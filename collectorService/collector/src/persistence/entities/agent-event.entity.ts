import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'agent_events' })
export class AgentEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column({ nullable: true })
  pbx_sn: string;

  @Column()
  event_type: string; // agent_status_changed

  @Column({ nullable: true })
  agent_id: string;

  @Column({ nullable: true })
  agent_name: string;

  @Column({ nullable: true })
  agent_status: number;

  @Column({ nullable: true })
  queue_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
