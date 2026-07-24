-- Habilitar extensión pgcrypto para cifrado de contraseñas si no existe
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ==========================================
-- 1. CREACIÓN DE TABLAS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT,
    email TEXT,
    nivel INT DEFAULT 5,
    system_role TEXT DEFAULT 'user',
    telefono TEXT,
    whatsapp TEXT,
    username TEXT UNIQUE,
    cedula TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.zonas_expansion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.redes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.celulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lider_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    colider_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    zona TEXT,
    direccion TEXT,
    categoria TEXT,
    dia_reunion TEXT,
    hora_reunion TEXT,
    red TEXT,
    lideres_adicionales TEXT,
    fecha_cumpleanos TEXT,
    fecha_aniversario TEXT,
    vacaciones TEXT,
    fecha_apertura TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.informes_celula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lider_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    nombre_celula TEXT,
    lugar TEXT,
    fecha_reunion TEXT,
    nuevos_convertidos INT DEFAULT 0,
    visitas INT DEFAULT 0,
    estado TEXT,
    asistencia_total INT DEFAULT 0,
    ofrenda NUMERIC DEFAULT 0,
    uso_bosquejo BOOLEAN DEFAULT false,
    tema_manual TEXT,
    versiculo_manual TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.asistentes_celula (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lider_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    cedula TEXT,
    whatsapp TEXT,
    telefono TEXT,
    direccion TEXT,
    edad INT,
    libro_juan BOOLEAN DEFAULT false,
    pre_tcd_1 BOOLEAN DEFAULT false,
    tiempo_con_dios BOOLEAN DEFAULT false,
    pos_tcd_2 BOOLEAN DEFAULT false,
    bautismo BOOLEAN DEFAULT false,
    discipulado_1 BOOLEAN DEFAULT false,
    modulo_1_escuela BOOLEAN DEFAULT false,
    seminario_vision BOOLEAN DEFAULT false,
    modulo_2_escuela BOOLEAN DEFAULT false,
    seminario_servicio BOOLEAN DEFAULT false,
    modulo_3 BOOLEAN DEFAULT false,
    lanzamiento BOOLEAN DEFAULT false,
    consolidacion BOOLEAN DEFAULT false,
    plan_felipe BOOLEAN DEFAULT false,
    retiro BOOLEAN DEFAULT false,
    encuentro BOOLEAN DEFAULT false,
    liderazgo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.asistencia_reunion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    informe_id UUID REFERENCES public.informes_celula(id) ON DELETE CASCADE,
    asistente_id UUID REFERENCES public.asistentes_celula(id) ON DELETE CASCADE,
    asistio BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(informe_id, asistente_id)
);

CREATE TABLE IF NOT EXISTS public.bosquejos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    versiculo_base TEXT,
    introduccion TEXT,
    puntos_desarrollo JSONB DEFAULT '[]'::jsonb,
    conclusion TEXT,
    tipo TEXT,
    red_dirigida_id UUID REFERENCES public.redes(id) ON DELETE SET NULL,
    mes INT,
    anio INT,
    autor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    publicado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    contenido TEXT,
    fecha TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. POLÍTICAS RLS (Row Level Security)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zonas_expansion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informes_celula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistentes_celula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_reunion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bosquejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas iniciales (Para que el panel y app funcionen para todos los autenticados)
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['usuarios', 'zonas_expansion', 'redes', 'celulas', 'informes_celula', 'asistentes_celula', 'asistencia_reunion', 'bosquejos', 'anuncios'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('CREATE POLICY "Permitir lectura a autenticados" ON public.%I FOR SELECT TO authenticated USING (true)', t);
        EXECUTE format('CREATE POLICY "Permitir insercion a autenticados" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t);
        EXECUTE format('CREATE POLICY "Permitir actualizacion a autenticados" ON public.%I FOR UPDATE TO authenticated USING (true)', t);
        EXECUTE format('CREATE POLICY "Permitir eliminacion a autenticados" ON public.%I FOR DELETE TO authenticated USING (true)', t);
    END LOOP;
END $$;

-- ==========================================
-- 3. FUNCIONES RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_nombre_completo TEXT,
  p_email TEXT,
  p_nivel INT,
  p_system_role TEXT,
  p_telefono TEXT,
  p_whatsapp TEXT,
  p_username TEXT,
  p_cedula TEXT,
  p_password TEXT
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Insert into auth.users (bypass API limits)
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000', p_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('username', p_username),
    now(), now(), 'authenticated', 'authenticated'
  ) RETURNING id INTO v_user_id;

  -- Insert into auth.identities
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (v_user_id, v_user_id, v_user_id::text, json_build_object('sub', v_user_id, 'email', p_email), 'email', now(), now(), now());

  -- Insert into public.usuarios
  INSERT INTO public.usuarios (
    id, nombre_completo, email, nivel, system_role, telefono, whatsapp, username, cedula, activo
  ) VALUES (
    v_user_id, p_nombre_completo, p_email, p_nivel, p_system_role, p_telefono, p_whatsapp, p_username, p_cedula, true
  );

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.admin_update_user(
  p_user_id UUID,
  p_nombre_completo TEXT,
  p_email TEXT,
  p_nivel INT,
  p_system_role TEXT,
  p_telefono TEXT,
  p_whatsapp TEXT,
  p_username TEXT,
  p_cedula TEXT,
  p_activo BOOLEAN,
  p_password TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Update auth.users
  IF p_password IS NOT NULL AND p_password != '' THEN
    UPDATE auth.users
    SET email = p_email,
        raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{username}', to_jsonb(p_username)),
        encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
        updated_at = now()
    WHERE id = p_user_id;
  ELSE
    UPDATE auth.users
    SET email = p_email,
        raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{username}', to_jsonb(p_username)),
        updated_at = now()
    WHERE id = p_user_id;
  END IF;

  -- Update auth.identities email if it exists
  UPDATE auth.identities
  SET identity_data = jsonb_set(identity_data, '{email}', to_jsonb(p_email)),
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Update public.usuarios
  UPDATE public.usuarios
  SET nombre_completo = p_nombre_completo,
      email = p_email,
      nivel = p_nivel,
      system_role = p_system_role,
      telefono = p_telefono,
      whatsapp = p_whatsapp,
      username = p_username,
      cedula = p_cedula,
      activo = p_activo
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
