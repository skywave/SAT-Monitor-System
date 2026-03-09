import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'daily_call_stats' })
@Unique(['pbx_id', 'date'])
@Index(['pbx_id', 'date'])
export class DailyCallStatsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'integer', default: 0 })
  total_calls: number;

  @Column({ type: 'integer', default: 0 })
  answered_calls: number;

  @Column({ type: 'integer', default: 0 })
  failed_calls: number;

  @Column({ type: 'integer', default: 0 })
  unanswered_calls: number;

  @Column({ type: 'integer', default: 0 })
  rejected_calls: number;

  @Column({ type: 'integer', default: 0 })
  total_duration_seconds: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  avg_duration_seconds: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}