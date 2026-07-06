import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseContext';

export interface SystemProfile {
  system_role: 'superadmin' | 'admin' | 'secretaria' | 'contabilidad' | 'soporte' | 'user';
  nombre_completo: string;
  nivel?: number;
  username?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  direccion?: string;
}

interface AuthContextType {
  user: User | null;
  profile: SystemProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SystemProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('system_role, nombre_completo, nivel, username, telefono, fecha_nacimiento, direccion')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
        }
        setProfile(data);
      } catch (err) {
        console.error("Exception fetching profile:", err);
        setProfile(null);
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
