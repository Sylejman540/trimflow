import { Link } from '@inertiajs/react';

interface Props {
    /** 'light' = white text (on dark bg), 'dark' = dark text (on white bg) */
    theme?: 'light' | 'dark';
    href?: string;
    size?: 'sm' | 'md';
}

export default function FadeLogo({ theme = 'light', href = '/', size = 'md' }: Props) {
    const diamondSize = size === 'sm' ? 28 : 36;
    const fontSize = size === 'sm' ? 16 : 20;
    const textClass = size === 'sm'
        ? 'text-lg font-black tracking-tight'
        : 'text-2xl font-black tracking-tight';

    const mark = (
        <svg width={diamondSize} height={diamondSize} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 2 L34 18 L18 34 L2 18 Z" fill="#2563EB" />
            <text
                x="18"
                y="24"
                textAnchor="middle"
                fontFamily="'Bebas Neue', sans-serif"
                fontSize={fontSize}
                fontWeight="900"
                fill="#ffffff"
                letterSpacing="-0.5"
            >
                F
            </text>
        </svg>
    );

    const wordmark = (
        <span
            className={`${textClass} ${theme === 'dark' ? 'text-slate-900' : 'text-white'}`}
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em' }}
        >
            Fade
        </span>
    );

    return (
        <Link href={href} className="flex items-center gap-2.5">
            {mark}
            {wordmark}
        </Link>
    );
}
