# Staycation — product plan

## Product direction

**Staycation** is a New Hampshire-first vacation-rental marketplace operated by Staycation LLC. Start with a carefully curated selection of the company's own homes. Add an application-based host program only after the guest journey, support operations, and economics are working reliably.

The opportunity is not to reproduce a national marketplace on day one. It is to make it easy to find distinctive local stays, set clear expectations, and get thoughtful help before, during, and after a trip.

## First release: a focused MVP

### Guest experience

1. Discover available stays by destination, travel dates, and guest count.
2. Compare accurate listings, photographs, amenities, rules, cancellation terms, total price, and availability.
3. Ask questions and request or confirm a reservation, with clear confirmation and trip details.
4. Pay securely, receive a receipt, and get timely messages and help.
5. Review a completed stay and revisit saved properties.

### Owner / host experience

1. Create an account and submit a property for review.
2. Add a description, address, photos, amenities, house rules, minimum stay, and pricing.
3. Set availability, manage conflicting dates, and view reservation requests.
4. Track reservations, payouts, and guest messages from a simple dashboard.
5. Receive platform support, tax documentation where applicable, and practical hosting guidance.

### Admin / operations experience

- Approve hosts and listings; verify ownership and completeness.
- Manage reservations, cancellation/refund exceptions, guest and host support, and disputes.
- Review reports and operational activity without exposing unnecessary personal data.
- Pause or remove unsafe or inaccurate listings.

## Recommended sequencing

**Phase 0 — validate (now):** Interview likely guests and local owners; list the initial Staycation-owned inventory; decide whether reservations are instant-book or request-to-book; define guest support hours, cancellation principles, and launch towns. Test the clickable prototype with both audiences.

**Phase 1 — direct-booking MVP:** Launch a small, manually managed catalogue of Staycation LLC properties. Build destination/date/guest search, accurate availability and total pricing, a guest reservation flow, secure payment, confirmations, and a basic internal operations view. Manually handle edge cases before automating them.

**Phase 2 — owner portal:** Invite a small number of vetted New Hampshire owners. Add listing drafts, admin approval, calendars, reservation management, host payouts, and a clear marketplace fee model. Keep a human review and support path.

**Phase 3 — measured expansion:** Improve search and map discovery, host tools, reviews, repeat booking, analytics, and operations based on real demand and support data. Expand geography only when service quality and local compliance are repeatable.

## Sensible default product decisions

- **Geography:** New Hampshire first; avoid implying statewide inventory until enough verified listings exist.
- **Inventory:** Start with company-managed homes, then onboard owners by invitation/application.
- **Trust:** Verify hosts and listing facts before publication; show transparent rules, fees, and cancellation terms before a guest pays.
- **Booking:** Choose request-to-book for the first third-party-host cohort if calendar freshness or owner readiness is uncertain; move to instant booking only for dependable availability.
- **Payments:** Use a marketplace-capable payment provider, such as Stripe Connect, after account, onboarding, payout, refund, and tax requirements are confirmed. Never collect or store raw card details in the Staycation app.
- **Initial operations:** Prefer clear manual review and support over complex automation. Define who handles emergencies and reservation changes before inviting guests to transact.

## Product surfaces

| Surface | First useful capability | Later capability |
|---|---|---|
| Guest web app | Search, listing detail, quote, checkout, confirmation, trip support | Saved searches, recommendations, reviews, repeat booking |
| Host portal | Onboarding, listing draft, availability, request management, payouts overview | Analytics, flexible pricing, team access, automated messages |
| Admin console | Listing review, reservation lookup, support actions, audit trail | Moderation queues, payout/refund operations, reporting |

## Suggested technical foundation

Treat this as a product direction, not a commitment to a stack. A maintainable first production version could use:

- A TypeScript web app with server-rendered public listing pages and a responsive guest/host interface.
- A relational database (for example PostgreSQL) for users, listings, availability, quotes, bookings, payment references, reviews, and audit events.
- Private object storage for property photographs with image resizing and moderation.
- A trusted authentication provider; role-aware authorization for guests, hosts, and admins.
- A marketplace payment provider for hosted checkout or tokenized payment, connected host accounts, refunds, and payouts.
- Transactional email (and, later, SMS) for reservation and support notifications.

Model availability and booking state explicitly. A reservation must be revalidated and held atomically before payment confirmation so that two guests cannot buy the same dates. Make payment webhooks idempotent and keep payment-provider identifiers, not card data. Protect host addresses and guest contact details; expose only what the booking requires.

## Core data concepts

- **User / role:** guest, host, admin; a person may be both guest and host.
- **Listing:** owner, publication status, location, capacity, content, amenities, house rules, and media.
- **Availability / rate:** dates, minimum nights, nightly price, fees, and blocked periods.
- **Quote:** date range, guest count, line-item price, currency, expiration, and policy version.
- **Booking:** listing, guests, dates, state, price snapshot, cancellation terms, and message/support history.
- **Payment / payout:** provider references, status, amount, currency, refund records, and reconciliation state.
- **Review / audit event:** completed-booking feedback and a timestamped record of important account, listing, booking, and admin changes.

## Success measures

For the invitation pilot, track:

- Search-to-listing and listing-to-booking conversion.
- Booking completion and payment failure rates.
- Search result coverage (searches with suitable, actually available listings).
- Cancellation, refund, and support-contact rate per booking.
- Host activation time, calendar accuracy, and payout accuracy.
- Guest and host satisfaction after completed stays.

Do not optimize booking volume in isolation; safety, accurate availability, total-price clarity, and dependable support are launch gates.

## New Hampshire and marketplace launch checklist

Before accepting live reservations, obtain qualified advice on the actual property mix, owner/agent arrangements, business operations, and town-by-town launch locations. Confirm applicable New Hampshire and local lodging, land-use, fire/life-safety, registration, and tax obligations; determine responsibility for collecting and remitting applicable lodging and sales taxes. Confirm insurance, property-owner permissions, accessibility and safety disclosures, privacy notices, booking terms, cancellations, refunds, customer support, and dispute processes. Marketplace payout, identity verification, tax reporting, and money-flow requirements should be reviewed with the payment provider and legal/tax professionals.

These are planning topics, not legal or tax advice. Requirements may depend on location and how the business operates; validate them before launch.

## Current prototype boundary

The repository starter is a static front-end concept with illustrative listings. It has no account system, live availability, real search service, backend, reservation, payment, payout, map, or verified property data. Do not present the current cards as bookable inventory.
