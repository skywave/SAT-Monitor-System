/**
 * api.client.ts
 * 
 * PBX class for interacting with Yeastar P-Series API.
 * Follows official API documentation for authentication and requests.
 */

import axios, { AxiosInstance } from 'axios'

export interface TokenResponse {
  errcode: number
  errmsg: string
  access_token: string
  access_token_expire_time: number
  refresh_token: string
  refresh_token_expire_time: number
}

/**
 * PBX class represents a single Yeastar P-Series PBX.
 */
export class PBX {
  private token: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: number | null = null
  private axiosInstance: AxiosInstance

  /**
   * @param ip PBX IP or hostname
   * @param username API username (Client ID)
   * @param password API password (Client Secret)
   */
  constructor(
    public ip: string,
    public username: string,
    public password: string
  ) {
    this.axiosInstance = axios.create({
      baseURL: `https://${ip}/openapi/v1.0/`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OpenAPI' // required by Yeastar
      },
      timeout: 120000
    })
  }

  /**
   * Authenticate with PBX and store access + refresh tokens
   */
  async authenticate(): Promise<void> {

    console.log('[PBX] Attempting authentication with PBX at', this.ip)

    try {
        const ipCheck = await axios.get('https://api.ipify.org?format=json')
        console.log(`[PBX] Our current outgoing IP is: ${ipCheck.data.ip}`)
    } catch (error) {
        console.error('[PBX] Failed to check outgoing IP:', error.message)  
    }

    const response = await this.axiosInstance.post<TokenResponse>('get_token', {
      username: this.username,
      password: this.password
    })

    if (response.data.errcode !== 0) {
        console.log('Full PBX response:', JSON.stringify(response.data, null, 2))
      throw new Error(`PBX auth failed: ${response.data.errmsg}`)
    }

    this.token = response.data.access_token
    this.refreshToken = response.data.refresh_token
    this.tokenExpiry = Date.now() + response.data.access_token_expire_time * 1000
    this.axiosInstance.defaults.headers.common['Authorization'] = `${this.token}`
  }

  /**
   * Refresh access token using refresh_token
   */
  async refresh(): Promise<void> {
    if (!this.refreshToken) throw new Error('No refresh token. Authenticate first.')

    const response = await this.axiosInstance.post<TokenResponse>('refresh_token', {
      refresh_token: this.refreshToken
    })

    if (response.data.errcode !== 0) {
      throw new Error(`PBX token refresh failed: ${response.data.errmsg}`)
    }

    this.token = response.data.access_token
    this.refreshToken = response.data.refresh_token
    this.tokenExpiry = Date.now() + response.data.access_token_expire_time * 1000
    this.axiosInstance.defaults.headers.common['Authorization'] = `${this.token}`
  }

  /**
   * Generic request wrapper for PBX API
   * @param endpoint API endpoint like 'extension/list'
   * @param method HTTP method
   * @param data POST payload
   */
  async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    const token = await this.getAccessToken() // Ensure we have a valid token before making the request
    console.log(`[PBX] Making API request to ${endpoint}`)
    const response = await this.axiosInstance.request({
      url: endpoint,
      method,
      data,
    })

    return response.data
  }

  /**
   * Example: get list of extensions
   */
  async getExtensions(): Promise<any> {
    return this.request('extension/list', 'GET')
  }

  /**
   * Example: get list of trunks
   */
  async getTrunks(): Promise<any> {
    return this.request('trunk/list', 'GET')
  }

  /**
 * Check if current access token is valid.
 * If expired, automatically refresh.
 */
async hasValidToken(): Promise<boolean> {
  if (!this.token) return false

  // Optional: check expiry if you track it
  if (this.tokenExpiry && Date.now() >= this.tokenExpiry - 30000) {
    // Token is about to expire, try refresh
    try {
      await this.refresh()
    } catch (err) {
      console.error('[PBX] Token refresh failed:', err)
      return false
    }
  }

  return !!this.token
}

/**
 * Return the current access token.
 * If not valid, refresh automatically.
 */
async getAccessToken(): Promise<string> {
  const valid = await this.hasValidToken()
  if (!valid) {
    throw new Error('No valid access token. Authenticate first.')
  }
  return this.token!
}

  // Add other endpoint-specific methods as needed
}
