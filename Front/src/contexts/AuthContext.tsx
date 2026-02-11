import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const queryClient = useQueryClient();

  // Gestion de la session Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        queryClient.setQueryData(["profile"], null); // Nettoie le cache au logout
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Récupération du profil avec TanStack Query
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear(); // Vide tout le cache pour la sécurité
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading: authLoading || profileLoading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
