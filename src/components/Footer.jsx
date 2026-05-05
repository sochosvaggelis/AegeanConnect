import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';
import useLanguage from '@/lib/useLanguage';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-card border-t border-border/50 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <Waves className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-display font-semibold text-foreground">SeaSide Jobs</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('footer_about_text')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('footer_links')}</h4>
                        <div className="space-y-2">
                            <Link to="/jobs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {t('nav_jobs')}
                            </Link>
                            <Link to="/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {t('nav_dashboard')}
                            </Link>
                            <Link to="/profile" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {t('nav_profile')}
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">{t('footer_contact')}</h4>
                        <p className="text-sm text-muted-foreground">info@seasidejobs.gr</p>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} SeaSide Jobs. {t('footer_rights')}
                </div>
            </div>
        </footer>
    );
}