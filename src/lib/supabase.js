import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    return profile ? { ...profile, id: user.id, email: user.email } : null;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export async function uploadFile(file) {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filename, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);
    return { file_url: publicUrl };
}
