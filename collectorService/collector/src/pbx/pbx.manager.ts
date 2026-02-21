/**
 * pbx.manager.ts
 * 
 * Manages PBX instances
 */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { PBXInstance, PBXConfig } from './instance/pbx.instance'
import { pbxConfigs } from '../config/pbx.config'

@Injectable()
export class PBXManager implements OnModuleInit {
  private readonly logger = new Logger(PBXManager.name)
  private instances: Map<string, PBXInstance> = new Map()

  /**
   * This runs automatically when NestJS starts the application
   */
  async onModuleInit() {
    this.logger.log('Initializing PBX connections...')
    for (const config of pbxConfigs) {
      await this.initializePBX(config)
    }
  }

  /**
   * Initialize a single PBX instance
   */
  async initializePBX(config: PBXConfig): Promise<void> {
    try {
      const instance = new PBXInstance(config)
      await instance.connect()
      this.instances.set(config.id, instance)
      this.logger.log(`PBX [${config.id}] initialized successfully`)
    } catch (error) {
      this.logger.error(`Failed to initialize PBX [${config.id}]: ${error.message}`)
    }
  }

  /**
   * Get a PBX instance by ID
   */
  getInstance(id: string): PBXInstance | undefined {
    return this.instances.get(id)
  }

  /**
   * Get all active PBX instances as an array
   * (Required for WebSocketManager to iterate and connect listeners)
   */
  getAllInstances(): PBXInstance[] {
    return Array.from(this.instances.values())
  }

  /**
   * Get extensions from a specific PBX
   */
  async getExtensions(pbxId: string): Promise<any> {
    const instance = this.getInstance(pbxId)
    if (!instance) {
      throw new Error(`PBX ${pbxId} not found`)
    }
    return instance.request('extension/list')
  }
}