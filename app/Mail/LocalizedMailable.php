<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;

abstract class LocalizedMailable extends Mailable
{
    protected string $language = 'en';

    public function __construct(protected $user)
    {
        $this->language = $user?->language ?? 'en';
    }

    protected function setLanguage(): void
    {
        app()->setLocale($this->language);
    }

    public function build()
    {
        $this->setLanguage();
        return parent::build();
    }
}
