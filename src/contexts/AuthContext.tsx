import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/supabase";

interface AuthContextType {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (
    email: string,
    password: string,
    fullName: string,
    role: Profile["role"],
    shopName?: string,
    shopAddress?: string
  ) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) return null;
    return data as Profile | null;
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);

      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const s = data.session;

      if (s?.user) {
        const profile = await fetchProfile(s.user.id);
        setUser(profile);
        setSession(s);
      } else {
        setUser(null);
        setSession(null);
      }

      setIsLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!mounted) return;

      setIsLoading(true);

      if (s?.user) {
        const profile = await fetchProfile(s.user.id);

        setUser(profile);
        setSession(s);
      } else {
        setUser(null);
        setSession(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const profile = await fetchProfile(data.user.id);

      setUser(profile);
      setSession(data.session);

      return data.session;
    },
    [fetchProfile]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: Profile["role"],
      shopName?: string,
      shopAddress?: string
    ) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            shop_name: shopName,
            shop_address: shopAddress
          },
        },
      });

      if (error) throw error;

      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setUser(data);
    },
    [user]
  );

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession();

    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id);
      setUser(profile);
      setSession(data.session);
    }
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}