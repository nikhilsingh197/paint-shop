import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// Find this interface at the top of AuthContext.tsx and update it:
export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  street_address: string;
  area: string;
  landmark: string;
  latitude?: number;  // <-- ADDED
  longitude?: number; // <-- ADDED
  rang_coins: number;
  lifetime_coins_earned: number;
  total_orders_count: number;
  total_litres_purchased: number;
  tier: 'Silver Painter' | 'Gold Pro' | 'Platinum Master';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (data) {
      setProfile(data);
    } else if (error && error.code === 'PGRST116') {
      // PGRST116 means "No rows found". Let's auto-create their profile!
      const newProfile = { 
        id: userId, 
        rang_coins: 100, 
        lifetime_coins_earned: 100, 
        tier: 'Silver Painter' 
      };
      const { data: insertedData } = await supabase.from('profiles').insert(newProfile).select().single();
      if (insertedData) setProfile(insertedData);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Finish loading only when user and profile are synced
  useEffect(() => {
    if (user && profile) setLoading(false);
  }, [user, profile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (data) setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);