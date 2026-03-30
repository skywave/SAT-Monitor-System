import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('alert_management')
@Index(['alert_type', 'status', 'timestamp'])
@Index(['severity', 'status', 'timestamp'])
@Index(['trunk_id', 'timestamp'])
@Index(['device_id', 'timestamp'])
@Index(['status', 'timestamp'])
export class AlertManagementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pbx_id: string;

  @Column()
  alert_type: string;  
  // 'trunk_drop', 'trunk_up', 'trunk_unreachable',
  // 'ip_unreachable', 'ip_recovered', 
  // 'latency_high', 'latency_normal',
  // 'bandwidth_high', 'bandwidth_low', 'bandwidth_normal',
  // 'call_failed', 'call_no_answer', 'call_rejected',
  // 'device_down', 'device_up',
  // 'concurrent_calls_high', 'system_alert'

  @Column()
  severity: string;  // 'info', 'warning', 'critical'

  @Column({ type: 'uuid', nullable: true })
  trunk_id: string;  // Related trunk (if applicable)

  @Column({ nullable: true })
  trunk_name: string;  // Denormalized for quick display

  @Column({ type: 'uuid', nullable: true })
  device_id: string;  // Related network device (if applicable)

  @Column({ nullable: true })
  device_name: string;  // Denormalized

  @Column({ type: 'uuid', nullable: true })
  config_rule_id: string;  // Which system_configuration rule triggered this

  @Column({ type: 'text' })
  description: string;  // Human-readable alert message

  @Column({ type: 'jsonb', nullable: true })
  alert_data: any;  
  // Flexible context data:
  // { current_latency_ms: 350, threshold_ms: 200, device_ip: '192.168.1.1' }
  // { trunk_status: 'unreachable', peer_ip: '41.77.1.100', calls_dropped: 5 }
  // { bandwidth_mbps: 95, max_capacity_mbps: 100, utilization_percent: 95 }

  @Column({ type: 'timestamptz' })
  timestamp: Date;  // When alert was triggered

  @Column()
  status: string;  // 'new', 'acknowledged', 'resolved', 'auto_resolved'

  @Column({ type: 'timestamptz', nullable: true })
  acknowledged_at: Date;

  @Column({ nullable: true })
  acknowledged_by: string;  // Technician username/ID

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at: Date;

  @Column({ nullable: true })
  resolved_by: string;  // Technician username/ID

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;  // How it was fixed

  @Column({ default: false })
  notified: boolean;  // Was notification sent?

  @Column({ type: 'jsonb', nullable: true })
  notification_recipients: any;  // { emails: ['admin@...'], phones: ['+260...'] }

  @Column({ default: 0 })
  notification_retry_count: number;  // Failed notification attempts

  @Column({ type: 'timestamptz', nullable: true })
  last_notification_attempt: Date;

  @Column({ nullable: true })
  correlation_id: string;  // Group related alerts (e.g., trunk down → multiple calls failed)

  @Column({ nullable: true })
  parent_alert_id: string;  // If this is a child alert of a larger issue

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;  // Additional context (SLA impact, ticket ID, etc.)

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}