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

// Galería: lightbox
const items = [...document.querySelectorAll('#gallery .g-item')];
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
let idx = 0;
function openLb(i) {
  idx = (i + items.length) % items.length;
  lbImg.src = items[idx].href;
  lbImg.alt = items[idx].querySelector('img').alt;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
items.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); openLb(i); }));
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
        amount, cap: shared ? 2 : parseInt(cap || '8', 10), shared,
        btn: card.querySelector('.btn')
      });
    });
  });
})();

// Motor de reservas
(() => {
  const en = document.documentElement.lang === 'en';
  const form = document.getElementById('bkForm');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const boatSel = $('bkBoat'), tripSel = $('bkTrip'), guestSel = $('bkGuests'), dateIn = $('bkDate');
  const waBase = ((document.querySelector('.wa-float') || {}).href || 'https://wa.me/').split('?')[0];
  const mailTo = 'reservas@lorisfleet.com';
  const fmt = n => '$' + n.toLocaleString(en ? 'en-US' : 'es-MX') + ' MXN';
  const T = en
    ? { pick: 'Select\u2026', pickDate: 'Choose a date', pickName: 'Please enter your name', hi: 'Hi, I\u2019d like to book a charter with Lori\u2019s Fleet:', boat: 'Boat', trip: 'Trip', date: 'Date', ang: 'Anglers', name: 'Name', notes: 'Notes', total: 'Estimated total', subj: 'Charter booking request', one: 'angler', many: 'anglers', shared: 'Shared tour (2 seats)' }
    : { pick: 'Selecciona\u2026', pickDate: 'Elige una fecha', pickName: 'Escribe tu nombre', hi: 'Hola, quiero reservar un charter con Lori\u2019s Fleet:', boat: 'Barco', trip: 'Salida', date: 'Fecha', ang: 'Pescadores', name: 'Nombre', notes: 'Notas', total: 'Total estimado', subj: 'Solicitud de reserva de charter', one: 'pescador', many: 'pescadores', shared: 'Tour compartido (2 lugares)' };
  const boats = Object.keys(TRIPS);
  boatSel.innerHTML = '<option value="">' + T.pick + '</option>' + boats.map(id => '<option value="' + id + '">' + TRIPS[id][0].boat + '</option>').join('');
  const tomorrow = new Date(Date.now() + 864e5);
  dateIn.min = tomorrow.toISOString().slice(0, 10);

  function fillTrips() {
    const list = TRIPS[boatSel.value] || [];
    tripSel.innerHTML = '<option value="">' + T.pick + '</option>' + list.map((t, i) => '<option value="' + i + '">' + t.hrs + ' \u00b7 ' + t.name + ' \u2014 ' + fmt(t.amount) + '</option>').join('');
    tripSel.disabled = !list.length;
    fillGuests();
  }
  function current() { const l = TRIPS[boatSel.value]; return l && l[tripSel.value] ? l[tripSel.value] : null; }
  function fillGuests() {
    const t = current(), keep = guestSel.value;
    const max = t ? t.cap : 0;
    guestSel.innerHTML = Array.from({ length: max }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + '</option>').join('');
    guestSel.disabled = !max;
    if (max) guestSel.value = keep && keep <= max ? keep : String(max);
    render();
  }
  const fmtDate = v => v ? new Date(v + 'T12:00:00').toLocaleDateString(en ? 'en-US' : 'es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
  function render() {
    const t = current();
    $('bkEmpty').hidden = !!t; $('bkDetail').hidden = !t;
    if (!t) return;
    const g = parseInt(guestSel.value || '1', 10);
    $('bkBoatName').textContent = t.boat;
    $('bkTripName').textContent = t.hrs + ' \u00b7 ' + t.name;
    $('bkMeta').textContent = (dateIn.value ? fmtDate(dateIn.value) + ' \u00b7 ' : '') + (t.shared ? T.shared : g + ' ' + (g === 1 ? T.one : T.many));
    $('bkTotal').textContent = fmt(t.amount);
    const per = $('bkPer');
    per.hidden = t.shared;
    per.textContent = '\u2248 ' + fmt(Math.round(t.amount / g)) + ' ' + (en ? 'per angler' : 'por pescador');
    updateMail();
  }
  function message() {
    const t = current(); if (!t) return '';
    const g = guestSel.value;
    return [T.hi, '', T.boat + ': ' + t.boat, T.trip + ': ' + t.hrs + ' \u00b7 ' + t.name, T.date + ': ' + fmtDate(dateIn.value), T.ang + ': ' + (t.shared ? '2' : g),
      T.name + ': ' + $('bkName').value.trim(), $('bkNotes').value.trim() ? T.notes + ': ' + $('bkNotes').value.trim() : null, T.total + ': ' + fmt(t.amount)].filter(x => x !== null).join('\n');
  }
  function updateMail() { $('bkMail').href = 'mailto:' + mailTo + '?subject=' + encodeURIComponent(T.subj) + '&body=' + encodeURIComponent(message()); }
  boatSel.addEventListener('change', fillTrips);
  tripSel.addEventListener('change', fillGuests);
  [guestSel, dateIn, $('bkName'), $('bkNotes')].forEach(el => el.addEventListener('input', render));
  const err = $('bkErr');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let m = '';
    if (!current()) m = T.pick.replace('\u2026', '') + ': ' + T.boat + ' / ' + T.trip;
    else if (!dateIn.value || dateIn.value < dateIn.min) m = T.pickDate;
    else if (!$('bkName').value.trim()) m = T.pickName;
    err.hidden = !m; err.textContent = m;
    if (m) return;
    window.open(waBase + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
  });
  // Los botones RESERVAR de cada tarifa preseleccionan barco y salida
  boats.forEach(id => TRIPS[id].forEach((t, i) => t.btn.addEventListener('click', () => {
    boatSel.value = id; fillTrips(); tripSel.value = String(i); fillGuests();
  })));
  // Al cambiar de pestaña en tarifas, sugiere ese barco si aún no hay elección
  document.querySelectorAll('.tab').forEach(tb => tb.addEventListener('click', () => { if (!boatSel.value) { boatSel.value = tb.dataset.tab; fillTrips(); } }));
  fillTrips();
})();
