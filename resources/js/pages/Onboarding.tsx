import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Onboarding() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('onboarding.store'));
    }

    return (
        <>
            <Head title="Set Up Your Shop" />
            <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] px-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center justify-center gap-2">
                        <Scissors className="h-6 w-6 text-amber-500" />
                        <span className="text-2xl font-bold tracking-tight">
                            TrimFlow
                        </span>
                    </div>

                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle>Set up your barbershop</CardTitle>
                            <CardDescription>
                                Create your shop to get started with TrimFlow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Shop Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g. Elite Cuts Barbershop"
                                        required
                                        autoFocus
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Shop Email{' '}
                                        <span className="text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="shop@example.com"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">
                                        Phone{' '}
                                        <span className="text-muted-foreground">
                                            (optional)
                                        </span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="(555) 123-4567"
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    Create Shop
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
