<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification implements ShouldQueue
{
    use Queueable;

    /** @param Product[] $products */
    public function __construct(public readonly array $products) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $count = count($this->products);
        $names = implode(', ', array_map(fn($p) => $p->name, array_slice($this->products, 0, 3)));
        $suffix = $count > 3 ? " and " . ($count - 3) . " more" : '';

        return [
            'message' => "Low stock alert: {$names}{$suffix}.",
            'icon'    => 'alert',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Low Stock Alert')
            ->greeting("Hi {$notifiable->name},")
            ->line('The following products are running low on stock:');

        foreach ($this->products as $product) {
            $mail->line("- **{$product->name}**: {$product->stock_qty} remaining (threshold: {$product->low_stock_threshold})");
        }

        return $mail
            ->action('View Products', url('/products'))
            ->salutation('Freshio');
    }
}
