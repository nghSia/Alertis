import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or Key is missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // Permet de rafraîchir automatiquement le token d'authentification
        autoRefreshToken: true,
        // Permet de garder l'utilisateur connecté même après un rafraîchissement de la page
        persistSession: true,
        // Permet de détecter les sessions dans l'URL (utile pour les redirections après connexion)
        detectSessionInUrl: true,

    },
    global: {
        headers: { "x-application-name": "alertis" },
    },
});
