/**
 * Enrich BONUS lessons (ders20-48) with Thai characters and fix common issues.
 * Run: node tools/enrich-bonus.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function normRo(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const roThMap = new Map();
const trThMap = new Map();

function addPair(ro, th) {
  if (!ro || !th || !/[\u0E00-\u0E7F]/.test(th)) return;
  const n = normRo(ro);
  if (!roThMap.has(n)) roThMap.set(n, th);
  // also store without khrap/kha suffix
  const base = normRo(ro.replace(/\s*(khrap|kha|krap|na|loey|duay)\b/gi, '').trim());
  if (base && !roThMap.has(base)) roThMap.set(base, th);
}

function collectFromText(text) {
  const blockRe = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  let m;
  while ((m = blockRe.exec(text))) {
    const block = m[0];
    const roM = block.match(/ro:'([^']*)'/);
    const thM = block.match(/th:'([^']*)'/);
    const trM = block.match(/tr:'([^']*)'/);
    if (roM && thM) addPair(roM[1], thM[1]);
    if (trM && thM) {
      const tr = trM[1].toLowerCase().trim();
      if (!trThMap.has(tr)) trThMap.set(tr, thM[1]);
    }
  }
}

for (let n = 1; n <= 19; n++) {
  const f = path.join(ROOT, `ders${n}.js`);
  if (fs.existsSync(f)) collectFromText(fs.readFileSync(f, 'utf8'));
}

const MANUAL = {
  'sawatdii': 'สวัสดี', 'khobkhun': 'ขอบคุณ', 'khaawpkhun': 'ขอบคุณ',
  'khrap': 'ครับ', 'kha': 'ค่ะ', 'chai': 'ใช่', 'mai': 'ไม่', 'dii': 'ดี',
  'maidi': 'ไม่ดี', 'saabai': 'สบาย', 'khun': 'คุณ', 'phom': 'ผม', 'chan': 'ฉัน',
  'khao': 'เขา', 'rao': 'เรา', 'aagaawn': 'ลาก่อน', 'agaawn': 'ลาก่อน',
  'yindii': 'ยินดี', 'yindiitiidairuujak': 'ยินดีที่ได้รู้จัก',
  'maipenrai': 'ไม่เป็นไร', 'nueng': 'หนึ่ง', 'saawng': 'สอง', 'saam': 'สาม',
  'sii': 'สี่', 'haa': 'ห้า', 'hok': 'หก', 'jet': 'เจ็ด', 'bpaaet': 'แปด',
  'gao': 'เก้า', 'sip': 'สิบ', 'wannii': 'วันนี้', 'phuuket': 'ภูเก็ต',
  'bpai': 'ไป', 'maa': 'มา', 'yuu': 'อยู่', 'hen': 'เห็น', 'nam': 'น้ำ',
  'chaa': 'ชา', 'gaafaae': 'กาแฟ', 'aahaan': 'อาหาร', 'aroi': 'อร่อย',
  'phet': 'เผ็ด', 'rot': 'รถ', 'taeksii': 'แท็กซี่', 'mottoesai': 'มอเตอร์ไซค์',
  'roongraem': 'โรงแรม', 'hong': 'ห้อง', 'bplaa': 'ปลา', 'gai': 'ไก่',
  'khaaw': 'ข้าว', 'thukwan': 'ทุกวัน', 'nii': 'นี่', 'khu': 'คือ',
  'ngaai': 'ง่าย', 'glai': 'ใกล้', 'glaiyak': 'ใกล้', 'glaiuzak': 'ไกล',
  'wansapdaa': 'วันศุกร์', 'wanjan': 'วันจันทร์', 'wanangkaan': 'วันอังคาร',
  'wanphut': 'วันพุธ', 'wanparuehat': 'วันพฤหัสบดี', 'wansao': 'วันเสาร์',
  'wanathit': 'วันอาทิตย์', 'saamaat': 'สามารถ', 'sewn': 'ศูนย์',
  'jao': 'เช่า', 'sue': 'ซื้อ', 'raakhaa': 'ราคา', 'thuuk': 'ถูก',
  'phaeng': 'แพง', 'lot': 'ลด', 'thamngaan': 'ทำงาน', 'chue': 'ชื่อ',
  'thong': 'ท้อง', 'hua': 'หัว', 'bpuat': 'ปวด', 'yaa': 'ยา',
  'mor': 'หมอ', 'roongphayaabaan': 'โรงพยาบาล', 'raankhaaiyaa': 'ร้านขายยา',
  'chuay': 'ช่วย', 'duan': 'ด่วน', 'tho': 'โทร', 'thii': 'ที่', 'nai': 'ไหน',
  'arai': 'อะไร', 'thaaorai': 'เท่าไร', 'dai': 'ได้', 'pen': 'เป็น',
  'mii': 'มี', 'mai': 'ไม่', 'mak': 'มาก', 'noi': 'หน่อย', 'reo': 'เร็ว',
  'chaa': 'ช้า', 'glai': 'ใกล้', 'yak': 'ไกล', 'tham': 'ทำ', 'kin': 'กิน',
  'duem': 'ดื่ม', 'nang': 'นั่ง', 'dern': 'เดิน', 'wing': 'วิ่ง',
  'len': 'เล่น', 'rian': 'เรียน', 'phuut': 'พูด', 'fang': 'ฟัง',
  'khit': 'คิด', 'rak': 'รัก', 'kwaa': 'กว่า', 'samrap': 'สำหรับ',
  'thuk': 'ทุก', 'yang': 'ยัง', 'laeo': 'แล้ว', 'kor': 'ขอ', 'khor': 'ขอ',
  'khorthot': 'ขอโทษ', 'saabaidee': 'สบายดี', 'saabaideemai': 'สบายดีไหม',
  'yinii': 'ยินดี', 'tonrap': 'ต้อนรับ', 'khaawjai': 'เข้าใจ',
  'phamaa': 'พม่า', 'jiin': 'จีน', 'phatthai': 'ผัดไทย', 'chiiangmai': 'เชียงใหม่',
  'graathing': 'กระทิง', 'chaayen': 'ชาเย็น', 'muuai': 'มวย', 'phleeng': 'เพลง',
  'hiphawp': 'ฮิปฮอป', 'graaraawk': 'กระรอก', 'joofi': 'จ๊อฟฟี่',
};
for (const [k, v] of Object.entries(MANUAL)) roThMap.set(normRo(k), v);

function lookupTh(ro, tr) {
  if (!ro) return '';
  const n = normRo(ro);
  if (roThMap.has(n)) return roThMap.get(n);
  // strip polite suffixes
  const stripped = normRo(ro.replace(/\s*(khrap|kha|krap|na|loey|duay|mak|noi)\b/gi, ''));
  if (roThMap.has(stripped)) return roThMap.get(stripped);
  // first token
  const first = normRo(ro.split(/[\s-]/)[0]);
  if (roThMap.has(first)) return roThMap.get(first);
  // tr match
  if (tr) {
    const t = tr.toLowerCase().trim();
    if (trThMap.has(t)) return trThMap.get(t);
  }
  // fuzzy: find key that starts with same 4 chars
  if (n.length >= 4) {
    const prefix = n.slice(0, 4);
    for (const [k, v] of roThMap) {
      if (k.startsWith(prefix) && Math.abs(k.length - n.length) <= 3) return v;
    }
  }
  return '';
}

function fixTr(tr) {
  if (!tr) return tr;
  return tr
    .replace(/oodbye/gi, 'Hoşçakal')
    .replace(/neapple/gi, 'ananas')
    .replace(/gaan rafting ve trekking gaaeng/gi, 'rafting ve trekking')
    .replace(/bpra-wat-saat geçmişinin izini sürüyor/gi, 'tarihi keşfetmek')
    .replace(/reklam Tay dili/gi, 'Tayca reklam')
    .replace(/ark Thai buzlu çay/gi, 'Tay buzlu çay')
    .replace(/Modern köpek/gi, 'Modern Dog (grup)');
}

function enrichFile(num) {
  const file = path.join(ROOT, `ders${num}.js`);
  if (!fs.existsSync(file)) return { num, skipped: true };
  let src = fs.readFileSync(file, 'utf8');
  let added = 0;
  let fixed = 0;

  // Words without th
  src = src.replace(/\{id:'([^']+)',ro:'([^']*)',tr:'([^']*)',en:'([^']*)'/g, (full, id, ro, tr, en) => {
    const newTr = fixTr(tr);
    if (newTr !== tr) fixed++;
    const th = lookupTh(ro, newTr);
    if (th) {
      added++;
      return `{id:'${id}',th:'${th}',ro:'${ro}',tr:'${newTr}',en:'${en}'`;
    }
    return `{id:'${id}',ro:'${ro}',tr:'${newTr}',en:'${en}'`;
  });

  // Words that already have th but tr needs fix
  src = src.replace(/\{id:'([^']+)',th:'([^']*)',ro:'([^']*)',tr:'([^']*)',en:'([^']*)'/g, (full, id, th, ro, tr, en) => {
    const newTr = fixTr(tr);
    if (newTr !== tr) fixed++;
    return `{id:'${id}',th:'${th}',ro:'${ro}',tr:'${newTr}',en:'${en}'`;
  });

  src = src.replace(/role:'S'/g, "role:'S - Ozne'");
  src = src.replace(/role:'V'/g, "role:'V - Yuklem'");
  src = src.replace(/role:'O'/g, "role:'O - Nesne'");
  src = src.replace(/role:'K'/g, "role:'Kelime'");

  fs.writeFileSync(file, src, 'utf8');
  return { num, added, fixed };
}

const results = [];
for (let n = 20; n <= 48; n++) results.push(enrichFile(n));

let withTh = 0, total = 0;
for (let n = 20; n <= 48; n++) {
  const src = fs.readFileSync(path.join(ROOT, `ders${n}.js`), 'utf8');
  const words = src.match(/\{id:'c\d+'/g) || [];
  total += words.length;
  const wordBlocks = src.split(/\{id:'c\d+'/).slice(1);
  wordBlocks.forEach(b => { if (b.startsWith(",th:'") || b.match(/^,th:'/)) withTh++; });
}

console.log('BONUS enrichment done:');
results.forEach(r => { if (!r.skipped) console.log(`  ders${r.num}: +${r.added} th, ${r.fixed} tr fixes`); });
console.log(`Coverage: ${withTh}/${total} words have th (${Math.round(withTh/total*100)}%)`);
console.log(`Dictionary: ${roThMap.size} ro entries, ${trThMap.size} tr entries`);
