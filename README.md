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
- Category filters, destination search, saved-stay buttons, and listing-detail dialogs.
- An introductory host flow to show how guest and host experiences could coexist.
- Explicit preview messages for booking, accounts, and maps, which are not implemented or connected to payment processing.

Listings, prices, reviews, and descriptions are illustrative demo content, not verified properties or bookable offers. This front end does not collect personal information, create accounts, accept reservations, or process payments.

## Project plan

See [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) for the recommended marketplace MVP, product surfaces, technical approach, and launch considerations.

## Publish and share

This workspace is not currently connected to a GitHub repository. To publish it, install Git, create an empty `staycation` repository in your signed-in GitHub account, then run these commands from this folder (replace `<your-account>`):

```powershell
git init
git add .
git commit -m "Create Staycation prototype"
git branch -M main
git remote add origin https://github.com/<your-account>/staycation.git
git push -u origin main
```

For a hosted, shareable preview, open the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. After the Pages deployment finishes, GitHub will show the public site URL in that section. Every subsequent push to `main` republishes the static preview.

Choose a public repository if you want to use free GitHub Pages; private-repository Pages availability depends on your GitHub plan. This publishes only a static design preview. Live bookings and payments require a backend and the security/compliance work in the product plan.
