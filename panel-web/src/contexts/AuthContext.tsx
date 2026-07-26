import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from './SupabaseContext';

export interface SystemProfile {
  system_role: 'superadmin' | 'admin' | 'secretaria' | 'contabilidad' | 'soporte' | 'user';
  nombre_completo: string;
  nivel?: number;
  username?: string;
  telefono?: string;
  whatsapp?: string;
  cedula?: string;
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

  // Idle Timer (30 minutes)
  const IDLE_TIMEOUT = 1000 * 60 * 30;

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('system_role, nombre_completo, nivel, username, telefono, whatsapp, cedula')
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

    // --- Idle Timer Logic ---
    let idleTimeoutId: ReturnType<typeof setTimeout>;
    const resetIdleTimer = () => {
      clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        // Only sign out if user is actually logged in
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) {
            console.log('Logging out due to inactivity');
            supabase.auth.signOut();
          }
        });
      }, IDLE_TIMEOUT);
    };

    // Attach event listeners
    const events = ['mousemove', 'keydown', 'wheel', 'DOMMouseScroll', 'mouseWheel', 'mousedown', 'touchstart', 'touchmove', 'MSPointerDown', 'MSPointerMove'];
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });
    
    // Start the timer
    resetIdleTimer();

    return () => {
      subscription.unsubscribe();
      clearTimeout(idleTimeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
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
