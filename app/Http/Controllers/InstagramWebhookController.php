<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Meta Cloud API — Instagram DM AI Agent
 *
 * Setup steps (after you have a domain):
 * 1. Go to developers.facebook.com → Create App → Business type
 * 2. Add "Instagram" product to the app
 * 3. Connect your Instagram Business account
 * 4. Set webhook URL: https://yourdomain.com/webhooks/instagram
 *    Verify token: any string you choose (set as META_VERIFY_TOKEN in .env)
 * 5. Subscribe to "messages" webhook field
 * 6. Generate a permanent Page Access Token and save it in Settings
 * 7. Toggle "Instagram AI Agent" on in Settings
 */
class InstagramWebhookController extends Controller
{
    /**
     * GET — Meta webhook verification handshake
     */
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

    /**
     * POST — Receive incoming Instagram DMs from Meta
     */
    public function receive(Request $request)
    {
        $body = $request->all();

        // Meta sends a test ping — acknowledge immediately
        if (($body['object'] ?? '') !== 'instagram') {
            return response('ok', 200);
        }

        foreach ($body['entry'] ?? [] as $entry) {
            foreach ($entry['messaging'] ?? [] as $event) {
                $senderId = $event['sender']['id'] ?? null;
                $text     = $event['message']['text'] ?? null;

                if (!$senderId || !$text) {
                    continue;
                }

                // Find company by Instagram page ID (meta_page_id = recipient ID)
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
            $reply = $this->generateAiReply($company, $userMessage);
            $this->sendInstagramMessage($company, $senderId, $reply);
        } catch (\Throwable $e) {
            Log::error('Instagram AI agent error', ['error' => $e->getMessage(), 'company' => $company->id]);
        }
    }

    private function generateAiReply(Company $company, string $userMessage): string
    {
        $bookingUrl   = url('/book/' . $company->slug);
        $services     = $company->services()->where('is_active', true)->get(['name', 'price', 'duration']);
        $servicesList = $services->map(fn($s) => "- {$s->name} (" . ($s->duration) . " min, €" . number_format($s->price / 100, 2) . ")")->join("\n");

        $systemPrompt = <<<PROMPT
You are a friendly booking assistant for "{$company->name}", a barbershop.
Your job is to help customers book appointments and answer questions about the shop.

Shop info:
- Name: {$company->name}
- Booking link: {$bookingUrl}
- Phone: {$company->phone}
- Address: {$company->address}, {$company->city}

Services:
{$servicesList}

Rules:
- Always be friendly, brief, and professional
- When someone wants to book, give them the booking link: {$bookingUrl}
- Answer questions about services, prices, and availability
- Do not make up information not listed above
- Keep replies short (2-4 sentences max) — this is Instagram DM
- Write in the same language the customer used
PROMPT;

        $response = Http::withToken($company->openai_api_key)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'      => 'gpt-4o-mini',
                'max_tokens' => 200,
                'messages'   => [
                    ['role' => 'system',  'content' => $systemPrompt],
                    ['role' => 'user',    'content' => $userMessage],
                ],
            ]);

        if ($response->failed()) {
            Log::error('OpenAI API error', ['status' => $response->status(), 'body' => $response->body()]);
            return "Hi! To book an appointment, visit: {$bookingUrl}";
        }

        return $response->json('choices.0.message.content') ?? "Hi! To book an appointment, visit: {$bookingUrl}";
    }

    private function sendInstagramMessage(Company $company, string $recipientId, string $text): void
    {
        $response = Http::post("https://graph.facebook.com/v21.0/me/messages?access_token={$company->meta_access_token}", [
            'recipient' => ['id' => $recipientId],
            'message'   => ['text' => $text],
        ]);

        if ($response->failed()) {
            Log::error('Meta send message error', ['status' => $response->status(), 'body' => $response->body()]);
        }
    }
}
