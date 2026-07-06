const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://fhugnuhatzcepvhnacsm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as');
async function test() {
  const { data, error } = await supabase.rpc('reasignar_celula_bypass_rls', {
    p_celula_id: 'c6f839f8-cea5-451b-8255-ad31811d59a1',
    p_nuevo_lider_id: 'c6f839f8-cea5-451b-8255-ad31811d59a1',
    p_nuevo_colider_id: null,
    p_lideres_adicionales: ''
  });
  console.log('Error:', error);
}
test();
