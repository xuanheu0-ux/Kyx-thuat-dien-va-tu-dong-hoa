#!/usr/bin/env node
/*
 * check_web.js — 网页工程自检脚本 (kiểm tra nhanh các project web)
 *
 * Checks every HTML/JS/CSS project under 选修课/web程序设计:
 *   1. JS syntax check (vm.Script compile);
 *   2. all src=/href=/url(...) references of the runnable projects resolve to
 *      real files (case-sensitive, so Linux/macOS/CI and Windows behave the same).
 *      JS/CSS references are resolved relative to the project root (the page);
 *   3. HTML files with non-ASCII content declare <meta charset>.
 *
 * Usage:  node tools/check_web.js   (or: npm run check)
 * Exit code 0 = OK, 1 = problems found.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO = path.join(__dirname, '..');
const WEB = path.join(REPO, '选修课', 'web程序设计');
// project roots that are actually runnable in a browser
const PROJECTS = [
  WEB,                                    // hub index.html
  path.join(WEB, '大作业', 'Tank-master'),
  path.join(WEB, '大作业', '植物大战僵尸'),
  path.join(WEB, '大作业', '小游戏'),
  path.join(WEB, '大作业'),                // 贪吃蛇.html sits here
  path.join(WEB, '实验', '实验程序'),
];

let problems = 0;
const rel = (p) => path.relative(REPO, p).split(path.sep).join('/');
const seen = new Set();

// Images missing from the *original* upstream JSPVZ package (documented in
// 植物大战僵尸/README.md). Reported as warnings, not errors.
const PVZ = '选修课/web程序设计/大作业/植物大战僵尸/';
const KNOWN_MISSING = new Set(
  [
    'images/Plants/CoffeeBean/CoffeeBean.gif', 'images/Plants/CoffeeBean/CoffeeBeanEat.gif',
    'images/Plants/FumeShroom/FumeShroom.gif', 'images/Plants/FumeShroom/FumeShroomAttack.gif',
    'images/Plants/FumeShroom/FumeShroomBullet.gif', 'images/Plants/FumeShroom/FumeShroomSleep.gif',
    'images/Plants/GloomShroom/GloomShroom.gif', 'images/Plants/GloomShroom/GloomShroomAttack.gif',
    'images/Plants/GloomShroom/GloomShroomBullet.gif', 'images/Plants/GloomShroom/GloomShroomSleep.gif',
    'images/Plants/PumpkinHead/PumpkinHead.gif', 'images/Plants/PumpkinHead/PumpkinHead1.gif',
    'images/Plants/PumpkinHead/PumpkinHead2.gif', 'images/Plants/PumpkinHead/Pumpkin_back.gif',
    'images/Plants/PumpkinHead/pumpkin_damage1.gif', 'images/Plants/PumpkinHead/pumpkin_damage2.gif',
    'images/Plants/TallNut/TallNut.gif', 'images/Plants/TallNut/TallnutCracked1.gif',
    'images/Plants/TallNut/TallnutCracked2.gif',
    'images/Plants/FlowerPot/FlowerPot.gif', 'images/Plants/LilyPad/LilyPad.gif',
    'images/Plants/PuffShroom/PuffShroom.gif', 'images/Plants/PuffShroom/PuffShroomSleep.gif',
    'images/Zombies/FootballZombie/FootballZombie.gif', 'images/Zombies/FootballZombie/FootballZombieAttack.gif',
    'images/Zombies/FootballZombie/FootballZombieOrnLost.gif', 'images/Zombies/FootballZombie/FootballZombieOrnLostAttack.gif',
    'images/interface/SelectorScreen_Almanac.png', 'images/interface/SelectorScreen_AlmanacHighlight.png',
    'images/interface/background2.jpg', 'images/interface/sod3row.png',
  ].map((s) => PVZ + s)
);
const norm = (r) => PVZ + r.replace(/^\.\//, '').split('\\').join('/');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function resolveAny(bases, ref) {
  for (const b of bases) {
    const t = path.resolve(b, ref);
    if (fs.existsSync(t)) return t;
  }
  return null;
}

// each file is checked against its DEEPEST containing project root
function rootOf(file) {
  let best = null;
  for (const r of PROJECTS) {
    if (file.startsWith(r + path.sep) && (!best || r.length > best.length)) best = r;
  }
  return best;
}

const allFiles = [];
for (const r of PROJECTS) {
  if (!fs.existsSync(r)) { console.error(`[check] missing directory: ${rel(r)}`); problems++; continue; }
  for (const f of walk(r)) allFiles.push(f);
}

const uniq = [...new Set(allFiles)].filter((f) => /\.(html?|js|css)$/i.test(f));
for (const f of uniq) {
  const root = rootOf(f) || WEB;
  {
      const src = fs.readFileSync(f, 'utf8');

    // 1) JS syntax
    if (f.endsWith('.js')) {
      try {
        new vm.Script(src, { filename: f });
      } catch (e) {
        console.error(`[syntax] ${rel(f)}: ${e.message}`);
        problems++;
      }
    }

    // 2) references (relative only; dynamic concatenated strings are skipped)
    const isPage = /\.html?$/i.test(f);
    const bases = isPage ? [path.dirname(f), root] : [root, path.dirname(f)];
    const refs = [
      ...src.matchAll(/(?:src|href)\s*=\s*["']([^"'?>#]+)["']/gi),
      ...src.matchAll(/url\(\s*["']?([^"')]+?)\s*["']?\)/gi),
      // bare string literals like PicArr entries: "images/Plants/X/x.gif"
      ...src.matchAll(/["'](images\/[^"']+?\.(?:gif|png|jpe?g|bmp|svg))["']/gi),
    ].map((m) => m[1].trim());
    for (const r of new Set(refs)) {
      if (/^(https?:|data:|javascript:|mailto:|#|\/\/)/i.test(r) || /[+\s'"]/.test(r)) continue;
      if (resolveAny(bases, r)) continue;
      // dynamic prefix like "images/Plants/PB" (no extension, dir exists) → skip
      const t0 = path.resolve(bases[0], r);
      if (!path.extname(t0) && fs.existsSync(path.dirname(t0))) continue;
      if (KNOWN_MISSING.has(norm(r))) {
        console.warn(`[warn] ${rel(f)} -> ${r} (thiếu từ bản gốc upstream — xem README)`);
        continue;
      }
      // case-insensitive hint
      let hint = '';
      for (const b of bases) {
        const t = path.resolve(b, r);
        const dir = path.dirname(t);
        if (fs.existsSync(dir)) {
          const guess = fs.readdirSync(dir).find((n) => n.toLowerCase() === path.basename(t).toLowerCase());
          if (guess) { hint = ` → đúng phải là ${path.relative(b, path.join(dir, guess))} (sai HOA/thường)`; break; }
        }
      }
      console.error(`[404] ${rel(f)} -> ${r}${hint || ' (thiếu file — xem README của project)'}`);
      problems++;
    }

    // 3) charset meta for html with non-ASCII
    if (isPage && /[^\x00-\x7f]/.test(src) && !/charset\s*=/i.test(src)) {
      console.error(`[charset] ${rel(f)}: thiếu <meta charset="utf-8">`);
      problems++;
    }
  }
}

if (problems === 0) console.log('✔ All web projects OK (JS syntax, references, charset).');
else console.log(`✘ Found ${problems} problem(s).`);
process.exit(problems ? 1 : 0);
