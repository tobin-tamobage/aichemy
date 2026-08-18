const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, 'public');
const SVG_PATH = path.join(PUBLIC_DIR, 'icon.svg');

const OUTPUTS = {
  iconPng: path.join(PUBLIC_DIR, 'icon.png'),
  icon256: path.join(PUBLIC_DIR, 'icon-256.png'),
  favicon32: path.join(PUBLIC_DIR, 'favicon-32.png'),
  iconIco: path.join(PUBLIC_DIR, 'icon.ico'),
  iconIcns: path.join(PUBLIC_DIR, 'icon.icns'),
};

async function renderPng(size) {
  return sharp(SVG_PATH)
    .resize(size, size)
    .png()
    .toBuffer();
}

async function tryGenerateIco() {
  try {
    const pngToIco = require('png-to-ico');
    const icoBuffer = await pngToIco([OUTPUTS.icon256]);
    fs.writeFileSync(OUTPUTS.iconIco, icoBuffer);
    console.log('Generated icon.ico');
  } catch {
    console.log('Skipped icon.ico generation (install png-to-ico for automatic ICO export).');
  }
}

async function tryGenerateIcns() {
  try {
    const { Icns, IcnsImage } = require('@fiahfy/icns');
    const icns = new Icns();

    const iconTypeMap = [
      { size: 16, type: 'icp4' },
      { size: 32, type: 'icp5' },
      { size: 64, type: 'icp6' },
      { size: 128, type: 'ic07' },
      { size: 256, type: 'ic08' },
      { size: 512, type: 'ic09' },
      { size: 1024, type: 'ic10' },
    ];

    for (const icon of iconTypeMap) {
      const png = await renderPng(icon.size);
      icns.append(IcnsImage.fromPNG(png, icon.type));
    }

    fs.writeFileSync(OUTPUTS.iconIcns, Buffer.from(icns.data));
    console.log('Generated icon.icns');
  } catch {
    console.log('Skipped icon.icns generation (install @fiahfy/icns for automatic ICNS export).');
  }
}

async function generateIcons() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Missing source SVG: ${SVG_PATH}`);
  }

  const icon512 = await renderPng(512);
  fs.writeFileSync(OUTPUTS.iconPng, icon512);
  console.log('Generated icon.png (512x512)');

  const icon256 = await renderPng(256);
  fs.writeFileSync(OUTPUTS.icon256, icon256);
  console.log('Generated icon-256.png (256x256)');

  const favicon32 = await renderPng(32);
  fs.writeFileSync(OUTPUTS.favicon32, favicon32);
  console.log('Generated favicon-32.png (32x32)');

  await tryGenerateIco();
  await tryGenerateIcns();

  console.log('\nIcon generation complete.');
}

generateIcons().catch((error) => {
  console.error('Error generating icons:', error);
  process.exitCode = 1;
});
