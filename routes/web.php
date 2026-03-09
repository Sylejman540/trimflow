<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\BarberController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\WaitlistController;
use App\Http\Controllers\WalkinController;
use App\Http\Controllers\BarberTimeOffController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

Route::middleware(['auth', 'verified', 'company'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::resource('services', ServiceController::class)->except(['show']);
    Route::resource('barbers', BarberController::class)->except(['show']);
    Route::get('/barbers/{barber}/schedule', [BarberController::class, 'schedule'])->name('barbers.schedule');
    Route::put('/barbers/{barber}/schedule', [BarberController::class, 'updateSchedule'])->name('barbers.schedule.update');
    Route::resource('customers', CustomerController::class);
    Route::resource('appointments', AppointmentController::class);
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/export/appointments', [ExportController::class, 'appointments'])->name('export.appointments');
    Route::get('/export/customers', [ExportController::class, 'customers'])->name('export.customers');
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::get('/waitlist', [WaitlistController::class, 'index'])->name('waitlist.index');
    Route::get('/waitlist/create', [WaitlistController::class, 'create'])->name('waitlist.create');
    Route::post('/waitlist', [WaitlistController::class, 'store'])->name('waitlist.store');
    Route::patch('/waitlist/{waitlist}', [WaitlistController::class, 'update'])->name('waitlist.update');
    Route::delete('/waitlist/{waitlist}', [WaitlistController::class, 'destroy'])->name('waitlist.destroy');
    Route::post('/walkin', [WalkinController::class, 'store'])->name('walkin.store');
    Route::get('/barbers/time-off', [BarberTimeOffController::class, 'index'])->name('barbers.time-off.index');
    Route::post('/barbers/time-off', [BarberTimeOffController::class, 'store'])->name('barbers.time-off.store');
    Route::delete('/barbers/time-off/{timeOff}', [BarberTimeOffController::class, 'destroy'])->name('barbers.time-off.destroy');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::post('/customers/{customer}/message', [MessageController::class, 'send'])->name('customers.message');
    Route::post('/goals', [GoalController::class, 'update'])->name('goals.update');
});

Route::middleware('auth')->group(function () {
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public booking portal (no auth required)
Route::get('/book/{slug}', [BookingController::class, 'show'])->name('booking.show');
Route::post('/book/{slug}', [BookingController::class, 'store'])->name('booking.store');
Route::get('/book/{slug}/confirmed', [BookingController::class, 'confirmation'])->name('booking.confirmation');

require __DIR__.'/auth.php';
