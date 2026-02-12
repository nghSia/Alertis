-- ==========================================
-- 1. TYPES
-- ==========================================

-- Type pour la géolocalisation (Utilisé lors d'une alerte)
DO $$ BEGIN
    CREATE TYPE position_gps AS (
        lat FLOAT,
        lng FLOAT
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==========================================
-- 2. TABLES (CLIENTS & PATROLS)
-- ==========================================

-- Table CLIENTS (Remplace l'ancienne table profiles)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  tel TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table PATROLS (Pour les patrouilles)
CREATE TABLE IF NOT EXISTS public.patrols (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  matrice_id TEXT, -- Exemple de champ specifique
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. FONCTIONS ET AUTOMATISATION (TRIGGER)
-- ==========================================

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at (clients)
CREATE TRIGGER tr_update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger pour updated_at (patrols)
CREATE TRIGGER tr_update_patrols_updated_at
    BEFORE UPDATE ON public.patrols
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Fonction de création automatique de profil CLIENT (Sign-up)
-- On assume que l'inscription publique via l'app crée des CLIENTS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (id, email, nom, prenom, tel)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
    (NEW.raw_user_meta_data->>'lastName'), -- Mapping corrigé pour correspondre au Front (AuthService.ts)
    (NEW.raw_user_meta_data->>'firstName'), -- Mapping corrigé
    (NEW.raw_user_meta_data->>'phone') -- Mapping corrigé
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation du trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 4. SÉCURITÉ (RLS)
-- ==========================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.patrols ENABLE ROW LEVEL SECURITY;

-- Politiques pour CLIENTS
CREATE POLICY "Le client accède à son propre profil" ON public.clients FOR ALL TO authenticated USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);

-- Politiques pour PATROLS
CREATE POLICY "La patrouille accède à son propre profil" ON public.patrols FOR ALL TO authenticated USING (auth.uid () = id)
WITH
    CHECK (auth.uid () = id);