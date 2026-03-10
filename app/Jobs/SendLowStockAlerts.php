<?php

namespace App\Jobs;

use App\Models\Company;
use App\Models\Product;
use App\Notifications\LowStockAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendLowStockAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Company $company) {}

    public function handle(): void
    {
        $lowStock = Product::where('company_id', $this->company->id)
            ->where('is_active', true)
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold')
            ->where('stock_qty', '>', 0)
            ->get();

        if ($lowStock->isEmpty()) {
            return;
        }

        // Notify all shop-admin users of this company
        $this->company->users()
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['shop-admin', 'platform-admin']))
            ->get()
            ->each(fn($user) => $user->notify(new LowStockAlert($lowStock->all())));
    }
}
