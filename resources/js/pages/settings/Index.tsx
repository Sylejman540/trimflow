import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import AppLayout from '@/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Company {
    id: number;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    timezone?: string;
}

export default function Index({ company }: { company: Company }) {
    const { t } = useTranslation();

    const { data, setData, patch, processing, errors } = useForm({
        name:     company.name     ?? '',
        email:    company.email    ?? '',
        phone:    company.phone    ?? '',
        address:  company.address  ?? '',
        city:     company.city     ?? '',
        state:    company.state    ?? '',
        zip:      company.zip      ?? '',
        country:  company.country  ?? '',
        timezone: company.timezone ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('settings.company'));
    }

    return (
        <AppLayout title="Settings">
            <Head title="Settings" />

            <div className="max-w-2xl mx-auto space-y-6">

                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <CardTitle className="text-base">Shop Information</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                            Basic details about your shop visible to customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Shop Name *</Label>
                                    <Input
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                        required
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</Label>
                                    <Input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone</Label>
                                    <Input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Timezone</Label>
                                    <Input
                                        value={data.timezone}
                                        onChange={e => setData('timezone', e.target.value)}
                                        placeholder="e.g. Europe/London"
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Street Address</Label>
                                    <Input
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">City</Label>
                                    <Input
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">State / Region</Label>
                                    <Input
                                        value={data.state}
                                        onChange={e => setData('state', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">ZIP / Postal Code</Label>
                                    <Input
                                        value={data.zip}
                                        onChange={e => setData('zip', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Country</Label>
                                    <Input
                                        value={data.country}
                                        onChange={e => setData('country', e.target.value)}
                                        className="h-10 border-slate-200 shadow-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-6 shadow-none"
                                >
                                    {t('save')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
