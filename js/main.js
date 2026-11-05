// Gala de l'IUT 2027 · Nuit étoilée
'use strict';

// Lien de la billetterie : à renseigner dès son ouverture (laisser vide = « Ouverture prochaine »).
const BILLETTERIE_URL = '';
// Début de la soirée, heure de Paris.
const GALA_DEBUT = new Date('2027-02-12T20:00:00+01:00');
const LIEU = { coords: [50.6416, 3.1049], nom: 'Salle des fêtes du Fort', detail: 'Métro 2 · arrêt Fort de Mons' };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------------------
// Fond : « La Nuit étoilée » de Van Gogh se révèle au fil du défilement (--p de 0 à 1).
(function scrollPainting() {
  const root = document.documentElement;
  let pending = false;
  function update() {
    pending = false;
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, window.scrollY / (max * 0.6)));
    root.style.setProperty('--p', p.toFixed(3));
  }
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ---------------------------------------------------------------------------
// Ciel étoilé : étoiles qui scintillent, quelques étoiles filantes.
(function sky() {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shooting = null;
  let w = 0;
  let h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 4200);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.2,
      gold: Math.random() < 0.18,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.6,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = reduceMotion ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(s.phase + (t / 1000) * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? `rgba(241, 213, 144, ${a})` : `rgba(238, 240, 249, ${a * 0.85})`;
      ctx.fill();
    }
    if (!reduceMotion) {
      if (!shooting && Math.random() < 0.004) {
        shooting = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.35, vx: 7 + Math.random() * 4, vy: 2.5 + Math.random() * 2, life: 0 };
      }
      if (shooting) {
        const s = shooting;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        grad.addColorStop(0, 'rgba(255, 246, 214, 0.95)');
        grad.addColorStop(1, 'rgba(255, 246, 214, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12);
        ctx.stroke();
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        if (s.life > 70 || s.x > w + 100 || s.y > h + 100) shooting = null;
      }
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) draw(0);
  });
  requestAnimationFrame(draw);
})();

// ---------------------------------------------------------------------------
// Compte à rebours
(function countdown() {
  const el = document.getElementById('countdown');
  const units = {
    jours: el.querySelector('[data-unit="jours"]'),
    heures: el.querySelector('[data-unit="heures"]'),
    minutes: el.querySelector('[data-unit="minutes"]'),
    secondes: el.querySelector('[data-unit="secondes"]'),
  };
  function tick() {
    const diff = GALA_DEBUT.getTime() - Date.now();
    if (diff <= 0) {
      el.classList.add('done');
      el.textContent = Date.now() < GALA_DEBUT.getTime() + 7 * 3600 * 1000 ? 'C’est ce soir !' : 'Merci pour cette nuit étoilée ✦';
      return;
    }
    const s = Math.floor(diff / 1000);
    units.jours.textContent = String(Math.floor(s / 86400));
    units.heures.textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    units.minutes.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    units.secondes.textContent = String(s % 60).padStart(2, '0');
    setTimeout(tick, 1000);
  }
  tick();
})();

// ---------------------------------------------------------------------------
// Billetterie
(function ticketing() {
  const btn = document.getElementById('ticketing');
  if (!BILLETTERIE_URL) {
    btn.addEventListener('click', (e) => e.preventDefault());
    return;
  }
  btn.href = BILLETTERIE_URL;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = 'Accéder à la billetterie →';
  btn.removeAttribute('aria-disabled');
})();

// ---------------------------------------------------------------------------
// Navigation : fond au défilement, menu mobile
(function nav() {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    links.classList.toggle('open', open);
  });
  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    }
  });
})();

// ---------------------------------------------------------------------------
// Apparition des blocs au défilement
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 },
  );
  items.forEach((el) => io.observe(el));
})();

// ---------------------------------------------------------------------------
// Carte (Leaflet, fond sombre)
window.addEventListener('load', () => {
  if (!window.L) return;
  const map = L.map('map', { center: LIEU.coords, zoom: 12, scrollWheelZoom: false });
  // Tuiles OpenStreetMap, passées en version nuit par un filtre CSS (.map-night).
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    className: 'map-night',
  }).addTo(map);
  const data = window.GALA_CARTE;
  if (data) {
    L.polyline(data.ligne1, { color: '#f2c500', weight: 4, opacity: 0.85 }).addTo(map);
    L.polyline(data.ligne2, { color: '#e3423a', weight: 4, opacity: 0.85 }).addTo(map);
    const iutIcon = L.divIcon({ className: '', html: '<div class="iut-pin"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
    for (const site of data.iut) L.marker(site.coords, { icon: iutIcon, title: site.nom }).addTo(map).bindPopup(site.nom);
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend');
      div.innerHTML =
        '<div><i style="background:#f2c500"></i>Métro ligne 1</div>' +
        '<div><i style="background:#e3423a"></i>Métro ligne 2</div>' +
        '<div><i class="round" style="background:#d9b25f"></i>Lieu du Gala</div>' +
        '<div><i class="round" style="background:#eef0f9"></i>IUT de Lille</div>';
      return div;
    };
    legend.addTo(map);
  }
  const icon = L.divIcon({ className: '', html: '<div class="gala-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  L.marker(LIEU.coords, { icon, title: LIEU.nom }).addTo(map).bindPopup(`<strong>${LIEU.nom}</strong><br>${LIEU.detail}`).openPopup();
});
