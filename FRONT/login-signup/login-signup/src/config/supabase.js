// src/config/supabaseApi.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getTrunks() {
    return this.request('/trunks');
  }

  async getNetworkStatus() {
    return this.request('/network/status');
  }

  async getCallStats() {
    return this.request('/calls/stats');
  }

  async getAlerts() {
    return this.request('/alerts');
  }
}

export const api = new APIClient(API_URL);