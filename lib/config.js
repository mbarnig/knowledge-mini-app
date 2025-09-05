import fs from 'node:fs';
import path from 'node:path';

export function loadConfig() {
  const dataDir = path.join(process.cwd(), 'data');

  // Cherche le premier fichier .json dans /data
  const files = fs.readdirSync(dataDir).filter(f => f.toLowerCase().endsWith('.json'));
  if (files.length === 0) {
    throw new Error(`Aucun fichier JSON trouvé dans ${dataDir}`);
  }

  const filePath = path.join(dataDir, files[0]); // prends le premier trouvé

  const raw = fs.readFileSync(filePath, 'utf8');
  const cfg = JSON.parse(raw);
  return cfg;
}

export const LANG_ORDER = ['en','fr','de','pt','lb'];

export function initialsFromName(name) {
  if (!name) return 'AU';
  const parts = String(name).match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g) || [];
  return parts.slice(0,3).map(p=>p[0].toUpperCase()).join('') || 'AU';
}

export function luminance(hex) {
  const c = (hex || '#000').replace('#','');
  const r = parseInt(c.slice(0,2),16)/255;
  const g = parseInt(c.slice(2,4),16)/255;
  const b = parseInt(c.slice(4,6),16)/255;
  const a = [r,g,b].map(v=> v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];
}

