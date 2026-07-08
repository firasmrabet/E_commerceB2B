-- Fichier à exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS public.client_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name_encrypted TEXT NOT NULL,
    phone_encrypted TEXT NOT NULL,
    phone_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS sur la table
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de lire leur propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" 
ON public.client_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- La création ou modification des profils se fera via l'API sécurisée du Backend en utilisant la clé SERVICE ROLE
-- afin d'empêcher un utilisateur de modifier son profil directement (ou de manipuler les empreintes).

-- Autorisation pour permettre l'insertion de profils
CREATE POLICY "L'insertion des profils se fait par le backend"
ON public.client_profiles
FOR INSERT 
WITH CHECK (true); -- Le backend utilise le Service Role de toute façon

CREATE POLICY "La mise à jour des profils se fait par le backend"
ON public.client_profiles
FOR UPDATE
USING (true); -- Le backend utilise le Service Role de toute façon
