<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IgConversation extends Model
{
    protected $fillable = [
        'company_id',
        'sender_id',
        'messages',
        'state',
        'context',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'messages'        => 'array',
            'context'         => 'array',
            'last_message_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /** Append a message to the thread and save. */
    public function appendMessage(string $role, string $content): void
    {
        $messages   = $this->messages ?? [];
        $messages[] = ['role' => $role, 'content' => $content];
        $this->messages = $messages;
        $this->last_message_at = now();
        $this->save();
    }

    /** Merge values into context and save. */
    public function mergeContext(array $data): void
    {
        $this->context = array_merge($this->context ?? [], $data);
        $this->save();
    }

    /** Reset to idle state (after booking done or abandoned). */
    public function reset(): void
    {
        $this->state   = 'idle';
        $this->context = null;
        $this->messages = [];
        $this->save();
    }
}
