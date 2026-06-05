import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// for local development
export const supabase = createClient<Database>(
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// TODO: change to this for production
// export const supabase = createClient<Database>(
//     import.meta.env.VITE_SUPABASE_URL,
//     import.meta.env.VITE_SUPABASE_ANON_KEY
// )