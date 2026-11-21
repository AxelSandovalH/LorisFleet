// Nav: fondo al hacer scroll + menú móvil
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Tarifas: pestañas por barco (también desde los botones de la flota)
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
function showTab(id) {
  tabs.forEach(t => { const on = t.dataset.tab === id; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); });
  panels.forEach(p => p.classList.toggle('active', p.dataset.panel === id));
}
tabs.forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
document.querySelectorAll('[data-boat]').forEach(b => b.addEventListener('click', () => showTab(b.dataset.boat)));

// Galería: filtros por barco, "ver más" y visor con pie de foto, contador y deslizamiento
const gallery = document.getElementById('gallery');
const gItems = [...gallery.querySelectorAll('.g-item')];
const chips = [...document.querySelectorAll('.g-chip')];
const gMore = document.getElementById('gMore');
const gCount = document.getElementById('gCount');
const enG = document.documentElement.lang === 'en';
let gFilter = 'all', gExpanded = false;
function applyGallery() {
  gItems.forEach(a => {
    const match = gFilter === 'all' || a.dataset.boat === gFilter;
    const hide = !match || (gFilter === 'all' && !gExpanded && a.classList.contains('extra'));
    a.classList.toggle('g-hide', hide);
  });
  gMore.hidden = gFilter !== 'all';
  gMore.textContent = gExpanded ? gMore.dataset.less : gMore.dataset.more;
  const n = gItems.filter(a => !a.classList.contains('g-hide')).length;
  gCount.textContent = n + (enG ? ' photos' : ' fotos');
}
chips.forEach(c => c.addEventListener('click', () => {
  gFilter = c.dataset.f;
  chips.forEach(x => x.classList.toggle('active', x === c));
  applyGallery();
}));
gMore.addEventListener('click', () => { gExpanded = !gExpanded; applyGallery(); });
applyGallery();

const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let shown = [], idx = 0;
function openLb(i) {
  shown = gItems.filter(a => !a.classList.contains('g-hide'));
  idx = (i + shown.length) % shown.length;
  const a = shown[idx];
  lbImg.classList.add('swap');
  lbImg.onload = () => lbImg.classList.remove('swap');
  lbImg.src = a.href;
  lbImg.alt = a.querySelector('img').alt;
  document.getElementById('lbCap').textContent = lbImg.alt;
  document.getElementById('lbN').textContent = (idx + 1) + ' / ' + shown.length;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  [shown[(idx + 1) % shown.length], shown[(idx - 1 + shown.length) % shown.length]].forEach(n => { new Image().src = n.href; });
}
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
gItems.forEach(a => a.addEventListener('click', e => { e.preventDefault(); shown = gItems.filter(x => !x.classList.contains('g-hide')); openLb(shown.indexOf(a)); }));
document.getElementById('lbClose').addEventListener('click', closeLb);
document.getElementById('lbPrev').addEventListener('click', () => openLb(idx - 1));
document.getElementById('lbNext').addEventListener('click', () => openLb(idx + 1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') openLb(idx - 1);
  if (e.key === 'ArrowRight') openLb(idx + 1);
});
let tx = null;
lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 50) openLb(idx + (dx < 0 ? 1 : -1));
});

// Aparición suave de secciones
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.why-list li, .boat, .card, blockquote, .g-item, .banner').forEach(el => {
  el.classList.add('reveal');
  io.observe(el);
});

document.getElementById('year').textContent = new Date().getFullYear();

// Barra de progreso, enlace activo y botón para volver arriba
const bar = document.createElement('div');
bar.className = 'progress';
document.body.appendChild(bar);
const toTop = document.createElement('button');
toTop.className = 'to-top';
toTop.type = 'button';
toTop.textContent = '\u2191';
toTop.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Back to top' : 'Volver arriba');
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
document.body.appendChild(toTop);
const onScrollUi = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  toTop.classList.toggle('show', scrollY > innerHeight * 0.8);
};
onScrollUi();
addEventListener('scroll', onScrollUi, { passive: true });
const linkFor = {};
links.querySelectorAll('a[href^="#"]').forEach(a => { linkFor[a.getAttribute('href').slice(1)] = a; });
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    Object.values(linkFor).forEach(a => a.classList.remove('active'));
    const a = linkFor[e.target.id];
    if (a) a.classList.add('active');
  }
}), { rootMargin: '-45% 0px -50% 0px' });
Object.keys(linkFor).forEach(id => { const s = document.getElementById(id); if (s) spy.observe(s); });

// Flota: miniaturas que cambian la foto principal
document.querySelectorAll('.boat-media').forEach(m => {
  const main = m.querySelector('.boat-img img');
  m.querySelectorAll('.thumb').forEach(t => t.addEventListener('click', () => {
    if (t.classList.contains('active')) return;
    m.querySelectorAll('.thumb').forEach(x => x.classList.toggle('active', x === t));
    main.classList.add('swap');
    setTimeout(() => { main.src = t.dataset.src; main.onload = () => main.classList.remove('swap'); }, 200);
  }));
});

// Tarifas: formato de precio y precio por pescador; recoge las salidas para el motor de reservas
const TRIPS = {};
(() => {
  const en = document.documentElement.lang === 'en';
  const fmt = n => n.toLocaleString(en ? 'en-US' : 'es-MX');
  document.querySelectorAll('.panel').forEach(panel => {
    const tab = document.querySelector('.tab[data-tab="' + panel.dataset.panel + '"]');
    const boat = tab ? tab.textContent.split('\u00b7')[0].trim() : '';
    panel.querySelectorAll('.card').forEach(card => {
      const price = card.querySelector('.price');
      const small = price.querySelector('small');
      const m = price.firstChild.textContent.match(/MXN\s*([\d,]+)/);
      if (!m) return;
      const amount = parseInt(m[1].replace(/,/g, ''), 10);
      price.firstChild.textContent = '$' + m[1];
      const cur = document.createElement('span');
      cur.className = 'cur';
      cur.textContent = 'MXN';
      price.insertBefore(cur, small);
      const cap = (card.textContent.match(/(?:Hasta|Up to)\s+(\d+)/) || [])[1];
      const isBoat = small && /barco|boat/i.test(small.textContent);
      const shared = small && /personas|people/i.test(small.textContent);
      if (cap && isBoat) {
        const p = document.createElement('p');
        p.className = 'per';
        p.textContent = en
          ? '\u2248 $' + fmt(Math.round(amount / cap)) + ' per angler with a full boat'
          : '\u2248 $' + fmt(Math.round(amount / cap)) + ' por pescador con el barco lleno';
        price.after(p);
      }
      (TRIPS[panel.dataset.panel] = TRIPS[panel.dataset.panel] || []).push({
        boat, name: card.querySelector('h3').textContent.trim(),
        hrs: card.querySelector('.card-hrs').textContent.trim(),
        amount, cap: shared ? 2 : parseInt(cap || '8', 10), shared, featured: card.classList.contains('featured'),
        btn: card.querySelector('.btn')
      });
    });
  });
})();

// Motor de reservas: asistente en modal de 3 pasos (fecha, salida, contacto)
(() => {
  const en = document.documentElement.lang === 'en';
  const loc = en ? 'en-US' : 'es-MX';
  // Si algún día hay backend, pon aquí la URL: recibirá un POST con la solicitud en JSON.
  const BOOKING_ENDPOINT = '';
  const waBase = ((document.querySelector('.wa-float') || {}).href || 'https://wa.me/').split('?')[0];
  const mailTo = 'reservas@lorisfleet.com';
  const L = en ? {
    eyebrow: "LORI'S FLEET CHARTER", title: 'BOOK YOUR TRIP', close: 'Close', back: '← Back', cont: 'CONTINUE',
    pickDate: 'SELECT A DATE', contDate: d => 'CONTINUE — ' + d, boat: 'Boat', trip: 'Trip type', anglers: 'Number of anglers',
    max: n => 'Max ' + n + ' anglers on this boat', sharedNote: 'Shared tour: price covers 2 seats', notes: 'Special requests / notes',
    notesPh: 'Target species, experience level, anything we should know…', name: 'Full name', phone: 'WhatsApp', email: 'Email',
    namePh: 'John Smith', phonePh: '+1 555 000 0000', emailPh: 'you@email.com', date: 'Date', ang: 'Anglers', total: 'Total',
    confirm: 'CONFIRM BOOKING', upTo: n => 'Up to ' + n + ' anglers', hi: "Hi, I'd like to book a charter with Lori's Fleet:",
    k: { boat: 'Boat', trip: 'Trip', date: 'Date', ang: 'Anglers', name: 'Name', phone: 'WhatsApp', email: 'Email', notes: 'Notes', total: 'Estimated total' },
    doneT: 'REQUEST READY!', doneP: 'One last step: send it on WhatsApp so the captain can confirm availability. Nothing is charged now.',
    sendWa: 'SEND ON WHATSAPP', sendMail: 'Send by email instead', closeBtn: 'Close', subj: 'Charter booking request', seats: '2 seats', pp: 'per angler'
  } : {
    eyebrow: "CHARTER LORI'S FLEET", title: 'RESERVA TU SALIDA', close: 'Cerrar', back: '← Atrás', cont: 'CONTINUAR',
    pickDate: 'ELIGE UNA FECHA', contDate: d => 'CONTINUAR — ' + d, boat: 'Embarcación', trip: 'Tipo de salida', anglers: 'Número de pescadores',
    max: n => 'Máximo ' + n + ' pescadores en este barco', sharedNote: 'Tour compartido: el precio cubre 2 lugares', notes: 'Peticiones especiales / notas',
    notesPh: 'Especie que buscas, nivel de experiencia, algo que debamos saber…', name: 'Nombre completo', phone: 'WhatsApp', email: 'Correo',
    namePh: 'Juan Pérez', phonePh: '+52 314 000 0000', emailPh: 'tu@correo.com', date: 'Fecha', ang: 'Pescadores', total: 'Total',
    confirm: 'CONFIRMAR RESERVA', upTo: n => 'Hasta ' + n + ' pescadores', hi: 'Hola, quiero reservar un charter con Lori’s Fleet:',
    k: { boat: 'Barco', trip: 'Salida', date: 'Fecha', ang: 'Pescadores', name: 'Nombre', phone: 'WhatsApp', email: 'Correo', notes: 'Notas', total: 'Total estimado' },
    doneT: '¡SOLICITUD LISTA!', doneP: 'Un último paso: envíala por WhatsApp para que el capitán confirme disponibilidad. No se cobra nada ahora.',
    sendWa: 'ENVIAR POR WHATSAPP', sendMail: 'Enviar por correo', closeBtn: 'Cerrar', subj: 'Solicitud de reserva de charter', seats: '2 lugares', pp: 'por pescador'
  };
  const fmt = n => '$' + n.toLocaleString(loc) + ' MXN';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const nice = (v, long) => new Date(v + 'T12:00:00').toLocaleDateString(loc, long ? { weekday: 'short', month: 'short', day: 'numeric' } : { day: 'numeric', month: 'short' });
  const boats = Object.keys(TRIPS);
  if (!boats.length) return;
  const boatCap = id => Math.max(...TRIPS[id].filter(t => !t.shared).map(t => t.cap));
  const featuredIdx = id => Math.max(0, TRIPS[id].findIndex(t => t.featured));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDate = new Date(today.getTime() + 864e5);
  const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('lf-contact') || '{}'); } catch (e) {}

  const S = { step: 1, month: new Date(minDate.getFullYear(), minDate.getMonth(), 1), date: '', boat: boats[0], trip: featuredIdx(boats[0]), guests: 2, notes: '', name: saved.name || '', phone: saved.phone || '', email: saved.email || '' };
  let pre = null, opener = null;

  const ov = document.createElement('div');
  ov.className = 'bk-ov'; ov.hidden = true;
  ov.innerHTML = '<div class="bk" role="dialog" aria-modal="true" aria-labelledby="bkT"><div class="bk-head"><button type="button" class="bk-x" aria-label="' + L.close + '">×</button><p class="bk-eyebrow">' + L.eyebrow + '</p><h2 class="bk-title" id="bkT">' + L.title + '</h2><ol class="bk-steps" aria-hidden="true"><li></li><li></li><li></li></ol></div><div class="bk-body"></div></div>';
  document.body.appendChild(ov);
  const body = ov.querySelector('.bk-body');
  const stepEls = ov.querySelectorAll('.bk-steps li');

  const cur = () => TRIPS[S.boat][S.trip];
  const total = () => cur().amount;
  function summary() {
    const t = cur();
    return '<div class="bk-sum"><div><span>' + L.date + '</span><b>' + nice(S.date, true) + '</b></div><div><span>' + L.boat + '</span><b>' + t.boat + '</b></div><div><span>' + L.trip + '</span><b>' + t.name + ' — ' + fmt(t.amount) + '</b></div><div><span>' + L.ang + '</span><b>' + (t.shared ? L.seats : S.guests) + '</b></div></div>';
  }
  function setSteps() {
    stepEls.forEach((li, i) => { li.className = S.step > i + 1 || S.step === 4 ? 'done' : S.step === i + 1 ? 'on' : ''; li.textContent = S.step > i + 1 || S.step === 4 ? '✓' : i + 1; });
  }
  function render() {
    setSteps();
    if (S.step === 1) renderDate(); else if (S.step === 2) renderTrip(); else if (S.step === 3) renderContact(); else renderDone();
  }

  function renderDate() {
    const y = S.month.getFullYear(), m = S.month.getMonth();
    const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
    const wd = Array.from({ length: 7 }, (_, i) => { const n = new Date(2023, 0, 1 + i).toLocaleDateString(loc, { weekday: 'short' }).replace('.', ''); return n.charAt(0).toUpperCase() + n.slice(1, 2); });
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span></span>';
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d), v = ymd(dt), off = dt < minDate || dt > maxDate;
      cells += '<button type="button" class="bk-day' + (v === S.date ? ' sel' : '') + '" data-d="' + v + '"' + (off ? ' disabled' : '') + '>' + d + '</button>';
    }
    const label = S.month.toLocaleDateString(loc, { month: 'long', year: 'numeric' });
    body.innerHTML = '<div class="bk-cal"><div class="bk-month"><button type="button" class="bk-nav" data-nav="-1" aria-label="‹"' + (y === minDate.getFullYear() && m === minDate.getMonth() ? ' disabled' : '') + '>‹</button><strong>' + label.charAt(0).toUpperCase() + label.slice(1) + '</strong><button type="button" class="bk-nav" data-nav="1" aria-label="›"' + (new Date(y, m + 1, 1) > maxDate ? ' disabled' : '') + '>›</button></div><div class="bk-wd">' + wd.map(w => '<span>' + w + '</span>').join('') + '</div><div class="bk-days">' + cells + '</div></div><button type="button" class="bk-go" id="bkGo"' + (S.date ? '' : ' disabled') + '>' + (S.date ? L.contDate(nice(S.date).toUpperCase()) : L.pickDate) + '</button>';
    body.querySelectorAll('.bk-nav').forEach(b => b.onclick = () => { S.month = new Date(y, m + parseInt(b.dataset.nav, 10), 1); renderDate(); });
    body.querySelectorAll('.bk-day').forEach(b => b.onclick = () => { S.date = b.dataset.d; renderDate(); const g = body.querySelector('#bkGo'); if (g) g.focus({ preventScroll: true }); });
    body.querySelector('#bkGo').onclick = () => { S.step = 2; render(); };
  }

  function renderTrip() {
    const list = TRIPS[S.boat], t = list[S.trip];
    const boatOpts = boats.map(id => '<button type="button" class="bk-opt' + (id === S.boat ? ' sel' : '') + '" data-boat="' + id + '"><b>' + TRIPS[id][0].boat + '</b><small>' + L.upTo(boatCap(id)) + '</small></button>').join('');
    const tripOpts = list.map((x, i) => '<button type="button" class="bk-opt' + (i === S.trip ? ' sel' : '') + '" data-trip="' + i + '"><b>' + x.name + '</b><small>' + x.hrs.toLowerCase() + ' · ' + fmt(x.amount) + '</small></button>').join('');
    let ang;
    if (t.shared) ang = '<p class="bk-hint">' + L.sharedNote + '</p>';
    else ang = '<div class="bk-n">' + Array.from({ length: t.cap }, (_, i) => '<button type="button" class="bk-opt' + (i + 1 === S.guests ? ' sel' : '') + '" data-g="' + (i + 1) + '">' + (i + 1) + '</button>').join('') + '</div><p class="bk-hint">' + L.max(t.cap) + '</p>';
    body.innerHTML = '<p class="bk-l">' + L.boat + '</p><div class="bk-opts c3">' + boatOpts + '</div><p class="bk-l">' + L.trip + '</p><div class="bk-opts">' + tripOpts + '</div><p class="bk-l">' + L.anglers + '</p>' + ang + '<p class="bk-l">' + L.notes + '</p><textarea class="bk-in" id="bkNotes" rows="2" placeholder="' + L.notesPh + '"></textarea><div class="bk-foot"><button type="button" class="bk-back">' + L.back + '</button><button type="button" class="bk-go" id="bkGo">' + L.cont + ' →</button></div>';
    body.querySelector('#bkNotes').value = S.notes;
    body.querySelector('#bkNotes').oninput = e => { S.notes = e.target.value; };
    body.querySelectorAll('[data-boat]').forEach(b => b.onclick = () => { S.boat = b.dataset.boat; S.trip = featuredIdx(S.boat); S.guests = Math.min(S.guests, TRIPS[S.boat][S.trip].cap); renderTrip(); });
    body.querySelectorAll('[data-trip]').forEach(b => b.onclick = () => { S.trip = parseInt(b.dataset.trip, 10); S.guests = Math.min(S.guests, cur().cap); renderTrip(); });
    body.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { S.guests = parseInt(b.dataset.g, 10); renderTrip(); });
    body.querySelector('.bk-back').onclick = () => { S.step = 1; render(); };
    body.querySelector('#bkGo').onclick = () => { S.step = 3; render(); };
  }

  const validPhone = v => v.replace(/\D/g, '').length >= 8;
  const validName = v => v.trim().length >= 2;
  function renderContact() {
    body.innerHTML = '<label class="bk-l" for="bkName">' + L.name + ' *</label><input class="bk-in" id="bkName" type="text" autocomplete="name" placeholder="' + L.namePh + '"><label class="bk-l" for="bkPhone">' + L.phone + ' *</label><input class="bk-in" id="bkPhone" type="tel" autocomplete="tel" placeholder="' + L.phonePh + '"><label class="bk-l" for="bkEmail">' + L.email + '</label><input class="bk-in" id="bkEmail" type="email" autocomplete="email" placeholder="' + L.emailPh + '">' + summary() + '<div class="bk-total"><span>' + L.total + '</span><b>' + fmt(total()) + '</b></div><div class="bk-foot"><button type="button" class="bk-back">' + L.back + '</button><button type="button" class="bk-go" id="bkGo" disabled>' + L.confirm + '</button></div>';
    const n = body.querySelector('#bkName'), p = body.querySelector('#bkPhone'), e = body.querySelector('#bkEmail'), go = body.querySelector('#bkGo');
    n.value = S.name; p.value = S.phone; e.value = S.email;
    const check = () => { S.name = n.value; S.phone = p.value; S.email = e.value; go.disabled = !(validName(S.name) && validPhone(S.phone)); };
    [n, p, e].forEach(x => x.oninput = check); check();
    body.querySelector('.bk-back').onclick = () => { S.step = 2; render(); };
    go.onclick = () => submit();
  }

  function message() {
    const t = cur(), K = L.k;
    return [L.hi, '', K.boat + ': ' + t.boat, K.trip + ': ' + t.hrs + ' · ' + t.name, K.date + ': ' + nice(S.date, true), K.ang + ': ' + (t.shared ? 2 : S.guests), K.name + ': ' + S.name.trim(), K.phone + ': ' + S.phone.trim(), S.email.trim() ? K.email + ': ' + S.email.trim() : null, S.notes.trim() ? K.notes + ': ' + S.notes.trim() : null, K.total + ': ' + fmt(t.amount)].filter(x => x !== null).join('\n');
  }
  function submit() {
    try { localStorage.setItem('lf-contact', JSON.stringify({ name: S.name.trim(), phone: S.phone.trim(), email: S.email.trim() })); } catch (e) {}
    const t = cur();
    if (BOOKING_ENDPOINT) {
      fetch(BOOKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: en ? 'en' : 'es', boat: t.boat, trip: t.name, hours: t.hrs, date: S.date, anglers: t.shared ? 2 : S.guests, total: t.amount, name: S.name.trim(), phone: S.phone.trim(), email: S.email.trim(), notes: S.notes.trim() }) }).catch(() => {});
    }
    S.step = 4; render();
    window.open(waBase + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
  }
  function renderDone() {
    body.innerHTML = '<div class="bk-done"><div class="bk-ok">✓</div><h3>' + L.doneT + '</h3><p>' + L.doneP + '</p></div>' + summary() + '<a class="bk-go wa" id="bkWa" target="_blank" rel="noopener">' + L.sendWa + '</a><a class="bk-alt" id="bkMail">' + L.sendMail + '</a><button type="button" class="bk-back wide">' + L.closeBtn + '</button>';
    body.querySelector('#bkWa').href = waBase + '?text=' + encodeURIComponent(message());
    body.querySelector('#bkMail').href = 'mailto:' + mailTo + '?subject=' + encodeURIComponent(L.subj) + '&body=' + encodeURIComponent(message());
    body.querySelector('.bk-back').onclick = close;
  }

  function open() {
    opener = document.activeElement;
    if (pre) { S.boat = pre.boat; S.trip = pre.trip; S.guests = Math.min(S.guests, TRIPS[S.boat][S.trip].cap); pre = null; }
    if (S.step === 4) { S.step = 1; S.date = ''; }
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    render();
    ov.querySelector('.bk').scrollTop = 0;
    requestAnimationFrame(() => ov.classList.add('open'));
    const f = body.querySelector('button:not([disabled])'); if (f) f.focus({ preventScroll: true });
  }
  function close() {
    ov.classList.remove('open');
    setTimeout(() => { ov.hidden = true; }, 220);
    document.body.style.overflow = '';
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }
  ov.querySelector('.bk-x').onclick = close;
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.addEventListener('keydown', e => { if (!ov.hidden && e.key === 'Escape') close(); });

  boats.forEach(id => TRIPS[id].forEach((t, i) => t.btn.addEventListener('click', () => { pre = { boat: id, trip: i }; })));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#reservar"],[data-book]');
    if (a) { e.preventDefault(); open(); }
  });
  if (location.hash === '#reservar') open();
})();

// Pre-chat de WhatsApp: saludo, respuestas rápidas y mensaje listo antes de abrir wa.me
(() => {
  const en = document.documentElement.lang === 'en';
  const float = document.querySelector('.wa-float');
  if (!float) return;
  const wa = 'https://wa.me/523141639998';
  const T = en ? {
    name: "Lori's Fleet", status: 'Usually replies in minutes', hi: 'Hi! \u{1F44B} Thanks for stopping by. What can we help you with?',
    q: ['I want to book a charter', 'Rates and trip lengths', 'Fishing with family or kids', 'Another question'],
    book: 'Book with date and price', msgs: ["Hi, I'd like to book a charter with Lori's Fleet.", "Hi, could you tell me the rates and trip lengths?", "Hi, we're planning to fish with family and kids. What do you recommend?", 'Hi, I have a question about your charters.'],
    your: 'Your name (optional)', msgLabel: 'Your message', go: 'CONTINUE ON WHATSAPP', note: "You'll chat directly with the captain's team on WhatsApp.", close: 'Close', open: 'WhatsApp chat', sig: 'My name is '
  } : {
    name: "Lori's Fleet", status: 'Normalmente responde en minutos', hi: '¡Hola! \u{1F44B} Gracias por escribirnos. ¿En qué podemos ayudarte?',
    q: ['Quiero reservar un charter', 'Precios y duración de salidas', 'Pescar con familia o niños', 'Otra pregunta'],
    book: 'Reservar con fecha y precio', msgs: ['Hola, quiero reservar un charter con Lori’s Fleet.', 'Hola, ¿me pueden compartir los precios y la duración de las salidas?', 'Hola, vamos a pescar en familia con niños. ¿Qué nos recomiendan?', 'Hola, tengo una pregunta sobre sus charters.'],
    your: 'Tu nombre (opcional)', msgLabel: 'Tu mensaje', go: 'CONTINUAR EN WHATSAPP', note: 'Hablarás directo con el equipo del capitán por WhatsApp.', close: 'Cerrar', open: 'Chat de WhatsApp', sig: 'Me llamo '
  };
  const box = document.createElement('div');
  box.className = 'pc'; box.hidden = true;
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T.open);
  box.innerHTML = '<div class="pc-head"><img src="' + (document.querySelector('.brand img') || {}).src + '" alt=""><div><b>' + T.name + '</b><small><i></i>' + T.status + '</small></div><button type="button" class="pc-x" aria-label="' + T.close + '">×</button></div>' +
    '<div class="pc-body"><p class="pc-bubble">' + T.hi + '</p><div class="pc-q">' + T.q.map((q, i) => '<button type="button" data-i="' + i + '">' + q + '</button>').join('') + '<button type="button" class="alt" data-book>' + T.book + '</button></div>' +
    '<label class="pc-l" for="pcName">' + T.your + '</label><input id="pcName" class="pc-in" type="text" autocomplete="name">' +
    '<label class="pc-l" for="pcMsg">' + T.msgLabel + '</label><textarea id="pcMsg" class="pc-in" rows="3"></textarea>' +
    '<a class="pc-go" id="pcGo" target="_blank" rel="noopener">' + T.go + '</a><p class="pc-note">' + T.note + '</p></div>';
  document.body.appendChild(box);
  const msg = box.querySelector('#pcMsg'), name = box.querySelector('#pcName'), go = box.querySelector('#pcGo');
  msg.value = T.msgs[0];
  const link = () => {
    const n = name.value.trim();
    const text = msg.value.trim() + (n ? '\n' + T.sig + n : '');
    go.href = wa + '?text=' + encodeURIComponent(text);
  };
  link();
  [msg, name].forEach(x => x.addEventListener('input', link));
  box.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
    box.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('sel', x === b));
    msg.value = T.msgs[parseInt(b.dataset.i, 10)]; link(); msg.focus({ preventScroll: true });
  }));
  box.querySelector('[data-book]').addEventListener('click', () => { closePc(); const a = document.querySelector('[data-book]:not(.pc [data-book])') || document.querySelector('a[href="#reservar"]'); if (a) a.click(); });
  go.addEventListener('click', () => setTimeout(closePc, 150));
  let opener = null;
  function openPc() { opener = document.activeElement; box.hidden = false; requestAnimationFrame(() => box.classList.add('open')); float.setAttribute('aria-expanded', 'true'); }
  function closePc() { box.classList.remove('open'); float.setAttribute('aria-expanded', 'false'); setTimeout(() => { box.hidden = true; }, 200); if (opener && opener.focus) opener.focus({ preventScroll: true }); }
  box.querySelector('.pc-x').addEventListener('click', closePc);
  document.addEventListener('keydown', e => { if (!box.hidden && e.key === 'Escape') closePc(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="https://wa.me/"]');
    if (a && !a.closest('.pc') && !a.closest('.bk')) { e.preventDefault(); box.hidden || box.classList.contains('open') ? (box.hidden ? openPc() : closePc()) : openPc(); return; }
    if (!box.hidden && !e.target.closest('.pc')) closePc();
  });
})();
