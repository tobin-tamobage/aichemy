#!/usr/bin/env node
/**
 * Package Signing Utility for RenderZero Studio
 * 
 * Signs RenderZero suite ZIP packages with HMAC-SHA256.
 * The app verifies this signature before extracting any package.
 * 
 * Usage:
 *   node sign-package.cjs <input.nbprovider|input.nbmodel|input.nbcomfy> [output]
 *   node sign-package.cjs my-provider.nbprovider
 *   node sign-package.cjs my-provider.nbprovider signed-provider.nbprovider
 * 
 * If no output path is given, the input file is overwritten in-place.
 * 
 * What it does:
 * 1. Reads the ZIP file
 * 2. Computes SHA-256 hash of the original file bytes
 * 3. Computes HMAC-SHA256(hash, SIGNING_KEY) as the signature
 * 4. Injects `fileHash` and `signature` fields into the manifest.json inside the ZIP
 * 5. Writes the signed ZIP to the output path
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AdmZip = require('adm-zip');

// IMPORTANT: This must match PACKAGE_SIGNING_KEY in electron/main.cjs
const PACKAGE_SIGNING_KEY = 'nbp-signing-key-change-me-in-production-2026';

function signPackage(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File not found: ${inputPath}`);
    process.exit(1);
  }

  const ext = path.extname(inputPath).toLowerCase();
  if (!['.nbplugin', '.nbprovider', '.nbupdate', '.nbmodel', '.nbcomfy'].includes(ext)) {
    console.error(`Error: Unsupported file type "${ext}". Must be .nbplugin, .nbprovider, .nbupdate, .nbmodel, or .nbcomfy`);
    process.exit(1);
  }

  // Step 1: Open ZIP, read manifest
  const zip = new AdmZip(inputPath);
  const manifestEntry = zip.getEntry('manifest.json');

  if (!manifestEntry) {
    console.error('Error: ZIP does not contain manifest.json');
    process.exit(1);
  }

  const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));

  // Step 2: Remove any existing signature fields
  delete manifest.signature;
  delete manifest.fileHash;

  // Step 3: Compute HMAC over manifest content (without signature) + all other file contents
  // This must exactly match the verification logic in electron/main.cjs
  const manifestContent = JSON.stringify(manifest, Object.keys(manifest).sort());

  const entries = zip.getEntries()
    .filter(e => !e.isDirectory && e.entryName !== 'manifest.json')
    .sort((a, b) => a.entryName.localeCompare(b.entryName));

  const hmac = crypto.createHmac('sha256', PACKAGE_SIGNING_KEY);
  hmac.update(manifestContent);
  for (const entry of entries) {
    hmac.update(entry.entryName);
    hmac.update(entry.getData());
  }
  const signature = hmac.digest('hex');

  // Also compute a SHA-256 file hash for reference (informational, not used for verification)
  const fileBuffer = fs.readFileSync(inputPath);
  const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log(`File:       ${inputPath}`);
  console.log(`SHA-256:    ${fileHash}`);
  console.log(`Signature:  ${signature}`);

  // Step 4: Inject signature into manifest and rewrite ZIP
  manifest.fileHash = fileHash;
  manifest.signature = signature;

  zip.updateFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));

  // Step 5: Write out the signed ZIP
  zip.writeZip(outputPath);

  console.log(`\nSigned package written to: ${outputPath}`);
  console.log('Manifest updated with signature and fileHash fields.');
}

// --- CLI ---
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`
Package Signing Utility for RenderZero Studio
============================================

Usage:
  node sign-package.cjs <input-file> [output-file]

Examples:
  node sign-package.cjs my-provider.nbprovider
  node sign-package.cjs my-plugin.nbplugin signed-plugin.nbplugin
  node sign-package.cjs update.nbupdate
  node sign-package.cjs model-pack.nbmodel
  node sign-package.cjs comfy-pack.nbcomfy

Supported formats: .nbplugin, .nbprovider, .nbupdate, .nbmodel, .nbcomfy
`);
  process.exit(0);
}

const inputPath = path.resolve(args[0]);
const outputPath = args[1] ? path.resolve(args[1]) : inputPath;

signPackage(inputPath, outputPath);
