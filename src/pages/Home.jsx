import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Waves, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JobCard from '@/components/JobCard';
import useLanguage from '@/lib/useLanguage';
import { base44 } from '@/api/base44Client';

const ISLANDS = [
    { name: 'Santorini', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/09772b00b_outline.png' },
    { name: 'Mykonos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/47d88f94d_image.png' },
    { name: 'Crete', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/3abbf2af5_image.png' },
    { name: 'Rhodes', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/5dbf47276_image.png' },
    { name: 'Corfu', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/3776e27e7_image.png' },
    { name: 'Zakynthos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/4638acc8a_image.png' },
    { name: 'Paros', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/a84ce17fd_image.png' },
    { name: 'Naxos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/a6e717364_image.png' },
    { name: 'Lefkada', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/6f0b28779_lefkada_outline.webp' },
    { name: 'Milos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/c221afccd_milos_outline.webp' },
    { name: 'Skiathos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/f2e8b723a_skiathos_outline.webp' },
    { name: 'Hydra', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/46a873750_image.png' },
    { name: 'Ios', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/74cd88460_image.png' },
    { name: 'Kefalonia', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/dc15de17b_image.png' },
    { name: 'Samos', outline: 'https://media.base44.com/images/public/69f7b607f372feaad608e5b5/cdc62bdff_image.png' },
];

export default function Home() {
    const { t, lang } = useLanguage();
    const [jobs, setJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await base44.entities.Job.filter({ status: 'active' }, '-created_date', 50);
            setAllJobs(data);
            setJobs(data.slice(0, 6));
            setLoading(false);
        };
        load();
    }, []);

    const getIslandJobCount = (islandName) => {
        return allJobs.filter(j =>
            j.location?.toLowerCase().includes(islandName.toLowerCase())
        ).length;
    };



    const handleSearch = () => {
        if (search.trim()) {
            window.location.href = `/jobs?search=${encodeURIComponent(search)}`;
        }
    };

    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://media.base44.com/images/public/69f7b607f372feaad608e5b5/d97b2767b_image.png')" }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.3) 50%, #eef4fd 100%)' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-40 pb-20 sm:pt-64 sm:pb-28 flex items-end min-h-screen">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/25 text-white text-sm font-medium mb-6">
                            <Waves className="w-4 h-4" />
                            {lang === 'el' ? 'Νησιώτικη Φιλοξενία' : 'Island Hospitality'}
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-sm">
                            {lang === 'el' ? 'Βρες δουλειά ως σερβιτόρος στα ελληνικά νησιά' : 'Find Server Jobs on Greek Islands'}
                        </h1>
                        <p className="mt-6 text-xl font-medium text-white/90 leading-relaxed max-w-2xl mx-auto">
                            {lang === 'el'
                                ? 'Συνδέουμε σερβιτόρους με ξενοδοχεία και καταστήματα στα ελληνικά νησιά. Αν ψάχνεις εποχιακή ή μόνιμη δουλειά στη φιλοξενία, είσαι στο σωστό μέρος.'
                                : 'We connect servers with hotels and venues across the Greek islands. Whether you are looking for seasonal or permanent work in hospitality, this is your place.'}
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-12 rounded-xl bg-white/90 border-0 text-base"
                                    placeholder={t('hero_search_placeholder')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} className="h-12 px-6 rounded-xl text-base">
                                {t('common_search')}
                            </Button>
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-4">
                            <Link to="/jobs">
                                <Button variant="outline" className="rounded-xl gap-2">
                                    {t('hero_browse')}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Browse by Island */}
            <section className="px-4 sm:px-6 py-16" style={{ background: '#eef4fd' }}>
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-10">
                        {lang === 'el' ? 'Αναζήτηση ανά Νησί' : 'Browse by Island'}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {ISLANDS.map((island) => {
                            const count = getIslandJobCount(island.name);
                            return (
                                <Link
                                    key={island.name}
                                    to={`/jobs?search=${encodeURIComponent(island.name)}`}
                                    className="group relative border border-border/50 rounded-2xl overflow-hidden aspect-[3/4] flex flex-col items-center justify-between p-4 hover:border-primary/40 transition-all duration-300"
                                    style={{ background: 'hsl(40 50% 97%)', boxShadow: '0 -3px 8px -2px rgba(194,160,100,0.15), 0 3px 8px -2px rgba(194,160,100,0.15)' }}
                                >
                                    {/* Island name top center */}
                                    <span className="font-display font-semibold text-sm text-foreground group-hover:text-primary transition-colors z-10 text-center" style={{ textShadow: '0 1px 4px rgba(194,160,100,0.35)' }}>
                                        {island.name}
                                    </span>

                                    {/* Island outline centered */}
                                    <div className="flex-1 flex items-center justify-center w-full py-2">
                                        {island.outline ? (
                                            <img
                                                src={island.outline}
                                                alt={island.name}
                                                className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{ filter: 'invert(27%) sepia(97%) saturate(500%) hue-rotate(190deg) brightness(85%)' }}
                                            />
                                        ) : (
                                            <div className="w-16 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Waves className="w-6 h-6 text-primary/40" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Job count bottom center */}
                                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors z-10" style={{ textShadow: '0 1px 4px rgba(194,160,100,0.35)' }}>
                                        {count > 0 ? `${count} ${count === 1 ? 'job' : 'jobs'}` : lang === 'el' ? 'Σύντομα' : 'Coming soon'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
}