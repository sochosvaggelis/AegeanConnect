import { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, Trash2, Shield, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function Admin() {
    const { t, lang } = useLanguage();
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const load = async () => {
            const me = await base44.auth.me().catch(() => null);
            if (!me || me.role !== 'admin') {
                setLoading(false);
                return;
            }
            setAuthorized(true);
            const [u, j, a] = await Promise.all([
                base44.entities.User.list('-created_date', 100),
                base44.entities.Job.list('-created_date', 100),
                base44.entities.Application.list('-created_date', 100),
            ]);
            setUsers(u);
            setJobs(j);
            setApplications(a);
            setLoading(false);
        };
        load();
    }, []);

    const updateUserRole = async (userId, newRole) => {
        await base44.entities.User.update(userId, { role: newRole });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success(lang === 'el' ? 'Ο ρόλος ενημερώθηκε' : 'Role updated');
    };

    const deleteJob = async (jobId) => {
        await base44.entities.Job.delete(jobId);
        setJobs(prev => prev.filter(j => j.id !== jobId));
        toast.success(lang === 'el' ? 'Η θέση διαγράφηκε' : 'Job deleted');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="flex justify-center items-center py-32">
                <p className="text-muted-foreground">{lang === 'el' ? 'Δεν έχετε πρόσβαση σε αυτή τη σελίδα.' : 'You do not have access to this page.'}</p>
            </div>
        );
    }

    const roleIcon = { admin: Shield, hotel: Building2, user: User };

    return (
        <div style={{ background: '#eef4fd', minHeight: '100vh' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-8">{t('nav_admin')}</h1>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{users.length}</p>
                            <p className="text-xs text-muted-foreground">{lang === 'el' ? 'Χρήστες' : 'Users'}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                            <p className="text-xs text-muted-foreground">{lang === 'el' ? 'Θέσεις' : 'Jobs'}</p>
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border border-border/50 p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{applications.length}</p>
                            <p className="text-xs text-muted-foreground">{lang === 'el' ? 'Αιτήσεις' : 'Applications'}</p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="users">
                    <TabsList className="rounded-xl mb-6">
                        <TabsTrigger value="users" className="rounded-lg gap-2">
                            <Users className="w-4 h-4" />
                            {lang === 'el' ? 'Χρήστες' : 'Users'}
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="rounded-lg gap-2">
                            <Briefcase className="w-4 h-4" />
                            {lang === 'el' ? 'Θέσεις' : 'Jobs'}
                        </TabsTrigger>
                        <TabsTrigger value="applications" className="rounded-lg gap-2">
                            <FileText className="w-4 h-4" />
                            {lang === 'el' ? 'Αιτήσεις' : 'Applications'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border/50">
                                            <th className="text-left p-4 font-medium text-muted-foreground">{lang === 'el' ? 'Όνομα' : 'Name'}</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground">{lang === 'el' ? 'Ρόλος' : 'Role'}</th>
                                            <th className="text-left p-4 font-medium text-muted-foreground">{lang === 'el' ? 'Ημ/νία' : 'Date'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => {
                                            const RIcon = roleIcon[u.role] || User;
                                            return (
                                                <tr key={u.id} className="border-b border-border/30 last:border-0">
                                                    <td className="p-4 font-medium text-foreground">{u.full_name}</td>
                                                    <td className="p-4 text-muted-foreground">{u.email}</td>
                                                    <td className="p-4">
                                                        <Select value={u.role || 'user'} onValueChange={(v) => updateUserRole(u.id, v)}>
                                                            <SelectTrigger className="h-8 w-28 rounded-lg text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="user">User</SelectItem>
                                                                <SelectItem value="hotel">Hotel</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="p-4 text-xs text-muted-foreground">{moment(u.created_date).format('DD/MM/YYYY')}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="jobs">
                        <div className="space-y-3">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-card rounded-xl border border-border/50 p-4 flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">{job.title}</p>
                                        <p className="text-sm text-muted-foreground">{job.hotel_name} · {job.location}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{moment(job.created_date).format('DD/MM/YYYY')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="rounded-lg capitalize">{job.status}</Badge>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteJob(job.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="applications">
                        <div className="space-y-3">
                            {applications.map((app) => (
                                <div key={app.id} className="bg-card rounded-xl border border-border/50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-foreground">{app.applicant_name}</p>
                                            <p className="text-sm text-muted-foreground">{app.job_title} · {app.hotel_name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{moment(app.created_date).format('DD/MM/YYYY')}</p>
                                        </div>
                                        <Badge variant="outline" className="rounded-lg capitalize">{app.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}