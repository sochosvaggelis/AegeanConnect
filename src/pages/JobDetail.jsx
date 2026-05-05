import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Users, Briefcase, Calendar, DollarSign, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function JobDetail() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { t, lang } = useLanguage();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);
    const [applyOpen, setApplyOpen] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    useEffect(() => {
        const load = async () => {
            const jobData = await base44.entities.Job.get(jobId);
            setJob(jobData);

            const authenticated = await base44.auth.isAuthenticated();
            setIsAuth(authenticated);
            if (authenticated) {
                const me = await base44.auth.me();
                setUser(me);
                const apps = await base44.entities.Application.filter({
                    job_id: jobId,
                    applicant_email: me.email
                });
                if (apps.length > 0) setAlreadyApplied(true);
            }
            setLoading(false);
        };
        load();
    }, [jobId]);

    const handleApply = async () => {
        if (!isAuth) {
            base44.auth.redirectToLogin(window.location.pathname);
            return;
        }
        setApplyOpen(true);
    };

    const submitApplication = async () => {
        setSubmitting(true);
        await base44.entities.Application.create({
            job_id: jobId,
            job_title: job.title,
            hotel_name: job.hotel_name,
            hotel_user_id: job.hotel_user_id,
            applicant_name: user.full_name,
            applicant_email: user.email,
            cover_letter: coverLetter,
            status: 'pending',
        });
        setSubmitting(false);
        setApplyOpen(false);
        setAlreadyApplied(true);
        toast.success(t('apply_success'));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                <p className="text-muted-foreground">Job not found</p>
                <Link to="/jobs"><Button variant="outline" className="mt-4">{t('common_back')}</Button></Link>
            </div>
        );
    }

    const typeLabels = { full_time: t('emp_full_time'), part_time: t('emp_part_time'), seasonal: t('emp_seasonal'), temporary: t('emp_temporary') };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t('common_back')}
            </button>

            <div className="bg-card rounded-2xl border border-border/50 p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    {job.hotel_logo ? (
                        <img src={job.hotel_logo} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-7 h-7 text-primary" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{job.title}</h1>
                        <p className="text-lg text-muted-foreground mt-1">{job.hotel_name}</p>
                    </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Badge variant="secondary" className="gap-1 rounded-lg py-1.5 px-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                    </Badge>
                    <Badge variant="outline" className="gap-1 rounded-lg py-1.5 px-3">
                        <Clock className="w-3.5 h-3.5" />
                        {typeLabels[job.employment_type] || job.employment_type}
                    </Badge>
                    {job.positions_available && (
                        <Badge variant="outline" className="gap-1 rounded-lg py-1.5 px-3">
                            <Users className="w-3.5 h-3.5" />
                            {job.positions_available} {t('jobs_positions')}
                        </Badge>
                    )}
                    {job.salary_range && (
                        <Badge variant="secondary" className="gap-1 rounded-lg py-1.5 px-3 bg-primary/10 text-primary border-0">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary_range}
                        </Badge>
                    )}
                    {job.start_date && (
                        <Badge variant="outline" className="gap-1 rounded-lg py-1.5 px-3">
                            <Calendar className="w-3.5 h-3.5" />
                            {job.start_date}
                        </Badge>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-6">
                    <div>
                        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-primary" />
                            {lang === 'el' ? 'Περιγραφή Θέσης' : 'Job Description'}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
                    </div>

                    {job.requirements && (
                        <div>
                            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Award className="w-4 h-4 text-primary" />
                                {lang === 'el' ? 'Απαιτήσεις' : 'Requirements'}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
                        </div>
                    )}

                    {job.benefits && (
                        <div>
                            <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                {lang === 'el' ? 'Παροχές' : 'Benefits'}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
                        </div>
                    )}
                </div>

                {/* Apply button */}
                <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                        {t('jobs_posted')} {moment(job.created_date).fromNow()}
                    </span>
                    {alreadyApplied ? (
                        <Badge variant="secondary" className="gap-1 rounded-lg py-2 px-4">
                            <CheckCircle className="w-4 h-4" />
                            {t('apply_already')}
                        </Badge>
                    ) : job.status === 'active' ? (
                        <Button onClick={handleApply} className="rounded-xl px-6">
                            {isAuth ? t('jobs_apply') : t('jobs_login_to_apply')}
                        </Button>
                    ) : (
                        <Badge variant="secondary">{t('status_closed')}</Badge>
                    )}
                </div>
            </div>

            {/* Apply Dialog */}
            <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-display">{t('apply_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium text-foreground mb-1.5 block">{t('apply_cover_letter')}</label>
                            <Textarea
                                className="rounded-xl min-h-[120px]"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder={lang === 'el' ? 'Γράψτε μια σύντομη συνοδευτική επιστολή...' : 'Write a brief cover letter...'}
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setApplyOpen(false)} className="rounded-xl">{t('common_cancel')}</Button>
                            <Button onClick={submitApplication} disabled={submitting} className="rounded-xl">
                                {submitting ? t('common_loading') : t('apply_submit')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}