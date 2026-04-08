// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlpfnfbgpraprzuysnge.supabase.co'
const supabaseKey = 'sb_publishable_F6Hzt-MAkdwuxVMYz4DKtA__FSnDOVM'

// Create client with explicit headers
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  },
})