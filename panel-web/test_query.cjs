const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fhugnuhatzcepvhnacsm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodWdudWhhdHpjZXB2aG5hY3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEyODMsImV4cCI6MjA5ODQ0NzI4M30.3eP6wr17wgW6Dp4ITcU8ub-W68d8jWyePVRdxM8k-as';

const test = async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase
        .from('celulas')
        .select('*, colider:colider_id(nombre_completo), usuarios!celulas_lider_id_fkey(nombre_completo, plan_felipe, capacitacion, ministerio, lider_directo:lider_directo_id(nombre_completo), equipo_lider:equipo_lider_id(nombre), redes:red_asignada_id(nombre))')
        .order('fecha_apertura', { ascending: false });

    if (error) {
        console.error("Supabase Error:", error);
    } else {
        console.log("Success! Fetched", data.length, "celulas.");
    }
}
test();
