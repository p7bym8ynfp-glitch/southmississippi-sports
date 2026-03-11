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
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

export function hasAdminPassword() {
  return getAdminPassword().length > 0;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
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
