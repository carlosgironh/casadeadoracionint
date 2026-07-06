const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://fhugnuhatzcepvhnacsm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const { data: cell } = await supabase.from('celulas').select('*').limit(1);
  if (cell && cell.length > 0) {
    const { data, error } = await supabase.from('celulas').update({ lideres_adicionales: 'test' }).eq('id', cell[0].id).select();
    console.log('Update result:', data, error);
  }
}
testUpdate();
