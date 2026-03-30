import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('network_monitoring')
@Index(['device_name', 'timestamp'])
@Index(['device_type', 'timestamp'])
@Index(['ip_address', 'timestamp'])
@Index(['reachable', 'timestamp'])
@Index(['trunk_id', 'timestamp'])
export class NetworkMonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  device_name: string;  // 'Router-1', 'Gateway-MNO-Airtel', 'NAS-Primary'

  @Column()
  device_type: string;  // 'router', 'switch', 'gateway', 'nas', 'sbc', 'mno', 'customer', 'dns'

  @Column()
  ip_address: string;

  @Column({ nullable: true })
  hostname?: string;  // DNS name (e.g., 'gateway.mno.com')

  @Column()
  reachable: boolean;

  @Column({ type: 'float', nullable: true })
  latency_ms?: number;  // Round-trip time

  @Column({ type: 'float', nullable: true })
  packet_loss_percent?: number;  // 0-100

  @Column({ type: 'float', nullable: true })
  jitter_ms?: number;  // Latency variation (important for VoIP)

  @Column({ nullable: true })
  source?: string;  // 'sat-monitor', 'sbc', 'pbx' - who performed the check

  @Column({ type: 'uuid', nullable: true })
  trunk_id?: string;  // Associated trunk (if any)

  @Column({ nullable: true })
  network_path?: string;  // 'SBC -> Router-1 -> Gateway-MNO' (for troubleshooting)

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  additional_metrics?: any;  // Flexible for future metrics (DNS response time, etc.)

  @Column({ type: 'text', nullable: true })
  status_notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}