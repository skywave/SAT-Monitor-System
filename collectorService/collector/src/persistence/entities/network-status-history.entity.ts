import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'network_status_history' })
@Index(['host', 'changed_at'])
export class NetworkStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  host: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz' })
  changed_at: Date;

  @Column({ type: 'integer', nullable: true })
  duration_seconds: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}