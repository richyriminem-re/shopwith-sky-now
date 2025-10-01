import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AdminStore {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      sidebarOpen: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setSession: (session) => set({ 
        session, 
        user: session?.user ?? null,
        isAuthenticated: !!session?.user 
      }),

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (data.session) {
          set({ 
            session: data.session, 
            user: data.user,
            isAuthenticated: true 
          });
        }

        return { error };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({ 
            session, 
            user: session.user,
            isAuthenticated: true 
          });
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
