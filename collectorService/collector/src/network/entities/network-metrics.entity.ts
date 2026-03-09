import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'network_metrics' })
@Index(['host', 'timestamp'])
export class NetworkMetricsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  host: string;

  @Column({ name: 'is_reachable', default: false })
  is_reachable: boolean;

  @Column({ name: 'latency_ms', type: 'float', nullable: true })
  latency_ms: number | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  timestamp: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
