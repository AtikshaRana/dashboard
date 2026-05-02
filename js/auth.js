import { supabase } from './supabase-config.js';

export const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // If on login page, don't redirect to login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/admin/login.html';
        }
        return null;
    }

    const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .single();

    if (error || !admin) {
        console.error('Not an admin or error:', error);
        await supabase.auth.signOut();
        window.location.href = '/admin/login.html?error=unauthorized';
        return null;
    }

    // If already on login page and admin, go to dashboard
    if (window.location.pathname.includes('login.html')) {
        window.location.href = '/admin/dashboard.html';
    }

    return user;
};

export const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    // Verify if admin
    const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

    if (adminError || !admin) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: You are not an admin.');
    }

    window.location.href = '/admin/dashboard.html';
    return data;
};

export const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login.html';
};
