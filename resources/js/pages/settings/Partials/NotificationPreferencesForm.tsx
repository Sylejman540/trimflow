import { useTranslation } from 'react-i18next';
import { router, usePage } from '@inertiajs/react';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { User } from '@/types';

export default function NotificationPreferencesForm({ user }: { user: User }) {
    const { t } = useTranslation();
    const page = usePage();
    const [showFeedback, setShowFeedback] = useState(false);
    const [notificationsSound, setNotificationsSound] = useState(user.notifications_sound ?? true);
    const [notificationsEmail, setNotificationsEmail] = useState(user.notifications_email ?? true);
    const [processing, setProcessing] = useState(false);

    // Sync with updated auth user from server
    useEffect(() => {
        const authUser = (page.props.auth as any)?.user;
        console.log('Auth user updated:', authUser?.notifications_sound, authUser?.notifications_email);
        if (authUser) {
            setNotificationsSound(authUser.notifications_sound ?? true);
            setNotificationsEmail(authUser.notifications_email ?? true);
        }
    }, [(page.props.auth as any)?.user?.notifications_sound, (page.props.auth as any)?.user?.notifications_email]);

    useEffect(() => {
        console.log('Local state:', { notificationsSound, notificationsEmail });
    }, [notificationsSound, notificationsEmail]);

    const handleToggle = (key: 'notifications_sound' | 'notifications_email', value: boolean) => {
        setProcessing(true);

        const newSound = key === 'notifications_sound' ? value : notificationsSound;
        const newEmail = key === 'notifications_email' ? value : notificationsEmail;

        setNotificationsSound(newSound);
        setNotificationsEmail(newEmail);

        router.patch(
            route('settings.update-notifications'),
            {
                notifications_sound: newSound,
                notifications_email: newEmail,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowFeedback(true);
                    setTimeout(() => setShowFeedback(false), 3000);
                },
                onError: () => {
                    // Reset on error
                    setNotificationsSound(user.notifications_sound ?? true);
                    setNotificationsEmail(user.notifications_email ?? true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900 shrink-0">
                    <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-900">{t('settingsPage.notifications')}</h3>
                    <p className="text-xs text-slate-500">{t('settingsPage.notificationsDesc')}</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Sound Notifications */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{t('settingsPage.soundNotifications')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t('settingsPage.soundNotificationsDesc')}</p>
                    </div>
                    <Switch
                        checked={notificationsSound}
                        onCheckedChange={(checked) => {
                            handleToggle('notifications_sound', checked);
                        }}
                        disabled={processing}
                    />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{t('settingsPage.emailNotifications')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t('settingsPage.emailNotificationsDesc')}</p>
                    </div>
                    <Switch
                        checked={notificationsEmail}
                        onCheckedChange={(checked) => {
                            handleToggle('notifications_email', checked);
                        }}
                        disabled={processing}
                    />
                </div>
            </div>

            {showFeedback && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    <p className="text-xs text-emerald-700 font-semibold">{t('settingsPage.preferencesSaved')}</p>
                </div>
            )}
        </div>
    );
}
