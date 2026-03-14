import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Ad {
    id: number;
    headline: string;
    sub: string | null;
    emoji: string;
    is_active: boolean;
}

const EMOJI_OPTIONS = ['💈', '✂️', '🪒', '🧴', '💇', '🏆', '⭐', '🔥'];

export default function AdsIndex({ ads }: { ads: Ad[] }) {
    const [editing, setEditing] = useState<number | null>(null);

    // ── Create form ──────────────────────────────────────────────────────────
    const createForm = useForm({ headline: '', sub: '', emoji: '💈' });

    function submitCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(route('ads.store'), {
            onSuccess: () => createForm.reset(),
        });
    }

    // ── Edit form ────────────────────────────────────────────────────────────
    const editForm = useForm({ headline: '', sub: '', emoji: '💈', is_active: true as boolean });

    function startEdit(ad: Ad) {
        editForm.setData({ headline: ad.headline, sub: ad.sub ?? '', emoji: ad.emoji, is_active: ad.is_active });
        setEditing(ad.id);
    }

    function submitEdit(ad: Ad) {
        editForm.patch(route('ads.update', ad.id), {
            onSuccess: () => setEditing(null),
        });
    }

    function deleteAd(id: number) {
        if (!confirm('Delete this ad?')) return;
        router.delete(route('ads.destroy', id));
    }

    function toggleActive(ad: Ad) {
        router.patch(route('ads.update', ad.id), { is_active: !ad.is_active }, { preserveScroll: true });
    }

    return (
        <AppLayout>
            <Head title="Marketplace Ads" />

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Megaphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Marketplace Ads</h1>
                        <p className="text-sm text-slate-400">Your ads scroll on the Freshio landing page for all visitors to see.</p>
                    </div>
                </div>

                {/* Create ad card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Create a new ad</CardTitle>
                        <CardDescription>Promote your shop to everyone who visits Freshio.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitCreate} className="space-y-4">
                            {/* Emoji picker */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Icon</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {EMOJI_OPTIONS.map(e => (
                                        <button
                                            key={e} type="button"
                                            onClick={() => createForm.setData('emoji', e)}
                                            className={`w-9 h-9 text-lg rounded-lg border-2 transition-all ${
                                                createForm.data.emoji === e
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-100 bg-white hover:border-slate-200'
                                            }`}
                                        >{e}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Headline <span className="text-slate-300 normal-case font-normal">(max 120 chars)</span>
                                </Label>
                                <Input
                                    value={createForm.data.headline}
                                    onChange={e => createForm.setData('headline', e.target.value)}
                                    placeholder="Classic Cuts Barbershop — Open 7 days"
                                    maxLength={120}
                                    required
                                />
                                {createForm.errors.headline && <p className="text-xs text-red-500">{createForm.errors.headline}</p>}
                            </div>

                            {/* Sub */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Call to action <span className="text-slate-300 normal-case font-normal">(optional)</span>
                                </Label>
                                <Input
                                    value={createForm.data.sub}
                                    onChange={e => createForm.setData('sub', e.target.value)}
                                    placeholder="Book now →"
                                    maxLength={60}
                                />
                            </div>

                            {/* Preview */}
                            {createForm.data.headline && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <span className="text-lg leading-none">{createForm.data.emoji}</span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-800">{createForm.data.headline}</p>
                                        <p className="text-[10px] text-blue-600 font-bold">{createForm.data.sub || 'Book now →'}</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-md shadow-emerald-500/20"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {createForm.processing ? 'Saving…' : 'Create Ad'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Existing ads */}
                {ads.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your ads ({ads.length})</h2>

                        {ads.map(ad => (
                            <div key={ad.id} className={`bg-white border rounded-xl transition-all ${ad.is_active ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
                                {editing === ad.id ? (
                                    // ── Edit mode ──────────────────────────────────────────────
                                    <div className="p-4 space-y-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {EMOJI_OPTIONS.map(e => (
                                                <button key={e} type="button"
                                                    onClick={() => editForm.setData('emoji', e)}
                                                    className={`w-9 h-9 text-lg rounded-lg border-2 transition-all ${editForm.data.emoji === e ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                                >{e}</button>
                                            ))}
                                        </div>
                                        <Input
                                            value={editForm.data.headline}
                                            onChange={e => editForm.setData('headline', e.target.value)}
                                            placeholder="Headline"
                                            maxLength={120}
                                        />
                                        <Input
                                            value={editForm.data.sub ?? ''}
                                            onChange={e => editForm.setData('sub', e.target.value)}
                                            placeholder="Call to action"
                                            maxLength={60}
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => submitEdit(ad)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white">
                                                <Check className="h-3.5 w-3.5 mr-1" /> Save
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                                                <X className="h-3.5 w-3.5 mr-1" /> Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // ── View mode ──────────────────────────────────────────────
                                    <div className="flex items-center gap-3 p-4">
                                        <span className="text-xl leading-none shrink-0">{ad.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">{ad.headline}</p>
                                            <p className="text-[11px] text-blue-600 font-medium">{ad.sub || 'Book now →'}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {/* Toggle active */}
                                            <button onClick={() => toggleActive(ad)} title={ad.is_active ? 'Deactivate' : 'Activate'}
                                                className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                                                {ad.is_active
                                                    ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                                                    : <ToggleLeft className="h-5 w-5 text-slate-300" />}
                                            </button>
                                            {/* Edit */}
                                            <button onClick={() => startEdit(ad)} title="Edit"
                                                className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            {/* Delete */}
                                            <button onClick={() => deleteAd(ad.id)} title="Delete"
                                                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-300 hover:text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {ads.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No ads yet. Create your first one above.</p>
                        <p className="text-xs mt-1">It will appear in the scrolling ticker on the Freshio homepage.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
