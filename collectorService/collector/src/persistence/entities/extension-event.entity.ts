import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'extension_events' })
export class ExtensionEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column({ nullable: true })
  pbx_sn: string;

  @Column()
  event_type: string; // extension_registration_changed, extension_call_state_changed, extension_info_updated

  @Column({ nullable: true })
  ext_id: string;

  @Column({ nullable: true })
  ext_name: string;

  @Column({ nullable: true })
  registration_status: number;

  @Column({ nullable: true })
  call_status: number;

  @Column({ nullable: true })
  call_id: string;

  @Column({ type: 'jsonb', nullable: true })
  data: any;

  @Column({ type: 'jsonb', nullable: true })
  raw: any;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
