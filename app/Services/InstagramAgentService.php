<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Barber;
use App\Models\Company;
use App\Models\Customer;
use App\Models\IgConversation;
use App\Models\Service;
use App\Notifications\NewPublicBooking;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InstagramAgentService
{
    // How many past messages to send to GPT (keep context window lean)
    private const MAX_HISTORY = 20;

    // Tools the AI can call
    private const TOOLS = [
        [
            'type' => 'function',
            'function' => [
                'name'        => 'get_available_slots',
                'description' => 'Get available booking time slots for a barber on a specific date. Returns a list of HH:MM times.',
                'parameters'  => [
                    'type'       => 'object',
                    'properties' => [
                        'barber_id' => ['type' => 'integer', 'description' => 'The barber ID'],
                        'date'      => ['type' => 'string',  'description' => 'Date in YYYY-MM-DD format'],
                        'service_ids' => [
                            'type'  => 'array',
                            'items' => ['type' => 'integer'],
                            'description' => 'List of service IDs the customer wants',
                        ],
                    ],
                    'required' => ['barber_id', 'date', 'service_ids'],
                ],
            ],
        ],
        [
            'type' => 'function',
            'function' => [
                'name'        => 'create_booking',
                'description' => 'Create an appointment. Call this only after collecting name, phone, barber, service, date, and time from the customer.',
                'parameters'  => [
                    'type'       => 'object',
                    'properties' => [
                        'customer_name'  => ['type' => 'string',  'description' => 'Customer full name'],
                        'customer_phone' => ['type' => 'string',  'description' => 'Customer phone number'],
                        'barber_id'      => ['type' => 'integer', 'description' => 'Barber ID'],
                        'service_ids'    => [
                            'type'  => 'array',
                            'items' => ['type' => 'integer'],
                            'description' => 'List of service IDs to book',
                        ],
                        'starts_at' => ['type' => 'string', 'description' => 'Start datetime in YYYY-MM-DD HH:MM format'],
                    ],
                    'required' => ['customer_name', 'customer_phone', 'barber_id', 'service_ids', 'starts_at'],
                ],
            ],
        ],
    ];

    public function __construct(private readonly Company $company) {}

    /**
     * Handle an incoming DM. Returns the reply string to send back to the customer.
     */
    public function handle(string $senderId, string $userMessage): string
    {
        // Load or create conversation thread
        $conv = IgConversation::firstOrCreate(
            ['company_id' => $this->company->id, 'sender_id' => $senderId],
            ['messages' => [], 'state' => 'idle'],
        );

        // Reset stale conversations (idle > 2 hours)
        if ($conv->last_message_at && $conv->last_message_at->diffInHours(now()) >= 2 && $conv->state !== 'idle') {
            $conv->reset();
        }

        // Add user message to thread
        $conv->appendMessage('user', $userMessage);

        // Build the system prompt with live shop data
        $systemPrompt = $this->buildSystemPrompt();

        // Trim to last N messages to keep cost down
        $history = array_slice($conv->messages, -self::MAX_HISTORY);

        $reply = $this->runAgentLoop($conv, $systemPrompt, $history);

        // Save assistant reply to thread
        $conv->appendMessage('assistant', $reply);

        return $reply;
    }

    /**
     * Run the GPT agent loop, executing tool calls until the model returns a plain text reply.
     */
    private function runAgentLoop(IgConversation $conv, string $systemPrompt, array $messages, int $depth = 0): string
    {
        // Max 5 tool-call iterations to prevent runaway loops
        if ($depth >= 5) {
            return "Sorry, I ran into an issue. Please try again or visit: " . url('/book/' . $this->company->slug);
        }

        $response = Http::withToken($this->company->openai_api_key)
            ->timeout(20)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'      => 'gpt-4o-mini',
                'max_tokens' => 300,
                'tools'      => self::TOOLS,
                'tool_choice' => 'auto',
                'messages'   => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $messages,
                ),
            ]);

        if ($response->failed()) {
            Log::error('OpenAI error in agent loop', ['status' => $response->status(), 'body' => $response->body()]);
            return "Hi! To book an appointment visit: " . url('/book/' . $this->company->slug);
        }

        $choice     = $response->json('choices.0');
        $finishReason = $choice['finish_reason'] ?? 'stop';
        $message    = $choice['message'] ?? [];

        // No tool calls — plain text reply
        if ($finishReason === 'stop' || empty($message['tool_calls'])) {
            return $message['content'] ?? "Thanks! Visit " . url('/book/' . $this->company->slug) . " to book.";
        }

        // Process each tool call GPT wants to make
        $toolCallMessages = [['role' => 'assistant', 'content' => null, 'tool_calls' => $message['tool_calls']]];

        foreach ($message['tool_calls'] as $toolCall) {
            $toolName = $toolCall['function']['name'];
            $args     = json_decode($toolCall['function']['arguments'], true) ?? [];
            $toolId   = $toolCall['id'];

            $result = match ($toolName) {
                'get_available_slots' => $this->toolGetSlots($args),
                'create_booking'      => $this->toolCreateBooking($conv, $args),
                default               => ['error' => 'Unknown tool'],
            };

            $toolCallMessages[] = [
                'role'         => 'tool',
                'tool_call_id' => $toolId,
                'content'      => json_encode($result),
            ];
        }

        // Recurse with tool results appended
        return $this->runAgentLoop(
            $conv,
            $systemPrompt,
            array_merge($messages, $toolCallMessages),
            $depth + 1,
        );
    }

    // ─── Tool implementations ──────────────────────────────────────────────────

    private function toolGetSlots(array $args): array
    {
        $barberId   = (int) ($args['barber_id'] ?? 0);
        $date       = $args['date'] ?? '';
        $serviceIds = $args['service_ids'] ?? [];

        if (!$barberId || !$date || empty($serviceIds)) {
            return ['error' => 'Missing required parameters'];
        }

        $barber = Barber::where('id', $barberId)
            ->where('company_id', $this->company->id)
            ->where('is_active', true)
            ->first();

        if (!$barber) {
            return ['error' => 'Barber not found'];
        }

        $totalDuration = (int) Service::whereIn('id', $serviceIds)
            ->where('company_id', $this->company->id)
            ->sum('duration');

        if ($totalDuration === 0) {
            return ['error' => 'Services not found'];
        }

        $parsedDate = Carbon::parse($date)->startOfDay();
        $dayKey     = strtolower($parsedDate->format('l'));
        $shortKey   = substr($dayKey, 0, 3);

        $hours    = $barber->working_hours ?? [];
        $dayHours = $hours[$dayKey] ?? $hours[$shortKey] ?? null;

        if (!$dayHours) {
            return ['slots' => [], 'message' => 'Barber does not work on ' . ucfirst($dayKey)];
        }

        if (isset($dayHours['enabled'])) {
            if (!$dayHours['enabled']) {
                return ['slots' => [], 'message' => 'Barber does not work on ' . ucfirst($dayKey)];
            }
            $windowStart = $dayHours['start'] ?? '09:00';
            $windowEnd   = $dayHours['end']   ?? '17:00';
        } else {
            [$windowStart, $windowEnd] = array_values($dayHours);
        }

        // Check time-off
        $onTimeOff = \DB::table('barber_time_offs')
            ->where('barber_id', $barber->id)
            ->where('starts_on', '<=', $date)
            ->where('ends_on',   '>=', $date)
            ->exists();

        if ($onTimeOff) {
            return ['slots' => [], 'message' => 'Barber is on time off that day'];
        }

        // Load booked slots
        $booked = Appointment::where('barber_id', $barber->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '>=', $parsedDate->copy()->startOfDay())
            ->where('starts_at', '<',  $parsedDate->copy()->endOfDay())
            ->get(['starts_at', 'ends_at']);

        // Generate slots
        $slots      = [];
        $now        = Carbon::now();
        $cursor     = $parsedDate->copy()->setTimeFromTimeString($windowStart);
        $windowEnd  = $parsedDate->copy()->setTimeFromTimeString($windowEnd);

        while ($cursor->copy()->addMinutes($totalDuration)->lte($windowEnd)) {
            $slotStart = $cursor->copy();
            $slotEnd   = $cursor->copy()->addMinutes($totalDuration);

            if ($slotStart->lte($now)) {
                $cursor->addMinutes($totalDuration);
                continue;
            }

            $conflict = false;
            foreach ($booked as $appt) {
                $as = Carbon::parse($appt->starts_at);
                $ae = Carbon::parse($appt->ends_at);
                if ($slotStart->lt($ae) && $slotEnd->gt($as)) {
                    $conflict = true;
                    break;
                }
            }

            if (!$conflict) {
                $slots[] = $slotStart->format('H:i');
            }

            $cursor->addMinutes($totalDuration);
        }

        return [
            'slots'    => array_slice($slots, 0, 12), // max 12 slots so GPT doesn't overflow
            'date'     => $date,
            'day_name' => ucfirst($dayKey),
        ];
    }

    private function toolCreateBooking(IgConversation $conv, array $args): array
    {
        $name       = trim($args['customer_name']   ?? '');
        $phone      = trim($args['customer_phone']  ?? '');
        $barberId   = (int) ($args['barber_id']     ?? 0);
        $serviceIds = $args['service_ids']           ?? [];
        $startsAt   = $args['starts_at']             ?? '';

        if (!$name || !$phone || !$barberId || empty($serviceIds) || !$startsAt) {
            return ['error' => 'Missing required booking fields'];
        }

        $barber = Barber::where('id', $barberId)
            ->where('company_id', $this->company->id)
            ->where('is_active', true)
            ->first();

        if (!$barber) {
            return ['error' => 'Barber not found'];
        }

        $services = Service::whereIn('id', $serviceIds)
            ->where('company_id', $this->company->id)
            ->where('is_active', true)
            ->get();

        if ($services->isEmpty()) {
            return ['error' => 'Services not found'];
        }

        $totalDuration = (int) $services->sum('duration');
        $totalPrice    = (int) $services->sum('price');

        try {
            $start  = Carbon::parse($startsAt);
            $end    = $start->copy()->addMinutes($totalDuration);
        } catch (\Throwable) {
            return ['error' => 'Invalid date/time format'];
        }

        // Double-booking check
        $conflict = Appointment::where('barber_id', $barber->id)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->where('starts_at', '<', $end)
            ->where('ends_at',   '>', $start)
            ->exists();

        if ($conflict) {
            return ['error' => 'That slot is no longer available. Please choose another time.'];
        }

        // Normalize phone
        $phone = preg_replace('/[^\d+]/', '', $phone);

        // Resolve or create customer
        $customer = Customer::firstOrCreate(
            ['phone' => $phone, 'company_id' => $this->company->id],
            ['name'  => $name],
        );
        if ($customer->name !== $name) {
            $customer->update(['name' => $name]);
        }

        // Create appointment
        $cancelToken = Str::random(48);
        $appointment = Appointment::create([
            'company_id'              => $this->company->id,
            'barber_id'               => $barber->id,
            'customer_id'             => $customer->id,
            'service_id'              => $services->first()->id,
            'starts_at'               => $start,
            'ends_at'                 => $end,
            'price'                   => $totalPrice,
            'status'                  => 'confirmed',
            'booking_source'          => 'instagram_dm',
            'notes'                   => 'Booked via Instagram DM',
            'cancel_token'            => $cancelToken,
            'cancel_token_expires_at' => now()->addDays(1),
        ]);

        // Attach services pivot
        $pivotData = $services->mapWithKeys(fn($s) => [
            $s->id => ['price' => $s->price, 'duration' => $s->duration]
        ])->all();
        $appointment->services()->attach($pivotData);
        $appointment->load(['barber.user', 'customer', 'service', 'services']);

        // Notify barber + admins
        if ($barber->user) {
            $barber->user->notify(new NewPublicBooking($appointment));
        }
        $barberUserId = $barber->user?->id;
        User::where('company_id', $this->company->id)
            ->whereHas('roles', fn($q) => $q->whereIn('name', ['shop-admin', 'platform-admin']))
            ->when($barberUserId, fn($q) => $q->where('id', '!=', $barberUserId))
            ->each(fn(User $u) => $u->notify(new NewPublicBooking($appointment)));

        $customer->increment('booking_total');

        // Mark conversation done
        $conv->state = 'done';
        $conv->save();

        return [
            'success'      => true,
            'appointment_id' => $appointment->id,
            'barber_name'  => $barber->user?->name,
            'services'     => $services->pluck('name')->join(', '),
            'starts_at'    => $start->format('l, F j \a\t g:i A'),
            'customer_name' => $customer->name,
            'cancel_url'   => url('/book/' . $this->company->slug . '/cancel') . '?token=' . $cancelToken,
        ];
    }

    // ─── System prompt ─────────────────────────────────────────────────────────

    private function buildSystemPrompt(): string
    {
        $bookingUrl = url('/book/' . $this->company->slug);
        $today      = now()->format('l, F j Y'); // e.g. Thursday, March 12 2026

        // Services list
        $services = $this->company->services()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'price', 'duration', 'description']);

        $servicesList = $services->map(fn($s) =>
            "  ID {$s->id}: {$s->name} — " . number_format($s->price / 100, 2) . " EUR, {$s->duration} min" .
            ($s->description ? " ({$s->description})" : '')
        )->join("\n");

        // Barbers list
        $barbers = $this->company->barbers()
            ->where('is_active', true)
            ->with('user')
            ->get();

        $barbersList = $barbers->map(fn($b) =>
            "  ID {$b->id}: " . ($b->user?->name ?? 'Unknown') .
            ($b->specialty ? " — {$b->specialty}" : '')
        )->join("\n");

        return <<<PROMPT
You are a smart booking assistant for "{$this->company->name}", a barbershop. Today is {$today}.

Your goal is to collect all required information to book an appointment, then call create_booking.

Shop info:
- Name: {$this->company->name}
- Address: {$this->company->address}, {$this->company->city}
- Phone: {$this->company->phone}
- Online booking: {$bookingUrl}

Available services:
{$servicesList}

Available barbers:
{$barbersList}

Booking flow — collect these in order (but be flexible, customers may volunteer info early):
1. Which service(s) they want
2. Which barber (or "any" — pick the first available)
3. What date they prefer
4. Call get_available_slots to get open times, then ask them to pick one
5. Their full name
6. Their phone number
7. Confirm details, then call create_booking

Rules:
- Be friendly, concise — this is Instagram DM (max 3-4 sentences per reply)
- When slots are returned, list up to 6 nicely formatted times, e.g. "10:00 AM, 11:30 AM, 2:00 PM"
- If a slot is taken, apologise and offer alternatives
- After create_booking succeeds, confirm with: name, service, barber, date/time. Tell them they can reply CANCEL to cancel.
- If they say CANCEL, tell them to visit the booking portal to manage their appointment
- If someone just asks questions (prices, hours, location), answer from the shop info — no need to start booking flow
- Always write in the same language the customer uses
- Never make up information not listed above
PROMPT;
    }
}
