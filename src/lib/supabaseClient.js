import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dukkzhdaspgcqnlbfhqt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1a2t6aGRhc3BnY3FubGJmaHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MTM2MTEsImV4cCI6MjA2MjM4OTYxMX0.WJwl9wdI1ZUDsTVX87FH9JAUMVsHDXIv0DvFvi3aEvw';

export const supabase = createClient(supabaseUrl, supabaseKey);
