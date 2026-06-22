import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Brak konfiguracji Supabase. Uzupełnij plik .env na podstawie .env.example'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nazwa kubełka (bucket) na pliki projektów w Supabase Storage
export const FILES_BUCKET = 'projekty-ogrody'
