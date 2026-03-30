export interface NetworkStatusDto {
  host: string;
  isReachable: boolean;
  latencyMs?: number;
  lastChecked: string; // ISO timestamp
  status: 'up' | 'down' | 'unknown';
}
