import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AppLayout from '@/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        bio: '',
        specialty: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('barbers.store'));
    }

    return (
        <AppLayout title="Add Barber">
            <Head title="Add Barber" />
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>New Barber</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={3}
                                />
                                {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialty">Specialty</Label>
                                <Input
                                    id="specialty"
                                    value={data.specialty}
                                    onChange={(e) => setData('specialty', e.target.value)}
                                    placeholder="e.g. Fades, Beard sculpting, Hot towel shave"
                                />
                                {errors.specialty && <p className="text-sm text-destructive">{errors.specialty}</p>}
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create Barber
                                </Button>
                                <Link href={route('barbers.index')} className={buttonVariants({ variant: "outline" })}>Cancel</Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
