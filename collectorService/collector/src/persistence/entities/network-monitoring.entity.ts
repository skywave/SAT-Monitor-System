// src/persistence/entities/network-monitoring.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('network_monitoring')
@Index(['device_name', 'timestamp'])
@Index(['ip_address', 'timestamp'])
@Index(['reachable', 'timestamp'])
export class NetworkMonitoringEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // === PHASE 1: Core fields (populated now) ===
  @Column()
  device_name: string;      // 'Gateway', 'NAS', 'MNO', 'Customer', 'Google'

  @Column()
  device_type: string;      // 'gateway', 'nas', 'mno', 'customer', 'dns'

  @Column()
  ip_address: string;       // IP being pinged

  @Column()
  reachable: boolean;       // true/false

  @Column({ type: 'float', nullable: true })
  latency_ms: number;       // Average RTT in milliseconds

  @Column({ type: 'float', nullable: true })
  packet_loss_percent: number;  // 0-100

  @Column({ default: 'sat-monitor' })
  source: string;           // 'sat-monitor' (Phase 1), 'sbc' (Phase 2)

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  // === PHASE 2: Keep for future (not populated now) ===
  @Column({ type: 'float', nullable: true })
  jitter_ms: number;        // Phase 2 (needs multiple pings or RTP)

  @Column({ nullable: true })
  hostname: string;         // Phase 2 (optional reverse DNS)

  @Column({ type: 'uuid', nullable: true })
  trunk_id: string;         // Phase 2 (associate with trunk)

  @Column({ nullable: true })
  network_path: string;     // Phase 2 (advanced)

  @Column({ type: 'jsonb', nullable: true })
  additional_metrics: any;  // Phase 2

  @Column({ type: 'text', nullable: true })
  status_notes: string;     // Phase 2

  // === AUDIT ===
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}