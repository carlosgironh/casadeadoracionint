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
  nombre: string;
  email: string;
  rol?: string;
  aprobado?: boolean;
  telefono?: string;
  celula_id?: string;
  red_id?: string;
  created_at?: string;
}

export interface CelulaItem {
  id: string;
  nombre: string;
  codigo?: string;
  red_id?: string;
  lider_id?: string;
  dia_reunion?: string;
  hora_reunion?: string;
}

export interface InformeCelula {
  id?: string;
  celula_id: string;
  lider_id: string;
  fecha_reunion: string;
  asistentes_miembros: number;
  asistentes_visitas: number;
  conversiones: number;
  reconciliaciones: number;
  ofrenda_monto: number;
  observaciones?: string;
  evidencia_url?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  created_at?: string;
}

export interface AnuncioItem {
  id: string;
  titulo: string;
  contenido: string;
  imagen_url?: string;
  fecha?: string;
  destacado?: boolean;
  created_at?: string;
}

export interface BosquejoItem {
  id: string;
  titulo: string;
  tema?: string;
  versiculo_clave?: string;
  contenido: string;
  archivo_url?: string;
  fecha?: string;
  created_at?: string;
}

export interface AsistenteItem {
  id: string;
  nombre: string;
  telefono?: string;
  tipo?: 'miembro' | 'visita' | 'lider';
  celula_id?: string;
  created_at?: string;
}
