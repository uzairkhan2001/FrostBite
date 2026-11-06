// FrostBite - zero-dependency Node server (site + admin API)
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.VERCEL ? '' : 'admin123');
const DATA_DIR = path.join(__dirname, 'data'), DB_FILE = path.join(DATA_DIR, 'db.json');
const PUB = path.join(__dirname, 'public'), UPLOADS = path.join(PUB, 'uploads');
try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.mkdirSync(UPLOADS, { recursive: true }); } catch { }

const uid = () => crypto.randomBytes(5).toString('hex');
const seed = () => ({
  brand: { name: 'FrostBite', tagline: 'Fry fresh at home. Crispy in minutes.', logo: '🍗', notice: 'Cash on delivery available · Fresh frozen, ready in minutes', whatsapp: '', phone: '' },
  theme: { primary: '#e4002b', accent: '#ffb400', bg: '#f1f3f6', text: '#000000', card: '#ffffff', font: 'Barlow', headingFont: 'Archivo Black', fontSize: 16 },
  sections: [
    { id: 'hero', type: 'hero', visible: true, content: { eyebrow: '🔥 Frozen • Ready to fry', title: 'Restaurant-style snacks, straight from your freezer', subtitle: 'Samosas, rolls, peri-peri bites & more. Fry or air-fry in 6 minutes. Crispy outside, juicy inside.', ctaText: 'Shop now', image: '', emoji: '🥟' } },
    { id: 'kidsdeals', type: 'productgroup', visible: true, content: { title: 'Kids Deals', subtitle: 'Bite-sized packs the little ones love.', group: 'Kids Deals' } },
    { id: 'dealsgrid', type: 'productgroup', visible: true, content: { title: 'Deals', subtitle: 'Bundles that save you more.', group: 'Deals' } },
    { id: 'products', type: 'products', visible: true, content: { title: 'Our Menu', subtitle: 'Pick, add to cart, fry, enjoy.' } },
    { id: 'deal', type: 'deal', visible: true, content: { title: 'Deal of the Day', subtitle: 'Grab it before the timer hits zero!', discount: 20, endsAt: '', productIds: ['p1', 'p3'], image: '' } },
    { id: 'features', type: 'features', visible: true, content: { title: 'Why FrostBite?', items: '🧊|Flash frozen|Locked at peak freshness within hours.\n⏱️|Ready in 6 min|Deep fry, shallow fry or air fry.\n🌿|Clean recipes|No artificial colours or preservatives.\n🚚|Cold-chain delivery|Arrives frozen, every single time.' } },
    { id: 'gallery', type: 'gallery', visible: false, content: { title: 'Gallery', images: [] } },
    { id: 'about', type: 'about', visible: true, content: { title: 'Made with love, frozen with care', body: 'We started FrostBite so busy families never have to choose between convenience and taste. Every samosa is hand-folded, every roll is packed with real filling, and everything is flash-frozen to lock in flavour.', image: '' } },
    { id: 'reviews', type: 'reviews', visible: true, content: { title: 'What our customers say', subtitle: 'Real reviews from real snack lovers.' } },
    { id: 'feedback', type: 'feedback', visible: true, content: { title: 'Tell us what you think', subtitle: 'Your feedback shapes our next flavour.' } }
  ],
  products: [
    { id: 'k1', name: 'Kids Pack 1', desc: 'Half dozen each: Chicken Strips + Cheese Roll + Mini Patty + Cheese Balls + Nuggets', price: 1999, oldPrice: 0, stock: 30, emoji: '🧸', image: '', category: 'Kids Deals' },
    { id: 'k2', name: 'Kids Pack 2', desc: 'One dozen each: Chicken Strips + Cheese Balls + Nuggets + Cheese Samosa', price: 3000, oldPrice: 0, stock: 20, emoji: '🎈', image: '', category: 'Kids Deals' },
    { id: 'k3', name: 'Kids Pack 3', desc: 'One dozen each: Strips + Cheese Balls + Mini Patty + Nuggets, plus 1 kg Hot Shots', price: 5500, oldPrice: 0, stock: 12, emoji: '🍭', image: '', category: 'Kids Deals' },
    { id: 'd1', name: 'Deal 01', desc: 'One dozen each: Chicken Samosa + BBQ Samosa + Wonton', price: 1700, oldPrice: 2100, stock: 25, emoji: '🎁', image: '', category: 'Deals' },
    { id: 'd2', name: 'Deal 02', desc: 'One dozen each: Chicken Samosa + Cheese Samosa + Spring Roll', price: 2000, oldPrice: 2500, stock: 25, emoji: '🎁', image: '', category: 'Deals' },
    { id: 'd3', name: 'Deal 03', desc: 'One dozen each: Cheese Cone + Cheese Roll + Box Patties', price: 2560, oldPrice: 3200, stock: 15, emoji: '🎁', image: '', category: 'Deals' },
    { id: 'd4', name: 'Deal 04', desc: 'One dozen each: Seekh Kabab + Shami Kabab + Koftay', price: 3000, oldPrice: 3600, stock: 0, emoji: '🎁', image: '', category: 'Deals' },
    { id: 'p1', name: 'Crispy Veg Samosa', desc: 'Spiced potato & peas, 12 pcs', price: 450, stock: 40, emoji: '🥟', image: '', category: 'Samosa' },
    { id: 'p2', name: 'Chicken Spring Roll', desc: 'Crunchy veg & chicken, 10 pcs', price: 650, stock: 25, emoji: '🌯', image: '', category: 'Rolls' },
    { id: 'p3', name: 'Peri-Peri Chicken Bites', desc: 'Spicy boneless bites, 500 g', price: 750, stock: 3, emoji: '🍗', image: '', category: 'Bites' },
    { id: 'p4', name: 'Paneer Tikka Roll', desc: 'Smoky paneer in crisp wrap, 8 pcs', price: 600, stock: 18, emoji: '🌯', image: '', category: 'Rolls' },
    { id: 'p5', name: 'Cheese Corn Nuggets', desc: 'Gooey cheese & sweet corn, 20 pcs', price: 550, stock: 0, emoji: '🧀', image: '', category: 'Bites' },
    { id: 'p6', name: 'Aloo Tikki', desc: 'Classic street-style, 12 pcs', price: 350, stock: 60, emoji: '🥔', image: '', category: 'Snacks' },
    { id: 'p7', name: 'Crinkle Fries', desc: 'Golden & crunchy, 750 g', price: 450, stock: 35, emoji: '🍟', image: '', category: 'Snacks' },
    { id: 'p8', name: 'Veg Cutlet', desc: 'Mixed veg patties, 10 pcs', price: 400, stock: 22, emoji: '🍘', image: '', category: 'Snacks' }
  ],
  reviews: [
    { id: 'r1', name: 'Aarav S.', rating: 5, text: 'The samosas taste exactly like the corner shop. Ready in minutes!', approved: true, date: new Date().toISOString() },
    { id: 'r2', name: 'Meera K.', rating: 5, text: 'Peri-peri bites are insanely good. Kids finished the pack in one go.', approved: true, date: new Date().toISOString() },
    { id: 'r3', name: 'Rohan D.', rating: 4, text: 'Great packaging and arrived properly frozen. Will order again.', approved: true, date: new Date().toISOString() }
  ],
  feedbackForm: { title: 'Customer feedback', fields: [
    { id: 'f1', label: 'Your name', type: 'text', required: true, options: '' },
    { id: 'f2', label: 'Email (optional)', type: 'email', required: false, options: '' },
    { id: 'f3', label: 'Which product did you try?', type: 'select', required: false, options: 'Samosa,Rolls,Peri-Peri Bites,Other' },
    { id: 'f4', label: 'Overall rating', type: 'rating', required: true, options: '' },
    { id: 'f5', label: 'Any suggestions?', type: 'textarea', required: false, options: '' }
  ] },
  orders: [], feedbacks: [], events: []
});

// ---- storage: Upstash Redis (Vercel) or local JSON file ----
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useRedis = !!(REDIS_URL && REDIS_TOKEN);
const redis = async cmd => {
  const r = await fetch(REDIS_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + REDIS_TOKEN }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
};
let db;
async function load() {
  if (useRedis) {
    const v = await redis(['GET', 'fb:db']);
    if (v) db = JSON.parse(v); else { db = seed(); await redis(['SET', 'fb:db', JSON.stringify(db)]); }
  } else if (!db) { try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch { db = seed(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1)); } }
}
async function save() { if (!useRedis && process.env.VERCEL) throw new Error('Database not connected yet. In Vercel add Upstash Redis to this project (Storage tab), then redeploy.'); if (useRedis) await redis(['SET', 'fb:db', JSON.stringify(db)]); else fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1)); }
async function addEvent(e) {
  if (useRedis) { await redis(['RPUSH', 'fb:ev', JSON.stringify(e)]); if (Math.random() < .02) await redis(['LTRIM', 'fb:ev', -20000, -1]); }
  else { db.events.push(e); if (db.events.length > 60000) db.events.splice(0, 10000); await save(); }
}
async function getEvents() { return useRedis ? (await redis(['LRANGE', 'fb:ev', -20000, -1])).map(x => JSON.parse(x)) : (db.events || []); }

// ---- stateless admin tokens (work across serverless instances) ----
const secret = () => db.adminSecret || ADMIN_PASSWORD;
const hashPw = (pw, salt = crypto.randomBytes(8).toString('hex')) => salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
const checkPw = pw => {
  if (db.adminHash) { const [salt, h] = db.adminHash.split(':'); return hashPw(String(pw), salt) === db.adminHash; }
  return !!ADMIN_PASSWORD && pw === ADMIN_PASSWORD;
};
const needsSetup = () => !db.adminHash && !ADMIN_PASSWORD;
const setPw = pw => { db.adminHash = hashPw(pw); db.adminSecret = crypto.randomBytes(24).toString('hex'); };
const sig = x => crypto.createHmac('sha256', secret()).update('fb|' + x).digest('hex');
const makeToken = () => { const exp = Date.now() + 7 * 864e5; return exp + '.' + sig(exp); };
const okToken = t => { if (needsSetup()) return false; const [exp, h] = String(t || '').split('.'); if (!exp || !h || +exp < Date.now()) return false; const g = sig(exp); return h.length === g.length && crypto.timingSafeEqual(Buffer.from(h), Buffer.from(g)); };

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const readBody = req => new Promise((ok, no) => {
  let b = '', n = 0;
  req.on('data', c => { n += c.length; if (n > 15e6) { no(new Error('too big')); req.destroy(); } else b += c; });
  req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } });
});
const str = (v, max = 500) => String(v ?? '').slice(0, max);

// active deal -> { productIds, discount } or null
function activeDeal() {
  const s = db.sections.find(x => x.type === 'deal' && x.visible);
  if (!s) return null;
  const c = s.content, d = Number(c.discount) || 0;
  if (c.endsAt && new Date(c.endsAt).getTime() < Date.now()) return null;
  return d > 0 ? { ids: c.productIds || [], discount: d } : null;
}
const priceOf = (p, deal) => deal && deal.ids.includes(p.id) ? Math.round(p.price * (1 - deal.discount / 100)) : p.price;

function publicSite() {
  const deal = activeDeal();
  return {
    brand: db.brand, theme: db.theme,
    sections: db.sections.filter(s => s.visible && !(s.type === 'deal' && !deal)),
    products: db.products.map(p => ({ ...p, salePrice: priceOf(p, deal), onDeal: !!(deal && deal.ids.includes(p.id)) })),
    reviews: db.reviews.filter(r => r.approved),
    feedbackForm: db.feedbackForm
  };
}

function analytics(days, all) {
  const since = Date.now() - days * 864e5;
  const ev = all.filter(e => e.t >= since);
  const views = ev.filter(e => e.type === 'view');
  const uniq = new Set(views.map(e => e.vid));
  const src = {};
  views.forEach(e => { const o = src[e.source] ||= { source: e.source, views: 0, vids: new Set() }; o.views++; o.vids.add(e.vid); });
  const bySource = Object.values(src).map(o => ({ source: o.source, views: o.views, visitors: o.vids.size })).sort((a, b) => b.views - a.views);
  const byDay = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5), k = d.toISOString().slice(0, 10);
    const dv = views.filter(e => new Date(e.t).toISOString().slice(0, 10) === k);
    byDay.push({ day: k, views: dv.length, visitors: new Set(dv.map(e => e.vid)).size });
  }
  const orders = db.orders.filter(o => new Date(o.date).getTime() >= since);
  return {
    days, views: views.length, visitors: uniq.size,
    addToCart: ev.filter(e => e.type === 'cart').length,
    orders: orders.length, revenue: orders.reduce((a, o) => a + o.total, 0),
    conversion: uniq.size ? +(orders.length / uniq.size * 100).toFixed(1) : 0,
    bySource, byDay
  };
}

async function api(req, res, url) {
  const p = url.pathname, m = req.method;
  if (p === '/api/site' && m === 'GET') return send(res, 200, publicSite());

  if (p === '/api/track' && m === 'POST') {
    const b = await readBody(req);
    await addEvent({ t: Date.now(), type: ['view', 'cart'].includes(b.type) ? b.type : 'view', vid: str(b.vid, 40), source: str(b.source || 'Direct', 60), ref: str(b.ref, 200) });
    return send(res, 200, { ok: 1 });
  }

  if (p === '/api/order' && m === 'POST') {
    const b = await readBody(req);
    const name = str(b.name, 80).trim(), phone = str(b.phone, 20).trim(), address = str(b.address, 300).trim();
    if (!name || !/^[0-9+\-\s]{7,20}$/.test(phone) || !address) return send(res, 400, { error: 'Please fill name, valid phone and address.' });
    const deal = activeDeal(), items = [];
    for (const it of Array.isArray(b.items) ? b.items : []) {
      const pr = db.products.find(x => x.id === it.id), q = Math.floor(Number(it.qty));
      if (!pr || !(q > 0)) continue;
      if (pr.stock < q) return send(res, 400, { error: pr.stock <= 0 ? `${pr.name} is out of stock.` : `Only ${pr.stock} left of ${pr.name}.` });
      items.push({ id: pr.id, name: pr.name, qty: q, price: priceOf(pr, deal) });
    }
    if (!items.length) return send(res, 400, { error: 'Cart is empty.' });
    items.forEach(i => { db.products.find(x => x.id === i.id).stock -= i.qty; });
    const total = items.reduce((a, i) => a + i.price * i.qty, 0);
    const order = { id: 'FB' + Date.now().toString().slice(-6), name, phone, address, note: str(b.note, 300), items, total, status: 'New', date: new Date().toISOString() };
    db.orders.unshift(order); await save();
    return send(res, 200, { ok: 1, order });
  }

  if (p === '/api/review' && m === 'POST') {
    const b = await readBody(req), name = str(b.name, 60).trim(), text = str(b.text, 600).trim();
    if (!name || !text) return send(res, 400, { error: 'Name and review required.' });
    db.reviews.unshift({ id: uid(), name, text, rating: Math.min(5, Math.max(1, Math.floor(Number(b.rating)) || 5)), approved: false, date: new Date().toISOString() });
    await save(); return send(res, 200, { ok: 1 });
  }

  if (p === '/api/feedback' && m === 'POST') {
    const b = await readBody(req), answers = [];
    for (const f of db.feedbackForm.fields) {
      const v = str(b.answers?.[f.id], 1000).trim();
      if (f.required && !v) return send(res, 400, { error: `"${f.label}" is required.` });
      answers.push({ label: f.label, value: v });
    }
    db.feedbacks.unshift({ id: uid(), date: new Date().toISOString(), answers });
    await save(); return send(res, 200, { ok: 1 });
  }

  if (p === '/api/admin/status' && m === 'GET') return send(res, 200, { setup: needsSetup() });

  if (p === '/api/admin/login' && m === 'POST') {
    const b = await readBody(req);
    if (needsSetup()) {
      if (String(b.password || '').length < 6) return send(res, 400, { error: 'Choose a password of at least 6 characters.' });
      setPw(String(b.password)); await save(); return send(res, 200, { token: makeToken() });
    }
    if (!checkPw(b.password)) return send(res, 401, { error: 'Wrong password' });
    return send(res, 200, { token: makeToken() });
  }

  if (p.startsWith('/api/admin/')) {
    if (!okToken(req.headers['x-token'])) return send(res, 401, { error: 'Unauthorized' });
    if (p === '/api/admin/data' && m === 'GET') { const { events, adminHash, adminSecret, ...rest } = db; return send(res, 200, rest); }
    if (p === '/api/admin/password' && m === 'POST') {
      const b = await readBody(req);
      if (!checkPw(b.old)) return send(res, 400, { error: 'Current password is wrong.' });
      if (String(b.password || '').length < 6) return send(res, 400, { error: 'New password must be at least 6 characters.' });
      setPw(String(b.password)); await save(); return send(res, 200, { token: makeToken() });
    }
    if (p === '/api/admin/analytics' && m === 'GET') return send(res, 200, analytics(Math.min(90, Number(url.searchParams.get('days')) || 14), await getEvents()));
    if (p === '/api/admin/save' && m === 'PUT') {
      const b = await readBody(req);
      if (!['brand', 'theme', 'sections', 'products', 'feedbackForm'].includes(b.key)) return send(res, 400, { error: 'bad key' });
      db[b.key] = b.value; await save(); return send(res, 200, { ok: 1 });
    }
    if (p === '/api/admin/item' && m === 'POST') {
      const b = await readBody(req);
      if (!['orders', 'reviews', 'feedbacks'].includes(b.key)) return send(res, 400, { error: 'bad key' });
      const list = db[b.key], i = list.findIndex(x => x.id === b.id);
      if (b.op === 'add' && b.key === 'reviews') list.unshift({ id: uid(), date: new Date().toISOString(), approved: true, ...b.data });
      else if (i < 0) return send(res, 404, { error: 'not found' });
      else if (b.op === 'patch') Object.assign(list[i], b.data);
      else if (b.op === 'delete') list.splice(i, 1);
      await save(); return send(res, 200, { ok: 1 });
    }
    if (p === '/api/admin/upload' && m === 'POST') {
      const b = await readBody(req), mt = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,(.+)$/.exec(b.data || '');
      if (!mt) return send(res, 400, { error: 'Image only' });
      const ext = mt[1].startsWith('svg') ? 'svg' : mt[1] === 'jpeg' ? 'jpg' : mt[1];
      const fn = uid() + Date.now().toString(36) + '.' + ext;
      const buf = Buffer.from(mt[2], 'base64');
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { put } = require('@vercel/blob');
        const r = await put('uploads/' + fn, buf, { access: 'public', contentType: 'image/' + (ext === 'svg' ? 'svg+xml' : ext === 'jpg' ? 'jpeg' : ext), token: process.env.BLOB_READ_WRITE_TOKEN });
        return send(res, 200, { url: r.url });
      }
      fs.writeFileSync(path.join(UPLOADS, fn), buf);
      return send(res, 200, { url: '/uploads/' + fn });
    }
  }
  send(res, 404, { error: 'Not found' });
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) { await load(); return await api(req, res, url); }
    let f = decodeURIComponent(url.pathname);
    if (f === '/') f = '/index.html'; else if (f === '/admin') f = '/admin.html';
    const full = path.join(PUB, path.normalize(f));
    if (!full.startsWith(PUB) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(full).pipe(res);
  } catch (e) { send(res, 500, { error: e.message }); }
};
