import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dssipdkvbdiffplqcept.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzc2lwZGt2YmRpZmZwbHFjZXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NTc5MTMsImV4cCI6MjA5MjQzMzkxM30.OCRa_LjPA-J5dA32YLmzEQFo_csK2h1SiL0wD467xL8';

// For Web, we don't need the custom storage object or polyfills
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Set to true for web to handle password reset links
  },
});