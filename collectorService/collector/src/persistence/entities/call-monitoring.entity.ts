import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('call_monitoring')
@Unique(['trunk_id', 'period_start', 'period_type'])
@Index(['trunk_id', 'period_start'])
@Index(['period_type', 'period_start'])
export class CallMonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pbx_id?: string;

  @Column({ type: 'uuid', nullable: true })
  trunk_id?: string;  // null = system-wide aggregation

  @Column({ type: 'timestamptz' })
  period_start: Date;  // Start of period (rounded to minute/hour/day)

  @Column()
  period_type: string;  // 'minute', 'hour', 'day'

  // Real-time metrics
  @Column({ default: 0 })
  active_calls: number;

  @Column({ default: 0 })
  peak_concurrent_calls: number;

  // Call counts by type
  @Column({ default: 0 })
  total_calls: number;

  @Column({ default: 0 })
  inbound_calls: number;

  @Column({ default: 0 })
  outbound_calls: number;

  @Column({ default: 0 })
  internal_calls: number;

  // Call counts by status
  @Column({ default: 0 })
  completed_calls: number;

  @Column({ default: 0 })
  answered_calls: number;

  @Column({ default: 0 })
  failed_calls: number;

  @Column({ default: 0 })
  rejected_calls: number;

  @Column({ default: 0 })
  no_answer_calls: number;

  @Column({ default: 0 })
  busy_calls: number;

  // Duration metrics
  @Column({ default: 0 })
  total_duration_seconds?: number;

  @Column({ type: 'float', nullable: true })
  avg_duration_seconds?: number;

  @Column({ nullable: true })
  max_duration_seconds?: number;

  @Column({ nullable: true })
  min_duration_seconds?: number;

  // Quality metrics (optional)
  @Column({ type: 'float', nullable: true })
  avg_call_setup_time_ms?: number;  // Time to establish call

  @Column({ type: 'float', nullable: true })
  call_success_rate_percent?: number;  // (completed / total) * 100

  // MNO distribution
  @Column({ type: 'jsonb', nullable: true })
  mno_distribution: any;  // { "MTN": 50, "Airtel": 30 }

  @Column({ type: 'timestamptz' })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}