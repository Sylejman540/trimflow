import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { buttonVariants } from '@/components/ui/button';
import {
    Search,
    MapPin,
    Calendar,
    Scissors,
    ChevronRight,
    Users,
    Star,
    Sparkles,
    Hand,
    Eye,
    Droplets,
    Clock,
    ShieldCheck,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function CategoryItem({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="flex flex-col items-center gap-3 cursor-pointer group">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border border-gray-100 bg-white shadow-sm flex items-center justify-center transition-all group-hover:shadow-md group-hover:border-amber-200">
                <div className="text-gray-600 group-hover:text-amber-600 transition-colors">
                    {icon}
                </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {label}
            </span>
        </div>
    );
}

function VenueCard({
    image,
    name,
    location,
    rating,
    reviews,
    price,
}: {
    image: string;
    name: string;
    location: string;
    rating: string;
    reviews: number;
    price: string;
}) {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
                <img
                    src={image}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    alt={name}
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {rating}
                </div>
            </div>
            <h3 className="font-semibold text-base leading-tight text-gray-900 group-hover:text-black">
                {name}
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">{location}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-400">
                    {reviews} reviews
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-sm font-medium text-gray-700">
                    From {price}
                </span>
            </div>
        </div>
    );
}

function StepItem({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white text-lg font-bold">
                {number}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                {description}
            </p>
        </div>
    );
}

const venues = [
    {
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
        name: 'The Gentleman\'s Quarter',
        location: 'Midtown · 0.8 mi',
        rating: '5.0',
        reviews: 324,
        price: '$35',
    },
    {
        image: 'https://images.unsplash.com/photo-1585747860019-8a8e3f055233?auto=format&fit=crop&q=80&w=600',
        name: 'Blade & Fade Studio',
        location: 'Downtown · 1.2 mi',
        rating: '4.9',
        reviews: 187,
        price: '$28',
    },
    {
        image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
        name: 'Crown & Comb Barbershop',
        location: 'West Side · 2.1 mi',
        rating: '4.8',
        reviews: 256,
        price: '$30',
    },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="TrimFlow — Book barbers, stylists & grooming pros" />
            <div className="min-h-screen bg-white antialiased">
                {/* Navbar */}
                <header className="fixed top-0 w-full z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gray-900 p-1.5 rounded-lg">
                                <Scissors className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className="text-lg font-black tracking-tight text-gray-900 uppercase">
                                TrimFlow
                            </span>
                        </div>
                        <nav className="flex items-center gap-3">
                            <Link
                                href={route('login')}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden md:block transition-colors"
                            >
                                For Business
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className={cn(
                                        buttonVariants({ variant: 'outline' }),
                                        'rounded-full px-5',
                                    )}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 bg-[#F2F2F2]">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <h1 className="mb-4 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
                            Book local
                            <br />
                            professionals
                        </h1>
                        <p className="mb-10 text-lg text-gray-500 max-w-lg mx-auto">
                            Discover and book barbers, stylists, and grooming
                            experts near you.
                        </p>

                        {/* Search Bar */}
                        <div className="mx-auto max-w-3xl bg-white rounded-2xl md:rounded-full shadow-xl shadow-black/5 p-2 flex flex-col md:flex-row items-center">
                            <div className="flex flex-1 items-center w-full px-4 border-b md:border-b-0 md:border-r border-gray-100 py-3">
                                <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Service or venue"
                                    className="w-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                />
                            </div>
                            <div className="flex flex-1 items-center w-full px-4 border-b md:border-b-0 md:border-r border-gray-100 py-3">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    className="w-full bg-transparent border-none outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                />
                            </div>
                            <div className="flex items-center w-full md:w-auto px-4 py-3 md:py-0">
                                <Calendar className="h-5 w-5 text-gray-400 mr-3 shrink-0 md:hidden" />
                                <span className="text-sm text-gray-400 md:hidden">
                                    Any date
                                </span>
                                <button className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl md:rounded-full text-sm font-semibold hover:bg-black transition-colors">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Popular searches */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            <span className="text-xs text-gray-400">
                                Popular:
                            </span>
                            {[
                                'Fade Haircut',
                                'Beard Trim',
                                'Hot Towel Shave',
                                'Hair Coloring',
                            ].map((term) => (
                                <span
                                    key={term}
                                    className="text-xs text-gray-500 bg-white/60 px-3 py-1.5 rounded-full border border-gray-200 cursor-pointer hover:bg-white hover:border-gray-300 transition-colors"
                                >
                                    {term}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-16 md:py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-10">
                            Browse by category
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6 md:gap-8">
                            <CategoryItem
                                label="Hair Salon"
                                icon={<Scissors size={26} />}
                            />
                            <CategoryItem
                                label="Barbershop"
                                icon={<Users size={26} />}
                            />
                            <CategoryItem
                                label="Nails"
                                icon={<Hand size={26} />}
                            />
                            <CategoryItem
                                label="Massage"
                                icon={<Sparkles size={26} />}
                            />
                            <CategoryItem
                                label="Eyebrows"
                                icon={<Eye size={26} />}
                            />
                            <CategoryItem
                                label="Skin Care"
                                icon={<Droplets size={26} />}
                            />
                        </div>
                    </div>
                </section>

                {/* Recommended Venues */}
                <section className="py-16 md:py-20 bg-gray-50/80">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Recommended near you
                            </h2>
                            <button className="text-sm font-semibold text-gray-900 flex items-center gap-1 hover:underline underline-offset-4">
                                See all{' '}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {venues.map((venue) => (
                                <VenueCard key={venue.name} {...venue} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-16 md:py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center mb-14">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                                How TrimFlow works
                            </h2>
                            <p className="mt-3 text-gray-500 max-w-md mx-auto">
                                Book your next appointment in three simple
                                steps.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <StepItem
                                number="1"
                                title="Discover"
                                description="Browse top-rated barbers and stylists in your area with real reviews and transparent pricing."
                            />
                            <StepItem
                                number="2"
                                title="Book Instantly"
                                description="Choose your service, pick a time that works, and confirm your appointment in seconds."
                            />
                            <StepItem
                                number="3"
                                title="Look Great"
                                description="Show up, enjoy your service, and leave looking your best. Rate and review your experience."
                            />
                        </div>
                    </div>
                </section>

                {/* Trust Bar */}
                <section className="py-12 bg-gray-50/80 border-y border-gray-100">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">
                                    24/7 Online Booking
                                </p>
                                <p className="text-xs text-gray-400">
                                    Book anytime, anywhere
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">
                                    Verified Professionals
                                </p>
                                <p className="text-xs text-gray-400">
                                    Every provider is vetted
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Zap className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-700">
                                    Instant Confirmation
                                </p>
                                <p className="text-xs text-gray-400">
                                    No waiting, no phone calls
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 md:py-28 bg-gray-900">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to grow your business?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Join thousands of barbershops and salons using
                            TrimFlow to manage bookings, clients, and payments.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href={route('register')}
                                className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                Get started free
                            </Link>
                            <Link
                                href={route('login')}
                                className="rounded-full border border-gray-700 px-8 py-3 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-10 bg-gray-950">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-gray-800 p-1.5 rounded-lg">
                                    <Scissors className="h-4 w-4 text-gray-400" />
                                </div>
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                                    TrimFlow
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <span className="hover:text-gray-300 cursor-pointer transition-colors">
                                    About
                                </span>
                                <span className="hover:text-gray-300 cursor-pointer transition-colors">
                                    Careers
                                </span>
                                <span className="hover:text-gray-300 cursor-pointer transition-colors">
                                    Privacy
                                </span>
                                <span className="hover:text-gray-300 cursor-pointer transition-colors">
                                    Terms
                                </span>
                            </div>
                            <p className="text-xs text-gray-600">
                                &copy; {new Date().getFullYear()} TrimFlow.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
