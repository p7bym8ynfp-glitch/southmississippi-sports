import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

async function processLogo() {
  const input = "public/logo.jpg";
  const outputLogo = "public/logo-transparent.png";
  const outputWatermark = "public/watermark.png";

  console.log("Processing logo image...");
  
  // To simulate basic background removal without AI models, 
  // we'll just save it as a high quality PNG for the frontend for now,
  // and we'll apply it into a badge container on the UI.
  // For the watermark, we will instruct sharp to multiply it during media generation.
  
  await sharp(input)
    .resize({ width: 800, withoutEnlargement: true })
    .png({ quality: 90 })
    .toFile(outputLogo);
    
  console.log("Saved logo-transparent.png!");
  
  await sharp(input)
    .resize({ width: 800, withoutEnlargement: true })
    .png({ quality: 90 })
    .toFile(outputWatermark);
    
  console.log("Saved watermark.png!");
  
  // Ensure the storage directory exists and copy the watermark there for the media library
  await fs.mkdir("storage", { recursive: true });
  await fs.copyFile(outputWatermark, "storage/custom-watermark.png");
  console.log("Saved custom-watermark.png to storage!");
}

processLogo().catch(console.error);
