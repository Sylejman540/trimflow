<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px; color: #111827;">Verify Your Email</h1>
    </div>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hello {{ $user->name }},
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Thank you for signing up! To complete your registration and verify your email address, please use the verification code below:
    </p>

    <div style="background: #f3f4f6; border: 2px solid #2563eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
        <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your verification code</p>
        <p style="margin: 0; font-size: 48px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">{{ $code }}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">This code will expire in 10 minutes</p>
    </div>

    <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px; color: #6b7280;">
        If you didn't create an account, you can ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        © {{ date('Y') }} Fade. All rights reserved.
    </p>
</div>
