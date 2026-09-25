import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

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
  fcm_token?: string;
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

  const registerPushNotifications = async (userId: string) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        return; // User denied permission
      }

      await PushNotifications.register();
      await PushNotifications.createChannel({
        id: 'orders',
        name: 'Order Updates',
        description: 'Notifications about your paint orders',
        importance: 5,
        visibility: 1
      });

      // Listen for registration success
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ' + token.value);
        // Save the token to the user's profile
        await supabase
          .from('profiles')
          .update({ fcm_token: token.value })
          .eq('id', userId);
      });

      // Listen for registration error
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for incoming notifications when app is open
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
        // We could trigger a local Toast here if we want!
      });
      
    } catch (e) {
      console.error("Failed to register push:", e);
    }
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (data) {
      setProfile(data);
      registerPushNotifications(userId);
    } else if (error && error.code === 'PGRST116') {
      // PGRST116 means "No rows found". Let's auto-create their profile!
      const newProfile = { 
        id: userId, 
        rang_coins: 100, 
        lifetime_coins_earned: 100, 
        tier: 'Silver Painter' 
      };
      const { data: insertedData } = await supabase.from('profiles').insert(newProfile).select().single();
      if (insertedData) {
        setProfile(insertedData);
        registerPushNotifications(userId);
      }
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
          
          // CRITICAL: Close the Capacitor Browser if it's our OAuth callback
          if (event.url.includes('com.nikhilpaints.app://')) {
            import('@capacitor/browser').then(({ Browser }) => {
              Browser.close().catch(() => {});
            });
          }

          if (event.url.includes('#access_token=')) {
            const url = new URL(event.url.replace('#', '?'));
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
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
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
    if (error) {
      console.error("Failed to update profile:", error);
    }
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