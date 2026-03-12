<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Services\InstagramAgentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Meta Cloud API — Instagram DM AI Booking Agent
 *
 * Setup steps:
 * 1. developers.facebook.com → Create App → Business type
 * 2. Add "Instagram" product → Connect your Instagram Business account
 * 3. Set webhook URL: https://yourdomain.com/webhooks/instagram
 *    Verify token: any string (set as META_VERIFY_TOKEN in .env)
 * 4. Subscribe to "messages" webhook field
 * 5. Generate a permanent Page Access Token → save in Settings
 * 6. Toggle "Instagram AI Agent" on in Settings
 */
class InstagramWebhookController extends Controller
{
    /** GET — Meta webhook verification handshake */
    public function verify(Request $request)
    {
        $verifyToken = config('services.meta.verify_token');

        if (
            $request->query('hub_mode') === 'subscribe' &&
            $request->query('hub_verify_token') === $verifyToken
        ) {
            return response($request->query('hub_challenge'), 200);
        }

        return response('Forbidden', 403);
    }

    /** POST — Receive incoming Instagram DMs from Meta */
    public function receive(Request $request)
    {
        $body = $request->all();

        if (($body['object'] ?? '') !== 'instagram') {
            return response('ok', 200);
        }

        foreach ($body['entry'] ?? [] as $entry) {
            foreach ($entry['messaging'] ?? [] as $event) {
                // Skip delivery receipts, read receipts, echo
                if (isset($event['delivery']) || isset($event['read']) || ($event['message']['is_echo'] ?? false)) {
                    continue;
                }

                $senderId = $event['sender']['id']    ?? null;
                $text     = $event['message']['text'] ?? null;

                if (!$senderId || !$text) {
                    continue;
                }

                $recipientId = $event['recipient']['id'] ?? null;
                $company = Company::where('meta_page_id', $recipientId)
                    ->where('instagram_agent_enabled', true)
                    ->where('is_active', true)
                    ->first();

                if (!$company || !$company->meta_access_token || !$company->openai_api_key) {
                    continue;
                }

                $this->handleMessage($company, $senderId, $text);
            }
        }

        return response('EVENT_RECEIVED', 200);
    }

    private function handleMessage(Company $company, string $senderId, string $userMessage): void
    {
        try {
            $agent = new InstagramAgentService($company);
            $reply = $agent->handle($senderId, $userMessage);
            $this->sendInstagramMessage($company, $senderId, $reply);
        } catch (\Throwable $e) {
            Log::error('Instagram AI agent error', [
                'company' => $company->id,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            // Graceful fallback
            $this->sendInstagramMessage(
                $company,
                $senderId,
                "Hi! Something went wrong on our end. To book an appointment visit: " . url('/book/' . $company->slug),
            );
        }
    }

    private function sendInstagramMessage(Company $company, string $recipientId, string $text): void
    {
        // Instagram DMs have a 1000 char limit — truncate gracefully
        if (mb_strlen($text) > 1000) {
            $text = mb_substr($text, 0, 997) . '...';
        }

        $response = Http::post(
            "https://graph.facebook.com/v21.0/me/messages?access_token={$company->meta_access_token}",
            [
                'recipient' => ['id' => $recipientId],
                'message'   => ['text' => $text],
            ],
        );

        if ($response->failed()) {
            Log::error('Meta send message error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
        }
    }
}
