import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'call_transfer_events' })
export class CallTransferEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column({ nullable: true })
  pbx_sn: string;

  @Column()
  call_id: string;

  @Column({ nullable: true })
  from_party: string;

  @Column({ nullable: true })
  to_party: string;

  @Column({ nullable: true })
  transferrer: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
