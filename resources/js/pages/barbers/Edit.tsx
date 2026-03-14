import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Barber } from '@/types';
import { User, Mail, Star, AlignLeft, Contact } from 'lucide-react';

export default function Edit({ barber }: { barber: Barber }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        name: barber.user?.name ?? '',
        email: barber.user?.email ?? '',
        bio: barber.bio ?? '',
        specialty: barber.specialty ?? '',
        is_active: barber.is_active,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(route('barbers.update', barber.id));
    }

    return (
        <AppLayout title={t('barber.edit')}>
            <Head title={`${t('barber.edit')} ${barber.user?.name}`} />
            
            <div className="mx-auto max-w-2xl">
                {/* Header Section */}
                <div className="mb-6 px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('barber.edit')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('barber.editDesc')}</p>
                </div>

                <form onSubmit={submit} className="space-y-6 bg-white border border-slate-200 rounded-xl p-4 sm:p-8 shadow-sm">
                    
                    {/* Identity & Contact Grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <User size={12} />{' '}{t('barber.fullName')}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('barber.namePlaceholder')}
                                required
                            />
                            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail size={12} />{' '}{t('barber.emailAddress')}
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                                placeholder={t('barber.emailPlaceholder')}
                                required
                            />
                            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Specialty Field */}
                    <div className="space-y-2">
                        <Label htmlFor="specialty" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Star size={12} />{' '}{t('barber.specialtyExpertise')}
                        </Label>
                        <Input
                            id="specialty"
                            value={data.specialty}
                            onChange={(e) => setData('specialty', e.target.value)}
                            className="h-10 bg-slate-50 border-slate-200 focus:bg-white rounded-lg transition-all"
                            placeholder={t('barber.specialtyPlaceholder')}
                        />
                        {errors.specialty && <p className="text-xs text-red-500 font-medium">{errors.specialty}</p>}
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlignLeft size={12} />{' '}{t('barber.professionalBio')}
                        </Label>
                        <Textarea
                            id="bio"
                            value={data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="bg-slate-50 border-slate-200 focus:bg-white rounded-lg min-h-[100px] transition-all"
                            placeholder={t('barber.bioPlaceholder')}
                            rows={4}
                        />
                        {errors.bio && <p className="text-xs text-red-500 font-medium">{errors.bio}</p>}
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 bg-white p-2 rounded-lg border border-slate-200">
                                <Contact size={16} className="text-slate-400" />
                            </div>
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-sm font-bold text-slate-900">{t('barber.activeSchedule')}</Label>
                                <p className="text-xs text-slate-500">{t('barber.activeScheduleDesc')}</p>
                            </div>
                        </div>
                        <Switch
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(v) => setData('is_active', v)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold h-10 px-6 shadow-sm transition-all"
                        >
                            {t('barber.updateBarber')}
                        </Button>
                        <Link
                            href={route('barbers.index')}
                            className={cn(buttonVariants({ variant: "ghost" }), "text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold h-10 px-4")}
                        >
                            {t('cancel')}
                        </Link>
                    </div>
                </form>

            </div>
        </AppLayout>
    );
}