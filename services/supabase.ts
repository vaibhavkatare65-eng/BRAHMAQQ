import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://watemngmzbcyyatedjgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdGVtbmdtemJjeXlhdGVkamdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDEyNDUsImV4cCI6MjA3OTgxNzI0NX0.R9FwTdSf-gjposXOa_YzROaoEoSjJtb4NKRZ_tZINrQ';

export const supabase = createClient(supabaseUrl, supabaseKey);