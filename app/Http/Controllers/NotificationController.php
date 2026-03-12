<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $user->unreadNotifications->markAsRead();

        $notifications = $user->notifications()
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'data'       => $n->data,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at->diffForHumans(),
            ]);

        return Inertia::render('notifications/Index', [
            'notifications' => $notifications,
            'unread_count'  => 0,
        ]);
    }

    public function markRead(Request $request)
    {
        $id = $request->input('id');

        if ($id) {
            Auth::user()->notifications()->where('id', $id)->update(['read_at' => now()]);
        } else {
            Auth::user()->unreadNotifications->markAsRead();
        }

        return back();
    }
}
