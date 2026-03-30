import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AlertManagementEntity } from '../persistence/entities/alert-management.entity';
import { SystemConfigurationEntity } from '../persistence/entities/system-configuration.entity';
import { TrunkMonitoringEntity } from '../persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';
import { CallMonitoringEntity } from '../persistence/entities/call-monitoring.entity';

/**
 * Monitors thresholds and creates alerts
 * Runs every minute to check all configurations
 */
@Injectable()
export class AlertCheckerService {
  private readonly logger = new Logger(AlertCheckerService.name);

  constructor(
    @InjectRepository(AlertManagementEntity)
    private readonly alertRepo: Repository<AlertManagementEntity>,
    @InjectRepository(SystemConfigurationEntity)
    private readonly configRepo: Repository<SystemConfigurationEntity>,
    @InjectRepository(TrunkMonitoringEntity)
    private readonly trunkRepo: Repository<TrunkMonitoringEntity>,
    @InjectRepository(NetworkMonitoringEntity)
    private readonly networkRepo: Repository<NetworkMonitoringEntity>,
    @InjectRepository(BandwidthMonitoringEntity)
    private readonly bandwidthRepo: Repository<BandwidthMonitoringEntity>,
    @InjectRepository(CallMonitoringEntity)
    private readonly callRepo: Repository<CallMonitoringEntity>,
  ) {}

  /**
   * Check thresholds every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async checkThresholds(): Promise<void> {
    try {
      const configs = await this.configRepo.find({ where: { enabled: true } });

      for (const config of configs) {
        switch (config.type) {
          case 'trunk':
            await this.checkTrunkStatus(config);
            break;
          case 'latency':
            await this.checkLatency(config);
            break;
          case 'bandwidth':
            await this.checkBandwidth(config);
            break;
          case 'call':
            await this.checkCalls(config);
            break;
          case 'network':
            await this.checkNetwork(config);
            break;
        }
      }
    } catch (error) {
      this.logger.error(`Alert checking error: ${error.message}`);
    }
  }

  /**
   * Check trunk status (down/unreachable)
   */
  private async checkTrunkStatus(config: SystemConfigurationEntity): Promise<void> {
    const trunks = await this.trunkRepo.find({
      where: {
        last_checked: MoreThan(new Date(Date.now() - 60000)),
      },
    });

    for (const trunk of trunks) {
      if (trunk.status !== 1 && trunk.status !== 2) {
        await this.createOrUpdateAlert({
          alert_type: 'trunk_drop',
          severity: config.severity || 'critical',
          trunk_id: trunk.id,
          trunk_name: trunk.trunk_name,
          config_rule_id: config.id,
          description: `Trunk ${trunk.trunk_name} is ${trunk.status_text}`,
          alert_data: {
            trunk_id: trunk.trunk_id,
            status: trunk.status,
            status_text: trunk.status_text,
            active_calls: trunk.active_calls,
          },
          config,
        });
      } else {
        await this.autoResolveAlert('trunk_drop', trunk.id);
      }
    }
  }

  /**
   * Check latency thresholds
   */
  private async checkLatency(config: SystemConfigurationEntity): Promise<void> {
    const networkData = await this.networkRepo.find({
      where: {
        timestamp: MoreThan(new Date(Date.now() - 60000)),
      },
    });

    for (const data of networkData) {
      if (data.latency_ms && config.threshold_max && data.latency_ms > config.threshold_max) {
        await this.createOrUpdateAlert({
          alert_type: 'latency_high',
          severity: config.severity || 'warning',
          device_name: data.device_name,
          config_rule_id: config.id,
          description: `Latency to ${data.device_name} is ${data.latency_ms}ms (threshold: ${config.threshold_max}ms)`,
          alert_data: {
            device_name: data.device_name,
            device_ip: data.ip_address,
            current_latency_ms: data.latency_ms,
            threshold_ms: config.threshold_max,
            packet_loss_percent: data.packet_loss_percent,
          },
          config,
        });
      } else {
        await this.autoResolveAlert('latency_high', data.device_name);
      }
    }
  }

  /**
   * Check bandwidth utilization
   */
  private async checkBandwidth(config: SystemConfigurationEntity): Promise<void> {
    const bandwidthData = await this.bandwidthRepo.find({
      where: {
        timestamp: MoreThan(new Date(Date.now() - 60000)),
      },
    });

    for (const data of bandwidthData) {
      if (
        data.total_utilization_percent &&
        config.threshold_max &&
        data.total_utilization_percent > config.threshold_max
      ) {
        await this.createOrUpdateAlert({
          alert_type: 'bandwidth_high',
          severity: config.severity || 'warning',
          trunk_id: data.trunk_id || undefined,
          device_name: data.device_name || undefined,
          config_rule_id: config.id,
          description: `Bandwidth utilization on ${data.device_name || 'Unknown'} is ${data.total_utilization_percent.toFixed(1)}% (threshold: ${config.threshold_max}%)`,
          alert_data: {
            device_name: data.device_name || 'Unknown',
            trunk_id: data.trunk_id || undefined,
            utilization_percent: data.total_utilization_percent,
            threshold_percent: config.threshold_max,
            bandwidth_in_mbps: data.bandwidth_in_mbps,
            bandwidth_out_mbps: data.bandwidth_out_mbps,
            max_capacity_mbps: data.max_capacity_mbps,
          },
          config,
        });
      } else {
        await this.autoResolveAlert('bandwidth_high', data.device_name || 'system');
      }
    }
  }

  /**
   * Check concurrent calls
   */
  private async checkCalls(config: SystemConfigurationEntity): Promise<void> {
    const callData = await this.callRepo.find({
      where: {
        period_type: 'minute',
        period_start: MoreThan(new Date(Date.now() - 120000)),
      },
      order: { period_start: 'DESC' },
      take: 1,
    });

    if (callData.length === 0) return;

    const latest = callData[0];
    if (
      config.threshold_max &&
      latest.active_calls > config.threshold_max
    ) {
      await this.createOrUpdateAlert({
        alert_type: 'concurrent_calls_high',
        severity: config.severity || 'warning',
        trunk_id: latest.trunk_id || undefined,
        config_rule_id: config.id,
        description: `Concurrent calls (${latest.active_calls}) exceeded threshold (${config.threshold_max})`,
        alert_data: {
          active_calls: latest.active_calls,
          peak_concurrent_calls: latest.peak_concurrent_calls,
          threshold: config.threshold_max,
          trunk_id: latest.trunk_id || undefined,
        },
        config,
      });
    } else {
      await this.autoResolveAlert('concurrent_calls_high', latest.trunk_id || 'system-wide');
    }
  }

  /**
   * Check network device reachability
   */
  private async checkNetwork(config: SystemConfigurationEntity): Promise<void> {
    const networkData = await this.networkRepo.find({
      where: {
        timestamp: MoreThan(new Date(Date.now() - 60000)),
      },
    });

    for (const data of networkData) {
      if (!data.reachable) {
        await this.createOrUpdateAlert({
          alert_type: 'ip_unreachable',
          severity: config.severity || 'critical',
          device_name: data.device_name,
          config_rule_id: config.id,
          description: `Device ${data.device_name} (${data.ip_address}) is unreachable`,
          alert_data: {
            device_name: data.device_name,
            device_type: data.device_type,
            ip_address: data.ip_address,
            last_reachable: data.timestamp,
          },
          config,
        });
      } else {
        await this.autoResolveAlert('ip_unreachable', data.device_name);
      }
    }
  }

  /**
   * Create or update alert (respects cooldown)
   */
  private async createOrUpdateAlert(params: {
    alert_type: string;
    severity: string;
    trunk_id?: string;
    trunk_name?: string;
    device_name?: string;
    config_rule_id: string;
    description: string;
    alert_data: any;
    config: SystemConfigurationEntity;
  }): Promise<void> {
    const {
      alert_type,
      severity,
      trunk_id,
      trunk_name,
      device_name,
      config_rule_id,
      description,
      alert_data,
      config,
    } = params;

    const existingAlert = await this.alertRepo.findOne({
      where: {
        alert_type,
        status: 'new',
        ...(trunk_id && { trunk_id }),
        ...(device_name && { device_name }),
      },
      order: { timestamp: 'DESC' },
    });

    if (existingAlert && config.alert_cooldown_minutes) {
      const timeSinceLastAlert =
        (Date.now() - new Date(existingAlert.timestamp).getTime()) / 60000;
      if (timeSinceLastAlert < config.alert_cooldown_minutes) {
        return;
      }
    }

    const alert = this.alertRepo.create({
      pbx_id: 'pbx-labs1',
      alert_type,
      severity,
      trunk_id,
      trunk_name,
      device_name,
      config_rule_id,
      description,
      alert_data,
      timestamp: new Date(),
      status: 'new',
      notified: false,
      notification_recipients: config.notification_recipients,
    });

    await this.alertRepo.save(alert);

    this.logger.warn(`🚨 ALERT: ${description}`);
  }

  /**
   * Auto-resolve alert when condition clears
   */
  private async autoResolveAlert(
    alertType: string,
    resourceIdentifier: string,
  ): Promise<void> {
    const openAlerts = await this.alertRepo.find({
      where: {
        alert_type: alertType,
        status: 'new',
      },
    });

    for (const alert of openAlerts) {
      const matches =
        alert.trunk_id === resourceIdentifier ||
        alert.device_name === resourceIdentifier;

      if (matches) {
        alert.status = 'auto_resolved';
        alert.resolved_at = new Date();
        alert.resolution_notes = 'Condition cleared automatically';
        await this.alertRepo.save(alert);

        this.logger.log(`✅ Auto-resolved alert: ${alert.description}`);
      }
    }
  }
}