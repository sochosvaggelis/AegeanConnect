import { useState, useEffect } from 'react';
import { User, Building2, MapPin, Phone, Globe, Award, Languages, Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import useLanguage from '@/lib/useLanguage';
import { supabase, uploadFile } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';

export default function Profile() {
    const { t, lang } = useLanguage();
    const { me, user, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        if (me) {
            setForm({
                phone: me.phone || '',
                bio: me.bio || '',
                location: me.location || '',
                experience_years: me.experience_years || 0,
                skills: me.skills || '',
                languages_spoken: me.languages_spoken || '',
                hotel_name: me.hotel_name || '',
                hotel_description: me.hotel_description || '',
                hotel_website: me.hotel_website || '',
            });
        }
    }, [me]);

    const handleSave = async () => {
        setSaving(true);
        await supabase.from('profiles').update(form).eq('id', user.id);
        await refreshProfile();
        setSaving(false);
        toast.success(lang === 'el' ? 'Το προφίλ ενημερώθηκε!' : 'Profile updated!');
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const { file_url } = await uploadFile(file);
        await supabase.from('profiles').update({ avatar_url: file_url }).eq('id', user.id);
        await refreshProfile();
        toast.success(lang === 'el' ? 'Η φωτογραφία ενημερώθηκε!' : 'Photo updated!');
    };

    if (!me) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

    const isHotel = me.role === 'hotel';
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-8">{t('profile_title')}</h1>

            <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        {me.avatar_url ? (
                            <img src={me.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                {isHotel ? <Building2 className="w-8 h-8 text-primary" /> : <User className="w-8 h-8 text-primary" />}
                            </div>
                        )}
                        <label className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">{me.full_name}</h2>
                        <p className="text-sm text-muted-foreground">{me.email}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">{me.role}</span>
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_phone')}</label>
                        <Input className="rounded-xl" value={form.phone || ''} onChange={e => set('phone', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_location')}</label>
                        <Input className="rounded-xl" value={form.location || ''} onChange={e => set('location', e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_bio')}</label>
                    <Textarea className="rounded-xl min-h-[100px]" value={form.bio || ''} onChange={e => set('bio', e.target.value)} />
                </div>

                {!isHotel && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Award className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_experience')}</label>
                                <Input type="number" className="rounded-xl" value={form.experience_years || 0} onChange={e => set('experience_years', Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Languages className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_languages')}</label>
                                <Input className="rounded-xl" value={form.languages_spoken || ''} onChange={e => set('languages_spoken', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Ελληνικά, Αγγλικά' : 'e.g. Greek, English'} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Award className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_skills')}</label>
                            <Input className="rounded-xl" value={form.skills || ''} onChange={e => set('skills', e.target.value)} placeholder={lang === 'el' ? 'π.χ. Σερβιτόρος, Bartending' : 'e.g. Serving, Bartending'} />
                        </div>
                    </>
                )}

                {isHotel && (
                    <>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_hotel_name')}</label>
                            <Input className="rounded-xl" value={form.hotel_name || ''} onChange={e => set('hotel_name', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_hotel_desc')}</label>
                            <Textarea className="rounded-xl min-h-[100px]" value={form.hotel_description || ''} onChange={e => set('hotel_description', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-muted-foreground" />{t('profile_hotel_website')}</label>
                            <Input className="rounded-xl" value={form.hotel_website || ''} onChange={e => set('hotel_website', e.target.value)} />
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-6">
                        <Save className="w-4 h-4" />{saving ? t('common_loading') : t('profile_save')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
