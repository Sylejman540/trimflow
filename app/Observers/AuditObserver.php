<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditObserver
{
    public function created(Model $model): void
    {
        $this->log($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $dirty = $model->getDirty();
        if (empty($dirty)) return;

        $old = array_intersect_key($model->getOriginal(), $dirty);
        $this->log($model, 'updated', $old, $dirty);
    }

    public function deleted(Model $model): void
    {
        $this->log($model, 'deleted', $model->getOriginal(), null);
    }

    private function log(Model $model, string $action, ?array $old, ?array $new): void
    {
        if (! Auth::check()) return;

        $user = Auth::user();

        AuditLog::create([
            'company_id'     => $user->company_id,
            'user_id'        => $user->id,
            'action'         => $action,
            'auditable_type' => get_class($model),
            'auditable_id'   => $model->getKey(),
            'old_values'     => $old,
            'new_values'     => $new,
            'ip_address'     => Request::ip(),
            'user_agent'     => Request::userAgent(),
        ]);
    }
}
