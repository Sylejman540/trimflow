import { Config } from 'ziggy-js';

export interface Company {
    id: number;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    logo: string | null;
    timezone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    company_id: number | null;
    created_at: string;
    updated_at: string;
}

export interface Barber {
    id: number;
    company_id: number;
    user_id: number;
    bio: string | null;
    specialty: string | null;
    working_hours: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: User;
}

export interface Service {
    id: number;
    company_id: number;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    category: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export type AppointmentStatus =
    | 'scheduled'
    | 'confirmed'
    | 'in_progress'
    | 'completed'
    | 'cancelled'
    | 'no_show';

export interface Appointment {
    id: number;
    company_id: number;
    barber_id: number;
    service_id: number;
    customer_name: string;
    customer_phone: string | null;
    starts_at: string;
    ends_at: string;
    status: AppointmentStatus;
    price: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    barber?: Barber;
    service?: Service;
    payment?: Payment;
    review?: Review;
    barber_notes?: BarberNote[];
}

export type PaymentMethod = 'cash' | 'card' | 'stripe' | 'paypal';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
    id: number;
    company_id: number;
    appointment_id: number;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
    appointment?: Appointment;
}

export interface Review {
    id: number;
    company_id: number;
    appointment_id: number;
    barber_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    updated_at: string;
    appointment?: Appointment;
    barber?: Barber;
}

export interface BarberNote {
    id: number;
    company_id: number;
    appointment_id: number;
    barber_id: number;
    notes: string;
    created_at: string;
    updated_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        company: Company | null;
        roles: string[];
        permissions: string[];
    };
    ziggy: Config & { location: string };
};
