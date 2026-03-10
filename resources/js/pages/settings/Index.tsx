import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Building2, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
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

export default function Index({
    company,
    twilio_configured,
    twilio_from,
}: {
    company: Company;
    twilio_configured: boolean;
    twilio_from: string;
}) {
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

                {/* Shop Info */}
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

                {/* SMS / Twilio */}
                <Card className="border-slate-200 shadow-none">
                    <CardHeader className="px-4 lg:px-6 pt-4 pb-2">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                            <CardTitle className="text-base">SMS Notifications (Twilio)</CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400 mt-0.5">
                            Customers receive SMS booking confirmations and reminders when Twilio is configured.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 lg:px-6 pb-4 space-y-4">
                        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${twilio_configured ? 'border-emerald-200 bg-emerald-50' : 'border-orange-200 bg-orange-50'}`}>
                            {twilio_configured
                                ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                : <XCircle className="h-4 w-4 text-orange-500 shrink-0" />
                            }
                            <div>
                                <p className={`text-sm font-semibold ${twilio_configured ? 'text-emerald-800' : 'text-orange-800'}`}>
                                    {twilio_configured ? 'Twilio is connected' : 'Twilio is not configured'}
                                </p>
                                <p className={`text-xs mt-0.5 ${twilio_configured ? 'text-emerald-600' : 'text-orange-600'}`}>
                                    {twilio_configured
                                        ? `Sending from ${twilio_from || 'your Twilio number'}`
                                        : 'Add TWILIO_SID, TWILIO_TOKEN, and TWILIO_FROM to your .env file to enable SMS.'
                                    }
                                </p>
                            </div>
                        </div>

                        {!twilio_configured && (
                            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Required .env variables</p>
                                <pre className="text-xs text-slate-700 font-mono leading-relaxed">
{`TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your_auth_token
TWILIO_FROM=+1234567890`}
                                </pre>
                                <p className="text-xs text-slate-500">
                                    Get your credentials at{' '}
                                    <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="underline">
                                        console.twilio.com
                                    </a>
                                </p>
                            </div>
                        )}

                        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SMS sent for</p>
                            <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                                <li>New public booking confirmation</li>
                                <li>1-hour appointment reminder</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
