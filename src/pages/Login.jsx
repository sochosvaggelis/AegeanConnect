import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import useLanguage from '@/lib/useLanguage';

export default function Login() {
    const navigate = useNavigate();
    const { lang } = useLanguage();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', fullName: '' });

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleLogin = async () => {
        if (!form.email || !form.password) {
            toast.error(lang === 'el' ? 'Συμπληρώστε email και κωδικό' : 'Enter email and password');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
        });
        setLoading(false);
        if (error) {
            toast.error(lang === 'el' ? 'Λάθος email ή κωδικός' : 'Invalid email or password');
        } else {
            navigate('/');
        }
    };

    const handleRegister = async () => {
        if (!form.email || !form.password || !form.fullName) {
            toast.error(lang === 'el' ? 'Συμπληρώστε όλα τα πεδία' : 'Fill in all fields');
            return;
        }
        if (form.password.length < 6) {
            toast.error(lang === 'el' ? 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες' : 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.fullName } },
        });
        setLoading(false);
        if (error) {
            toast.error(error.message);
        } else {
            toast.success(lang === 'el' ? 'Ο λογαριασμός δημιουργήθηκε!' : 'Account created!');
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#eef4fd' }}>
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
                        <Waves className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">SeaSide Jobs</h1>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
                    {/* Toggle */}
                    <div className="flex rounded-xl bg-muted p-1 mb-6">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'login' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        >
                            {lang === 'el' ? 'Σύνδεση' : 'Sign In'}
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'register' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                        >
                            {lang === 'el' ? 'Εγγραφή' : 'Register'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 block">
                                    {lang === 'el' ? 'Ονοματεπώνυμο' : 'Full Name'}
                                </label>
                                <Input
                                    className="rounded-xl"
                                    value={form.fullName}
                                    onChange={e => set('fullName', e.target.value)}
                                    placeholder={lang === 'el' ? 'π.χ. Γιώργης Παπαδόπουλος' : 'e.g. John Smith'}
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                            <Input
                                type="email"
                                className="rounded-xl"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                placeholder="email@example.com"
                                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">
                                {lang === 'el' ? 'Κωδικός' : 'Password'}
                            </label>
                            <Input
                                type="password"
                                className="rounded-xl"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                placeholder="••••••••"
                                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
                            />
                        </div>

                        <Button
                            className="w-full rounded-xl h-11"
                            disabled={loading}
                            onClick={mode === 'login' ? handleLogin : handleRegister}
                        >
                            {loading
                                ? (lang === 'el' ? 'Φόρτωση...' : 'Loading...')
                                : mode === 'login'
                                    ? (lang === 'el' ? 'Σύνδεση' : 'Sign In')
                                    : (lang === 'el' ? 'Δημιουργία Λογαριασμού' : 'Create Account')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
