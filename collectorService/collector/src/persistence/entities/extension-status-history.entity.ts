import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'extension_status_history' })
@Index(['pbx_id', 'changed_at'])
@Index(['ext_id'])
export class ExtensionStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pbx_id: string;

  @Column()
  ext_id: string;

  @Column({ nullable: true })
  ext_name: string;

  @Column({ type: 'integer' })
  status: number;

  @Column({ nullable: true })
  status_text: string;

  @Column({ type: 'timestamptz' })
  changed_at: Date;

  @Column({ type: 'integer', nullable: true })
  duration_seconds: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}