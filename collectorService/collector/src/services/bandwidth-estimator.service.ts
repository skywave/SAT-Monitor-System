import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';
import { PBXDataService } from '../supervisor/pbx-data.service';

/**
 * Estimates bandwidth usage from active calls
 * Writes to bandwidth_monitoring table every minute
 */
@Injectable()
export class BandwidthEstimatorService {
  private readonly logger = new Logger(BandwidthEstimatorService.name);

  // Codec bitrate mappings (Kbps)
  private readonly codecBitrates: Record<string, number> = {
    'G.711': 87.2,   // 64 Kbps audio + overhead
    'G.729': 31.2,   // 8 Kbps audio + overhead
    'OPUS': 50,      // Variable, assuming ~32 Kbps + overhead
    'GSM': 29.2,     // 13 Kbps + overhead
    'iLBC': 28.5,    // 15 Kbps + overhead
  };

  constructor(
    @InjectRepository(BandwidthMonitoringEntity)
    private readonly bandwidthRepo: Repository<BandwidthMonitoringEntity>,
    private readonly pbxDataService: PBXDataService,
  ) {}

  /**
   * Estimate bandwidth every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async estimateBandwidth(): Promise<void> {
    try {
      const calls = await this.pbxDataService.getCalls();
      const trunks = await this.pbxDataService.getTrunks();

      // Estimate per trunk
      for (const trunk of trunks) {
        const trunkId = trunk.trunk_id || trunk.id;
        const trunkName = trunk.trunk_name || trunk.name;

        // Find calls using this trunk
        const trunkCalls = calls.filter((call: any) => {
          const members = call.members || [];
          const inbound = members.find((m: any) => m.inbound);
          const outbound = members.find((m: any) => m.outbound);
          const callTrunk = inbound?.inbound?.trunk_name || outbound?.outbound?.trunk_name;
          return callTrunk && callTrunk.includes(trunkName);
        });

        // Estimate bandwidth
        const codec = trunk.codec || 'G.711';
        const bitratePerCall = this.codecBitrates[codec] || this.codecBitrates['G.711'];
        const estimatedBandwidthKbps = trunkCalls.length * bitratePerCall;
        const estimatedBandwidthMbps = estimatedBandwidthKbps / 1000;

        // Assume typical trunk capacity
        const maxCapacityMbps = 100; // Default 100 Mbps
        const utilizationPercent = (estimatedBandwidthMbps / maxCapacityMbps) * 100;

        const entity = this.bandwidthRepo.create({
          pbx_id: 'pbx-labs1',
          trunk_id: trunkId,
          device_name: trunkName,
          device_ip: trunk.registered_ip || trunk.ip || 'unknown',
          interface_name: undefined,
          bytes_received: 0, // Estimated, not actual
          bandwidth_in_mbps: estimatedBandwidthMbps / 2, // Assume symmetric (half in, half out)
          bandwidth_in_percent: utilizationPercent / 2,
          bytes_sent: 0,
          bandwidth_out_mbps: estimatedBandwidthMbps / 2,
          bandwidth_out_percent: utilizationPercent / 2,
          max_capacity_mbps: maxCapacityMbps,
          total_utilization_percent: utilizationPercent,
          errors_in: 0,
          errors_out: 0,
          drops_in: 0,
          drops_out: 0,
          measurement_source: 'estimated',
          active_calls_count: trunkCalls.length,
          codec_used: codec,
          timestamp: new Date(),
        });

        await this.bandwidthRepo.save(entity);
      }

      // System-wide estimate
      const totalCalls = calls.length;
      const avgBitratePerCall = this.codecBitrates['G.711']; // Default
      const totalBandwidthMbps = (totalCalls * avgBitratePerCall) / 1000;

      const systemEntity = this.bandwidthRepo.create({
        pbx_id: 'pbx-labs1',
        trunk_id: undefined, // System-wide
        device_name: 'PBX-System',
        device_ip: 'system',
        interface_name: undefined,
        bytes_received: 0,
        bandwidth_in_mbps: totalBandwidthMbps / 2,
        bandwidth_in_percent: undefined,
        bytes_sent: 0,
        bandwidth_out_mbps: totalBandwidthMbps / 2,
        bandwidth_out_percent: undefined,
        max_capacity_mbps: undefined,
        total_utilization_percent: undefined,
        errors_in: 0,
        errors_out: 0,
        drops_in: 0,
        drops_out: 0,
        measurement_source: 'estimated',
        active_calls_count: totalCalls,
        codec_used: 'mixed',
        timestamp: new Date(),
      });

      await this.bandwidthRepo.save(systemEntity);

      this.logger.debug(
        `📊 Estimated bandwidth: ${totalBandwidthMbps.toFixed(2)} Mbps (${totalCalls} calls)`
      );
    } catch (error) {
      this.logger.error(`Bandwidth estimation error: ${error.message}`);
    }
  }

  /**
   * Get bitrate for a codec
   */
  private getBitrateForCodec(codec: string): number {
    return this.codecBitrates[codec] || this.codecBitrates['G.711'];
  }
}