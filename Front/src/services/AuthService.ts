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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;
    return { user: data.user, role: profile?.role };
  } catch (error: any) {
    if (error.message === "Invalid login credentials") {
      throw new Error("Email ou mot de passe incorrect.");
    }
    throw error;
  }
};

export const register = async (formData: any) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
          nom: formData.nom,
          prenom: formData.prenom,
          tel: formData.tel,
          role: "client",
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
