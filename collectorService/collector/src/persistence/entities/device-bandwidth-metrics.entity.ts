import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'device_bandwidth_metrics' })
@Index(['device_ip', 'timestamp'])
export class DeviceBandwidthMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  device_ip: string;

  @Column({name: 'interface_name'})
  network_interface: string;

  @Column({ type: 'bigint', default: 0 })
  bytes_in: number;

  @Column({ type: 'bigint', default: 0 })
  bytes_out: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  bandwidth_in_mbps: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  bandwidth_out_mbps: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })
  utilization_percent: number;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}