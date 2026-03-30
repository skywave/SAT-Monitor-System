import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PingService } from './ping.service';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';
import { PBXManager } from '../pbx/pbx.manager';
import { NetworkStatusDto } from './dto/network-status.dto';

@Injectable()
export class NetworkMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NetworkMonitorService.name);
  private targets: string[] = [];
  private intervalId: NodeJS.Timeout;
  private pingIntervalSec = 30;

  constructor(
    private readonly pbxManager: PBXManager,
    private readonly configService: ConfigService,
    private readonly pingService: PingService,
    @InjectRepository(NetworkMonitoringEntity)
    private readonly metricsRepo: Repository<NetworkMonitoringEntity>,
  ) {}

  async onModuleInit() {
    this.pingIntervalSec = Number(
      this.configService.get<number>('NETWORK_PING_INTERVAL_SEC', 30),
    );

    // Always monitor PBX host
    const pbxInstance = this.pbxManager.getInstance('pbx-labs1');
    if (pbxInstance && pbxInstance.ip) {
      this.targets.push(pbxInstance.ip);
    } else {
      this.targets.push('labs1.ras.yeastar.com');
    }

    // Always check internet connectivity
    this.targets.push('8.8.8.8');

    const extra = this.configService.get<string>('NETWORK_MONITOR_TARGETS');
    if (extra) {
      const list = extra
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      this.targets.push(...list);
    }

    // Deduplicate
    this.targets = Array.from(new Set(this.targets));

    this.logger.log(`Network targets: ${this.targets.join(', ')}`);
    this.startInterval();
  }

  private startInterval() {
    this.intervalId = setInterval(() => {
      this.performPingCycle().catch((err) => {
        this.logger.error('Ping cycle error', err);
      });
    }, this.pingIntervalSec * 1000);
    
    // Run once immediately
    this.performPingCycle().catch((err) =>
      this.logger.error('Initial ping cycle failed', err),
    );
  }

  private refreshPBXTarget(): void {
    const inst = this.pbxManager.getInstance('pbx-labs1');
    if (inst && inst.ip) {
      const existing = this.targets.find((t) => t === inst.ip);
      if (!existing) {
        this.targets = this.targets.filter(
          (t) => t !== 'labs1.ras.yeastar.com',
        );
        this.targets.unshift(inst.ip);
        this.logger.log(`PBX IP resolved, updating target list: ${inst.ip}`);
      }
    }
  }

  private async performPingCycle() {
    this.refreshPBXTarget();
    const results = await Promise.allSettled(
      this.targets.map((t) => this.pingService.ping(t)),
    );
    
    for (const res of results) {
      if (res.status === 'fulfilled') {
        const result = res.value;
        
        // ✅ Map to new schema
        const entity = this.metricsRepo.create({
          device_name: this.getDeviceName(result.host),
          device_type: this.getDeviceType(result.host),
          ip_address: result.host,
          hostname: result.host,
          reachable: result.isAlive,
          latency_ms: result.latency ?? undefined,
          source: 'sat-monitor',
          timestamp: result.timestamp,
        });
        
        await this.metricsRepo.save(entity);
      } else {
        this.logger.warn(`Ping promise rejected: ${res.reason}`);
      }
    }
  }

  /**
   * Determine device name from host
   */
  private getDeviceName(host: string): string {
    if (host.includes('yeastar.com') || host.includes('pbx')) {
      return 'PBX-Primary';
    }
    if (host === '8.8.8.8') {
      return 'Google-DNS';
    }
    return `Device-${host}`;
  }

  /**
   * Determine device type from host
   */
  private getDeviceType(host: string): string {
    if (host.includes('yeastar.com') || host.includes('pbx')) {
      return 'pbx';
    }
    if (host === '8.8.8.8') {
      return 'dns';
    }
    return 'gateway';  // Default
  }

  /**
   * Get latest status per device
   */
  async getLatestStatus(): Promise<NetworkStatusDto[]> {
    const sub = this.metricsRepo
      .createQueryBuilder('m2')
      .select('MAX(m2.timestamp)', 'max_ts')
      .where('m2.device_name = m.device_name')
      .groupBy('m2.device_name');

    const rows = await this.metricsRepo
      .createQueryBuilder('m')
      .where(`m.timestamp IN (${sub.getQuery()})`)
      .setParameters(sub.getParameters())
      .getMany();

    return rows.map((r) => ({
      host: r.device_name,
      isReachable: r.reachable,
      latencyMs: r.latency_ms,
      lastChecked: r.timestamp.toISOString(),
      status: r.reachable ? 'up' : 'down',
    }));
  }

  /**
   * Get average latency for a device
   */
  async getAverageLatency(
    host: string,
    minutes: number,
  ): Promise<number | null> {
    const since = new Date(Date.now() - minutes * 60000);
    const raw = await this.metricsRepo
      .createQueryBuilder('m')
      .select('AVG(m.latency_ms)', 'avg')
      .where('m.device_name = :host', { host })
      .andWhere('m.timestamp >= :since', { since })
      .getRawOne();
    return raw?.avg ? parseFloat(raw.avg) : null;
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}