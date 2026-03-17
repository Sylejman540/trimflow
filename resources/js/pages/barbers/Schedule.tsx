import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Barber } from '@/types';

const DAYS = [
    { key: 'monday',    labelKey: 'days.monday' },
    { key: 'tuesday',   labelKey: 'days.tuesday' },
    { key: 'wednesday', labelKey: 'days.wednesday' },
    { key: 'thursday',  labelKey: 'days.thursday' },
    { key: 'friday',    labelKey: 'days.friday' },
    { key: 'saturday',  labelKey: 'days.saturday' },
    { key: 'sunday',    labelKey: 'days.sunday' },
] as const;

type DayKey = typeof DAYS[number]['key'];

interface DaySchedule {
    enabled: boolean;
    start: string;
    end: string;
}

type WorkingHours = Record<DayKey, DaySchedule>;

const DEFAULT_DAY: DaySchedule = { enabled: false, start: '09:00', end: '18:00' };

function buildInitial(raw: Record<string, unknown> | null): WorkingHours {
    const result = {} as WorkingHours;
    for (const { key } of DAYS) {
        const day = raw?.[key] as Partial<DaySchedule> | undefined;
        result[key] = {
            enabled: day?.enabled ?? false,
            start:   day?.start   ?? '09:00',
            end:     day?.end     ?? '18:00',
        };
    }
    return result;
}

function buildTimeOptions(maxHour: number): string[] {
    const options: string[] = [];
    for (let h = 6; h <= maxHour; h++) {
        options.push(`${String(h).padStart(2, '0')}:00`);
        if (h < maxHour) options.push(`${String(h).padStart(2, '0')}:30`);
    }
    return options;
}

interface ScheduleProps {
    barber: Barber;
    maxClosingHour?: number;
}

export default function Schedule({ barber, maxClosingHour = 22 }: ScheduleProps) {
    const { t } = useTranslation();
    const [hours, setHours] = useState<WorkingHours>(() =>
        buildInitial(barber.working_hours as Record<string, unknown> | null)
    );
    const [processing, setProcessing] = useState(false);
    const timeOptions = buildTimeOptions(maxClosingHour);

    function toggle(day: DayKey) {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled },
        }));
    }

    function setTime(day: DayKey, field: 'start' | 'end', value: string) {
        setHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value },
        }));
    }

    function applyToWeekdays() {
        const mon = hours['monday'];
        setHours(prev => {
            const next = { ...prev };
            (['tuesday', 'wednesday', 'thursday', 'friday'] as DayKey[]).forEach(d => {
                next[d] = { ...mon };
            });
            return next;
        });
    }

    function handleSubmit() {
        setProcessing(true);
        router.put(
            route('barbers.schedule.update', barber.id),
            { working_hours: hours as any },
            {
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <AppLayout
            title={`Schedule — ${barber.user?.name}`}
            actions={
                <Link
                    href={route('barbers.index')}
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none gap-1.5')}
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('back')}</span>
                </Link>
            }
        >
            <Head title={`Schedule — ${barber.user?.name}`} />

            <div className="flex flex-col items-center w-full py-4 lg:py-10">
                <div className="w-full max-w-2xl space-y-4 lg:space-y-6">
                    <Card className="border-slate-200 shadow-none">
                        <CardHeader className="pb-3 px-4 lg:px-6">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <CardTitle className="text-base">{t('barber.weeklyWorkingHours')}</CardTitle>
                            </div>
                            <CardDescription>
                                {t('barber.scheduleDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 px-3 lg:px-6">
                            {DAYS.map(({ key, labelKey }) => {
                                const day = hours[key];
                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            'rounded-lg transition-colors',
                                            day.enabled ? 'bg-slate-50' : 'opacity-50',
                                        )}
                                    >
                                        {/* Toggle row */}
                                        <div className="flex items-center gap-3 px-3 py-2.5">
                                            <button
                                                type="button"
                                                onClick={() => toggle(key)}
                                                className={cn(
                                                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0',
                                                    day.enabled ? 'bg-slate-900' : 'bg-slate-200',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform',
                                                        day.enabled ? 'translate-x-5' : 'translate-x-0.5',
                                                    )}
                                                />
                                            </button>
                                            <span className="flex-1 text-sm font-medium text-slate-900">{t(labelKey)}</span>
                                            {!day.enabled && (
                                                <span className="text-xs text-slate-400 italic">{t('barber.dayOff')}</span>
                                            )}
                                        </div>

                                        {/* Time selects — shown below on mobile, inline on sm+ */}
                                        {day.enabled && (
                                            <div className="flex flex-wrap items-center gap-2 px-3 pb-3 sm:pb-2.5 sm:flex-nowrap">
                                                {/* Spacer to align with toggle+label above on sm+ */}
                                                <div className="hidden sm:block w-[72px] shrink-0" />
                                                <select
                                                    value={day.start}
                                                    onChange={e => setTime(key, 'start', e.target.value)}
                                                    className="h-8 flex-1 min-w-[90px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                                >
                                                    {timeOptions.map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                <span className="text-xs text-slate-400">{t('barber.to')}</span>
                                                <select
                                                    value={day.end}
                                                    onChange={e => setTime(key, 'end', e.target.value)}
                                                    className="h-8 flex-1 min-w-[90px] rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                                >
                                                    {timeOptions.filter(t => t > day.start).map(t => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                                {key === 'monday' && (
                                                    <button
                                                        type="button"
                                                        onClick={applyToWeekdays}
                                                        className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors whitespace-nowrap"
                                                    >
                                                        {t('barber.applyToWeekdays')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    <div className="flex gap-2 justify-end px-1">
                        <Link
                            href={route('barbers.index')}
                            className={cn(buttonVariants({ variant: 'outline' }), 'h-10 px-6 rounded-lg text-xs font-bold border-slate-200 shadow-none')}
                        >
                            {t('cancel')}
                        </Link>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 h-10 px-6 rounded-lg text-xs font-bold shadow-none"
                        >
                            {t('barber.saveSchedule')}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}