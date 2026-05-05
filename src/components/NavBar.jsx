import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Waves, MessageCircle, LayoutDashboard, User, Briefcase, Globe, LogIn, Shield, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
    const { t, lang, setLanguage } = useLanguage();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await base44.auth.isAuthenticated();
            setIsAuth(authenticated);
            if (authenticated) {
                const me = await base44.auth.me();
                setUser(me);
            }
        };
        checkAuth();
    }, []);

    const isActive = (path) => location.pathname === path;
    const role = user?.role;

    const navLinks = [
        { to: '/', label: t('nav_home'), icon: Waves },
        { to: '/jobs', label: t('nav_jobs'), icon: Briefcase },
    ];

    if (isAuth) {
        navLinks.push({ to: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard });
        navLinks.push({ to: '/messages', label: t('nav_messages'), icon: MessageCircle });
        navLinks.push({ to: '/profile', label: t('nav_profile'), icon: User });
        if (role === 'admin') {
            navLinks.push({ to: '/admin', label: t('nav_admin'), icon: Shield });
        }
    }

    return (
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                            <Waves className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
                            SeaSide Jobs
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Globe className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLanguage('en')}>
                                    {t('lang_en')} {lang === 'en' && '✓'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLanguage('el')}>
                                    {t('lang_el')} {lang === 'el' && '✓'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {isAuth && role === 'hotel' && (
                            <Link to="/post-job">
                                <Button size="sm" className="hidden sm:flex gap-1.5">
                                    <Plus className="w-4 h-4" />
                                    {t('nav_post_job')}
                                </Button>
                            </Link>
                        )}

                        {isAuth && (
                            <Button size="sm" variant="ghost" onClick={() => base44.auth.logout()} className="gap-1.5 text-muted-foreground">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">{lang === 'el' ? 'Αποσύνδεση' : 'Logout'}</span>
                            </Button>
                        )}
                        {!isAuth && (
                            <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="gap-1.5">
                                <LogIn className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('nav_login')}</span>
                            </Button>
                        )}

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden h-9 w-9"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl">
                    <nav className="px-4 py-3 space-y-1">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(to)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                            </Link>
                        ))}
                        {isAuth && role === 'hotel' && (
                            <Link
                                to="/post-job"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary"
                            >
                                <Plus className="w-4 h-4" />
                                {t('nav_post_job')}
                            </Link>
                        )}
                        {!isAuth && (
                            <button
                                onClick={() => { setMobileOpen(false); base44.auth.redirectToLogin(); }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary w-full"
                            >
                                <LogIn className="w-4 h-4" />
                                {t('nav_login')}
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}