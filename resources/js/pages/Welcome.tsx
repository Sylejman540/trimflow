import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, CalendarDays, Users, BarChart2, Package, Link2, Globe, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function Welcome({ canLogin, canRegister }: { canLogin: boolean; canRegister: boolean }) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="TrimFlow - Barber Shop Management Software" />
            <div className="min-h-screen bg-slate-900 text-white overflow-hidden">
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
                                <span className="font-bold text-white text-sm">T</span>
                            </div>
                            <span className="font-bold text-lg">TrimFlow</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm text-slate-300 hover:text-white transition">
                                {t('land.navFeatures')}
                            </a>
                            <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition">
                                {t('land.navPricing')}
                            </a>
                        </div>

                        <div className="flex items-center gap-4">
                            <LanguageSwitcher />
                            {canLogin && (
                                <Link href={route('login')} className="text-sm text-slate-300 hover:text-white transition">
                                    {t('auth.loginTitle')}
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition">
                                    {t('auth.registerTitle')}
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                            {t('land.heroHeading')}
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            {t('land.heroSub')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            {canRegister && (
                                <Link
                                    href={route('register')}
                                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition inline-flex items-center justify-center gap-2"
                                >
                                    {t('land.heroBtn')} <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="px-8 py-3 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition inline-flex items-center justify-center gap-2"
                            >
                                {t('land.heroBtn2')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Marquee */}
                {/* <section className="py-12 border-y border-slate-800">
                    <Marquee />
                </section> */}

                {/* Problem Solution */}
                <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-blue-400 text-sm font-semibold mb-2">{t('land.problemLabel')}</p>
                            <h2 className="text-4xl font-bold mb-4">{t('land.problemHeading')}</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">{t('land.problemSub')}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Problems */}
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                            <span className="text-red-400 text-sm">✕</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{t(`land.problem${i}`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Solutions */}
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{t(`land.solution${i}`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-blue-400 text-sm font-semibold mb-2">{t('land.featuresLabel')}</p>
                            <h2 className="text-4xl font-bold mb-4">{t('land.featuresHeading')}</h2>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: CalendarDays, key: 1 },
                                { icon: Users, key: 2 },
                                { icon: BarChart2, key: 3 },
                                { icon: Package, key: 4 },
                                { icon: Link2, key: 5 },
                                { icon: Globe, key: 6 },
                            ].map(({ icon: Icon, key }) => (
                                <div key={key} className="p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
                                    <Icon className="h-8 w-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-lg font-semibold mb-2">{t(`land.feature${key}Title`)}</h3>
                                    <p className="text-slate-400 text-sm">{t(`land.feature${key}Desc`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <p className="text-center text-slate-400 text-sm mb-12">{t('land.statsLabel')}</p>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { value: t('land.stat1Value'), label: t('land.stat1Label') },
                                { value: t('land.stat2Value'), label: t('land.stat2Label') },
                                { value: t('land.stat3Value'), label: t('land.stat3Label') },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
                                    <p className="text-slate-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-blue-400 text-sm font-semibold mb-2">{t('land.pricingLabel')}</p>
                            <h2 className="text-4xl font-bold mb-4">{t('land.pricingHeading')}</h2>
                            <p className="text-slate-400">{t('land.pricingSub')}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Starter */}
                            <div className="p-8 rounded-xl border border-slate-700 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{t('land.planStarterName')}</h3>
                                    <p className="text-slate-400">{t('land.planStarterDesc')}</p>
                                </div>
                                <div className="text-3xl font-bold">
                                    {t('land.planStarterPrice')}
                                    <span className="text-sm text-slate-400 font-normal">/month</span>
                                </div>
                                <ul className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span>{t(`land.planStarterFeature${i}`)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-2 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition">
                                    {t('land.planCTA')}
                                </button>
                            </div>

                            {/* Pro (highlighted) */}
                            <div className="p-8 rounded-xl border-2 border-blue-500 space-y-6 relative">
                                <div className="absolute -top-3 left-6 bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold">
                                    {t('land.planProBadge')}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{t('land.planProName')}</h3>
                                    <p className="text-slate-400">{t('land.planProDesc')}</p>
                                </div>
                                <div className="text-3xl font-bold">
                                    {t('land.planProPrice')}
                                    <span className="text-sm text-slate-400 font-normal">/month</span>
                                </div>
                                <ul className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span>{t(`land.planProFeature${i}`)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition">
                                    {t('land.planCTA')}
                                </button>
                            </div>

                            {/* Enterprise */}
                            <div className="p-8 rounded-xl border border-slate-700 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{t('land.planEnterpriseName')}</h3>
                                    <p className="text-slate-400">{t('land.planEnterpriseDesc')}</p>
                                </div>
                                <div className="text-3xl font-bold">{t('land.planEnterprisePrice')}</div>
                                <ul className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <li key={i} className="flex gap-2 text-sm">
                                            <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span>{t(`land.planEnterpriseFeature${i}`)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full py-2 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold transition">
                                    {t('land.planContactUs')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Bottom */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Ready to transform your barbershop?</h2>
                        <p className="text-slate-300 mb-8">Start your free trial today. No credit card required.</p>
                        {canRegister && (
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
                            >
                                {t('land.getFreeBtn')} <ChevronRight className="h-5 w-5" />
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#features" className="hover:text-white transition">{t('land.linkFeatures')}</a></li>
                                <li><a href="#pricing" className="hover:text-white transition">{t('land.linkPricing')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkDemo')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">{t('land.linkAbout')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkBlog')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkCareers')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">{t('land.footerColSupport')}</h3>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">{t('land.linkHelp')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkContact')}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">{t('land.linkPrivacy')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkTerms')}</a></li>
                                <li><a href="#" className="hover:text-white transition">{t('land.linkCookies')}</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
                        <p>{t('land.copyright')}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
