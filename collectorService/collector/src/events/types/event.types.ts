// src/events/types/event.types.ts

/**
 * Base event structure from Yeastar PBX
 */
export interface YeastarEvent {
  type: number;           // Event type code (e.g., 30010)
  sn: string;             // PBX serial number
  msg: string;            // JSON string containing event data
}

/**
 * Raw Websocket message (before classification)
 */
export type YeastarWebSocketMessage = 
    | YeastarEvent
    | SubscribeResponse
    | string;

/**
 * Event 30010: Trunk Registration State Changed
 */
export interface TrunkStatusEventData {
  trunk_name: string;
  kind: string;           // 'PJSIP', 'IAX', etc.
  status: number;         // See TrunkStatus enum
  registered_ip?: string; // IP:Port where trunk is registered
}

/**
 * Trunk Status Codes
 */
export enum TrunkStatus {
  UNKNOWN = 0,
  IDLE = 1,
  BUSY = 2,
  IDLE_UNMONITORED = 3,
  REGISTERING = 4,
  REGISTER_FAILED = 41,
  UNREACHABLE = 42,
  UNAVAILABLE = 43,
  DISABLED = 44,
}

/**
 * Subscribe message format
 */
export interface SubscribeMessage {
  topic_list: number[];  // Array of event IDs (numeric)
}

/**
 * Subscribe response
 */
export interface SubscribeResponse {
  errcode: number;
  errmsg: string;
}

/**
 * Normalized trunk event (internal system format)
 */
export interface NormalizedTrunkEvent {
  pbx_sn: string;
  trunk_name: string;
  kind: string;
  status: TrunkStatus;
  registered_ip?: string;
  timestamp: number;
}

/**
 * Enum for Yeastar event types
 */
export enum YeastarEventType {
  EXTENSION_STATUS_CHANGED = 30007,
  TRUNK_STATUS_CHANGED = 30010,
  CALL_STATUS_CHANGED = 30011,
  CALL_CDR = 30012,
  TRUNK_INFO_UPDATED = 30023,
}

/**
 * Enum for WebSocket connection states
 */
export enum WebSocketConnectionState {
  DISCONNECTED = 0,
  CONNECTING = 1,
  CONNECTED = 2,
  SUBSCRIBED = 3,
}
/**
 * Event 30011: Call State Changed
 */
export interface CallStateEventData {
  call_id: string;
  call_status: string;
  members: Array<{
    extension: string;
    status: string;
  }>;
}