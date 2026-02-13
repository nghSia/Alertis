import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { logout as authLogout } from "../services/AuthService";

interface AuthContextType {
  user: any | null;
  profile: any | null;
  role: "client" | "patrol" | null;
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
  const  [user, setUser] = useState<any | null>(null);
  const[role, setRole] = useState<"client" | "patrol" | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const queryClient = useQueryClient();

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
        setRole(null);
        queryClient.setQueryData(["profile"], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: patrol } = await supabase
        .from("patrols")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (patrol) {
        setRole("patrol");
        return patrol;
      }

      const { data: client, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setRole("client");
      return client;
    },
    enabled: !!user,
  });

  const signOut = async () => {
    await authLogout();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading: authLoading || profileLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
