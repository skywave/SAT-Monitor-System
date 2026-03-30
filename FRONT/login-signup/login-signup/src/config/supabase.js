import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mlpfnfbgpraprzuysnge.supabase.co'
const supabaseKey = 'sb_publishable_F6Hzt-MAkdwuxVMYz4DKtA__FSnDOVM'

export const supabase = createClient(supabaseUrl, supabaseKey)