// src/ami/ami.service.ts
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { AMIConfig, AMITrunkMetrics } from './ami.interface';

// Import asterisk-ami (CommonJS)
const AMI = require('asterisk-ami');

@Injectable()
export class AMIService implements OnModuleDestroy {
  private readonly logger = new Logger(AMIService.name);
  private client: any = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private config: AMIConfig | null = null;

  /**
   * Configure and connect to AMI
   */
  async configure(config: AMIConfig): Promise<boolean> {
    // Validate required fields
    if (!config.host) {
      this.logger.error('AMI host is required');
      return false;
    }
    if (!config.username) {
      this.logger.error('AMI username is required');
      return false;
    }
    if (!config.password) {
      this.logger.error('AMI password is required');
      return false;
    }
    
    this.config = {
      ...config,
      port: config.port || 5038,
      reconnectInterval: config.reconnectInterval || 5,
    };
    
    return this.connect();
  }

  /**
   * Connect to AMI
   */
  private async connect(): Promise<boolean> {
    if (!this.config) {
      this.logger.error('AMI not configured. Call configure() first.');
      return false;
    }

    try {
      this.client = new AMI({
        host: this.config.host,
        port: this.config.port,
        username: this.config.username,
        password: this.config.password,
      });

      // Connect to AMI
      await new Promise((resolve, reject) => {
        this.client.connect((err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
      
      this.connected = true;
      this.reconnectAttempts = 0;
      this.logger.log(`✅ AMI Connected to ${this.config.host}:${this.config.port}`);
      return true;
      
    } catch (error: any) {
      this.logger.error(`❌ AMI Connection failed: ${error.message}`);
      this.connected = false;
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`Max reconnect attempts (${this.maxReconnectAttempts}) reached. AMI will not retry.`);
      return;
    }
    
    const delay = Math.pow(2, this.reconnectAttempts) * 1000;
    this.reconnectAttempts++;
    
    this.logger.warn(`Scheduling AMI reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  /**
   * Disconnect from AMI
   */
  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.client) {
      try {
        this.client.disconnect();
      } catch (error: any) {
        this.logger.error(`Error closing AMI connection: ${error.message}`);
      }
    }
    this.connected = false;
    this.logger.log('AMI Disconnected');
  }

  /**
   * Ensure connection is active
   */
  private async ensureConnected(): Promise<boolean> {
    if (!this.connected || !this.client) {
      this.logger.warn('AMI not connected, attempting reconnect...');
      return this.connect();
    }
    return true;
  }

  /**
   * Send AMI action and get response
   */
  private sendAction(action: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('AMI client not initialized'));
        return;
      }
      
      this.client.action(action, (err: Error | null, response: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Poll a single trunk for latency metrics
   */
  async pollTrunk(trunkName: string): Promise<AMITrunkMetrics> {
    const result: AMITrunkMetrics = {
      source: 'ami',
      trunk_name: trunkName,
      status: 'Unknown',
      latency_ms: null,
      jitter_ms: null,
      packet_loss_pct: null,
      timestamp: new Date(),
    };

    if (!await this.ensureConnected()) {
      this.logger.error(`Cannot poll trunk "${trunkName}": AMI not connected`);
      return result;
    }

    try {
      const response = await this.sendAction({
        Action: 'SIPshowpeer',
        Peer: trunkName,
      });

      const parsed = this.parseShowPeerResponse(response, trunkName);
      Object.assign(result, parsed);
      
      if (result.latency_ms !== null) {
        this.logger.debug(
          `📡 ${trunkName}: Latency=${result.latency_ms}ms, Jitter=${result.jitter_ms}ms, Loss=${result.packet_loss_pct}%`
        );
      }
      
    } catch (error: any) {
      this.logger.error(`Error polling trunk "${trunkName}": ${error.message}`);
      this.connected = false;
      result.status = 'Error';
    }

    return result;
  }

  /**
   * Parse SIPshowpeer response
   */
  private parseShowPeerResponse(response: any, trunkName: string): Partial<AMITrunkMetrics> {
    const result: Partial<AMITrunkMetrics> = {
      status: 'Unknown',
      latency_ms: null,
      jitter_ms: null,
      packet_loss_pct: null,
    };

    if (!response) {
      return result;
    }

    // response is typically an object with key-value pairs
    for (const [key, value] of Object.entries(response)) {
      const cleanKey = String(key).trim().toLowerCase();
      const cleanValue = String(value ?? '').trim();

      if (cleanKey === 'status') {
        result.status = cleanValue;
      } else if (cleanKey === 'ping') {
        const match = cleanValue.match(/(\d+\.?\d*)/);
        if (match) {
          result.latency_ms = parseFloat(match[1]);
        }
      } else if (cleanKey === 'pingjitter') {
        const match = cleanValue.match(/(\d+\.?\d*)/);
        if (match) {
          result.jitter_ms = parseFloat(match[1]);
        }
      } else if (cleanKey === 'packetloss') {
        if (cleanValue.toLowerCase() !== 'n/a') {
          const match = cleanValue.match(/(\d+\.?\d*)/);
          if (match) {
            result.packet_loss_pct = parseFloat(match[1]);
          }
        }
      }
    }

    // Check for error response
    if (response.Response === 'Error') {
      result.status = 'Unreachable';
      this.logger.warn(`Trunk "${trunkName}" not found or unreachable via AMI`);
    }

    return result;
  }

  /**
   * Poll multiple trunks concurrently
   */
  async pollMultipleTrunks(trunkNames: string[]): Promise<AMITrunkMetrics[]> {
    const results = await Promise.allSettled(
      trunkNames.map(name => this.pollTrunk(name))
    );

    const validResults: AMITrunkMetrics[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        validResults.push(result.value);
      } else {
        this.logger.error(`Poll error: ${result.reason}`);
      }
    }

    return validResults;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.connected) {
      return false;
    }

    try {
      await this.sendAction({ Action: 'Ping' });
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * On module destroy - cleanup
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}