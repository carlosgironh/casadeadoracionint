import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kkxjgmnmaxswpnbcimld.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtreGpnbW5tYXhzd3BuYmNpbWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NzEwOTMsImV4cCI6MjA5ODQ0NzA5M30.ikaTjYGKJdTfiskXigmWqHOJAPUXPMv2heWmH6SPdh8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export interface UsuarioProfile {
  id: string;
  nombre_completo?: string;
  nombre?: string;
  email?: string;
  username?: string;
  cedula?: string;
  whatsapp?: string;
  telefono?: string;
  direccion?: string;
  rol?: string;
  nivel?: number;
  pendiente_aprobacion?: boolean;
  conyuge_id?: string;
  equipo_id?: string;
  equipo_lider_id?: string;
  red_asignada_id?: string;
  created_at?: string;
}

export interface CelulaItem {
  id: string;
  zona?: string;
  nombre?: string;
  direccion?: string;
  categoria?: string;
  dia_reunion?: string;
  hora_reunion?: string;
  lider_id?: string;
  colider_id?: string;
}

export interface AnuncioItem {
  id: string;
  titulo: string;
  contenido: string;
  imagen_url?: string;
  fecha?: string;
  created_at?: string;
}

export interface BosquejoItem {
  id: string;
  titulo: string;
  tipo?: string;
  versiculo_base?: string;
  contenido?: string;
  archivo_url?: string;
  created_at?: string;
}
