const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fhugnuhatzcepvhnacsm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as');
async function test() {
  const { data, error } = await supabase.from('usuarios').select('id, nombre_completo');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
test();
