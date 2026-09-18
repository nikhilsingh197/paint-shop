import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface SavedAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  streetAddress: string;
  area: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  street_address: string;
  area: string;
  landmark: string;
  latitude?: number;  
  longitude?: number; 
  saved_addresses?: SavedAddress[];
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

    // Handle deep links for Native OAuth (Capacitor)
    let appListener: any;
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      import('@capacitor/app').then(({ App: CapacitorApp }) => {
        appListener = CapacitorApp.addListener('appUrlOpen', async (event) => {
          if (event.url.includes('#access_token=')) {
            // Supabase client automatically picks up URL hash fragments in standard setup,
            // but for Capacitor, you may need to manually parse and set session if it doesn't.
            const url = new URL(event.url.replace('#', '?')); // hack to parse hash as search params
            const access_token = url.searchParams.get('access_token');
            const refresh_token = url.searchParams.get('refresh_token');
            if (access_token && refresh_token) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
          }
        });
      });
    }

    return () => {
      subscription.unsubscribe();
      if (appListener) appListener.then((l: any) => l.remove());
    };
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