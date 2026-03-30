import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CallMonitoringEntity } from '../persistence/entities/call-monitoring.entity';
import { PBXDataService } from '../supervisor/pbx-data.service';

/**
 * Aggregates call statistics every minute
 * Writes to call_monitoring table
 */
@Injectable()
export class CallAggregatorService {
  private readonly logger = new Logger(CallAggregatorService.name);

  constructor(
    @InjectRepository(CallMonitoringEntity)
    private readonly callMonitoringRepo: Repository<CallMonitoringEntity>,
    private readonly pbxDataService: PBXDataService,
  ) {}

  /**
   * Run every minute to aggregate call stats
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async aggregateCallStats(): Promise<void> {
    try {
      const now = new Date();
      const periodStart = new Date(now.setSeconds(0, 0)); // Round to minute

      // Get active calls
      const calls = await this.pbxDataService.getCalls();

      // TODO: Get CDR for completed calls in last minute
      // For now, just track active calls

      const stats = {
        pbx_id: 'pbx-labs1',
        trunk_id: undefined, // System-wide aggregation
        period_start: periodStart,
        period_type: 'minute',
        active_calls: calls.length,
        peak_concurrent_calls: calls.length, // TODO: Track peak
        total_calls: 0, // TODO: Get from CDR
        inbound_calls: 0,
        outbound_calls: 0,
        internal_calls: 0,
        completed_calls: 0,
        answered_calls: 0,
        failed_calls: 0,
        rejected_calls: 0,
        no_answer_calls: 0,
        busy_calls: 0,
        total_duration_seconds: 0,
        avg_duration_seconds: undefined,
        max_duration_seconds: undefined,
        min_duration_seconds: undefined,
        avg_call_setup_time_ms: undefined,
        call_success_rate_percent: undefined,
        mno_distribution: undefined,
        last_updated: new Date(),
      };

      await this.callMonitoringRepo.save(stats);

      this.logger.debug(
        `📊 Aggregated call stats: ${calls.length} active calls at ${periodStart.toISOString()}`
      );
    } catch (error) {
      this.logger.error(`Call aggregation error: ${error.message}`);
    }
  }
}