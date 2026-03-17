<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserLanguageController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'language' => ['required', 'string', Rule::in(['en', 'sq', 'de'])],
        ]);

        $request->user()->update([
            'language' => $validated['language'],
        ]);

        return response()->json(['success' => true]);
    }
}
