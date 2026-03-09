<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

class MessageController extends Controller
{
    public function send(Request $request, Customer $customer)
    {
        $this->authorize('view', $customer);

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'body'    => 'required|string|max:5000',
        ]);

        if (! $customer->email) {
            return back()->withErrors(['email' => 'This customer has no email address on file.']);
        }

        Mail::raw($validated['body'], function (Message $msg) use ($customer, $validated) {
            $msg->to($customer->email, $customer->name)
                ->subject($validated['subject']);
        });

        return back()->with('success', 'Message sent to ' . $customer->name . '.');
    }
}
