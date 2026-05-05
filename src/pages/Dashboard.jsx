import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, CheckCircle, XCircle, Clock, Eye, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
};

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { t, lang } = useLanguage();
    const [user, setUser] = useState(null);
    const [applications, setApplications] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const me = await base44.auth.me();
            setUser(me);

            if (me.role === 'hotel') {
                const myJobs = await base44.entities.Job.filter({ hotel_user_id: me.id }, '-created_date', 50);
                setJobs(myJobs);
                const allApps = await base44.entities.Application.filter({ hotel_user_id: me.id }, '-created_date', 50);
                setApplications(allApps);
            } else {
                const myApps = await base44.entities.Application.filter({ applicant_email: me.email }, '-created_date', 50);
                setApplications(myApps);
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-32" style={{ background: '#eef4fd', minHeight: '100vh' }}>
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    const isHotel = user?.role === 'hotel';
    const pendingApps = applications.filter(a => a.status === 'pending').length;
    const acceptedApps = applications.filter(a => a.status === 'accepted').length;
    const activeJobs = jobs.filter(j => j.status === 'active').length;

    const handleAppStatus = async (appId, newStatus) => {
        await base44.entities.Application.update(appId, { status: newStatus });
        setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    };

    return (
        <div style={{ background: '#eef4fd', minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {t('dash_welcome')}, {user?.full_name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {isHotel ? (lang === 'el' ? 'Διαχείριση θέσεων & αιτήσεων' : 'Manage your jobs & applications') :
                                (lang === 'el' ? 'Παρακολουθήστε τις αιτήσεις σας' : 'Track your applications')}
                        </p>
                    </div>
                    {isHotel && (
                        <Link to="/post-job">
                            <Button className="rounded-xl gap-2">
                                <Plus className="w-4 h-4" />
                                {t('nav_post_job')}
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={FileText} label={t('dash_total_apps')} value={applications.length} color="bg-primary/10 text-primary" />
                    <StatCard icon={Clock} label={t('dash_pending')} value={pendingApps} color="bg-yellow-50 text-yellow-600" />
                    <StatCard icon={CheckCircle} label={t('dash_accepted')} value={acceptedApps} color="bg-green-50 text-green-600" />
                    {isHotel && <StatCard icon={Briefcase} label={t('dash_active_jobs')} value={activeJobs} color="bg-blue-50 text-blue-600" />}
                    {!isHotel && <StatCard icon={XCircle} label={t('dash_rejected')} value={applications.filter(a => a.status === 'rejected').length} color="bg-red-50 text-red-600" />}
                </div>

                {/* Hotel: Job listings */}
                {isHotel && (
                    <div className="mb-8">
                        <h2 className="font-display text-xl font-bold text-foreground mb-4">{t('dash_my_jobs')}</h2>
                        <div className="space-y-3">
                            {jobs.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">{t('common_no_data')}</p>
                            ) : jobs.map((job) => (
                                <div key={job.id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/jobs/${job.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                            {job.title}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                            <span>{job.location}</span>
                                            <span>·</span>
                                            <span>{applications.filter(a => a.job_id === job.id).length} {lang === 'el' ? 'αιτήσεις' : 'applications'}</span>
                                        </div>
                                    </div>
                                    <Badge className={`${statusColors[job.status]} border-0 rounded-lg`}>
                                        {t(`status_${job.status}`)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Applications */}
                <div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-4">
                        {isHotel ? (lang === 'el' ? 'Αιτήσεις Υποψηφίων' : 'Candidate Applications') : t('dash_my_applications')}
                    </h2>
                    <div className="space-y-3">
                        {applications.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">{t('common_no_data')}</p>
                        ) : applications.map((app) => (
                            <div key={app.id} className="bg-card rounded-xl border border-border/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/jobs/${app.job_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                                            {app.job_title}
                                        </Link>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {isHotel ? app.applicant_name : app.hotel_name}
                                        </p>
                                        {app.cover_letter && (
                                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{app.cover_letter}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">{moment(app.created_date).fromNow()}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge className={`${statusColors[app.status]} border-0 rounded-lg`}>
                                            {t(`status_${app.status}`)}
                                        </Badge>
                                        {isHotel && app.status === 'pending' && (
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => handleAppStatus(app.id, 'reviewed')}>
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    {t('dash_reviewed')}
                                                </Button>
                                                <Button size="sm" className="h-7 text-xs rounded-lg bg-green-600 hover:bg-green-700" onClick={() => handleAppStatus(app.id, 'accepted')}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                </Button>
                                                <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => handleAppStatus(app.id, 'rejected')}>
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                </Button>
                                            </div>
                                        )}
                                        {isHotel && app.status === 'reviewed' && (
                                            <div className="flex gap-1">
                                                <Button size="sm" className="h-7 text-xs rounded-lg bg-green-600 hover:bg-green-700" onClick={() => handleAppStatus(app.id, 'accepted')}>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {t('dash_accepted')}
                                                </Button>
                                                <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg" onClick={() => handleAppStatus(app.id, 'rejected')}>
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}