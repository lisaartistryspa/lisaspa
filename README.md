# NextEdge Spa - Booking System (Vanilla JS + Firebase + Paystack)

This repository contains a ready-to-use blueprint for a spa booking system using:
- Vanilla JavaScript frontend
- Firebase Firestore for bookings
- Firebase Cloud Functions (Express) for Paystack verification & webhook
- Paystack as the payment gateway

## What's included
- `index.html` — Customer-facing booking page (vanilla JS).
- `admin.html` — Minimal admin UI to list bookings and filter by status.
- `functions/index.js` — Cloud Functions (Express) with `/verify` and `/webhook` endpoints.
- `firestore.rules` — Example Firestore security rules.
- `package.json` — Dependencies for Cloud Functions.
- `README.md` — This file.

## Quick setup
1. Create a Firebase project, enable Firestore and Functions.
2. Replace Firebase config placeholders in `index.html` and `admin.html`.
3. Replace `REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY` in `index.html`.
4. Deploy functions:
   - `cd functions`
   - `npm install`
   - `firebase functions:config:set paystack.secret="sk_test_xxx" paystack.webhooksecret="your_webhook_secret"`
   - `firebase deploy --only functions`
5. Configure Paystack:
   - Use test keys while developing.
   - Set the webhook URL to `https://<your-region>-<project>.cloudfunctions.net/api/webhook` in your Paystack dashboard.
6. Secure your project:
   - Set Firestore rules in the Firebase console using `firestore.rules`.
   - Consider restricting admin access and using Cloud Identity or custom claims.

## Notes
- The client-side `verify` call is optional and only for improved UX. The webhook is the authoritative source of truth.
- Paystack amounts are in kobo (₦1 = 100 kobo). Ensure amounts are multiplied accordingly on the frontend.
- Do not commit secret keys to source control.

## Next steps (optional)
- Add email/SMS notifications on booking paid.
- Create an authenticated admin panel with update/delete actions.
- Add booking slot locking to prevent double-booking.

