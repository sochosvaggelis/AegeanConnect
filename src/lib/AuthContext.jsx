import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
                loadProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setUser(session.user);
                setIsAuthenticated(true);
                await loadProfile(session.user.id);
            } else {
                setUser(null);
                setProfile(null);
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async (userId) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setProfile(data);
        setIsLoading(false);
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const refreshProfile = async () => {
        if (user) await loadProfile(user.id);
    };

    // Returns combined user+profile object (same shape expected by pages)
    const me = profile ? { ...profile, id: user?.id, email: user?.email } : null;

    return (
        <AuthContext.Provider value={{ user, profile, me, isAuthenticated, isLoading, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
