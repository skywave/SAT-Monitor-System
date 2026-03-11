export interface NetworkStatusDto {
  host: string;
  isReachable: boolean;
  latencyMs: number | null;
  lastChecked: string; // ISO timestamp
  status: 'up' | 'down' | 'unknown';
}
