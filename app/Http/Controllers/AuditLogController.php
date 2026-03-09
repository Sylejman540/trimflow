<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user')
            ->where('company_id', Auth::user()->company_id)
            ->latest();

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('model')) {
            $query->where('auditable_type', 'like', '%' . $request->model . '%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(50)->withQueryString();

        // Map auditable_type to a short model name for display
        $logs->getCollection()->transform(function (AuditLog $log) {
            $log->model_name = class_basename($log->auditable_type);
            return $log;
        });

        return Inertia::render('audit-logs/Index', [
            'logs'    => $logs,
            'filters' => $request->only(['action', 'model', 'user_id']),
        ]);
    }
}
