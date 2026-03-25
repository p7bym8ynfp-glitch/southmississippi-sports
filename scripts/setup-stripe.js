/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

async function setup() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY in .env.local");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const webhookUrl = 'https://southmississippisports.com/api/webhooks/stripe';
  
  console.log(`Checking for existing webhooks for ${webhookUrl}...`);
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const existing = endpoints.data.find(ep => ep.url === webhookUrl);

  if (existing) {
    console.log(`Webhook endpoint already exists: ${existing.id}`);
    console.log(`Status: ${existing.status}`);
    
    // We cannot retrieve the secret of an existing webhook endpoint through the API for security reasons.
    console.log(`You already have a webhook setup in Stripe. Ensure its secret matches STRIPE_WEBHOOK_SECRET in .env.local. If it doesn't, please delete it from the Stripe Dashboard and run this script again.`);
    return;
  }

  console.log('Creating new webhook endpoint...');
  const endpoint = await stripe.webhookEndpoints.create({
    url: webhookUrl,
    enabled_events: ['checkout.session.completed'],
  });

  console.log(`Created webhook endpoint: ${endpoint.id}`);
  
  // The secret is ONLY returned immediately after creation
  const secret = endpoint.secret;
  
  // Update .env.local
  const envPath = path.resolve('.env.local');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('STRIPE_WEBHOOK_SECRET=')) {
    envContent = envContent.replace(/STRIPE_WEBHOOK_SECRET=.*/, `STRIPE_WEBHOOK_SECRET=${secret}`);
  } else {
    envContent += `\nSTRIPE_WEBHOOK_SECRET=${secret}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('Updated STRIPE_WEBHOOK_SECRET in .env.local!');
  console.log('Stripe webhook configuration is complete.');
}

setup().catch(console.error);
