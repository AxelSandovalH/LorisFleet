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
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
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
