import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Env Vars!');
    alert('Konfigurasi Supabase hilang! Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ada di .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey)
