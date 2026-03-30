import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('event')
@Index(['event_type', 'timestamp'])
@Index(['severity', 'resolved', 'timestamp'])
@Index(['related_entity_type', 'related_entity_id'])
@Index(['pbx_id', 'timestamp'])
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pbx_id: string;  // Which PBX

  @Column()
  event_type: string;  
  // 'trunk_drop', 'trunk_up', 'trunk_unreachable', 
  // 'ip_unreachable', 'ip_recovered',
  // 'latency_high', 'latency_normal',
  // 'bandwidth_high', 'bandwidth_low',
  // 'call_failed', 'call_no_answer', 'call_rejected',
  // 'device_down', 'device_up',
  // 'system_alert', 'config_changed'

  @Column()
  related_entity_type: string;  // 'trunk', 'network_device', 'call', 'system', 'bandwidth'

  @Column({ type: 'uuid', nullable: true })
  related_entity_id: string;  // FK to trunk_monitoring, network_monitoring, etc.

  @Column({ type: 'text' })
  description: string;  // Human-readable message

  @Column()
  severity: string;  // 'info', 'warning', 'critical'

  @Column({ nullable: true })
  triggered_by: string;  // 'system', 'webhook', 'manual', 'threshold_check'

  @Column({ type: 'uuid', nullable: true })
  alert_config_id: string;  // Which system_configuration rule triggered this

  @Column({ type: 'jsonb', nullable: true })
  event_data: any;  
  // Flexible JSON for event-specific details
  // Examples:
  // { trunk_name: 'SIP-MTN', peer_ip: '41.x.x.x', previous_status: 'up' }
  // { latency_ms: 350, threshold_ms: 200, device: 'Router-1' }
  // { call_id: 'xxx', from: '1000', to: '+260...', reason: 'busy' }

  @Column({ type: 'timestamptz' })
  timestamp: Date;  // When event occurred

  @Column({ default: false })
  resolved: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at: Date;

  @Column({ nullable: true })
  resolved_by: string;  // Technician username/ID

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;

  @Column({ default: false })
  notification_sent: boolean;

  @Column({ nullable: true })
  correlation_id: string;  // Group related events (e.g., trunk down → multiple calls failed)

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}