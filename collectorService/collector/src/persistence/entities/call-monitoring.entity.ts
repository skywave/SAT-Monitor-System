// src/persistence/entities/call-monitoring.entity.ts
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
  period_start: Date;  // Start of period (rounded to minute)

  @Column()
  period_type: string;  // 'minute', 'hour', 'day'

  // === PHASE 1: Core call metrics ===
  @Column({ default: 0 })
  active_calls: number;  // Current active calls at this moment

  @Column({ default: 0 })
  total_calls: number;  // Total calls in this period

  @Column({ default: 0 })
  inbound_calls: number;

  @Column({ default: 0 })
  outbound_calls: number;

  @Column({ default: 0 })
  answered_calls: number;

  @Column({ default: 0 })
  failed_calls: number;

  @Column({ default: 0 })
  rejected_calls: number;

  @Column({ default: 0 })
  no_answer_calls: number;

  @Column({ default: 0 })
  total_duration_seconds: number;  // Sum of all call durations

  @Column({ type: 'float', nullable: true })
  avg_duration_seconds?: number;  // Average call duration

  @Column({ type: 'timestamptz' })
  last_updated: Date;

  // === PHASE 2 (Keep for later) ===
  @Column({ default: 0 })
  peak_concurrent_calls: number;  // TODO: Phase 2

  @Column({ default: 0 })
  busy_calls: number;  // TODO: Phase 2

  @Column({ default: 0 })
  internal_calls: number;  // TODO: Phase 2

  @Column({ default: 0 })
  completed_calls: number;  // TODO: Phase 2

  @Column({ nullable: true })
  max_duration_seconds?: number;  // TODO: Phase 2

  @Column({ nullable: true })
  min_duration_seconds?: number;  // TODO: Phase 2

  @Column({ type: 'jsonb', nullable: true })
  mno_distribution: any;  // TODO: Phase 2 (needs MNO data)

  // === AUDIT ===
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}