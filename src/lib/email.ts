import nodemailer from "nodemailer";

import { getAppUrl, isEmailConfigured, siteConfig } from "@/lib/config";
import { getDeliveryArchivePath, getFileSize, getOriginalPath } from "@/lib/media";
import type { Game, Order, Photo } from "@/lib/types";
import { formatGameDate, formatMoney } from "@/lib/utils";

const attachmentCutoffBytes = 15 * 1024 * 1024;

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

export async function sendDeliveryEmail(input: {
  order: Order;
  game: Game;
  photos: Photo[];
}) {
  if (!isEmailConfigured() || !input.order.email) {
    return;
  }

  const appUrl = getAppUrl();
  const subject =
    input.order.kind === "folder"
      ? `${siteConfig.name}: your full game gallery is ready`
      : `${siteConfig.name}: your photo is ready`;

  const downloadLinks =
    input.order.kind === "folder"
      ? [
          {
            label: "Download your full gallery zip",
            href: `${appUrl}/api/deliveries/${input.order.deliveryToken}/folder.zip`,
          },
        ]
      : input.photos.map((photo) => ({
          label: `Download photo ${photo.sortOrder}`,
          href: `${appUrl}/api/deliveries/${input.order.deliveryToken}/${photo.id}`,
        }));

  const attachments: Array<{ filename: string; path: string }> = [];

  if (input.order.kind === "single" && input.photos[0]) {
    const photo = input.photos[0];
    const originalPath = getOriginalPath(input.game.slug, photo.originalFilename);
    const size = await getFileSize(originalPath);

    if (size > 0 && size <= attachmentCutoffBytes) {
      attachments.push({
        filename: photo.originalName,
        path: originalPath,
      });
    }
  }

  if (input.order.kind === "folder") {
    const archivePath = getDeliveryArchivePath(input.order.deliveryToken);
    const size = await getFileSize(archivePath);

    if (size > 0 && size <= attachmentCutoffBytes) {
      attachments.push({
        filename: `${input.game.slug}.zip`,
        path: archivePath,
      });
    }
  }

  const text = [
    `Thanks for shopping with ${siteConfig.name}.`,
    "",
    `${input.game.title} - ${formatGameDate(input.game.date)}`,
    `Amount paid: ${formatMoney(input.order.amountCents)}`,
    "",
    "Your download links:",
    ...downloadLinks.map((link) => `- ${link.label}: ${link.href}`),
    "",
    attachments.length > 0
      ? "We also attached your files when the delivery size allowed it."
      : "If the files were too large to attach, the secure links above will always work first.",
  ].join("\n");

  const html = `
    <div style="font-family: Aptos, Trebuchet MS, sans-serif; max-width: 620px; margin: 0 auto; color: #0f1720;">
      <h1 style="font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif; letter-spacing: 1px;">
        ${siteConfig.name}
      </h1>
      <p>Thanks for your purchase. Your unwatermarked files are ready right away.</p>
      <p><strong>${input.game.title}</strong><br />${formatGameDate(input.game.date)}<br />Amount paid: ${formatMoney(input.order.amountCents)}</p>
      <div style="padding: 18px; border-radius: 18px; background: #f4efe6;">
        ${downloadLinks
          .map(
            (link) =>
              `<p style="margin: 12px 0;"><a href="${link.href}" style="color: #a13b2f; font-weight: 700;">${link.label}</a></p>`,
          )
          .join("")}
      </div>
      <p style="margin-top: 18px;">
        ${attachments.length > 0 ? "We attached the files when the delivery size allowed it." : "If the files were too large to attach, the secure links above are the best way to grab them."}
      </p>
    </div>
  `;

  try {
    await getTransport().sendMail({
      from: process.env.SMTP_FROM,
      to: input.order.email,
      subject,
      text,
      html,
      attachments,
    });
  } catch (error) {
    console.error("CRITICAL: Failed to send delivery email:", error);
    // We don't throw here to avoid crashing the webhook fulfillment, 
    // but the error is now visible in logs.
  }
}
