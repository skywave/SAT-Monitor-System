import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('system_configuration')
@Index(['type', 'enabled'])
@Index(['applies_to_trunk_id'])
export class SystemConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;  // 'trunk_latency_threshold', 'max_concurrent_calls', etc.

  @Column()
  type: string;  // 'trunk', 'bandwidth', 'latency', 'call', 'network'

  @Column({ type: 'float', nullable: true })
  threshold_min?: number;  // Minimum acceptable value

  @Column({ type: 'float', nullable: true })
  threshold_max?: number;  // Maximum acceptable value

  @Column({ nullable: true })
  unit?: string;  // 'ms', 'Mbps', 'calls', '%'

  @Column({ nullable: true })
  severity?: string;  // 'critical', 'warning', 'info'

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: true })
  notify_email: boolean;

  @Column({ default: false })
  notify_sms: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notification_recipients: any;  // { emails: ['admin@example.com'], phones: ['+260...'] }

  @Column({ nullable: true })
  alert_cooldown_minutes?: number;  // Don't re-alert for X minutes

  @Column({ type: 'text', nullable: true })
  description?: string;  // Human-readable explanation of this rule

  @Column({ type: 'uuid', nullable: true })
  applies_to_trunk_id?: string;  // null = applies to all trunks

  @Column({ nullable: true })
  applies_to_resource_type?: string;  // 'all', 'sbc', 'mno', 'gateway'

  @UpdateDateColumn({ type: 'timestamptz' })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}