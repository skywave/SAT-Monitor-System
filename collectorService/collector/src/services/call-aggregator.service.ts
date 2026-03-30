// src/services/call-aggregator.service.ts
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
  private previousCallsMap = new Map<string, any>(); // Track calls to detect ended calls

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
      const periodStart = new Date(now);
      periodStart.setSeconds(0, 0); // Round to minute start

      // Get current active calls
      const currentCalls = await this.pbxDataService.getCalls();
      
      // Calculate which calls ended in this minute
      const endedCalls = this.findEndedCalls(currentCalls);
      
      // Aggregate call statistics
      const stats = await this.aggregateCallData(currentCalls, endedCalls, periodStart);
      
      // Save to database
      await this.callMonitoringRepo.save(stats);
      
      // Update previous calls map for next iteration
      this.updatePreviousCallsMap(currentCalls);
      
      this.logger.debug(
        `📊 Call stats: ${stats.active_calls} active, ${stats.total_calls} total calls in last minute`
      );
    } catch (error) {
      this.logger.error(`Call aggregation error: ${error.message}`);
    }
  }

  /**
   * Find calls that ended since last check
   */
  private findEndedCalls(currentCalls: any[]): any[] {
    const endedCalls: any[] = [];
    
    this.previousCallsMap.forEach((call, callId) => {
      const stillActive = currentCalls.some(c => c.call_id === callId);
      if (!stillActive) {
        endedCalls.push(call);
      }
    });
    
    return endedCalls;
  }

  /**
   * Aggregate call data for the minute
   */
  private async aggregateCallData(
    currentCalls: any[], 
    endedCalls: any[], 
    periodStart: Date
  ): Promise<Partial<CallMonitoringEntity>> {
    // Count inbound/outbound from active calls
    let inboundCount = 0;
    let outboundCount = 0;
    
    for (const call of currentCalls) {
      const members = call.members || [];
      const inbound = members.find((m: any) => m.inbound);
      const outbound = members.find((m: any) => m.outbound);
      
      if (inbound) inboundCount++;
      if (outbound) outboundCount++;
    }
    
    // Aggregate ended calls for totals
    let answeredCount = 0;
    let failedCount = 0;
    let rejectedCount = 0;
    let noAnswerCount = 0;
    let totalDuration = 0;
    
    for (const call of endedCalls) {
      // Determine call outcome from call data
      const disposition = call.disposition || call.end_reason;
      
      if (disposition === 'answered' || call.duration_seconds > 0) {
        answeredCount++;
        totalDuration += call.duration_seconds || 0;
      } else if (disposition === 'failed' || disposition === 'busy') {
        failedCount++;
      } else if (disposition === 'rejected') {
        rejectedCount++;
      } else if (disposition === 'no_answer' || disposition === 'timeout') {
        noAnswerCount++;
      }
      
      // Also count inbound/outbound from ended calls
      const members = call.members || [];
      const inbound = members.find((m: any) => m.inbound);
      const outbound = members.find((m: any) => m.outbound);
      
      if (inbound) inboundCount++;
      if (outbound) outboundCount++;
    }
    
    const totalCalls = endedCalls.length;
    const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : undefined;
    
    return {
      pbx_id: 'pbx-labs1',
      period_start: periodStart,
      period_type: 'minute',
      active_calls: currentCalls.length,
      total_calls: totalCalls,
      inbound_calls: inboundCount,
      outbound_calls: outboundCount,
      answered_calls: answeredCount,
      failed_calls: failedCount,
      rejected_calls: rejectedCount,
      no_answer_calls: noAnswerCount,
      total_duration_seconds: totalDuration,
      avg_duration_seconds: avgDuration,
      last_updated: new Date(),
      // Phase 2 fields (keep as default for now)
      peak_concurrent_calls: currentCalls.length,
    };
  }

  /**
   * Update map of calls for next minute comparison
   */
  private updatePreviousCallsMap(currentCalls: any[]): void {
    this.previousCallsMap.clear();
    for (const call of currentCalls) {
      this.previousCallsMap.set(call.call_id, call);
    }
  }
}