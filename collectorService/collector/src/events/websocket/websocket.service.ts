// src/events/websocket/websocket.service.ts

import { Logger } from '@nestjs/common';
import WebSocket from 'ws';
import { Subject, Observable } from 'rxjs';
import { YeastarEvent, SubscribeMessage } from '../types/event.types';

export class YeastarWebSocketService {
  private readonly logger: Logger;
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  // 📡 Output Stream: The Manager listens to this
  private readonly _events$ = new Subject<YeastarEvent>();

  constructor(
    private readonly pbxId: string,
    private readonly host: string,
    private readonly tokenFetcher: () => Promise<string> // ✅ Dynamic Token Fetcher
  ) {
    this.logger = new Logger(`WebSocketService-${pbxId}`);
  }

  get events$(): Observable<YeastarEvent> {
    return this._events$.asObservable();
  }

  async connect(): Promise<void> {
    if (this.isDestroyed || this.ws?.readyState === WebSocket.OPEN) return;

    try {
      // 1. Get a FRESH token (handles expiry automatically)
      const token = await this.tokenFetcher();
      
      const url = `wss://${this.host}/openapi/v1.0/subscribe?access_token=${token}`;
      this.logger.log(`Connecting to ${this.host}...`);

      this.ws = new WebSocket(url, { rejectUnauthorized: false });
      this.bindEvents();

    } catch (error) {
      this.logger.error(`Connection prep failed: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  private bindEvents() {
    if (!this.ws) return;

    this.ws.on('open', () => {
      this.logger.log('✅ Connected');
      this.startHeartbeat();
      // Subscribe to Extension, Trunk, Call, Agent, and Transfer events
      this.subscribe([
        30007, // Extension Registration Status Changed
        30008, // Extension Call State Changed
        30010, // Trunk Registration State Changed
        30011, // Call State Changed
        30012, // Call End Details (CDR)
        30013, // Call Transfer Report
        30022, // Extension Information Updated
        30023, // Trunk Information Updated
        30029, // Agent Status Changed
      ]);
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      try {
        const raw = data.toString();;
        // Filter out heartbeats/pongs
        if (raw === 'heartbeat response') {
          this.logger.debug('Received heartbeat response');  
          return;
        }

        const payload = JSON.parse(raw);

        // check if it's a subscription response
        if ('errcode' in payload) {
          this.logger.log(
            payload.errcode === 0
            ? '✅ Subscribed to events'
            : `❌ Subscription failed: ${payload.errmsg}`
          );
          return;
        }

        // 🚀 EMIT Event to Manager
        if (payload.type) {
          this._events$.next(payload as YeastarEvent);
        }

      } catch (err) {
        this.logger.error(`Parse error: ${err.message}`);
      }
    });

    this.ws.on('close', (code, reason) => {
      this.logger.warn(`Closed (${code}): ${reason}`);
      this.cleanup();
      this.scheduleReconnect();
    });

    this.ws.on('error', (err) => {
        this.logger.error(`Error: ${err.message}`);
    });
  }

  public subscribe(topics: number[]) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg: SubscribeMessage = { topic_list: topics };
      this.ws.send(JSON.stringify(msg));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('heartbeat');
      }
    }, 30000); // 30s rule
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  private cleanup() {
    this.stopHeartbeat();
    this.ws = null;
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout || this.isDestroyed) return;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 5000);
  }

  public disconnect() {
    this.isDestroyed = true;
    this.cleanup();
    this.ws?.close();
  }
}