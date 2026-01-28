const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/og-image.svg');
const pngPath = path.join(__dirname, '../public/og-image.png');

async function convertSvgToPng() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toFile(pngPath);

    console.log('Successfully converted og-image.svg to og-image.png');
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

convertSvgToPng();
