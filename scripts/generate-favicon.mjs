import sharp from "sharp";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public", "logo.png");

if (!existsSync(src)) {
  console.error("logo.png not found in public/");
  process.exit(1);
}

const sizes = [
  { size: 16, out: path.join(root, "public", "favicon-16x16.png") },
  { size: 32, out: path.join(root, "public", "favicon-32x32.png") },
  { size: 180, out: path.join(root, "public", "apple-touch-icon.png") },
  { size: 32, out: path.join(root, "src", "app", "icon.png") },
  { size: 180, out: path.join(root, "src", "app", "apple-icon.png") },
];

for (const { size, out } of sizes) {
  await sharp(src)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(out);
  console.log(`✓ Created ${out} (${size}x${size})`);
}

// Also create a proper 32x32 favicon.ico (as PNG with .ico extension - supported by all modern browsers)
await sharp(src)
  .resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(path.join(root, "public", "favicon.ico"));
console.log("✓ Created public/favicon.ico (32x32 PNG)");

console.log("\n🎉 All favicon files generated!");
