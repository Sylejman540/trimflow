
# 💈 Barber Management System – Master Build Prompt

## Project Overview
Build a **production-ready multi-tenant SaaS platform for barbershops** called:

**Barber Management System**

The platform must follow **Laravel MVC architecture** and provide a **clean, modern SaaS interface** similar to:
- Linear
- Notion
- Stripe Dashboard
- Monday.com

The UX must be **minimal, elegant, fast, and highly intuitive**.

---

# 🧱 Core Technology Stack

## Backend
- Laravel 11 (MVC Architecture)

## Database
- MySQL

## Frontend
- Inertia.js
- React

## UI Framework
- TailwindCSS
- shadcn/ui

## Tables
- TanStack Table
- AG Grid (for large datasets)

## Calendar
- FullCalendar (React)

## Search
- Laravel Scout
- Meilisearch

## Authentication
- Laravel Breeze (Inertia stack)

## Permissions
- Spatie Laravel Permission

## File Storage
- Laravel Storage (local / S3)

## Charts
- Recharts or Chart.js

## Notifications
- Laravel Notifications
- shadcn toast / popover UI

## Icons
- lucide-react

## Animations
- Framer Motion

---

# 🧠 AI Layer (Multi-Provider Support)

Supported providers:
- OpenAI
- Anthropic Claude
- Google Gemini
- HuggingFace

Create an **AI service layer**.

Example folder structure:

app/Services/AI/
- AIManager.php
- Providers/
  - OpenAIProvider.php
  - ClaudeProvider.php
  - GeminiProvider.php
  - HuggingFaceProvider.php

Switch provider via `.env`:

AI_PROVIDER=openai

---

# AI Capabilities

AI should provide:
- Appointment demand prediction
- Customer behavior insights
- Service recommendations
- Marketing message generation
- AI assistant for barbershop owners

All AI calls should run through **Laravel Queues**.

---

# AI Logging

Table: ai_logs

Columns:
- id
- user_id
- provider
- prompt
- response
- tokens_used
- latency
- created_at

Purpose:
- monitoring usage
- debugging
- cost tracking

---

# 👥 User Roles

## Platform Admin
Controls all barbershop companies.

## Shop Admin (Owner)
Manages barbers, services, appointments, clients.

## Barber
Manages:
- assigned appointments
- customer notes
- schedule

## Customer
Portal access with:
- My Appointments
- My Favorite Barber
- Booking History

---

# 🏢 Multi-Tenancy

Each **company = barbershop tenant**.

All data must be scoped by:

company_id

Ensure no cross-tenant data access.

---

# 💈 Core Entities

- Companies
- Users
- Barbers
- Customers
- Services
- Appointments
- Payments
- Reviews
- Notifications
- Audit Logs
- AI Logs

The **Appointment entity is the central hub**.

---

# 📂 Core Features

## Appointment Management
Appointments belong to:
- company
- barber
- customer
- service

Appointment page tabs:
- Overview
- Customer Info
- Service Details
- Notes
- Activity Log

---

## Appointment Scheduling
Use **FullCalendar**.

Features:
- drag & drop scheduling
- real-time availability
- appointment reminders
- barber schedule management
- service duration support

---

## Service Management

Table: services

Columns:
- id
- company_id
- name
- duration
- price
- description
- category

Features:
- haircut
- beard trim
- styling
- coloring
- custom services

---

# 💳 Payments

Integrate payment providers:

- Stripe
- PayPal

Store:
- payment status
- amount
- transaction id

Support:
- in-shop payments
- online booking payments

---

# 📝 Barber Notes

Table: barber_notes

Columns:
- id
- appointment_id
- barber_id
- notes
- created_at

Use cases:
- preferred haircut style
- customer preferences
- hair type notes

---

# ⭐ Reviews & Ratings

Customers can rate:

- barber
- service
- experience

Table: reviews

Columns:
- id
- appointment_id
- rating
- comment
- created_at

---

# 🔔 Notifications System

Trigger notifications for:

- new bookings
- appointment reminders
- cancellations
- payment confirmations
- customer reviews

UI:
- bell icon
- popover list
- toast alerts

---

# 📅 Barber Schedule Timeline

Events:
- appointment created
- appointment completed
- cancellation
- reschedule

---

# 📊 Analytics & Reports

Dashboards show:

- daily bookings
- most popular services
- barber performance
- revenue analytics

Use:
- Recharts
- shadcn cards

---

# 🔐 Security & Auditing

Table: audit_logs

Track:
- user actions
- CRUD operations
- IP address
- timestamps

Encrypt sensitive fields.

---

# 🔎 Global Search

Use:
- Laravel Scout
- Meilisearch

Search across:
- customers
- appointments
- services
- barbers

Include **Ctrl + K command palette**.

---

# 👤 Customer Portal

Customers see:

- Book Appointment
- My Appointments
- Favorite Barber
- Booking History

Design must be **mobile-first**.

---

# 🎨 UI / UX Standards

Colors

Primary: #111827
Accent: #F59E0B
Background: #F9FAFB
Text: #111827

Typography
- Inter
or
- Manrope

Spacing system
4px / 8px / 16px / 24px

Components
Use **shadcn/ui** components:
- cards
- modals
- drawers
- tabs
- dropdowns

Animations
Use **Framer Motion**.

---

# 📦 Code Generation Rules

When generating features include:

1. Migration
2. Model
3. Controller
4. Routes
5. Inertia React View
6. Policies / permissions
7. UX considerations
8. Optional seeders

---

# 🚀 Final Vision

A **next-generation SaaS platform for barbershops** including:

- Online appointment booking
- Barber schedule management
- Service catalog
- Payment processing
- Customer profiles
- Review & rating system
- AI business insights
- Analytics dashboards
- Secure multi-tenant architecture
- Premium modern UI

Built with:

**Laravel + React + shadcn/ui**
