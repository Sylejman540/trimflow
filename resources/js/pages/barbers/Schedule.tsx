import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Clock, ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Barber } from '@/types';

const DAYS = [
    { key: 'monday',    label: 'Monday' },
    { key: 'tuesday',   label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday',  label: 'Thursday' },
    { key: 'friday',    label: 'Friday' },
    { key: 'saturday',  label: 'Saturday' },
    { key: 'sunday',    label: 'Sunday' },
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

const TIME_OPTIONS: string[] = [];
for (let h = 6; h <= 22; h++) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 22) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`);
}

export default function Schedule({ barber }: { barber: Barber }) {
    const [hours, setHours] = useState<WorkingHours>(() =>
        buildInitial(barber.working_hours as Record<string, unknown> | null)
    );
    const [processing, setProcessing] = useState(false);

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
            { working_hours: hours },
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
                    className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-4 rounded-lg text-xs font-bold border-slate-200 shadow-none')}
                >
                    <ChevronLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                </Link>
            }
        >
            <Head title={`Schedule — ${barber.user?.name}`} />

            <div className="max-w-2xl space-y-6">
                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <CardTitle className="text-base">Weekly Working Hours</CardTitle>
                        </div>
                        <CardDescription>
                            Toggle days on/off and set start &amp; end times. Appointments can only be booked during active hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {DAYS.map(({ key, label }) => {
                            const day = hours[key];
                            return (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex items-center gap-4 px-4 py-3 rounded-lg transition-colors',
                                        day.enabled ? 'bg-slate-50' : 'opacity-50',
                                    )}
                                >
                                    {/* Toggle */}
                                    <button
                                        type="button"
                                        onClick={() => toggle(key)}
                                        className={cn(
                                            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
                                            day.enabled ? 'bg-slate-900' : 'bg-slate-200',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
                                                day.enabled ? 'translate-x-4' : 'translate-x-1',
                                            )}
                                        />
                                    </button>

                                    {/* Day label */}
                                    <span className="w-24 text-sm font-medium text-slate-900">{label}</span>

                                    {/* Time selects */}
                                    {day.enabled ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <select
                                                value={day.start}
                                                onChange={e => setTime(key, 'start', e.target.value)}
                                                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                            >
                                                {TIME_OPTIONS.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <span className="text-xs text-slate-400">to</span>
                                            <select
                                                value={day.end}
                                                onChange={e => setTime(key, 'end', e.target.value)}
                                                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
                                            >
                                                {TIME_OPTIONS.filter(t => t > day.start).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            {key === 'monday' && (
                                                <button
                                                    type="button"
                                                    onClick={applyToWeekdays}
                                                    className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors"
                                                >
                                                    Apply to Mon–Fri
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">Day off</span>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="bg-slate-900 text-white hover:bg-slate-800 h-9 px-6 rounded-lg text-xs font-bold shadow-none"
                    >
                        Save Schedule
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
