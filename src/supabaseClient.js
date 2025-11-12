import { createClient } from '@supabase/supabase-js'

// Supabase конфигурация
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jkbspeccroxmslgzftdf.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnNwZWNjcm94bXNsZ3pmdGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMDI4NDYsImV4cCI6MjA3MzY3ODg0Nn0.9C5put-DNAHFVkP5YAi5snddu6qnIlkQVhYJr9as81A'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

