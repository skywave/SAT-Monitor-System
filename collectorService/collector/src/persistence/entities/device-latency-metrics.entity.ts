import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'device_latency_metrics' })
@Index(['source_device', 'target_device', 'timestamp'])
export class DeviceLatencyMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  source_device: string;

  @Column()
  target_device: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  latency_ms: number;

  @Column({ default: false })
  is_reachable: boolean;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}