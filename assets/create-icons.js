const fs = require("fs");
const { exec } = require("child_process");

console.log("Creating app icons for Hoppscotch Desktop...");

exec(
  'convert -size 256x256 xc:"#667EEA" -font Arial-Bold -pointsize 150 -fill white -gravity center -annotate +0+0 "H" app-icon.png',
  (error) => {
    if (error) {
      console.log(
        "ImageMagick not available, creating placeholder icon files..."
      );

      // Create placeholder files for different sizes
      const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];

      sizes.forEach((size) => {
        const filename = `app-icon-${size}.png`;
        console.log(`Creating ${filename}...`);

        // For now, create placeholder files - in production you'd generate proper PNGs
        fs.writeFileSync(filename, `PNG placeholder ${size}x${size}`);
      });

      // Create main app icons
      fs.writeFileSync("app-icon.png", "PNG placeholder 256x256");
      fs.writeFileSync("app-icon.ico", "ICO placeholder for Windows");
      fs.writeFileSync("app-icon.icns", "ICNS placeholder for macOS");

      console.log("✅ Placeholder icon files created!");
      console.log(
        "Note: In production, use proper image generation tools or design software"
      );
    } else {
      console.log("✅ Icon created with ImageMagick!");
    }
  }
);
