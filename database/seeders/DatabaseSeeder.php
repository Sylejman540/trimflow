<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\BarberNote;
use App\Models\Company;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // Create company
        $company = Company::create([
            'name' => 'TrimFlow Demo Shop',
            'slug' => 'trimflow-demo',
            'email' => 'info@trimflow.test',
            'phone' => '(555) 123-4567',
            'address' => '123 Main Street',
            'city' => 'New York',
            'state' => 'NY',
            'zip' => '10001',
            'timezone' => 'America/New_York',
        ]);

        // Platform admin (no company)
        $admin = User::factory()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@trimflow.test',
            'company_id' => null,
        ]);
        $admin->assignRole('platform-admin');

        // Shop owner
        $owner = User::factory()->create([
            'name' => 'John Owner',
            'email' => 'owner@trimflow.test',
            'company_id' => $company->id,
        ]);
        $owner->assignRole('shop-admin');

        // Barber users + barber profiles
        $barberData = [
            ['name' => 'Mike Styles', 'email' => 'mike@trimflow.test', 'specialty' => 'Fades & Lineups'],
            ['name' => 'Sarah Cuts', 'email' => 'sarah@trimflow.test', 'specialty' => 'Coloring & Styling'],
            ['name' => 'Jake Blade', 'email' => 'jake@trimflow.test', 'specialty' => 'Beard Grooming'],
        ];

        $barbers = [];
        foreach ($barberData as $data) {
            $user = User::factory()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'company_id' => $company->id,
            ]);

            $user->assignRole('barber');

            $barbers[] = Barber::create([
                'company_id' => $company->id,
                'user_id' => $user->id,
                'specialty' => $data['specialty'],
                'bio' => fake()->sentence(10),
                'working_hours' => [
                    'monday'    => ['enabled' => true,  'start' => '09:00', 'end' => '17:00'],
                    'tuesday'   => ['enabled' => true,  'start' => '09:00', 'end' => '17:00'],
                    'wednesday' => ['enabled' => true,  'start' => '09:00', 'end' => '17:00'],
                    'thursday'  => ['enabled' => true,  'start' => '09:00', 'end' => '17:00'],
                    'friday'    => ['enabled' => true,  'start' => '09:00', 'end' => '17:00'],
                    'saturday'  => ['enabled' => true,  'start' => '10:00', 'end' => '15:00'],
                    'sunday'    => ['enabled' => false, 'start' => '09:00', 'end' => '17:00'],
                ],
                'is_active' => true,
            ]);
        }

        // Services
        $services = [];
        $serviceData = [
            ['name' => 'Classic Haircut', 'duration' => 30, 'price' => 3500, 'category' => 'haircut'],
            ['name' => 'Fade Haircut', 'duration' => 45, 'price' => 4500, 'category' => 'haircut'],
            ['name' => 'Beard Trim', 'duration' => 20, 'price' => 2000, 'category' => 'beard'],
            ['name' => 'Hot Towel Shave', 'duration' => 30, 'price' => 3000, 'category' => 'beard'],
            ['name' => 'Hair Coloring', 'duration' => 60, 'price' => 7500, 'category' => 'coloring'],
            ['name' => 'Kids Haircut', 'duration' => 20, 'price' => 2000, 'category' => 'haircut'],
            ['name' => 'Hair & Beard Combo', 'duration' => 50, 'price' => 5500, 'category' => 'combo'],
            ['name' => 'Styling & Blowout', 'duration' => 30, 'price' => 4000, 'category' => 'styling'],
        ];

        foreach ($serviceData as $data) {
            $services[] = Service::create([
                'company_id' => $company->id,
                ...$data,
            ]);
        }

        // Customers
        $customers = [];
        for ($i = 0; $i < 15; $i++) {
            $customers[] = Customer::create([
                'company_id' => $company->id,
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'favorite_barber_id' => $barbers[array_rand($barbers)]->id,
            ]);
        }

        // Appointments (past + upcoming)
        $statuses = ['completed', 'completed', 'completed', 'scheduled', 'confirmed'];

        for ($i = 0; $i < 30; $i++) {
            $barber = $barbers[array_rand($barbers)];
            $customer = $customers[array_rand($customers)];
            $service = $services[array_rand($services)];
            $status = $statuses[array_rand($statuses)];

            $startsAt = $status === 'completed'
                ? now()->subDays(rand(1, 60))->setHour(rand(9, 16))->setMinute(0)->setSecond(0)
                : now()->addDays(rand(1, 14))->setHour(rand(9, 16))->setMinute(0)->setSecond(0);

            $appointment = Appointment::create([
                'company_id' => $company->id,
                'barber_id' => $barber->id,
                'customer_id' => $customer->id,
                'service_id' => $service->id,
                'starts_at' => $startsAt,
                'ends_at' => $startsAt->copy()->addMinutes($service->duration),
                'status' => $status,
                'price' => $service->price,
            ]);

            // Payments for completed appointments
            if ($status === 'completed') {
                Payment::create([
                    'company_id' => $company->id,
                    'appointment_id' => $appointment->id,
                    'amount' => $appointment->price,
                    'status' => 'paid',
                    'method' => ['cash', 'card', 'stripe'][array_rand(['cash', 'card', 'stripe'])],
                ]);

                // Some reviews
                if (rand(0, 1)) {
                    Review::create([
                        'company_id' => $company->id,
                        'appointment_id' => $appointment->id,
                        'customer_id' => $customer->id,
                        'barber_id' => $barber->id,
                        'rating' => rand(3, 5),
                        'comment' => fake()->sentence(rand(5, 15)),
                    ]);
                }

                // Some barber notes
                if (rand(0, 1)) {
                    BarberNote::create([
                        'company_id' => $company->id,
                        'appointment_id' => $appointment->id,
                        'barber_id' => $barber->id,
                        'customer_id' => $customer->id,
                        'notes' => fake()->sentence(rand(5, 12)),
                    ]);
                }
            }
        }
    }
}
