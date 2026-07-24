import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kkxjgmnmaxswpnbcimld.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGpnbW5tYXhzd3BuYmNpbWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEwOTMsImV4cCI6MjA5ODQ0NzA5M30.ikaTjYGKJdTfiskXigmWqHOJAPUXPMv2heWmH6SPdh8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUsers() {
  console.log('Creando usuario lzurita...');
  const { data: d1, error: e1 } = await supabase.auth.signUp({
    email: 'lzurita@casadeadoracionint.com',
    password: '12345678',
    options: { data: { username: 'lzurita' } }
  });
  if (e1) console.error('Error con lzurita:', e1);
  else console.log('Usuario lzurita creado.');

  console.log('Creando usuario cgiron...');
  const { data: d2, error: e2 } = await supabase.auth.signUp({
    email: 'cgiron@casadeadoracionint.com',
    password: 'Kris3289@',
    options: { data: { username: 'cgiron' } }
  });
  if (e2) console.error('Error con cgiron:', e2);
  else console.log('Usuario cgiron creado.');
}

createUsers();
