import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'alert_rules' })
@Index(['resource_type'])
export class AlertRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rule_name: string;

  @Column()
  resource_type: string;

  @Column()
  condition_type: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  threshold_value: number;

  @Column()
  threshold_operator: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: true })
  notify_email: boolean;

  @Column({ default: false })
  notify_sms: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}