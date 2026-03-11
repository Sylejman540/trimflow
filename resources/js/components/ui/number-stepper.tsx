import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberStepperProps {
    value: number;
    onChange: (val: number) => void;
    min?: number;
    max?: number;
    step?: number;
    /** For decimal values like price (shows 2 decimal places) */
    decimal?: boolean;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function NumberStepper({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    decimal = false,
    placeholder,
    className,
    id,
}: NumberStepperProps) {
    function dec() {
        const next = parseNum(value) - step;
        onChange(clamp(round(next)));
    }

    function inc() {
        const next = parseNum(value) + step;
        onChange(clamp(round(next)));
    }

    function handleInput(raw: string) {
        // Allow empty/partial input while typing
        if (raw === '' || raw === '-') { onChange(0); return; }
        const n = decimal ? parseFloat(raw) : parseInt(raw, 10);
        if (!isNaN(n)) onChange(clamp(round(n)));
    }

    function handleBlur(raw: string) {
        const n = decimal ? parseFloat(raw) : parseInt(raw, 10);
        if (isNaN(n)) { onChange(min ?? 0); return; }
        onChange(clamp(round(n)));
    }

    function parseNum(v: number) { return isNaN(v) ? (min ?? 0) : v; }
    function round(n: number) { return decimal ? Math.round(n * 100) / 100 : Math.round(n); }
    function clamp(n: number) {
        if (min !== undefined && n < min) return min;
        if (max !== undefined && n > max) return max;
        return n;
    }

    const displayValue = decimal ? (value === 0 ? '' : value.toFixed(2)) : (value === 0 ? '' : String(value));

    return (
        <div className={cn('flex items-center h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-slate-400 transition-colors', className)}>
            <button
                type="button"
                onClick={dec}
                disabled={min !== undefined && value <= min}
                className="h-full px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>
            <input
                id={id}
                type="text"
                inputMode={decimal ? 'decimal' : 'numeric'}
                value={displayValue}
                placeholder={placeholder ?? (decimal ? '0.00' : '0')}
                onChange={e => handleInput(e.target.value)}
                onBlur={e => handleBlur(e.target.value)}
                className="flex-1 min-w-0 h-full bg-transparent text-center text-sm font-medium text-slate-900 focus:outline-none placeholder:text-slate-300"
            />
            <button
                type="button"
                onClick={inc}
                disabled={max !== undefined && value >= max}
                className="h-full px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
