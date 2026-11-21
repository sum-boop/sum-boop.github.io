#!/usr/bin/env node
/**
 * React Bits (reactbits.dev) Component Installer for AI Studio
 * Usage: node scripts/add-reactbit.js <ComponentName>
 * Example: node scripts/add-reactbit.js SpotlightCard
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

let componentName = process.argv[2];
if (!componentName) {
  console.error('Error: Component name required.');
  console.log('Usage: node scripts/add-reactbit.js <ComponentName>');
  console.log('Example: node scripts/add-reactbit.js SpotlightCard');
  process.exit(1);
}

// Normalize name if provided without suffix
let endpointName = componentName;
if (!endpointName.includes('-')) {
  endpointName = `${componentName}-TS-TW`;
}

async function installComponent() {
  const url = `https://reactbits.dev/r/${endpointName}.json`;
  console.log(`Connecting to React Bits registry: ${url}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (status: ${res.status})`);
    }

    const data = await res.json();
    console.log(`Loaded registry entry for: ${data.name}`);

    const targetDir = path.join(rootDir, 'src', 'components', 'reactbits');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (data.files && Array.isArray(data.files)) {
      for (const file of data.files) {
        const fileName = path.basename(file.path);
        const destination = path.join(targetDir, fileName);

        // Adapt 'motion/react' imports to 'framer-motion' if needed
        let content = file.content;
        content = content.replace(/from\s+['"]motion\/react['"]/g, "from 'framer-motion'");
        content = content.replace(/from\s+['"]motion['"]/g, "from 'framer-motion'");

        fs.writeFileSync(destination, content, 'utf8');
        console.log(`Installed: src/components/reactbits/${fileName}`);
      }
    }

    console.log(`Successfully connected and installed ${componentName} from reactbits.dev!`);
  } catch (err) {
    console.error('Error installing component from reactbits.dev:', err.message);
    process.exit(1);
  }
}

installComponent();
