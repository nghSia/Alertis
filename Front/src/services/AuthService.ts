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

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const userId = data.user.id;

    // 1. On vérifie si c'est une patrouille
    const { data: patrol, error: patrolError } = await supabase
      .from("patrols")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (patrolError) {
      console.error("Erreur lors de la recherche de patrouille:", patrolError);
    }

    if (patrol) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", "patrol");
      localStorage.setItem("username", patrol?.name_patrols); // Nom de la patrouille
      return { user: data.user, role: "patrol" };
    }

    // 2. Sinon on vérifie si c'est un client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (clientError) {
      console.error("Erreur lors de la recherche de client:", clientError);
    }

    if (client) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userRole", "client");
      localStorage.setItem("username", client?.first_name);
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
    console.log("Registering user with email:", formData.email);
    console.log("Form data:", formData);
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

    // Nettoyage du localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
  } catch (error: any) {
    throw error;
  }
};
