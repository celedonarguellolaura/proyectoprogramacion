import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Solo activa Supabase si la clave parece un JWT real (empieza con eyJ)
const configured = url && key && key.startsWith('eyJ')

export const supabase = configured ? createClient(url, key) : null
