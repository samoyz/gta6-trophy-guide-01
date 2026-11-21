// Leonida Platinum, the hand-in program for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is the static files under app/:
// a browser opens app/index.html, it loads nothing over the network, and its
// trophy list and guides live in app/data/trophies.json. This program hands
// the guide in: it copies app/ and screenshots/ from beside this file into
// the output directory and writes output/dossier.json, the summary the judge
// reads, using the vendored make.fun library. The library is left exactly as
// the kit shipped it: the scorer runs its own copy and requires the dossier
// to be byte for byte what that copy writes.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(sourceDir, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true });
}

function countFiles(dir) {
  // A small recursive count so the log line below can say what went in.
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

function writeDossier() {
  // The scorer's own caps, from the kit's reference/gate.json: only
  // text_max_bytes shapes the bytes. The other caps refuse an entry the
  // scorer would refuse: more than 4 screenshots or one over 256 KiB, more
  // than 993 files and directories in app/ or 48 MiB of app files.
  const dossierText = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossierText);
  return dossierText.length;
}

function confirmDossier() {
  // My own check, on top of the library: the dossier must exist, be a
  // regular file, and parse as JSON. If any of that fails the hand-in is
  // broken, so fail loudly here instead of shipping a bad entry.
  const dossierPath = join(outDir, 'dossier.json');
  if (!existsSync(dossierPath)) {
    throw new Error(`dossier.json was not written to ${dossierPath}`);
  }
  if (!statSync(dossierPath).isFile()) {
    throw new Error(`dossier.json at ${dossierPath} is not a regular file`);
  }
  const parsed = JSON.parse(readFileSync(dossierPath, 'utf-8'));
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('dossier.json did not parse into an object');
  }
  return statSync(dossierPath).size;
}

mkdirSync(outDir, { recursive: true });
copyTree(join(repoRoot, 'app'), join(outDir, 'app'));
if (existsSync(join(repoRoot, 'screenshots'))) {
  copyTree(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'));
}

const dossierChars = writeDossier();
const dossierSize = confirmDossier();
const appFiles = countFiles(join(outDir, 'app'));
console.log(
  `Leonida Platinum handed in: ${appFiles} app files, dossier.json ${dossierSize} bytes ` +
  `(buildDossier wrote ${dossierChars} characters), output in ${outDir}.`,
);
