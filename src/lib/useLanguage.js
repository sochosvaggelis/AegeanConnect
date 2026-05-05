import { useState, useEffect } from 'react';
import { t, getLanguage, setLanguage } from './i18n';

export default function useLanguage() {
    const [lang, setLang] = useState(getLanguage());

    useEffect(() => {
        const handler = () => setLang(getLanguage());
        window.addEventListener('languagechange', handler);
        return () => window.removeEventListener('languagechange', handler);
    }, []);

    return { lang, setLanguage, t };
}