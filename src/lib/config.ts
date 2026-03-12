export const siteConfig = {
  name: "South Mississippi Sports",
  domain: "southmississippisports.com",
  tagline: "Game-day photos for parents, delivered fast.",
  heroLabel: "Friday night lights, tournament weekends, and instant delivery.",
};

export const pricing = {
  singlePhotoCents: 2_000,
  fullGameCents: 1_500,
};

export const deliveryWindowDays = 7;

function getCleanEnvValue(value?: string) {
  return value?.trim() ?? "";
}

function isPlaceholderValue(value?: string) {
  const normalized = getCleanEnvValue(value).toLowerCase();

  return (
    normalized === "" ||
    normalized === "not-yet-set" ||
    normalized === "not-set-yet" ||
    normalized === "change-this-password" ||
    normalized === "replace-with-a-strong-password"
  );
}

export function getConfiguredAppUrl() {
  return (
    process.env.APP_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "") ||
    ""
  );
}

export function getAppUrl() {
  return getConfiguredAppUrl() || "http://localhost:3000";
}

export function getAdminPassword() {
  return getCleanEnvValue(process.env.ADMIN_PASSWORD);
}

export function hasAdminPassword() {
  return getAdminPassword().length > 0;
}

export function isStripeConfigured() {
  return Boolean(getStripeSecretKey());
}

export function isEmailConfigured() {
  return !isPlaceholderValue(process.env.SMTP_HOST) && !isPlaceholderValue(process.env.SMTP_FROM);
}

export function getWatermarkLabel() {
  return process.env.WATERMARK_LABEL?.trim() || siteConfig.name;
}

export function getDataDirectory() {
  return process.env.APP_DATA_DIR?.trim() || "data";
}

export function getStorageDirectory() {
  return process.env.APP_STORAGE_DIR?.trim() || "storage";
}

export function getStripeSecretKey() {
  const value = getCleanEnvValue(process.env.STRIPE_SECRET_KEY);
  return value.startsWith("sk_") ? value : "";
}

export function getStripeWebhookSecret() {
  const value = getCleanEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
  return value.startsWith("whsec_") ? value : "";
}
