-- ==========================================
-- 1. TYPES ET ENUMS
-- ==========================================

-- Type pour les rôles (Patrouilles créées à la main, Users via inscription)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'patrol');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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
-- 2. TABLE PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  tel TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  position_actuelle position_gps DEFAULT NULL, -- Optionnel lors de l'inscription
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

-- Trigger pour updated_at
CREATE TRIGGER tr_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Fonction de création automatique de profil (Sign-up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, prenom, tel, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    (NEW.raw_user_meta_data->>'nom'), 
    (NEW.raw_user_meta_data->>'prenom'),
    (NEW.raw_user_meta_data->>'tel'),
    'user' -- Sécurité : force le rôle user par défaut
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur gère ses propres données
CREATE POLICY "L'utilisateur gère son propre profil"
ON public.profiles FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Les patrouilles ont le droit de voir tous les profils (pour les secours)
CREATE POLICY "Les patrouilles voient tous les profils"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'patrol'
);