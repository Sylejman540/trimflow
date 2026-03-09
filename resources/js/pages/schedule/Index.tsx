import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react';
import { useMemo } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { buttonVariants } from '@/components/ui/button';
import { cn, formatCents } from '@/lib/utils';

interface ApptSlot {
    id: number;
    starts_at: string;
    ends_at: string;
    status: string;
    customer: string;
    service: string;
    barber: string;
    price: number;
}

// Hours to show: 07:00 – 21:00
const HOUR_START = 7;
const HOUR_END   = 21;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_HEIGHT = 64; // px per hour

const STATUS_COLORS: Record<string, string> = {
    scheduled:   'bg-blue-50 border-blue-200 text-blue-800',
    confirmed:   'bg-green-50 border-green-200 text-green-800',
    in_progress: 'bg-amber-50 border-amber-200 text-amber-800',
    completed:   'bg-emerald-50 border-emerald-200 text-emerald-800',
    no_show:     'bg-slate-50 border-slate-200 text-slate-500',
};

function addDays(dateStr: string, n: number) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

function weekDates(anchorDate: string) {
    const d = new Date(anchorDate + 'T12:00:00');
    const day = d.getDay(); // 0=Sun
    const mon = new Date(d);
    mon.setDate(d.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
        const dd = new Date(mon);
        dd.setDate(mon.getDate() + i);
        return dd.toISOString().split('T')[0];
    });
}

function fmtDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtShort(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}
function fmtTime(isoStr: string) {
    return new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function minutesSinceMidnight(isoStr: string) {
    const d = new Date(isoStr);
    return d.getHours() * 60 + d.getMinutes();
}

function AppointmentBlock({ appt }: { appt: ApptSlot }) {
    const startMins = minutesSinceMidnight(appt.starts_at);
    const endMins   = minutesSinceMidnight(appt.ends_at);
    const topPx     = ((startMins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
    const heightPx  = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 24);
    const colorCls  = STATUS_COLORS[appt.status] ?? 'bg-slate-50 border-slate-200 text-slate-700';

    return (
        <Link
            href={route('appointments.show', appt.id)}
            className={cn(
                'absolute left-1 right-1 rounded-lg border px-2 py-1 text-[11px] overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
                colorCls,
            )}
            style={{ top: topPx, height: heightPx }}
        >
            <p className="font-semibold truncate leading-tight">{appt.customer}</p>
            <p className="truncate opacity-70 leading-tight">{appt.service}</p>
            {heightPx > 40 && <p className="truncate opacity-60 leading-tight">{fmtTime(appt.starts_at)}</p>}
        </Link>
    );
}

function TimeGutter() {
    return (
        <div className="w-14 shrink-0 relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                <div
                    key={i}
                    className="absolute right-2 text-[10px] text-slate-400 font-medium"
                    style={{ top: i * HOUR_HEIGHT - 7 }}
                >
                    {((HOUR_START + i) % 12 || 12)}{HOUR_START + i < 12 ? 'am' : 'pm'}
                </div>
            ))}
        </div>
    );
}

function HourLines() {
    return (
        <>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-slate-100"
                    style={{ top: i * HOUR_HEIGHT }}
                />
            ))}
        </>
    );
}

export default function Index({
    appointments,
    view,
    date,
    start,
}: {
    appointments: ApptSlot[];
    view: 'day' | 'week';
    date: string;
    start: string;
    end: string;
    barbers: { id: number; name: string }[];
    is_barber: boolean;
}) {
    const days = view === 'week' ? weekDates(date) : [date];

    const apptsByDay = useMemo(() => {
        const map: Record<string, ApptSlot[]> = {};
        for (const appt of appointments) {
            const d = appt.starts_at.split('T')[0];
            if (!map[d]) map[d] = [];
            map[d].push(appt);
        }
        return map;
    }, [appointments]);

    function navigate(delta: number) {
        const newDate = view === 'week' ? addDays(start, delta * 7) : addDays(date, delta);
        router.get(route('schedule.index'), { view, date: newDate }, { preserveState: false });
    }

    function toggleView() {
        router.get(route('schedule.index'), { view: view === 'week' ? 'day' : 'week', date }, { preserveState: false });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <AppLayout
            title="Schedule"
            actions={
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleView}
                        className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none gap-2')}
                    >
                        {view === 'week'
                            ? <><CalendarDays className="h-3.5 w-3.5" /> Day</>
                            : <><LayoutGrid className="h-3.5 w-3.5" /> Week</>
                        }
                    </button>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => router.get(route('schedule.index'), { view, date: todayStr })}
                            className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => navigate(1)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Schedule" />

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {/* Day headers */}
                <div className="flex border-b border-slate-200">
                    <div className="w-14 shrink-0 border-r border-slate-100" />
                    {days.map(d => (
                        <div
                            key={d}
                            className={cn(
                                'flex-1 text-center py-3 text-xs font-semibold border-r border-slate-100 last:border-r-0',
                                d === todayStr ? 'bg-slate-900 text-white' : 'text-slate-600',
                            )}
                        >
                            {view === 'week' ? fmtShort(d) : fmtDate(d)}
                        </div>
                    ))}
                </div>

                {/* Grid body */}
                <div className="flex overflow-y-auto max-h-[calc(100vh-240px)]">
                    <TimeGutter />
                    {days.map(d => (
                        <div
                            key={d}
                            className="flex-1 relative border-r border-slate-100 last:border-r-0"
                            style={{ height: TOTAL_HOURS * HOUR_HEIGHT, minWidth: 0 }}
                        >
                            <HourLines />
                            {(apptsByDay[d] ?? []).map(appt => (
                                <AppointmentBlock key={appt.id} appt={appt} />
                            ))}
                        </div>
                    ))}
                </div>

                {appointments.length === 0 && (
                    <div className="py-12 text-center text-sm text-slate-400 border-t border-slate-100">
                        No appointments this {view}.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
