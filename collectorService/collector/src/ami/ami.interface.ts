// src/ami/ami.interface.ts
export interface AMIConfig {
  host: string;
  port: number;
  username: string;      // Must be string (required)
  password: string;      // Must be string (required)
  reconnectInterval?: number;  // Optional with default
}

export interface AMITrunkMetrics {
  source: 'ami';
  trunk_name: string;
  status: string;        // 'Registered', 'Unreachable', 'Unknown'
  latency_ms: number | null;
  jitter_ms: number | null;
  packet_loss_pct: number | null;
  timestamp: Date;
}

export interface AMIShowPeerResponse {
  Response: string;
  Peer: string;
  Status?: string;
  Ping?: string;
  PingJitter?: string;
  PacketLoss?: string;
  [key: string]: string | undefined;
}