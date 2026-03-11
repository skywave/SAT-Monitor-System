import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column({ nullable: true })
  pbx_sn: string;

  @Column()
  event_type: string;

  @Column({ nullable: true })
  event_id: string;

  @Column()
  resource_type: string;

  @Column({ nullable: true })
  resource_id: string;

  @Column({ nullable: true })
  resource_name: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
