<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

/**
 * ManyChat HTTP Request integration.
 *
 * In ManyChat, add an "HTTP Request" action block and point it to:
 *   POST https://yourdomain.com/webhooks/manychat/{slug}
 *   Header: X-Webhook-Secret: <your MANYCHAT_WEBHOOK_SECRET from .env>
 *
 * The response JSON can be used in a ManyChat "Dynamic" message:
 *   {{booking_url}}  — the full booking link
 *   {{message1}}     — ready-to-send template 1
 *   {{message2}}     — ready-to-send template 2
 */
class ManyChatWebhookController extends Controller
{
    public function __invoke(Request $request, string $slug)
    {
        // ── Secret token check ─────────────────────────────────────────────────
        $secret = config('services.manychat.webhook_secret');
        if ($secret && $request->header('X-Webhook-Secret') !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $company = Company::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $bookingUrl = url('/book/' . $company->slug);

        return response()->json([
            'booking_url' => $bookingUrl,
            'shop_name'   => $company->name,
            'message1'    => "Book your appointment here 👇\n{$bookingUrl}",
            'message2'    => "Choose your time here 👇\n{$bookingUrl}",
        ]);
    }
}
