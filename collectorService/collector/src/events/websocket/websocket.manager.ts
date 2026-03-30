// src/events/websocket/websocket.manager.ts

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { PBXManager } from '../../pbx/pbx.manager'; // Ensure path is correct
import { YeastarWebSocketService } from './websocket.service';
import { YeastarEvent } from '../types/event.types';
import { EventProcessor } from '../processors/event-processor';

@Injectable()
export class WebSocketManager implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebSocketManager.name);
  
  // Store active connections: key = pbxId
  private connections = new Map<string, YeastarWebSocketService>();

  // 🌍 Global Event Stream (All PBXs merged into one stream)
  private readonly _globalEvents$ = new Subject<YeastarEvent & { pbxId: string }>();

  constructor(private readonly pbxManager: PBXManager, private readonly eventProcessor: EventProcessor) {}

  /**
   * The rest of the app listens to THIS stream.
   */
  get eventStream$(): Observable<YeastarEvent & { pbxId: string }> {
    return this._globalEvents$.asObservable();
  }

  async onModuleInit() {
    this.logger.log('🚀 Initializing WebSocket Manager...');

    //start processing events
    this.eventStream$.subscribe(async (event) => {
      await this.eventProcessor.process(event);
    });
    
    // Allow PBXManager to finish its own init first if needed
    setTimeout(() => this.connectAll(), 1000);
  }

  private async connectAll() {
    // 1. Get all configured PBX instances
    const instances = this.pbxManager.getAllInstances(); // Assumes this method exists
    
    if (instances.length === 0) {
      this.logger.warn('No PBX instances configured.');
      return;
    }

    for (const pbx of instances) {
      this.setupConnection(pbx);
    }
  }

  private setupConnection(pbxInstance: any) {
    const pbxId = pbxInstance.id; // e.g. 'pbx-labs1'

    if (this.connections.has(pbxId)) return;

    this.logger.log(`Setup WebSocket for [${pbxId}]`);

    // ✅ Pass a FUNCTION that fetches a fresh token, not the string itself
    const tokenFetcher = async () => {
        // Access the public apiClient or method on your PBX instance
        return await pbxInstance.apiClient.getAccessToken();
    };

    const wsService = new YeastarWebSocketService(
      pbxId,
      pbxInstance.ip, 
      tokenFetcher
    );

    // 🔗 PIPE events from this PBX to the Global Stream
    wsService.events$.subscribe((event) => {
      this._globalEvents$.next({ ...event, pbxId });
    });

    // Start connection
    wsService.connect();
    this.connections.set(pbxId, wsService);
  }

  getConnection(pbxId: string): YeastarWebSocketService | undefined {
    return this.connections.get(pbxId);
  }

  onModuleDestroy() {
    this.connections.forEach(conn => conn.disconnect());
    this.connections.clear();
  }

  // -------------------------
  // Added Methods for MonitoringService
  // -------------------------
  
  /**
   * Check if a PBX WebSocket is connected
   */
  isConnected(pbxId: string): boolean {
    const conn = this.connections.get(pbxId);
    return conn ? conn.isConnected() : false;
  }

  /**
   * Get the last known latency in ms for a PBX connection
   */
  getLatency(pbxId: string): number {
    const conn = this.connections.get(pbxId);
    return conn ? conn.getLatency() : 0;
  }
}
