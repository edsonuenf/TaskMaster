const SUPABASE_URL = 'https://wpjoyzxniaadrrkbtamd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwam95enhuaWFhZHJya2J0YW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzI0ODAsImV4cCI6MjA4OTk0ODQ4MH0.h5F5jh9qtX1gei-xkEvozZi4hJMTy1cHs6FwVVbr-cQ';

console.log('Supabase CDN:', typeof window.supabase);
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client:', supabase);
