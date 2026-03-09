import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, GripVertical, Clock, User, Scissors } from 'lucide-react';
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const HOUR_START  = 7;
const HOUR_END    = 21;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_HEIGHT = 64;
const SLOT_MINS   = 15;

const STATUS_COLORS: Record<string, string> = {
    confirmed:   'bg-green-50 border-green-200 text-green-800',
    in_progress: 'bg-amber-50 border-amber-200 text-amber-800',
    completed:   'bg-emerald-50 border-emerald-200 text-emerald-800',
    no_show:     'bg-slate-50 border-slate-200 text-slate-500',
    cancelled:   'bg-red-50 border-red-200 text-red-600',
};

const STATUS_BADGE: Record<string, string> = {
    confirmed:   'bg-green-100 text-green-700',
    in_progress: 'bg-amber-100 text-amber-700',
    completed:   'bg-emerald-100 text-emerald-700',
    no_show:     'bg-slate-100 text-slate-500',
    cancelled:   'bg-red-100 text-red-600',
};

const DAY_COL_MIN_W = 120;

function addDays(dateStr: string, n: number) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}

function weekDates(anchorDate: string) {
    const d = new Date(anchorDate + 'T12:00:00');
    const day = d.getDay();
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
function parseShopTime(isoStr: string): Date {
    return new Date(isoStr.replace(/([+-]\d{2}:\d{2}|Z)$/, ''));
}
function fmtTime(isoStr: string) {
    return parseShopTime(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function minutesSinceMidnight(isoStr: string) {
    const d = parseShopTime(isoStr);
    return d.getHours() * 60 + d.getMinutes();
}

interface DragState {
    apptId: number;
    startY: number;
    origTop: number;
    ghostTop: number;
    origAppt: ApptSlot;
}

function TimeGutter() {
    return (
        <div className="w-12 shrink-0 relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                <div key={i} className="absolute right-2 text-[10px] text-slate-400 font-medium" style={{ top: i * HOUR_HEIGHT - 7 }}>
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
                <div key={i} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: i * HOUR_HEIGHT }} />
            ))}
        </>
    );
}

function AppointmentBlock({
    appt,
    onDragStart,
    isDragging,
    ghostTop,
}: {
    appt: ApptSlot;
    colDate: string;
    onDragStart: (e: React.MouseEvent, appt: ApptSlot, origTop: number) => void;
    isDragging: boolean;
    ghostTop: number | null;
}) {
    const startMins = minutesSinceMidnight(appt.starts_at);
    const endMins   = minutesSinceMidnight(appt.ends_at);
    const topPx     = ((startMins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
    const heightPx  = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 24);
    const colorCls  = STATUS_COLORS[appt.status] ?? 'bg-slate-50 border-slate-200 text-slate-700';
    const canDrag   = appt.status !== 'completed' && appt.status !== 'cancelled' && appt.status !== 'no_show';
    const displayTop = isDragging && ghostTop !== null ? ghostTop : topPx;

    return (
        <>
            {isDragging && (
                <div
                    className="absolute inset-x-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/60 pointer-events-none"
                    style={{ top: topPx, height: heightPx }}
                />
            )}
            <div
                className={cn(
                    'absolute inset-x-1 rounded-lg border px-1.5 py-1 text-[11px] overflow-hidden',
                    colorCls,
                    canDrag ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-pointer hover:shadow-sm',
                    isDragging ? 'shadow-2xl z-30 ring-2 ring-slate-900/20' : 'z-10 transition-shadow',
                )}
                style={{ top: displayTop, height: heightPx }}
                onMouseDown={canDrag ? (e) => onDragStart(e, appt, topPx) : undefined}
                onClick={!canDrag || !isDragging ? () => router.visit(route('appointments.show', appt.id)) : undefined}
            >
                <div className="flex items-start gap-0.5">
                    {canDrag && <GripVertical className="h-3 w-3 mt-0.5 shrink-0 opacity-30" />}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate leading-tight">{appt.customer}</p>
                        <p className="truncate opacity-70 leading-tight">{appt.service}</p>
                        {heightPx > 40 && <p className="truncate opacity-60 leading-tight">{fmtTime(appt.starts_at)}</p>}
                    </div>
                </div>
            </div>
        </>
    );
}

// Mobile list view — cards instead of a time grid
function MobileListView({ appointments, date, navigate }: {
    appointments: ApptSlot[];
    date: string;
    navigate: (delta: number) => void;
}) {
    const { t } = useTranslation();
    const todayStr = new Date().toISOString().split('T')[0];
    const sorted = [...appointments].sort((a, b) => a.starts_at.localeCompare(b.starts_at));

    return (
        <div className="space-y-3">
            {/* Date header */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3">
                <button onClick={() => navigate(-1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900">{fmtDate(date)}</p>
                    {date === todayStr && <p className="text-[11px] text-amber-600 font-medium">Today</p>}
                </div>
                <button onClick={() => navigate(1)} className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {sorted.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl py-12 text-center text-sm text-slate-400">
                    {t('appt.noAppointments')}
                </div>
            ) : (
                sorted.map(appt => (
                    <button
                        key={appt.id}
                        onClick={() => router.visit(route('appointments.show', appt.id))}
                        className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{appt.customer}</p>
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="h-3 w-3" />
                                        {fmtTime(appt.starts_at)} – {fmtTime(appt.ends_at)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <Scissors className="h-3 w-3" />
                                        {appt.service}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                        <User className="h-3 w-3" />
                                        {appt.barber}
                                    </span>
                                </div>
                            </div>
                            <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0', STATUS_BADGE[appt.status] ?? 'bg-slate-100 text-slate-500')}>
                                {appt.status === 'confirmed' ? t('appt.confirmed')
                                    : appt.status === 'in_progress' ? t('appt.inProgress')
                                    : appt.status === 'completed' ? t('appt.completed')
                                    : appt.status === 'cancelled' ? t('appt.cancelled')
                                    : appt.status === 'no_show' ? t('appt.noShow')
                                    : appt.status}
                            </span>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
}

export default function Index({
    appointments: initialAppointments,
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
    const { t } = useTranslation();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );
    const [appointments, setAppointments] = useState<ApptSlot[]>(initialAppointments);
    const [dragging, setDragging] = useState<DragState | null>(null);
    const [saving, setSaving] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Track resize
    useEffect(() => {
        function onResize() {
            setIsMobile(window.innerWidth < 640);
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Auto-switch to day view on mobile
    useEffect(() => {
        if (isMobile && view === 'week') {
            router.get(route('schedule.index'), { view: 'day', date }, { preserveState: false, replace: true });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile]);

    useEffect(() => {
        setAppointments(initialAppointments);
    }, [initialAppointments]);

    const effectiveView = isMobile ? 'day' : view;
    const days = effectiveView === 'week' ? weekDates(date) : [date];

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
        const newDate = effectiveView === 'week' ? addDays(start, delta * 7) : addDays(date, delta);
        router.get(route('schedule.index'), { view: effectiveView, date: newDate }, { preserveState: false });
    }

    function toggleView() {
        router.get(route('schedule.index'), { view: effectiveView === 'week' ? 'day' : 'week', date }, { preserveState: false });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const colStyle = effectiveView === 'week'
        ? { width: `${100 / days.length}%`, minWidth: DAY_COL_MIN_W, flexShrink: 0 as const }
        : { flex: '1 1 0%' };

    // ── Drag handlers ────────────────────────────────────────────────────────
    const handleDragStart = useCallback((e: React.MouseEvent, appt: ApptSlot, origTop: number) => {
        e.preventDefault();
        setErrorMsg(null);
        setDragging({ apptId: appt.id, startY: e.clientY, origTop, ghostTop: origTop, origAppt: { ...appt } });
    }, []);

    useEffect(() => {
        if (!dragging) return;

        function onMove(e: MouseEvent) {
            setDragging(prev => {
                if (!prev) return null;
                const rawDelta  = e.clientY - prev.startY;
                const minsPerPx = 60 / HOUR_HEIGHT;
                const rawMins   = rawDelta * minsPerPx;
                const snapped   = Math.round(rawMins / SLOT_MINS) * SLOT_MINS;
                const newTop    = prev.origTop + (snapped / 60) * HOUR_HEIGHT;
                const appt      = prev.origAppt;
                const durationMins = minutesSinceMidnight(appt.ends_at) - minutesSinceMidnight(appt.starts_at);
                const maxTop    = ((TOTAL_HOURS * 60 - durationMins) / 60) * HOUR_HEIGHT;
                const clampedTop = Math.max(0, Math.min(maxTop, newTop));
                return { ...prev, ghostTop: clampedTop };
            });
        }

        function onUp() {
            setDragging(prev => {
                if (!prev) return null;
                const appt = prev.origAppt;

                const offsetMins = (prev.ghostTop / HOUR_HEIGHT) * 60;
                const totalMins  = HOUR_START * 60 + offsetMins;
                const h = Math.floor(totalMins / 60);
                const m = Math.round(totalMins % 60);

                const apptDate    = appt.starts_at.split('T')[0];
                const newStartsAt = `${apptDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;

                const origMins = minutesSinceMidnight(appt.starts_at);
                const newMins  = h * 60 + m;
                if (origMins === newMins) return null;

                const durationMins = minutesSinceMidnight(appt.ends_at) - minutesSinceMidnight(appt.starts_at);
                const newEndsAt    = new Date(new Date(newStartsAt).getTime() + durationMins * 60000).toISOString();

                setAppointments(cur => cur.map(a =>
                    a.id === appt.id ? { ...a, starts_at: newStartsAt, ends_at: newEndsAt } : a
                ));

                setSaving(appt.id);
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
                fetch(route('schedule.reschedule', appt.id), {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ starts_at: newStartsAt }),
                })
                    .then(async r => {
                        if (!r.ok) {
                            const json = await r.json().catch(() => ({}));
                            throw new Error((json as { error?: string }).error ?? 'Failed');
                        }
                    })
                    .catch(err => {
                        setAppointments(cur => cur.map(a => a.id === appt.id ? appt : a));
                        setErrorMsg((err as Error).message ?? 'Could not reschedule.');
                    })
                    .finally(() => setSaving(null));

                return null;
            });
        }

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dragging]);

    return (
        <AppLayout
            title={t('nav.schedule')}
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    {!isMobile && (
                        <button
                            onClick={toggleView}
                            className={cn(buttonVariants({ variant: 'outline' }), 'h-9 px-3 rounded-lg text-xs font-bold border-slate-200 shadow-none gap-2')}
                        >
                            {effectiveView === 'week'
                                ? <><CalendarDays className="h-3.5 w-3.5" /> Day</>
                                : <><LayoutGrid className="h-3.5 w-3.5" /> Week</>
                            }
                        </button>
                    )}
                    <div className="flex items-center gap-1">
                        <button onClick={() => navigate(-1)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => router.get(route('schedule.index'), { view: effectiveView, date: todayStr })}
                            className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Today
                        </button>
                        <button onClick={() => navigate(1)} className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={t('nav.schedule')} />

            {/* Error toast */}
            {errorMsg && (
                <div className="mb-3 flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-700 font-bold">✕</button>
                </div>
            )}

            {saving !== null && (
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Saving…
                </div>
            )}

            {/* Mobile: card list */}
            {isMobile ? (
                <MobileListView
                    appointments={apptsByDay[date] ?? []}
                    date={date}
                    navigate={navigate}
                />
            ) : (
                /* Desktop: time grid */
                <div ref={gridRef} className={cn('bg-white border border-slate-200 rounded-xl overflow-hidden', dragging ? 'select-none cursor-grabbing' : '')}>
                    {/* Day headers */}
                    <div className="overflow-x-auto">
                        <div className="flex border-b border-slate-200" style={{ minWidth: effectiveView === 'week' ? days.length * DAY_COL_MIN_W + 48 : undefined }}>
                            <div className="w-12 shrink-0 border-r border-slate-100" />
                            {days.map(d => (
                                <div
                                    key={d}
                                    className={cn('text-center py-3 text-xs font-semibold border-r border-slate-100 last:border-r-0', d === todayStr ? 'bg-slate-900 text-white' : 'text-slate-600')}
                                    style={colStyle}
                                >
                                    {effectiveView === 'week' ? fmtShort(d) : fmtDate(d)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid body */}
                    <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                        <div className="flex" style={{ minWidth: effectiveView === 'week' ? days.length * DAY_COL_MIN_W + 48 : undefined }}>
                            <TimeGutter />
                            {days.map(d => (
                                <div
                                    key={d}
                                    className="relative border-r border-slate-100 last:border-r-0"
                                    style={{ ...colStyle, height: TOTAL_HOURS * HOUR_HEIGHT }}
                                >
                                    <HourLines />
                                    {(apptsByDay[d] ?? []).map(appt => {
                                        const isDraggingThis = dragging?.apptId === appt.id;
                                        return (
                                            <AppointmentBlock
                                                key={appt.id}
                                                appt={appt}
                                                colDate={d}
                                                onDragStart={handleDragStart}
                                                isDragging={isDraggingThis}
                                                ghostTop={isDraggingThis ? dragging!.ghostTop : null}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {appointments.length === 0 && (
                        <div className="py-12 text-center text-sm text-slate-400 border-t border-slate-100">
                            No appointments this {effectiveView}.
                        </div>
                    )}
                </div>
            )}

            {!isMobile && (
                <p className="mt-2 text-[11px] text-slate-400 text-center">
                    Drag appointments to reschedule · Click to view details · Completed/cancelled cannot be moved
                </p>
            )}
        </AppLayout>
    );
}
