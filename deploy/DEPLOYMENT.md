# Production Launch Guide

This project is ready to ship on a VPS or cloud VM with persistent storage.

## Included deployment files

- `Dockerfile` builds the Next.js app as a standalone Node server.
- `compose.yaml` runs the app and Caddy together.
- `deploy/Caddyfile` serves `southmississippisports.com` and `www.southmississippisports.com` with automatic HTTPS.
- `deploy/.env.production.example` is the production env template.
- `deploy/bootstrap-ubuntu.sh` installs Docker, Compose, git, and opens ports `80` and `443`.
- `deploy/deploy.sh` builds and launches the stack.
- `deploy/backup.sh` creates a timestamped backup of `data/` and `storage/`.

## Recommended hosting shape

- Ubuntu VPS or cloud VM
- 2 GB RAM minimum
- One public IPv4 address
- Ports `80` and `443` open
- Docker Engine and Docker Compose plugin installed

## 1. Copy the project to your server

On a fresh Ubuntu server you can first run:

```bash
sudo bash deploy/bootstrap-ubuntu.sh
```

Then, from the server:

```bash
git clone <your-repo-url>
cd southmississippi-sports
cp deploy/.env.production.example deploy/.env.production
mkdir -p data storage
```

If you already have a custom watermark PNG, place it at:

```bash
storage/watermark.png
```

## 2. Fill in production environment values

Edit `deploy/.env.production` and set:

- `APP_URL=https://southmississippisports.com`
- `ADMIN_PASSWORD`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 3. Start the stack

```bash
bash deploy/deploy.sh
```

Useful follow-up commands:

```bash
docker compose logs -f
docker compose ps
docker compose restart app
```

## 4. Point GoDaddy DNS to the server

If GoDaddy is your active DNS host, update these records:

- `A` record for `@` -> your VPS public IPv4 address
- `CNAME` record for `www` -> `@`

If your domain is using non-GoDaddy nameservers, make the same record changes at the provider that actually hosts DNS.

After DNS points correctly, Caddy will request and renew HTTPS certificates automatically.

## 5. Add the Stripe webhook

In Stripe Dashboard:

1. Open `Workbench` or `Developers`, then `Webhooks`.
2. Add a new endpoint:

```text
https://southmississippisports.com/api/webhooks/stripe
```

3. Subscribe to:

```text
checkout.session.completed
```

4. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.

## 6. Set up SMTP

Use any SMTP provider you trust. Once the env values are filled in, the app will email delivery links immediately after a paid Stripe checkout.

## 7. Verify the live site

Check these paths:

- `https://southmississippisports.com/`
- `https://southmississippisports.com/admin/login`
- `https://southmississippisports.com/api/health`

Then test the full workflow:

1. Log into admin
2. Upload a small game folder
3. Buy one photo in Stripe test mode
4. Confirm the `thank-you` page shows download links
5. Confirm the buyer email arrives

## 8. Ongoing maintenance

- Back up `data/` and `storage/` with `bash deploy/backup.sh`
- Keep your Stripe and SMTP secrets out of git
- Rebuild after code changes with `docker compose up -d --build`

