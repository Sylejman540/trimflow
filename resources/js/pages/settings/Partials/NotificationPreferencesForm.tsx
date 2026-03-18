import { useTranslation } from 'react-i18next';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { User } from '@/types';

export default function NotificationPreferencesForm({ user }: { user: User }) {
    const { t } = useTranslation();
    const [showFeedback, setShowFeedback] = useState(false);
    const { data, setData, patch, processing } = useForm({
        notifications_sound: user.notifications_sound ?? true,
        notifications_email: user.notifications_email ?? true,
    });

    const handleToggle = (key: 'notifications_sound' | 'notifications_email', value: boolean) => {
        setData(key, value);
        // Immediately save after toggle
        setTimeout(() => {
            patch(route('settings.update-notifications'), {
                data: { ...data, [key]: value },
                onSuccess: () => {
                    setShowFeedback(true);
                    setTimeout(() => setShowFeedback(false), 3000);
                },
            });
        }, 0);
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
                        checked={data.notifications_sound}
                        onCheckedChange={(checked) => {
                            setData('notifications_sound', checked);
                        }}
                        onBlur={() => handleSave('notifications_sound')}
                    />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                        <p className="font-semibold text-slate-900 text-sm">{t('settingsPage.emailNotifications')}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t('settingsPage.emailNotificationsDesc')}</p>
                    </div>
                    <Switch
                        checked={data.notifications_email}
                        onCheckedChange={(checked) => {
                            setData('notifications_email', checked);
                        }}
                        onBlur={() => handleSave('notifications_email')}
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
