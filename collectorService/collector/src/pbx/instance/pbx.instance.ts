/**
 * pbx.instance.ts
 * 
 * Manages a single PBX connection with token lifecycle
 */

import { PBX } from './api.client'

export interface PBXConfig {
  id: string
  ip: string
  username: string  // Client ID
  password: string  // Client Secret
}

export class PBXInstance {
  public readonly id: string
  public readonly ip: string
  
  public apiClient: PBX
  private isConnected: boolean = false
  
  // Token management
  private tokenRefreshTimer?: NodeJS.Timeout
  
  constructor(private config: PBXConfig) {
    this.id = config.id
    this.ip = config.ip
    
    this.apiClient = new PBX(config.ip, config.username, config.password)
  }

  /**
   * Establish connection: get token and schedule refresh
   */
  async connect(): Promise<void> {
    try {
      console.log(`[PBX ${this.id}] Connecting...`)
      
      // Get initial token
      await this.apiClient.authenticate()
      
      this.isConnected = true
      
      // Schedule token refresh before it expires
      this.scheduleTokenRefresh()
      
      console.log(`[PBX ${this.id}] Connected successfully`)
    } catch (error) {
      this.isConnected = false
      console.error(`[PBX ${this.id}] Connection failed:`, error)
      throw error
    }
  }

  /**
   * Schedule automatic token refresh before expiration
   * Docs say: access_token expires in 1800s (30 min)
   * We'll refresh at 25 minutes to have a buffer
   */
  private scheduleTokenRefresh(): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
    }
    
    // Refresh 5 minutes before expiration (25 min = 1500s)
    const refreshInMs = 25 * 60 * 1000
    
    this.tokenRefreshTimer = setTimeout(async () => {
      await this.refreshToken()
    }, refreshInMs)
    
    console.log(`[PBX ${this.id}] Token refresh scheduled in ${refreshInMs / 1000}s`)
  }

  /**
   * Refresh access token using refresh_token
   */
  private async refreshToken(): Promise<void> {
    try {
      console.log(`[PBX ${this.id}] Refreshing token...`)
      
      await this.apiClient.refresh()
      
      // Schedule next refresh
      this.scheduleTokenRefresh()
      
      console.log(`[PBX ${this.id}] Token refreshed successfully`)
    } catch (error) {
      console.error(`[PBX ${this.id}] Token refresh failed, attempting reconnect:`, error)
    }

    console.log(`PBX ${this.id} will retry refresh in 60 seconds`)

    setTimeout(async () => {
      try {
        await this.apiClient.refresh()
        this.scheduleTokenRefresh()
      } catch (retryError) {
        console.log(`[PBX ${this.id}] Token refresh retry failed:`, retryError)
        await this.connect() // Attempt full reconnect if refresh fails
      }
    }, 6000)
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer)
    }
    this.isConnected = false
    console.log(`[PBX ${this.id}] Disconnected`)
  }

  /**
   * Check if ready for API calls
   */
  isReady(): boolean {
    return this.isConnected
  }

  /**
   * Make API request (delegates to client)
   */
  async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    if (!this.isReady()) {
      throw new Error(`PBX ${this.id} not ready`)
    }

    // Ensure that this token is valid before making the request
    const valid = await this.apiClient.hasValidToken()
    if (!valid) {
      throw new Error(`PBX ${this.id} has invalid token`)
    }

    return this.apiClient.request(endpoint, method, data)
  }

  /**
   * Get instance info
   */
  getInfo() {
    return {
      id: this.id,
      ip: this.ip,
      connected: this.isConnected
    }
  }
}