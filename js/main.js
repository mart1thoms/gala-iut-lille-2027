// Gala de l'IUT 2027 · Nuit étoilée
'use strict';

// Lien de la billetterie : à renseigner dès son ouverture (laisser vide = « Ouverture prochaine »).
const BILLETTERIE_URL = '';
// Début de la soirée, heure de Paris.
const GALA_DEBUT = new Date('2027-02-12T20:00:00+01:00');
const LIEU = [50.6416, 3.1049];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// ---------------------------------------------------------------------------
// Fond : la nuit noire devient « La Nuit étoilée » au fil du défilement (variable CSS --p de 0 à 1).
(function scrollPainting() {
  let pending = false;
  function update() {
    pending = false;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    // Le tableau est entièrement révélé vers les deux tiers de la page.
    const p = Math.min(1, Math.max(0, window.scrollY / (max * 0.66)));
    root.style.setProperty('--p', p.toFixed(3));
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  window.addEventListener('resize', update);
  update();
})();

// ---------------------------------------------------------------------------
// Étoiles qui scintillent, quelques étoiles filantes.
(function sky() {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let shooting = null;
  let w = 0;
  let h = 0;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((w * h) / 5000) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      gold: Math.random() < 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.5,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const a = reduceMotion ? 0.8 : 0.4 + 0.6 * Math.abs(Math.sin(s.phase + (t / 1000) * s.speed));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? `rgba(252, 230, 160, ${a})` : `rgba(255, 255, 255, ${a * 0.8})`;
      ctx.fill();
    }
    if (reduceMotion) return;
    if (!shooting && Math.random() < 0.004) {
      shooting = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, vx: 7 + Math.random() * 4, vy: 2.5 + Math.random() * 2, life: 0 };
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
      if (++s.life > 70) shooting = null;
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) draw(0);
  });
  requestAnimationFrame(draw);
})();

// ---------------------------------------------------------------------------
// Compte à rebours (comme en 2026 : jours en or)
(function countdown() {
  const el = document.getElementById('countdown');
  function tick() {
    const diff = GALA_DEBUT.getTime() - Date.now();
    if (diff <= 0) {
      el.textContent = Date.now() < GALA_DEBUT.getTime() + 7 * 3600 * 1000 ? 'C’est ce soir !' : 'Merci pour cette nuit étoilée ✦';
      return;
    }
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    el.innerHTML = `<b>${d}j</b> ${hh}h ${mm}m ${ss}s`;
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
  btn.innerHTML = 'Accéder à la billetterie <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  btn.removeAttribute('aria-disabled');
})();

// ---------------------------------------------------------------------------
// Barre de navigation : fond au défilement
(function nav() {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
// Carte : salle, lignes de métro 1 et 2, campus de l'IUT (comme en 2026)
window.addEventListener('load', () => {
  if (!window.L) return;
  const data = window.GALA_CARTE;
  const map = L.map('map', { center: LIEU, zoom: 12, scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
    className: 'map-night',
  }).addTo(map);

  if (data) {
    L.polyline(data.ligne1, { color: '#f2c500', weight: 4, opacity: 0.85 }).addTo(map);
    L.polyline(data.ligne2, { color: '#e3423a', weight: 4, opacity: 0.85 }).addTo(map);
    const iutIcon = L.divIcon({ className: '', html: '<div class="iut-pin"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
    for (const site of data.iut) L.marker(site.coords, { icon: iutIcon, title: site.nom }).addTo(map).bindPopup(site.nom);
  }

  const galaIcon = L.divIcon({ className: '', html: '<div class="gala-pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
  L.marker(LIEU, { icon: galaIcon, title: 'Salle des fêtes du Fort' })
    .addTo(map)
    .bindPopup('<strong>Salle des fêtes du Fort</strong><br>Arrêt Métro 2 : Fort de Mons')
    .openPopup();

  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML =
      '<div><i style="background:#f2c500"></i>Métro ligne 1</div>' +
      '<div><i style="background:#e3423a"></i>Métro ligne 2</div>' +
      '<div><i class="round" style="background:#f4d06f"></i>Lieu du Gala</div>' +
      '<div><i class="round" style="background:#fff"></i>IUT de Lille</div>';
    return div;
  };
  legend.addTo(map);
});
