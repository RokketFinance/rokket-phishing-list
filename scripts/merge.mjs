// Genera dist/config.json = MetaMask/eth-phishing-detect (en vivo) + overlay.json propio.
//   blacklist final = unión(MetaMask.blacklist, overlay.blacklist) − overlay.whitelist
//   (restamos la whitelist porque la wallet consume SOLO la blacklist, sin lógica de whitelist;
//    así garantizamos que nuestros dApps de confianza nunca queden marcados).
// Sin dependencias: Node 18+ (fetch nativo).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MM_URL = 'https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json';

const uniqSorted = (arr) => [...new Set(arr.filter((s) => typeof s === 'string').map((s) => s.toLowerCase()))].sort();

const res = await fetch(MM_URL);
if (!res.ok) throw new Error(`MetaMask fetch falló: ${res.status}`);
const base = await res.json();
const overlay = JSON.parse(readFileSync(resolve(ROOT, 'overlay.json'), 'utf8'));

const whitelist = uniqSorted([...(base.whitelist ?? []), ...(overlay.whitelist ?? [])]);
const wl = new Set(uniqSorted(overlay.whitelist ?? []));
const blacklist = uniqSorted([...(base.blacklist ?? []), ...(overlay.blacklist ?? [])]).filter((d) => !wl.has(d));

const out = {
  name: 'rokket-phishing-list',
  source: 'MetaMask/eth-phishing-detect + RokketFinance overlay',
  version: base.version ?? 2,
  tolerance: base.tolerance ?? 1,
  fuzzylist: base.fuzzylist ?? [],
  whitelist,
  blacklist,
};

mkdirSync(resolve(ROOT, 'dist'), { recursive: true });
writeFileSync(resolve(ROOT, 'dist', 'config.json'), JSON.stringify(out));
console.log(`OK  blacklist=${blacklist.length}  whitelist=${whitelist.length}  (overlay: +${(overlay.blacklist ?? []).length} bl / ${(overlay.whitelist ?? []).length} wl)`);
