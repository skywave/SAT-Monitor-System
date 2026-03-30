import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('trunk_monitoring')
@Index(['pbx_id', 'trunk_id'])
@Index(['status', 'last_checked'])
export class TrunkMonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  pbx_id: string;  // Which PBX

  @Column()
  trunk_id: string;  // PBX trunk ID

  @Column({nullable: true})
  trunk_name: string;  // Human-readable name

  @Column({ nullable: true })
  peer_name: string;  // Peer trunk name

  @Column()
  source_type: string;  // 'SBC', 'Gateway', 'Customer'

  @Column()
  destination_type: string;  // 'MNO', 'Gateway', 'Customer'

  @Column()
  source_ip: string;

  @Column()
  destination_ip: string;

  @Column()
  status: number;  // 0=down, 1=up, 41=reg_failed, 42=unreachable

  @Column()
  status_text: string;  // 'up', 'down', 'unreachable'

  @Column({ nullable: true })
  protocol: string;  // 'SIP', 'PJSIP', 'IAX2'

  @Column({ nullable: true })
  codec: string;  // 'G.711', 'G.729'

  @Column({ type: 'float', nullable: true })
  current_bandwidth_in: number;  // Mbps

  @Column({ type: 'float', nullable: true })
  current_bandwidth_out: number;  // Mbps

  @Column({ type: 'float', nullable: true })
  current_latency_ms: number;  // ms

  @Column({ default: 0 })
  active_calls: number;

  @Column()
  ip_reachability: boolean;

  @Column({ type: 'timestamptz' })
  status_changed_at: Date;

  @Column({ nullable: true })
  uptime_seconds: number;

  @Column({ nullable: true })
  downtime_seconds: number;

  @Column({ type: 'timestamptz' })
  last_checked: Date;

  @Column({ type: 'jsonb', nullable: true })
  mno_info: any;  // { name, contact, sla }

  @Column({ type: 'jsonb', nullable: true })
  devices_connected: any;  // [{ type: 'router', ip, name }]

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}