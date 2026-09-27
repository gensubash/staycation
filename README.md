# Staycation

Staycation is an early, browser-ready concept for a New Hampshire vacation-rental marketplace: a place to discover local stays and, eventually, list and manage them.

## Preview locally

No packages or build step are required. From this folder, run:

```powershell
python -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173). Leave the server running while you browse; refresh the page to see file changes. Stop it with `Ctrl+C`.

You can also open `index.html` directly, though a local server is a more representative preview. The sample property photography is loaded from Unsplash, so images need an internet connection.

## What is in this prototype?

- A responsive New Hampshire discovery page with sample property cards.
- Category and destination filters, date/guest search, saved stays, and listing-detail dialogs.
- Guest and host demo profiles, a guest saved-stays dashboard, and a host dashboard with locally saved listing drafts.
- A demo booking journey with date/guest validation, a sample price breakdown, local reservation records, and a guest trips view.
- Clear preview messages for payments and maps, which are not connected to live services.

Listings, prices, reviews, and descriptions are illustrative demo content, not verified properties or bookable offers. The demo profile asks only for a display name and role; it does not ask for a password or email. Profiles, saved stays, listing drafts, and unpaid demo reservation records are stored in that browser's local storage. They are not real authenticated accounts, are not private from other people using the same browser, and are not shared between visitors or devices. Do not put sensitive information in a demo listing. Demo reservations do not block real availability, contact a host, confirm a real stay, or collect payment. The checkout preview deliberately does not ask for card details. Real secure payments require a trusted backend and a payment provider's hosted checkout or tokenized flow; never collect or store raw card details in this static site.

## Project plan

See [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) for the recommended marketplace MVP, product surfaces, technical approach, and launch considerations.

## Publish and share

Repository: [github.com/gensubash/staycation](https://github.com/gensubash/staycation)  
Hosted preview: [gensubash.github.io/staycation](https://gensubash.github.io/staycation/)

GitHub Pages is configured to publish the `main` branch from the repository root. To publish later changes with Git installed, run these commands from the project folder:

```powershell
git add .
git commit -m "Create Staycation prototype"
git push -u origin main
```

GitHub Pages republishes the static preview after each push to `main`. You can also edit files directly on GitHub; commits to `main` trigger a new deployment.

This is a public repository and static design preview. Live bookings and payments require a backend and the security/compliance work in the product plan.
