import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgDir = path.join(__dirname, '../public/images/ftr');
const files = ['clouds.svg', 'sun.svg', 'birds.svg', 'waves.svg'];

async function convertSvgToPng(svgFile) {
  const svgPath = path.join(svgDir, svgFile);
  const pngFile = svgFile.replace('.svg', '.png');
  const pngPath = path.join(svgDir, pngFile);

  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .png()
      .toFile(pngPath);
    console.log(`Converted ${svgFile} to ${pngFile}`);
  } catch (error) {
    console.error(`Error converting ${svgFile}:`, error);
  }
}

async function main() {
  for (const file of files) {
    await convertSvgToPng(file);
  }
}

main().catch(console.error); 