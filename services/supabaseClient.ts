import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjquwbnkftbqngvyiouf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcXV3Ym5rZnRicW5ndnlpb3VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTIxMjgsImV4cCI6MjA3NDg4ODEyOH0.omomIAc1prfUUejE3wHkK3ae8yFbP5QQHbKdS1EmT8I';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are not set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);