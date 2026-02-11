import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your .env file.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Permet de rafraîchir automatiquement le token d'authentification
    autoRefreshToken: true,
    // Permet de garder l'utilisateur connecté même après un rafraîchissement de la page
    persistSession: true,
    // Permet de détecter les sessions dans l'URL (utile pour les redirections après connexion)
    detectSessionInUrl: true,
    // Utilisation du localStorage pour stocker les sessions de manière persistante
    storage: window.localStorage,
  },
  global: {
    headers: { "x-application-name": "alertis" },
  },
});
