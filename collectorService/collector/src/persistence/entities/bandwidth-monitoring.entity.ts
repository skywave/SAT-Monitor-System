import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('bandwidth_monitoring')
@Index(['trunk_id', 'timestamp'])
@Index(['device_name', 'interface_name', 'timestamp'])
@Index(['measurement_source', 'timestamp'])
export class BandwidthMonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pbx_id?: string;

  @Column({ type: 'uuid', nullable: true })
  trunk_id?: string;  // Which trunk this bandwidth relates to

  @Column({ nullable: true })
  device_name?: string;  // 'Router-1', 'SBC-Primary', 'Switch-A'

  @Column({ nullable: true })
  device_ip?: string;

  @Column({ nullable: true })
  interface_name?: string;  // 'eth0', 'eth1', 'wan1', 'GigabitEthernet0/0'

  // Inbound metrics
  @Column({ type: 'bigint', default: 0 })
  bytes_received: number;  // Total bytes in (cumulative counter)

  @Column({ type: 'float', nullable: true })
  bandwidth_in_mbps?: number;  // Current inbound throughput

  @Column({ type: 'float', nullable: true })
  bandwidth_in_percent?: number;  // % of capacity used (inbound)

  // Outbound metrics
  @Column({ type: 'bigint', default: 0 })
  bytes_sent: number;  // Total bytes out (cumulative counter)

  @Column({ type: 'float', nullable: true })
  bandwidth_out_mbps?: number;  // Current outbound throughput

  @Column({ type: 'float', nullable: true })
  bandwidth_out_percent?: number;  // % of capacity used (outbound)

  // Capacity limits
  @Column({ type: 'float', nullable: true })
  max_capacity_mbps?: number;  // Interface speed (e.g., 100 Mbps, 1 Gbps)

  // Overall utilization
  @Column({ type: 'float', nullable: true })
  total_utilization_percent?: number;  // Max(in%, out%)

  // Network errors and drops
  @Column({ type: 'bigint', default: 0 })
  errors_in: number;  // Input errors

  @Column({ type: 'bigint', default: 0 })
  errors_out: number;  // Output errors

  @Column({ type: 'bigint', default: 0 })
  drops_in: number;  // Dropped packets inbound (congestion)

  @Column({ type: 'bigint', default: 0 })
  drops_out: number;  // Dropped packets outbound

  // Measurement metadata
  @Column()
  measurement_source: string;  // 'snmp', 'netflow', 'estimated', 'manual'

  @Column({ nullable: true })
  active_calls_count?: number;  // For estimation method: how many calls contributed

  @Column({ nullable: true })
  codec_used?: string;  // For estimation: 'G.711', 'G.729', 'mixed'

  @Column({ type: 'timestamptz' })
  timestamp: Date;  // When this measurement was taken

  @Column({ type: 'jsonb', nullable: true })
  additional_metrics?: any;  // Future extensibility (QoS, packet rate, etc.)

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}