<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BarberController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BookingCancelController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingSlotsController;
use App\Http\Controllers\BookingAvailabilityController;
use App\Http\Controllers\WalkinController;
use App\Http\Controllers\BarberTimeOffController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AppointmentProductController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\ManyChatWebhookController;
use App\Http\Controllers\InstagramWebhookController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $ads = \App\Models\Ad::where('is_active', true)
        ->with('company:id,name,slug')
        ->latest()
        ->get(['id', 'company_id', 'headline', 'sub', 'emoji']);

    return Inertia::render('Welcome', [
        'canLogin'    => Route::has('login'),
        'canRegister' => Route::has('register'),
        'ads'         => $ads,
    ]);
});

Route::get('/company', function () {
    return Inertia::render('Company');
})->name('company.page');

Route::middleware(['auth', 'verified', 'company'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('services', ServiceController::class)->except(['show']);
    Route::resource('barbers', BarberController::class)->except(['show']);
    Route::get('/barbers/{barber}/schedule', [BarberController::class, 'schedule'])->name('barbers.schedule');
    Route::put('/barbers/{barber}/schedule', [BarberController::class, 'updateSchedule'])->name('barbers.schedule.update');
    Route::resource('appointments', AppointmentController::class);
    Route::patch('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::post('appointments/bulk', [AppointmentController::class, 'bulkAction'])->name('appointments.bulk');
    Route::middleware('role:shop-admin|platform-admin')->group(function () {
        Route::get('/export/appointments', [ExportController::class, 'appointments'])->name('export.appointments');
    });
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/walkin', [WalkinController::class, 'store'])->name('walkin.store');
    Route::get('/barbers/time-off', [BarberTimeOffController::class, 'index'])->name('barbers.time-off.index');
    Route::post('/barbers/time-off', [BarberTimeOffController::class, 'store'])->name('barbers.time-off.store');
    Route::delete('/barbers/time-off/{timeOff}', [BarberTimeOffController::class, 'destroy'])->name('barbers.time-off.destroy');
    Route::post('/barbers/{barber}/toggle-availability', [BarberTimeOffController::class, 'toggle'])->name('barbers.toggle-availability');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::patch('/schedule/{appointment}/reschedule', [ScheduleController::class, 'reschedule'])->name('schedule.reschedule');
    Route::post('/goals', [GoalController::class, 'update'])->name('goals.update');


    Route::resource('products', ProductController::class)->except(['show']);
    Route::post('/appointments/{appointment}/products', [AppointmentProductController::class, 'store'])->name('appointment-products.store');
    Route::delete('/appointments/{appointment}/products/{product}', [AppointmentProductController::class, 'destroy'])->name('appointment-products.destroy');

    Route::get('/search', SearchController::class)->name('search');

    Route::middleware('role:shop-admin|platform-admin')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::patch('/settings/company', [SettingsController::class, 'updateCompany'])->name('settings.company');
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/ads', [AdController::class, 'index'])->name('ads.index');
        Route::post('/ads', [AdController::class, 'store'])->name('ads.store');
        Route::patch('/ads/{ad}', [AdController::class, 'update'])->name('ads.update');
        Route::delete('/ads/{ad}', [AdController::class, 'destroy'])->name('ads.destroy');
    });
});

// Platform super-admin panel
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', AdminDashboardController::class)->name('dashboard');
    Route::patch('/companies/{company}/toggle', [AdminDashboardController::class, 'toggleCompany'])->name('companies.toggle');
});

Route::middleware('auth')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Customer portal (no auth required)
Route::get('/book/{slug}/my-appointments', [CustomerPortalController::class, 'show'])->name('portal.show');
Route::post('/book/{slug}/my-appointments', [CustomerPortalController::class, 'lookup'])->name('portal.lookup');
Route::post('/book/{slug}/my-appointments/cancel', [CustomerPortalController::class, 'cancel'])->name('portal.cancel');

// Public booking portal (no auth required)
Route::get('/book/{slug}', [BookingController::class, 'show'])->name('booking.show');
Route::post('/book/{slug}', [BookingController::class, 'store'])->name('booking.store');
Route::get('/book/{slug}/confirmed', [BookingController::class, 'confirmation'])->name('booking.confirmation');
Route::get('/book/{slug}/slots', BookingSlotsController::class)->name('booking.slots');
Route::get('/book/{slug}/availability', BookingAvailabilityController::class)->name('booking.availability');
Route::post('/book/{slug}/cancel', BookingCancelController::class)->name('booking.cancel');

// ManyChat webhook — returns booking URL for use in ManyChat HTTP Request blocks
Route::post('/webhooks/manychat/{slug}', ManyChatWebhookController::class)->name('webhooks.manychat');

// Meta Cloud API — Instagram DM AI Agent
Route::get('/webhooks/instagram', [InstagramWebhookController::class, 'verify'])->name('webhooks.instagram.verify');
Route::post('/webhooks/instagram', [InstagramWebhookController::class, 'receive'])->name('webhooks.instagram.receive');

require __DIR__.'/auth.php';
