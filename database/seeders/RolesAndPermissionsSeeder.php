<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions grouped by resource
        $permissions = [
            // Companies
            'companies.view', 'companies.create', 'companies.update', 'companies.delete',

            // Users
            'users.view', 'users.create', 'users.update', 'users.delete',

            // Barbers
            'barbers.view', 'barbers.create', 'barbers.update', 'barbers.delete',

            // Customers
            'customers.view', 'customers.create', 'customers.update', 'customers.delete',

            // Services
            'services.view', 'services.create', 'services.update', 'services.delete',

            // Appointments
            'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',

            // Payments
            'payments.view', 'payments.create', 'payments.update',

            // Reviews
            'reviews.view', 'reviews.create', 'reviews.delete',

            // Reports / Analytics
            'reports.view',

            // AI
            'ai.use',

            // Audit logs
            'audit-logs.view',

            // Settings
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Platform Admin — god mode across all tenants
        Role::findOrCreate('platform-admin')
            ->givePermissionTo(Permission::all());

        // Shop Admin (Owner) — full control within their company
        Role::findOrCreate('shop-admin')
            ->givePermissionTo([
                'users.view', 'users.create', 'users.update', 'users.delete',
                'barbers.view', 'barbers.create', 'barbers.update', 'barbers.delete',
                'customers.view', 'customers.create', 'customers.update', 'customers.delete',
                'services.view', 'services.create', 'services.update', 'services.delete',
                'appointments.view', 'appointments.create', 'appointments.update', 'appointments.delete',
                'payments.view', 'payments.create', 'payments.update',
                'reviews.view', 'reviews.delete',
                'reports.view',
                'ai.use',
                'audit-logs.view',
                'settings.manage',
            ]);

        // Barber — manage own appointments, customers, notes
        Role::findOrCreate('barber')
            ->givePermissionTo([
                'appointments.view', 'appointments.update',
                'customers.view',
                'reviews.view',
                'services.view',
            ]);

        // Customer — book appointments, leave reviews
        Role::findOrCreate('customer')
            ->givePermissionTo([
                'appointments.view', 'appointments.create',
                'services.view',
                'barbers.view',
                'reviews.view', 'reviews.create',
            ]);
    }
}
