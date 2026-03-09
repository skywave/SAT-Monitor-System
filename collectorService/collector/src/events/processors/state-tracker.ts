// src/events/processors/state-tracker.ts

import { Injectable, Logger } from '@nestjs/common';
import { NormalizedEvent } from './event-normalizer';

/**
 * Tracks resource states and detects changes
 * Prevents duplicate events for unchanged states
 */
@Injectable()
export class StateTracker {
  private readonly logger = new Logger(StateTracker.name);
  
  // In-memory cache: key = "pbxId:resourceType:resourceId"
  private states = new Map<string, any>();

  /**
   * Check if event represents a state change
   * Returns true if this is a NEW state (emit event)
   */
  shouldEmit(event: NormalizedEvent): boolean {
    const key = this.getStateKey(event);
    const currentState = this.states.get(key);

    // First time seeing this resource
    if (!currentState) {
      this.updateState(event);
      return true;
    }

    // Check if state actually changed
    const hasChanged = this.hasStateChanged(currentState, event.data);

    if (hasChanged) {
      this.logger.log(
        `State changed: ${event.resource.type}/${event.resource.name} ` +
        `(${event.pbxId})`
      );
      this.updateState(event);
      return true;
    }

    // No change, don't emit
    this.logger.debug(
      `No state change: ${event.resource.type}/${event.resource.name}`
    );
    return false;
  }

  /**
   * Update stored state
   */
  private updateState(event: NormalizedEvent): void {
    const key = this.getStateKey(event);
    this.states.set(key, {
      ...event.data,
      lastUpdated: event.timestamp,
    });
  }

  /**
   * Generate unique key for resource
   */
  private getStateKey(event: NormalizedEvent): string {
    return `${event.pbxId}:${event.resource.type}:${event.resource.id}`;
  }

  /**
   * Compare states to detect changes
   * For trunk events, we care about status field
   */
  private hasStateChanged(oldState: any, newState: any): boolean {
    // For trunk status, check the status field
    if (newState.status !== undefined) {
      return oldState.status !== newState.status;
    }

    // For call events, check call_status
    if (newState.call_status !== undefined) {
      return oldState.call_status !== newState.call_status;
    }

    // Default: assume it changed if we can't determine
    return true;
  }

  /**
   * Get current state for a resource
   */
  getState(pbxId: string, resourceType: string, resourceId: string): any {
    const key = `${pbxId}:${resourceType}:${resourceId}`;
    return this.states.get(key);
  }

  /**
   * Get all trunk states for a PBX
   */
  getTrunkStates(pbxId: string): Map<string, any> {
    const trunks = new Map<string, any>();
    
    for (const [key, state] of this.states.entries()) {
      if (key.startsWith(`${pbxId}:trunk:`)) {
        const trunkId = key.split(':')[2];
        trunks.set(trunkId, state);
      }
    }
    
    return trunks;
  }

  /**
   * Get all extension states for a PBX
   */
  getExtensionStates(pbxId: string): Map<string, any> {
    const extensions = new Map<string, any>();
    
    for (const [key, state] of this.states.entries()) {
      if (key.startsWith(`${pbxId}:extension:`)) {
        const extId = key.split(':')[2];
        extensions.set(extId, state);
      }
    }
    
    return extensions;
  }

  /**
   * Get all call states for a PBX
   */
  getCallStates(pbxId: string): Map<string, any> {
    const calls = new Map<string, any>();
    
    for (const [key, state] of this.states.entries()) {
      if (key.startsWith(`${pbxId}:call:`)) {
        const callId = key.split(':')[2];
        calls.set(callId, state);
      }
    }
    
    return calls;
  }

  /**
   * Get all agent states for a PBX
   */
  getAgentStates(pbxId: string): Map<string, any> {
    const agents = new Map<string, any>();
    
    for (const [key, state] of this.states.entries()) {
      if (key.startsWith(`${pbxId}:agent:`)) {
        const agentId = key.split(':')[2];
        agents.set(agentId, state);
      }
    }
    
    return agents;
  }

  /**
   * Clear states (for testing or reset)
   */
  clear(): void {
    this.states.clear();
  }
}