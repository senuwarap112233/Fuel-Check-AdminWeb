import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdonioovmmuvfpbcbzer.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkb25pb292bW11dmZwYmNiemVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDg3NTYsImV4cCI6MjA4ODY4NDc1Nn0.UP3kTbPR1D3Y7mPUw6hwDC8BOEf5KByIuY61dCIgEPw';

// For Web, we don't need the custom storage object or polyfills
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Set to true for web to handle password reset links
  },
});