import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'state_history' })
export class StateHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column()
  resource_type: string;

  @Column({ nullable: true })
  resource_id: string;

  @Column({ type: 'jsonb', nullable: true })
  previous_state: any;

  @Column({ type: 'jsonb', nullable: true })
  current_state: any;

  @CreateDateColumn({ type: 'timestamptz' })
  changed_at: Date;
}
