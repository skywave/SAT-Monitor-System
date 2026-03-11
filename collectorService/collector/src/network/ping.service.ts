import { Injectable, Logger } from '@nestjs/common';
import * as ping from 'ping';
import { lookup } from 'dns/promises';

export interface PingResult {
  host: string;
  isAlive: boolean;
  latency: number | null;
  timestamp: Date;
}

@Injectable()
export class PingService {
  private readonly logger = new Logger(PingService.name);
  private readonly timeoutSec = 5;

  /**
   * Perform a single ICMP ping against a host or IP.
   *
   * @param host hostname or IP address
   */
  async ping(host: string): Promise<PingResult> {
    let target = host;
    try {
      if (!this.isIp(host)) {
        try {
          const res = await lookup(host);
          target = res.address;
        } catch (err) {
          this.logger.warn(`DNS lookup failed for ${host}: ${err.message}`);
          // continue with original host - ping package may resolve itself
        }
      }

      const res = await ping.promise.probe(target, {
        timeout: this.timeoutSec,
      });

      return {
        host,
        isAlive: res.alive,
        latency: res.alive ? parseFloat(String(res.time)) : null,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Ping error for ${host}: ${error.message}`);
      return { host, isAlive: false, latency: null, timestamp: new Date() };
    }
  }

  private isIp(value: string): boolean {
    const ipv4 = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;
    const ipv6 = /:/;
    return ipv4.test(value) || ipv6.test(value);
  }
}
