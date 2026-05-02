import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser]         = useState(null);
    const [session, setSession]   = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Restore session from AsyncStorage on cold start
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (!mounted) return;
            if (error) console.warn('[Auth] getSession error:', error.message);
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for all subsequent auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;
            console.log('[Auth] State change:', event);
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
