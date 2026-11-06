const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => 'Rs ' + n;
let S, cart = {};
try { cart = JSON.parse(localStorage.fbCart || '{}'); } catch { }
const saveCart = () => { try { localStorage.fbCart = JSON.stringify(cart); } catch { } };

/* ---------- analytics ---------- */
function source() {
  const q = new URLSearchParams(location.search), u = q.get('utm_source') || q.get('ref') || q.get('source');
  if (u) return u[0].toUpperCase() + u.slice(1).toLowerCase();
  if (!document.referrer) return 'Direct';
  let h; try { h = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch { return 'Direct'; }
  if (h === location.hostname) return 'Direct';
  const map = { google: 'Google', bing: 'Bing', facebook: 'Facebook', 'fb.com': 'Facebook', instagram: 'Instagram', 'l.instagram': 'Instagram', whatsapp: 'WhatsApp', 'wa.me': 'WhatsApp', youtube: 'YouTube', twitter: 'Twitter/X', 't.co': 'Twitter/X', linkedin: 'LinkedIn', 'lnkd.in': 'LinkedIn', pinterest: 'Pinterest', reddit: 'Reddit' };
  for (const k in map) if (h.includes(k)) return map[k];
  return h;
}
function vid() { try { return localStorage.fbVid || (localStorage.fbVid = Math.random().toString(36).slice(2) + Date.now().toString(36)); } catch { return 'anon'; } }
function track(type) {
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, vid: vid(), source: sessionStorage.fbSrc || source(), ref: document.referrer }) }).catch(() => { });
}
try { if (!sessionStorage.fbSrc) sessionStorage.fbSrc = source(); } catch { }

/* ---------- theme ---------- */
function applyTheme() {
  const t = S.theme, r = document.documentElement.style;
  r.setProperty('--primary', t.primary); r.setProperty('--accent', t.accent); r.setProperty('--bg', t.bg);
  r.setProperty('--text', t.text); r.setProperty('--card', t.card);
  r.setProperty('--fs', t.fontSize + 'px');
  r.setProperty('--font', `'${t.font}',system-ui,sans-serif`); r.setProperty('--hfont', `'${t.headingFont}',var(--font)`);
  const fams = [...new Set([t.font, t.headingFont])].map(f => 'family=' + f.replace(/ /g, '+') + ':wght@400;500;600;700').join('&');
  let l = $('#gfont'); if (!l) { l = document.createElement('link'); l.id = 'gfont'; l.rel = 'stylesheet'; document.head.appendChild(l); }
  l.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
  $('#brandName').textContent = S.brand.name; $('#logoEmoji').textContent = S.brand.logo;
  document.title = `${S.brand.name} – ${S.brand.tagline}`;
  $('#footTxt').innerHTML = `${esc(S.brand.name)} — ${esc(S.brand.tagline)}` + (S.brand.phone ? `<br>📞 <a href="tel:${esc(S.brand.phone)}" style="color:inherit">${esc(S.brand.phone)}</a>` : '');
  $('#yr').textContent = new Date().getFullYear();
  const n = $('#notice'); n.textContent = S.brand.notice || ''; n.style.display = S.brand.notice ? 'block' : 'none';
  document.documentElement.style.setProperty('--nh', S.brand.notice ? '34px' : '0px');
  const wa = $('#wa'), num = (S.brand.whatsapp || '').replace(/\D/g, '');
  wa.style.display = num ? 'grid' : 'none'; wa.href = `https://wa.me/${num}?text=${encodeURIComponent('Hi ' + S.brand.name + ', I want to order.')}`;
}

/* ---------- section renderers ---------- */
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const pic = p => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : `<span>${esc(p.emoji || '🍽️')}</span>`;
function card(p) {
  const oos = p.stock <= 0, low = !oos && p.stock <= 5;
  const was = p.onDeal ? p.price : Number(p.oldPrice) || 0, off = was > p.salePrice ? Math.round((1 - p.salePrice / was) * 100) : 0;
  return `<div class="card tilt${oos ? ' out' : ''}" data-q="${esc((p.name + ' ' + p.desc + ' ' + p.category).toLowerCase())}">
    ${oos ? '<span class="badge oos">Out of stock</span>' : low ? `<span class="badge low">Only ${p.stock} left</span>` : off ? `<span class="badge deal">${off}% OFF</span>` : ''}
    <div class="pic">${pic(p)}${oos ? '' : `<button class="plus" data-id="${p.id}" aria-label="Add ${esc(p.name)} to cart">+</button>`}</div>
    <h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p>
    <div class="price"><b>${inr(p.salePrice)}</b>${off ? `<s>${inr(was)}</s>` : ''}</div></div>`;
}
const groupNames = () => S.sections.filter(s => s.type === 'productgroup').map(s => (s.content.group || '').toLowerCase());
const R = {
  hero: c => {
    const w = c.title.split(' '), i = Math.max(1, Math.floor(w.length * .6));
    const t = esc(w.slice(0, i).join(' ')) + ' <em>' + esc(w.slice(i).join(' ')) + '</em>';
    return `<div class="blob" style="right:-80px;top:15%"></div>
    <div><span class="eyebrow">${esc(c.eyebrow)}</span><h1>${t}</h1><p>${esc(c.subtitle)}</p><a class="btn" href="#products">${esc(c.ctaText)} →</a></div>
    <div class="hero-art">${c.image ? `<img class="main" src="${esc(c.image)}" alt="">` : `<div class="main">${esc(c.emoji)}</div>`}
    <i style="top:6%;left:10%;animation-delay:.3s">🔥</i><i style="top:70%;left:0;animation-delay:1s">🌶️</i><i style="top:12%;right:6%;animation-delay:1.6s">🍗</i><i style="bottom:6%;right:12%;animation-delay:.8s">🥟</i><i style="top:45%;right:-2%;animation-delay:2s">✨</i></div>`;
  },
  marquee: c => { const it = c.items.split('\n').filter(Boolean).map(x => `<span>${esc(x)}</span>`).join(''); return `<div class="marquee"><div>${it}${it}${it}${it}</div></div>`; },
  products: c => {
    const list = menuProducts(), cats = ['All', ...new Set(list.map(p => p.category).filter(Boolean))];
    return `<h2>${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p>
    <div class="chips">${cats.map((x, i) => `<button class="chip${i ? '' : ' on'}" data-cat="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div class="grid" id="pgrid">${list.map(card).join('')}</div>`;
  },
  productgroup: c => {
    const list = S.products.filter(p => (p.category || '').toLowerCase() === (c.group || '').toLowerCase());
    if (!list.length) return '';
    return `<h2>${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p><div class="grid">${list.map(card).join('')}</div>`;
  },
  deal: c => {
    const ps = S.products.filter(p => p.onDeal);
    return `<div class="dealbox"><div class="bigoff">${Number(c.discount)}% OFF</div><h2>${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p>
    <div class="timer" data-end="${esc(c.endsAt)}"><div><b>00</b><small>HOURS</small></div><div><b>00</b><small>MIN</small></div><div><b>00</b><small>SEC</small></div></div>
    <div class="grid">${ps.map(card).join('')}</div></div>`;
  },
  features: c => `<h2>${esc(c.title)}</h2><div class="feats" style="margin-top:2.5rem">${c.items.split('\n').filter(Boolean).map(l => { const [e, t, d] = l.split('|'); return `<div class="feat tilt"><i>${esc(e)}</i><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`; }).join('')}</div>`,
  gallery: c => (c.images || []).length ? `<h2>${esc(c.title)}</h2><div class="gal" style="margin-top:2.5rem">${c.images.map(i => `<img src="${esc(i)}" alt="" loading="lazy">`).join('')}</div>` : '',
  about: c => `<div class="about${c.image ? '' : ' noimg'}"><div><h2>${esc(c.title)}</h2><p>${esc(c.body)}</p></div>${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}</div>`,
  reviews: c => `<h2>${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p>
    <div class="revs">${S.reviews.map(r => `<div class="rev tilt"><div class="stars">${stars(r.rating)}</div><p>“${esc(r.text)}”</p><b>— ${esc(r.name)}</b></div>`).join('') || '<p class="muted" style="text-align:center">No reviews yet. Be the first!</p>'}</div>
    <form class="formbox" id="revForm"><h3>Write a review</h3>
    <label class="f">Your name</label><input name="name" required maxlength="60">
    <label class="f">Rating</label><div class="starpick" id="starpick">${[1, 2, 3, 4, 5].map(i => `<span data-v="${i}" class="on">★</span>`).join('')}</div>
    <label class="f">Your review</label><textarea name="text" rows="3" required maxlength="600"></textarea>
    <button class="btn">Submit review</button></form>`,
  feedback: c => {
    const f = S.feedbackForm;
    const field = x => {
      let i;
      if (x.type === 'textarea') i = `<textarea name="${x.id}" rows="3" ${x.required ? 'required' : ''}></textarea>`;
      else if (x.type === 'select') i = `<select name="${x.id}" ${x.required ? 'required' : ''}><option value="">Select…</option>${x.options.split(',').map(o => `<option>${esc(o.trim())}</option>`).join('')}</select>`;
      else if (x.type === 'rating') i = `<input type="hidden" name="${x.id}" value="5"><div class="starpick fbstar">${[1, 2, 3, 4, 5].map(n => `<span data-v="${n}" class="on">★</span>`).join('')}</div>`;
      else i = `<input type="${x.type === 'email' ? 'email' : 'text'}" name="${x.id}" ${x.required ? 'required' : ''}>`;
      return `<label class="f">${esc(x.label)}${x.required ? ' *' : ''}</label>${i}`;
    };
    return `<h2>${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p><form class="formbox" id="fbForm" style="margin-top:0"><h3>${esc(f.title)}</h3>${f.fields.map(field).join('')}<button class="btn">Send feedback</button></form>`;
  },
  text: c => `<div class="about${c.image ? '' : ' noimg'}"><div><h2>${esc(c.title)}</h2><p>${esc(c.body)}</p></div>${c.image ? `<img src="${esc(c.image)}" alt="">` : ''}</div>`
};

const menuProducts = () => { const g = groupNames(); return S.products.filter(p => !g.includes((p.category || '').toLowerCase())); };
const isKids = s => s.type === 'productgroup' && /kid|child|bachon|baby/i.test(s.content.group + ' ' + s.content.title);
function render() {
  const app = $('#app');
  const shown = [];
  let html = S.sections.map(s => {
    const h = (R[s.type] || R.text)(s.content);
    if (!h) return '';
    shown.push(s);
    const deco = isKids(s) ? '<i class="kd k1">🎈</i><i class="kd k2">🧸</i><i class="kd k3">⭐</i><i class="kd k4">🍭</i>' : '';
    return `<section id="${esc(s.id)}" class="sec${s.type === 'hero' ? ' hero' : ''}${isKids(s) ? ' kids' : ''} ${s.type === 'marquee' ? '' : 'reveal'}" ${s.type === 'marquee' ? 'style="padding:1.5rem 0;overflow:hidden"' : ''}>${deco}${h}</section>`;
  });
  // sticky category bar + search, right after the hero
  const links = shown.filter(s => ['productgroup', 'products', 'deal'].includes(s.type));
  const bar = links.length ? `<div id="catbar"><div class="cb-in"><div class="cb-links">${links.map(s => `<a href="#${esc(s.id)}" data-t="${esc(s.id)}">${esc(s.content.title)}</a>`).join('')}</div>
    <label class="cb-search"><input id="q" type="search" placeholder="Search items & deals…" autocomplete="off"><span>🔍</span></label></div></div><p id="noq" class="sub" style="display:none;padding:2rem">No items match your search.</p>` : '';
  const hi = shown.findIndex(s => s.type === 'hero');
  const at = hi >= 0 ? hi + 1 : 0;
  html = html.filter(Boolean); html.splice(at, 0, bar);
  app.innerHTML = html.join('');
  $('#nav').innerHTML = shown.filter(s => s.content.title && !['hero', 'marquee'].includes(s.type)).map(s => `<a href="#${esc(s.id)}">${esc(s.content.title.split(' ').slice(0, 2).join(' '))}</a>`).join('');
  wire(); observe(); tick();
  const q = $('#q'); if (q) q.oninput = applySearch;
}
function applySearch() {
  const q = ($('#q')?.value || '').trim().toLowerCase();
  let any = false;
  document.querySelectorAll('.card').forEach(c => { const m = !q || c.dataset.q.includes(q); c.style.display = m ? '' : 'none'; if (m) any = true; });
  document.querySelectorAll('section.sec').forEach(s => { const cs = s.querySelectorAll('.card'); if (cs.length) s.style.display = q && ![...cs].some(c => c.style.display !== 'none') ? 'none' : ''; if (q) s.classList.add('in'); });
  const n = $('#noq'); if (n) n.style.display = q && !any ? 'block' : 'none';
}
function spy() {
  const links = [...document.querySelectorAll('.cb-links a')]; if (!links.length) return;
  let cur = null; links.forEach(a => { const el = document.getElementById(a.dataset.t); if (el && el.getBoundingClientRect().top < innerHeight * .4 && el.style.display !== 'none') cur = a; });
  links.forEach(a => a.classList.toggle('on', a === cur));
  if (cur) { const l = cur.parentElement; l.scrollTo({ left: cur.offsetLeft - 20, behavior: 'smooth' }); }
}
addEventListener('scroll', spy, { passive: true });

/* ---------- interactions ---------- */
function wire() {
  document.querySelectorAll('.plus').forEach(b => b.onclick = e => { e.stopPropagation(); addCart(b.dataset.id, b); });
  document.querySelectorAll('.chip').forEach(b => b.onclick = () => {
    document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === b));
    const base = menuProducts(), list = b.dataset.cat === 'All' ? base : base.filter(p => p.category === b.dataset.cat);
    $('#pgrid').innerHTML = list.map(card).join(''); wire(); tilt(); applySearch();
  });
  document.querySelectorAll('.starpick').forEach(sp => sp.onclick = e => {
    const v = +e.target.dataset.v; if (!v) return;
    sp.dataset.val = v; sp.querySelectorAll('span').forEach(s => s.classList.toggle('on', +s.dataset.v <= v));
    const h = sp.previousElementSibling; if (h && h.type === 'hidden') h.value = v;
  });
  const rf = $('#revForm'); if (rf) rf.onsubmit = async e => {
    e.preventDefault();
    const r = await post('/api/review', { name: rf.name.value, text: rf.text.value, rating: +($('#starpick').dataset.val || 5) });
    if (r.ok) { rf.reset(); toast('Thanks! Your review will appear after approval 💛'); }
  };
  const ff = $('#fbForm'); if (ff) ff.onsubmit = async e => {
    e.preventDefault();
    const answers = {}; S.feedbackForm.fields.forEach(f => answers[f.id] = ff.elements[f.id]?.value || '');
    const r = await post('/api/feedback', { answers });
    if (r.ok) { ff.reset(); toast('Feedback sent. Thank you! 🙏'); }
  };
  tilt();
}
function tilt() {
  document.querySelectorAll('.tilt').forEach(c => {
    c.onmousemove = e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`; };
    c.onmouseleave = () => c.style.transform = '';
  });
}
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}
async function post(url, body) {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), j = await r.json();
    if (!r.ok) { toast('⚠️ ' + (j.error || 'Something went wrong')); return {}; } return j;
  } catch { toast('⚠️ Network error'); return {}; }
}
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t.h); t.h = setTimeout(() => t.classList.remove('on'), 3200); }
function tick() {
  const t = document.querySelector('.timer'); if (!t) return;
  const tf = () => {
    let end = t.dataset.end ? new Date(t.dataset.end).getTime() : 0;
    if (!end) { const d = new Date(); d.setHours(23, 59, 59, 999); end = d.getTime(); }
    const s = Math.max(0, Math.floor((end - Date.now()) / 1000)), p = n => String(n).padStart(2, '0');
    const b = t.querySelectorAll('b'); b[0].textContent = p(Math.floor(s / 3600)); b[1].textContent = p(Math.floor(s % 3600 / 60)); b[2].textContent = p(s % 60);
  };
  tf(); clearInterval(window.tk); window.tk = setInterval(tf, 1000);
}

/* ---------- cart ---------- */
const prod = id => S.products.find(p => p.id === id);
function addCart(id, btn) {
  const p = prod(id); if (!p) return;
  const q = (cart[id] || 0) + 1;
  if (q > p.stock) return toast(`Only ${p.stock} in stock`);
  cart[id] = q; saveCart(); renderCart(); track('cart');
  const c = $('#cartBtn'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  toast(`${p.emoji || '🍽️'} ${p.name} added`);
}
function renderCart() {
  Object.keys(cart).forEach(id => { const p = prod(id); if (!p || p.stock <= 0) delete cart[id]; else if (cart[id] > p.stock) cart[id] = p.stock; });
  saveCart();
  const ids = Object.keys(cart), n = ids.reduce((a, i) => a + cart[i], 0);
  $('#cartCount').textContent = n;
  const total = ids.reduce((a, i) => a + prod(i).salePrice * cart[i], 0);
  $('#cartItems').innerHTML = ids.length ? ids.map(i => { const p = prod(i); return `<div class="ci"><div class="e">${pic(p)}</div><div class="i"><b>${esc(p.name)}</b>${inr(p.salePrice)}</div><div class="qty"><button data-m="${i}">−</button><b>${cart[i]}</b><button data-p="${i}">+</button></div></div>`; }).join('') : '<div class="empty"><div>🛒</div>Your cart is empty</div>';
  $('#cartFoot').innerHTML = ids.length ? `<div class="tot"><span>Total</span><span>${inr(total)}</span></div>
    <input id="oName" placeholder="Your name" maxlength="80"><input id="oPhone" placeholder="Phone number" maxlength="20" type="tel"><textarea id="oAddr" rows="2" placeholder="Delivery address" maxlength="300"></textarea><input id="oNote" placeholder="Note (optional)" maxlength="300">
    <button class="btn" id="placeBtn" style="width:100%;border:0">Place order · Cash on delivery</button>` : '';
  document.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { cart[b.dataset.m]--; if (cart[b.dataset.m] <= 0) delete cart[b.dataset.m]; renderCart(); });
  document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { const p = prod(b.dataset.p); if (cart[p.id] < p.stock) cart[p.id]++; else toast(`Only ${p.stock} in stock`); renderCart(); });
  const pb = $('#placeBtn'); if (pb) pb.onclick = placeOrder;
}
async function placeOrder() {
  const r = await post('/api/order', { name: $('#oName').value, phone: $('#oPhone').value, address: $('#oAddr').value, note: $('#oNote').value, items: Object.keys(cart).map(id => ({ id, qty: cart[id] })) });
  if (!r.ok) { await refresh(); return; }
  cart = {}; saveCart(); await refresh(); toggleCart(false);
  const num = (S.brand.whatsapp || '').replace(/\D/g, '');
  const msg = `New order #${r.order.id}\n` + r.order.items.map(i => `${i.qty} x ${i.name} (${inr(i.price)})`).join('\n') + `\nTotal: ${inr(r.order.total)}\nName: ${r.order.name}\nPhone: ${r.order.phone}\nAddress: ${r.order.address}`;
  const wa = num ? `<a class="btn" style="background:#25d366;box-shadow:none;margin-bottom:.6rem" target="_blank" rel="noopener" href="https://wa.me/${num}?text=${encodeURIComponent(msg)}">Confirm on WhatsApp</a><br>` : '';
  $('#modal').innerHTML = `<div class="box"><div style="font-size:4rem">🎉</div><h2>Order placed!</h2><p>Order <b>#${esc(r.order.id)}</b> · ${inr(r.order.total)}<br>We'll call ${esc(r.order.phone)} to confirm delivery. Pay on delivery.</p><br>${wa}<button class="btn" id="mclose" style="border:0">Awesome</button></div>`;
  $('#modal').classList.add('on'); $('#mclose').onclick = () => $('#modal').classList.remove('on'); boom();
}
async function refresh() { S = await (await fetch('/api/site')).json(); render(); renderCart(); }
function toggleCart(on) { $('#drawer').classList.toggle('on', on); $('#overlay').classList.toggle('on', on); }
$('#cartBtn').onclick = () => toggleCart(true); $('#closeCart').onclick = $('#overlay').onclick = () => toggleCart(false);
addEventListener('scroll', () => $('#hdr').classList.toggle('sc', scrollY > 30), { passive: true });
addEventListener('scroll', () => { const b = document.querySelector('.blob'); if (b) b.style.transform = `translateY(${scrollY * .2}px)`; }, { passive: true });

/* ---------- confetti ---------- */
function boom() {
  const cv = $('#confetti'), x = cv.getContext('2d'); cv.width = innerWidth; cv.height = innerHeight;
  const cols = ['#e8451e', '#ffb703', '#16a34a', '#3b82f6', '#ec4899'];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - .5) * 18, vy: Math.random() * -16 - 4, s: Math.random() * 8 + 4, c: cols[Math.random() * 5 | 0], r: Math.random() * 6 }));
  let f = 0; (function a() {
    x.clearRect(0, 0, cv.width, cv.height);
    ps.forEach(p => { p.vy += .4; p.x += p.vx; p.y += p.vy; p.r += .2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s / 2); x.restore(); });
    if (++f < 150) requestAnimationFrame(a); else x.clearRect(0, 0, cv.width, cv.height);
  })();
}

(async function init() {
  S = await (await fetch('/api/site')).json();
  applyTheme(); render(); renderCart(); track('view');
})();
