# South Mississippi Sports

A PWA-style ecommerce app for selling sports photography by game folder.

## What it does

- Protected admin upload area for organizing photos by game folder.
- Automatic watermarked previews for the public storefront.
- Single-photo checkout for $20 and full-game-folder checkout for $15.
- Stripe webhook fulfillment that unlocks originals immediately after payment.
- Email delivery flow using SMTP, with secure download links and attachments when the files are small enough.
- PWA manifest and service worker so the site behaves nicely on phones.

## Local setup

1. From `C:\Users\Bardw\Documents\Playground\southmississippi-sports`, copy `.env.example` to `.env.local`.
2. Set `APP_URL` and `ADMIN_PASSWORD`.
3. Add your Stripe keys and webhook secret.
4. Add your SMTP settings so customers get the email delivery automatically.
5. Optional: place your logo watermark at `storage/watermark.png`. If you skip that, the app uses a text watermark fallback.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

## Stripe webhook

Use Stripe CLI or your deployment host to send the webhook to:

`/api/webhooks/stripe`

The app fulfills `checkout.session.completed` events.

## Storage model

This version uses the local filesystem for simplicity:

- `storage/originals` for original uploads
- `storage/previews` for watermarked previews
- `storage/deliveries` for generated zip downloads
- `data/store.json` for game, photo, and order metadata

That makes local development easy. For production, this works best on a platform with persistent disk or attached volume.

## Deployment notes

The easiest production path for this version is Render with a persistent disk.

If you want a serverless host later, the next upgrade would be moving media storage from local disk to S3, Supabase Storage, or Cloudinary.

## Production deployment

Production-ready hosting files are included now:

- `Dockerfile`
- `compose.yaml`
- `render.yaml`
- `deploy/Caddyfile`
- `deploy/.env.production.example`
- `deploy/bootstrap-ubuntu.sh`
- `deploy/deploy.sh`
- `deploy/backup.sh`
- `deploy/DEPLOYMENT.md`
- `deploy/RENDER.md`

The easiest non-VPS path is documented in `deploy/RENDER.md`.

The VPS path is still documented in `deploy/DEPLOYMENT.md`.

