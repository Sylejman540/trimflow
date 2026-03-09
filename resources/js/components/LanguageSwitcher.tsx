import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '@/i18n';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: Props) {
    const { i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className={cn(
                    'flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300',
                    compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                )}
                aria-label="Change language"
            >
                <Globe className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                <span>{current.flag}</span>
                {!compact && <span className="font-medium">{current.label}</span>}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-slate-200 bg-white shadow-lg py-1 overflow-hidden">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                i18n.changeLanguage(lang.code);
                                setOpen(false);
                            }}
                            className={cn(
                                'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
                                i18n.language === lang.code
                                    ? 'bg-slate-900 text-white font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
