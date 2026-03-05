import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PingService, PingResult } from './ping.service';
import { NetworkMetricsEntity } from './entities/network-metrics.entity';
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
    @InjectRepository(NetworkMetricsEntity)
    private readonly metricsRepo: Repository<NetworkMetricsEntity>,
  ) {}

  async onModuleInit() {
    this.pingIntervalSec = Number(
      this.configService.get<number>('NETWORK_PING_INTERVAL_SEC', 30),
    );

    // always monitor PBX host, attempt to resolve dynamic IP
    const pbxInstance = this.pbxManager.getInstance('pbx-labs1');
    if (pbxInstance && pbxInstance.ip) {
      this.targets.push(pbxInstance.ip);
    } else {
      this.targets.push('labs1.ras.yeastar.com');
    }

    // always check internet connectivity
    this.targets.push('8.8.8.8');

    const extra = this.configService.get<string>('NETWORK_MONITOR_TARGETS');
    if (extra) {
      const list = extra
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      this.targets.push(...list);
    }

    // deduplicate
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
    // run once immediately
    this.performPingCycle().catch((err) =>
      this.logger.error('Initial ping cycle failed', err),
    );
  }

  /**
   * Refresh PBX IP target if instance becomes available later.
   */
  private refreshPBXTarget(): void {
    const inst = this.pbxManager.getInstance('pbx-labs1');
    if (inst && inst.ip) {
      const existing = this.targets.find((t) => t === inst.ip);
      if (!existing) {
        // remove domain fallback if present
        this.targets = this.targets.filter(
          (t) => t !== 'labs1.ras.yeastar.com',
        );
        this.targets.unshift(inst.ip);
        this.logger.log(`pbx IP resolved, updating target list: ${inst.ip}`);
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
        const entity = this.metricsRepo.create({
          host: result.host,
          is_reachable: result.isAlive,
          latency_ms: result.latency,
          timestamp: result.timestamp,
        });
        await this.metricsRepo.save(entity);
      } else {
        this.logger.warn(`Ping promise rejected: ${res.reason}`);
      }
    }
  }

  /**
   * Return the most recent row per host converted into DTOs
   */
  async getLatestStatus(): Promise<NetworkStatusDto[]> {
    // use subquery to get max timestamp per host
    const sub = this.metricsRepo
      .createQueryBuilder('m2')
      .select('MAX(m2.timestamp)', 'max_ts')
      .where('m2.host = m.host')
      .groupBy('m2.host');

    const rows = await this.metricsRepo
      .createQueryBuilder('m')
      .where(`m.timestamp IN (${sub.getQuery()})`)
      .setParameters(sub.getParameters())
      .getMany();

    return rows.map((r) => ({
      host: r.host,
      isReachable: r.is_reachable,
      latencyMs: r.latency_ms,
      lastChecked: r.timestamp.toISOString(),
      status: r.is_reachable ? 'up' : 'down',
    }));
  }

  async getAverageLatency(
    host: string,
    minutes: number,
  ): Promise<number | null> {
    const since = new Date(Date.now() - minutes * 60000);
    const raw = await this.metricsRepo
      .createQueryBuilder('m')
      .select('AVG(m.latency_ms)', 'avg')
      .where('m.host = :host', { host })
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
