import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'monitored_devices' })
@Unique(['ip_address'])
export class MonitoredDeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  device_name: string;

  @Column()
  device_type: string;

  @Column()
  ip_address: string;

  @Column({ default: 'public' })
  snmp_community: string;

  @Column({ type: 'integer', default: 161 })
  snmp_port: number;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}