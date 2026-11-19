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

// Tarifas: formato de precio, precio por pescador y reserva por WhatsApp con mensaje listo
(() => {
  const en = document.documentElement.lang === 'en';
  const waBase = (document.querySelector('.wa-float') || {}).href || '';
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
      if (cap && isBoat) {
        const p = document.createElement('p');
        p.className = 'per';
        p.textContent = en
          ? '\u2248 $' + fmt(Math.round(amount / cap)) + ' per angler with a full boat'
          : '\u2248 $' + fmt(Math.round(amount / cap)) + ' por pescador con el barco lleno';
        price.after(p);
      }
      const btn = card.querySelector('.btn');
      if (btn && waBase) {
        const hrs = card.querySelector('.card-hrs').textContent.trim();
        const name = card.querySelector('h3').textContent.trim();
        const msg = en
          ? 'Hi, I\u2019d like to book the ' + boat + ' \u2014 ' + name + ' (' + hrs + ')'
          : 'Hola, quiero reservar el ' + boat + ' \u2014 ' + name + ' (' + hrs + ')';
        btn.href = waBase.split('?')[0] + '?text=' + encodeURIComponent(msg);
        btn.target = '_blank';
        btn.rel = 'noopener';
      }
    });
  });
})();
