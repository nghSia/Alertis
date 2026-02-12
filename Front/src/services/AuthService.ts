import { supabase } from "../integrations/supabase/client";

// Validation des critères du mot de passe
export const validatePassword = (password: string) => {
  return {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

// Vérifier si tous les critères du mot de passe sont validés
export const isPasswordValid = (password: string) => {
  const requirements = validatePassword(password);
  return Object.values(requirements).every(Boolean);
};

/**
 * Récupère le jeton d'accès (JWT) actuel.
 * Supabase gère le rafraîchissement automatique du token.
 */
export const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
};

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const userId = data.user.id;

    // 1. On vérifie si c'est une patrouille
    const { data: patrol } = await supabase
      .from("patrols")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (patrol) {
      sessionStorage.setItem("userRole", "patrol");
      sessionStorage.setItem("username", patrol?.name_patrols ?? "");
      sessionStorage.setItem("patrolType", patrol?.type);
      return { user: data.user, role: "patrol" };
    }

    // 2. Sinon on vérifie si c'est un client
    const { data: client } = await supabase
      .from("clients")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (client) {
      sessionStorage.setItem("userRole", "client");
      sessionStorage.setItem("userFirstName", client?.first_name);
      sessionStorage.setItem("userLastName", client?.last_name);
      sessionStorage.setItem(
        "username",
        `${client?.last_name} ${client?.first_name}`,
      );
      return { user: data.user, role: "client" };
    }
    return { user: data.user, role: null };
  } catch (error: any) {
    if (error.message === "Invalid login credentials") {
      throw new Error("Email ou mot de passe incorrect.");
    }
    throw error;
  }
};

export const register = async (formData: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    throw new Error(
      "Veuillez entrer une adresse email valide (ex: nom@domaine.com).",
    );
  }

  // Validation du mot de passe avec critères métier
  if (!isPasswordValid(formData.password)) {
    const requirements = validatePassword(formData.password);
    const missing = [];
    if (!requirements.minLength) missing.push("6 caractères minimum");
    if (!requirements.hasUppercase) missing.push("une lettre majuscule");
    if (!requirements.hasNumber) missing.push("un chiffre");
    if (!requirements.hasSymbol) missing.push("un symbole (!@#$%^&*...)");

    throw new Error(`Le mot de passe doit contenir: ${missing.join(", ")}.`);
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          email: formData.email,
          lastName: formData.lastName,
          firstName: formData.firstName,
          phone: formData.phone,
        },
      },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    if (error.message === "User already registered") {
      throw new Error("Cet email est déjà utilisé.");
    }
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("patrolType");
    sessionStorage.removeItem("userFirstName");
    sessionStorage.removeItem("userLastName");
  } catch (error: any) {
    throw error;
  }
};
