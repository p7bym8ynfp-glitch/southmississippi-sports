# Render Launch Guide

Render is the easiest non-VPS path for this project because the app needs:

- a long-running Node server
- custom domain support
- automatic HTTPS
- a persistent disk for photos, previews, orders, and zip deliveries

This repository already includes a ready-to-use [`render.yaml`](/C:/Users/Bardw/Documents/Playground/southmississippi-sports/render.yaml).

## 1. Push the repo to GitHub

Render deploys from GitHub, so the project needs to be in a GitHub repo first.

## 2. Create the Render service

1. Sign in to Render.
2. Click `New`, then `Blueprint`.
3. Connect your GitHub repo.
4. Render should detect `render.yaml`.
5. Review the service settings and create the Blueprint.

The Blueprint creates:

- one Docker web service
- one persistent disk mounted at `/app/persist`

The app stores its persistent data at:

- `/app/persist/data`
- `/app/persist/storage`

## 3. Fill in the secret environment variables

In the Render dashboard, open the service and set values for:

- `ADMIN_PASSWORD`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

You can leave these as provided unless you want different values:

- `APP_URL=https://southmississippisports.com`
- `APP_DATA_DIR=/app/persist/data`
- `APP_STORAGE_DIR=/app/persist/storage`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `WATERMARK_LABEL=South Mississippi Sports`

## 4. Add the custom domain in Render

In the service settings:

1. Open `Custom Domains`
2. Add `southmississippisports.com`
3. Render will handle HTTPS automatically

## 5. Update GoDaddy DNS

Render's current guidance for other DNS providers is:

- for the apex domain, use the exact record Render shows in the custom domain screen
- if your provider does not support `ALIAS` or `ANAME`, Render documents an `A` record fallback of `216.24.57.1`
- for `www`, use the exact `CNAME` target Render shows for your service
- remove conflicting `AAAA` records during setup if Render tells you to

Important: add the custom domain in Render first, then copy the DNS values Render gives you into GoDaddy.

## 6. Configure Stripe webhook

In Stripe:

1. Go to `Developers` or `Workbench`, then `Webhooks`
2. Add endpoint:

```text
https://southmississippisports.com/api/webhooks/stripe
```

3. Subscribe to:

```text
checkout.session.completed
```

4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

## 7. Upload your watermark

The app looks for:

```text
/app/persist/storage/watermark.png
```

If no image is present, it falls back to the text watermark automatically.

## 8. Test the full flow

1. Visit `https://southmississippisports.com/admin/login`
2. Log in
3. Upload a small game folder
4. Buy a single photo using Stripe test mode
5. Confirm checkout, download, and buyer email all work
