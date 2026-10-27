import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { UsuarioProfile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UsuarioProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UsuarioProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error al cargar perfil de usuario:', error.message);
      }
      if (data) {
        setProfile(data as UsuarioProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Support mock authentication for UI preview / test demo
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mockAuth') === '1') {
      const mockUser = { id: '313fcbc5-a1b4-41e6-a3ac-4f7ece2ba01f', email: 'cgiron@casadeadoracionint.com' } as any;
      const mockProfile: UsuarioProfile = {
        id: '313fcbc5-a1b4-41e6-a3ac-4f7ece2ba01f',
        nombre_completo: 'Carlos Giron',
        username: 'cgiron',
        email: 'cgiron@casadeadoracionint.com',
        nivel: 7,
        pendiente_aprobacion: false
      };
      setUser(mockUser);
      setProfile(mockProfile);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      await fetchProfile(data.user.id);
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        login,
        logout,
        signOut: logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
