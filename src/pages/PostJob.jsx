import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import useLanguage from '@/lib/useLanguage';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export default function PostJob() {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const { isAuthenticated, me } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', location: '', description: '', requirements: '',
        employment_type: 'full_time', salary_range: '', positions_available: 1,
        start_date: '', category: 'fine_dining', benefits: '', status: 'active',
    });

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (me && me.role !== 'hotel') navigate('/dashboard');
    }, [isAuthenticated, me, navigate]);

    const handleSubmit = async () => {
        if (!form.title || !form.location || !form.description) {
            toast.error(lang === 'el' ? 'Συμπληρώστε τα απαιτούμενα πεδία' : 'Please fill in required fields');
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('jobs').insert({
            ...form,
            hotel_name: me.hotel_name || me.full_name,
            hotel_user_id: me.id,
            hotel_logo: me.hotel_logo_url || me.avatar_url || '',
        });
        setSubmitting(false);
        if (error) { toast.error(error.message); return; }
        toast.success(lang === 'el' ? 'Η θέση δημοσιεύτηκε!' : 'Job posted successfully!');
        navigate('/dashboard');
    };

    const categories = ['fine_dining', 'wine_expert', 'pool_beach', 'breakfast', 'banquet', 'room_service', 'head_waiter', 'catering'];
    const empTypes = ['full_time', 'part_time', 'seasonal', 'temporary'];
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div>
                <h1 className="font-display text-3xl font-bold text-foreground">{t('nav_post_job')}</h1>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Τίτλος Θέσης *' : 'Job Title *'}</label>
                    <Input className="rounded-xl" value={form.title} onChange={e => set('title', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Σερβιτόρος/α' : 'e.g. Waiter/Waitress'} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Τοποθεσία *' : 'Location *'}</label>
                        <Input className="rounded-xl" value={form.location} onChange={e => set('location', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Σαντορίνη' : 'e.g. Santorini'} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Μισθός' : 'Salary Range'}</label>
                        <Input className="rounded-xl" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder={lang === 'el' ? 'π.χ. €800-€1200/μήνα' : 'e.g. €800-€1200/month'} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Κατηγορία' : 'Category'}</label>
                        <Select value={form.category} onValueChange={v => set('category', v)}>
                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{t(`cat_${c}`)}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Τύπος' : 'Type'}</label>
                        <Select value={form.employment_type} onValueChange={v => set('employment_type', v)}>
                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>{empTypes.map(e => <SelectItem key={e} value={e}>{t(`emp_${e}`)}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Θέσεις' : 'Positions'}</label>
                        <Input type="number" className="rounded-xl" value={form.positions_available} onChange={e => set('positions_available', Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Ημ/νία Έναρξης' : 'Start Date'}</label>
                    <Input className="rounded-xl" value={form.start_date} onChange={e => set('start_date', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Ιούνιος 2026' : 'e.g. June 2026'} />
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Περιγραφή Θέσης *' : 'Job Description *'}</label>
                    <Textarea className="rounded-xl min-h-[120px]" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Απαιτήσεις' : 'Requirements'}</label>
                    <Textarea className="rounded-xl min-h-[80px]" value={form.requirements} onChange={e => set('requirements', e.target.value)} />
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">{lang === 'el' ? 'Παροχές' : 'Benefits'}</label>
                    <Textarea className="rounded-xl min-h-[80px]" value={form.benefits} onChange={e => set('benefits', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Διαμονή, Γεύματα' : 'e.g. Accommodation, Meals'} />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">{t('common_cancel')}</Button>
                    <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl px-6">
                        {submitting ? t('common_loading') : (lang === 'el' ? 'Δημοσίευση' : 'Post Job')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
