# Contact form delivery

The contact form posts to `/api/contact`. It sends a real email through the existing Resend account and only reports success after Resend accepts it with an email ID. It does not create a helpdesk ticket or send an automatic acknowledgement to the visitor.

Messages go to `CONTACT_TO_EMAIL`, or the configured `NEXT_PUBLIC_SUPPORT_EMAIL` when no override exists. All topic options use that same server-controlled inbox; the topic appears in the subject. Visitor input cannot choose the recipient. The visitor's email is set as Reply-To so the team can reply normally from its inbox.

The sender is `CONTACT_FROM_EMAIL`, or `support@<company domain>` with the `www.` prefix removed. The sender domain must be verified in Resend. These overrides are optional. `RESEND_API_KEY` must be configured in the deployment; a missing or mock key fails with an error rather than simulated success.

Protection includes server-side validation, a 16KB body limit, a hidden honeypot, same-origin checks, and durable counters in the existing `calculator_guard_counter` table (`npm run db:calculator-guard` if setting up a different database). Contact counters are separate from calculator counters. Defaults are 5 attempts per visitor IP per hour and 50 attempts per day globally, configurable with `CONTACT_MAX_PER_IP_PER_HOUR` and `CONTACT_MAX_PER_DAY`. Vercel's trusted forwarded IP is hashed. Outside Vercel, requests conservatively share a local visitor bucket.

The provider receives a stable idempotency key for retries of the same submission. Sending has a 15-second timeout. Failures keep the form content and offer the direct email link.

Validation:

```powershell
node --test tests/contact.test.cjs
```

A clearly labelled test email was sent through the actual local form endpoint to `support@signcollab.com`, reference `SC-4C7FA095`. The owner confirmed receipt. Automated unit and browser tests use mocked delivery and send no additional emails.
