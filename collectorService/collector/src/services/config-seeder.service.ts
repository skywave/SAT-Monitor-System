import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigurationEntity } from '../persistence/entities/system-configuration.entity';

/**
 * Seeds default thresholds and configurations
 * Runs once on startup
 */
@Injectable()
export class ConfigSeederService implements OnModuleInit {
  private readonly logger = new Logger(ConfigSeederService.name);

  constructor(
    @InjectRepository(SystemConfigurationEntity)
    private readonly configRepo: Repository<SystemConfigurationEntity>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultConfigs();
  }

  private async seedDefaultConfigs(): Promise<void> {
    try {
      // Check if configs already exist
      const existingCount = await this.configRepo.count();
      if (existingCount > 0) {
        this.logger.log(`System configurations already seeded (${existingCount} configs)`);
        return;
      }

      const defaultConfigs = [
        // Latency thresholds
        {
          name: 'latency_warning_threshold',
          type: 'latency',
          threshold_min: undefined,
          threshold_max: 200,
          unit: 'ms',
          severity: 'warning',
          enabled: true,
          notify_email: true,
          notify_sms: false,
          notification_recipients: { emails: ['ops@skywave.com'] },
          alert_cooldown_minutes: 15,
          description: 'Trigger warning when latency exceeds 200ms',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },
        {
          name: 'latency_critical_threshold',
          type: 'latency',
          threshold_min: undefined,
          threshold_max: 500,
          unit: 'ms',
          severity: 'critical',
          enabled: true,
          notify_email: true,
          notify_sms: true,
          notification_recipients: { emails: ['ops@skywave.com'], phones: ['+260977000000'] },
          alert_cooldown_minutes: 5,
          description: 'Trigger critical alert when latency exceeds 500ms',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },

        // Bandwidth thresholds
        {
          name: 'bandwidth_high_threshold',
          type: 'bandwidth',
          threshold_min: undefined,
          threshold_max: 80,
          unit: '%',
          severity: 'warning',
          enabled: true,
          notify_email: true,
          notify_sms: false,
          notification_recipients: { emails: ['ops@skywave.com'] },
          alert_cooldown_minutes: 30,
          description: 'Alert when bandwidth utilization exceeds 80%',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },

        // Trunk status
        {
          name: 'trunk_down_alert',
          type: 'trunk',
          threshold_min: undefined,
          threshold_max: undefined,
          unit: undefined,
          severity: 'critical',
          enabled: true,
          notify_email: true,
          notify_sms: true,
          notification_recipients: { emails: ['ops@skywave.com'], phones: ['+260977000000'] },
          alert_cooldown_minutes: 0, // Immediate
          description: 'Alert immediately when trunk goes down',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },

        // Concurrent calls
        {
          name: 'concurrent_calls_high',
          type: 'call',
          threshold_min: undefined,
          threshold_max: 50,
          unit: 'calls',
          severity: 'warning',
          enabled: true,
          notify_email: true,
          notify_sms: false,
          notification_recipients: { emails: ['ops@skywave.com'] },
          alert_cooldown_minutes: 60,
          description: 'Alert when concurrent calls exceed 50',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },

        // Network device down
        {
          name: 'device_unreachable',
          type: 'network',
          threshold_min: undefined,
          threshold_max: undefined,
          unit: undefined,
          severity: 'critical',
          enabled: true,
          notify_email: true,
          notify_sms: true,
          notification_recipients: { emails: ['ops@skywave.com'], phones: ['+260977000000'] },
          alert_cooldown_minutes: 10,
          description: 'Alert when network device becomes unreachable',
          applies_to_trunk_id: undefined,
          applies_to_resource_type: 'all',
        },
      ];

      for (const config of defaultConfigs) {
        await this.configRepo.save(config);
      }

      this.logger.log(`✅ Seeded ${defaultConfigs.length} default system configurations`);
    } catch (error) {
      this.logger.error(`Failed to seed configurations: ${error.message}`);
    }
  }
}