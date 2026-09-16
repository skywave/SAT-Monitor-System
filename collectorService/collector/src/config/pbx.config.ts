/**
 * pbx.config.ts
 * 
 * PBX configuration
 */

import { PBXConfig } from '../pbx/instance/pbx.instance'
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.PBX_USERNAME) console.warn('WARN: PBX_USERNAME missing in .env — falling back to default');
if (!process.env.PBX_PASSWORD) console.warn('WARN: PBX_PASSWORD missing in .env — falling back to default');

export const pbxConfigs: PBXConfig[] = [
  {
    id: 'pbx-labs1',
    ip: 'labs1.ras.yeastar.com',
    username: process.env.PBX_USERNAME || '***REMOVED***',
    password: process.env.PBX_PASSWORD || '***REMOVED***',
  }
]