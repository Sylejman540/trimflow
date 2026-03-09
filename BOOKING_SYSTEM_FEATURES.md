Barber Booking System — Feature Specification

Overview

This document describes the booking features that must be implemented in the barber management system.

The goal is to make booking appointments extremely easy for customers while protecting the system from abuse, since booking links will be public on social media profiles.

The implementation must not modify the existing UI design. Only extend functionality.

The system must be optimized for mobile users coming from Instagram and other social platforms, where most customers will access the booking page.

⸻

1. Social Media Booking Link

When a barbershop account is created, the system must automatically generate a public booking link.

This link is intended to be placed in:
	•	Instagram BIO
	•	TikTok BIO
	•	Google Business profile
	•	WhatsApp profile

When customers click the link they should be sent directly to the barbershop’s booking page.

The booking page must allow customers to create an appointment without needing to create an account.

The booking flow should be extremely simple.

Customer steps:
	1.	Select barber
	2.	Select service
	3.	Select date
	4.	See available time slots
	5.	Enter name
	6.	Enter phone number
	7.	Confirm booking

Email should not be required.

The booking experience must be fast and mobile-friendly, since most users will come from Instagram.

⸻

2. Instant Booking Mode (Important for Instagram Users)

Customers arriving from social media should be able to book extremely quickly.

When the booking page loads, the system should immediately display:
	•	available barbers
	•	next available appointment times

The page should automatically:
	•	default to today’s date
	•	highlight the earliest available appointment
	•	minimize the number of steps required to book

Customers should ideally be able to book in less than 15 seconds.

Example experience:

Customer opens booking link →
sees available barbers →
selects time →
enters name and phone →
booking confirmed.

If the barbershop has multiple barbers, the system should show something like:

Alex — next available 14:30
Marco — next available 14:10
David — next available 15:00

This helps customers quickly pick the fastest option.

The goal is zero friction booking for mobile users.

⸻

3. Smart Time Slot Engine

Customers should only see available appointment times.

The system should automatically determine which time slots are available based on:
	•	barber working hours
	•	service duration
	•	existing appointments

Unavailable or booked times must never be shown to customers.

This prevents:
	•	double bookings
	•	scheduling conflicts
	•	customer frustration

The booking process should always present valid time options only.

⸻

4. Notifications for New Appointments

Whenever a new appointment is created, notifications must be sent to:
	•	the assigned barber
	•	the barbershop owner

The goal is to ensure that staff are immediately aware of new bookings.

Notifications may appear in the dashboard or be sent through external channels such as SMS or messaging services.

⸻

5. Appointment Reminder System

Customers should receive reminders before their appointment.

Recommended reminder timing:
	•	24 hours before appointment
	•	optionally 2 hours before appointment

Reminder messages should clearly include the appointment time and service.

This reduces no-shows, which are a major problem for barbershops.

⸻

6. Anti-Spam Protection

Since the booking link will be publicly available on social media, the system must protect against abuse.

Possible risks include:
	•	fake bookings
	•	bots submitting appointments
	•	competitors spamming bookings
	•	repeated fake reservations

The system must include protections such as:

Rate limiting

Limit how many bookings can be created from the same source in a short period of time.

Phone verification

Require phone verification before confirming a booking.

CAPTCHA protection

Use a CAPTCHA system to prevent automated bot bookings.

Duplicate booking protection

Prevent a single phone number from creating too many future appointments.

These safeguards ensure the calendar cannot easily be abused.

⸻

7. Phone Trust / Reputation System

The system should track the reliability of phone numbers that create appointments.

Over time, the system should record behaviors such as:
	•	appointments attended
	•	appointments cancelled
	•	missed appointments

If a phone number repeatedly creates bookings but does not attend them, the system should gradually restrict that number.

Possible restrictions include:
	•	requiring manual approval before booking
	•	temporarily blocking new bookings
	•	requiring additional verification

This prevents repeat offenders from abusing the system.

⸻

8. Smart Waitlist

If a day becomes fully booked, customers should be able to join a waitlist.

Instead of leaving the site when no slots are available, customers can request to be notified if a time becomes free.

Customers should be able to indicate:
	•	preferred barber
	•	service
	•	preferred time range

This allows the system to match them with newly available slots.

⸻

9. Instant Slot Fill (Cancellation Recovery)

When an appointment is cancelled, the system should immediately check the waitlist.

If a matching customer exists, the system should notify them that a slot has opened.

Customers receiving the notification can accept the slot and instantly convert the waitlist request into a real appointment.

This ensures that empty slots caused by cancellations are quickly filled.

This feature helps barbers avoid losing revenue from unused time.

⸻

10. Booking Source Tracking

Every appointment should record how the booking was created.

Possible sources include:
	•	social media booking link
	•	internal dashboard booking
	•	walk-in customer
	•	waitlist slot fill

Tracking the booking source allows barbershops to understand where their customers are coming from.

This information can later be used for analytics and business insights.

⸻

Implementation Guidelines

The implementation must follow these rules:
	•	Do not redesign or change existing UI components.
	•	Maintain compatibility with the current project architecture.
	•	Keep the booking flow simple and fast.
	•	Ensure the system is secure against abuse.
	•	Design the features to scale for many barbershops.

The final system should prioritize speed, simplicity, reliability, and security, especially since most bookings will originate from social media traffic on mobile devices.