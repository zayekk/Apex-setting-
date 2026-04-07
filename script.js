/* ============================================================
   APEX SETTINGS — Main Script 2026
   ============================================================ */

'use strict';

/* ─── STATE ─────────────────────────────────────────────── */
let appData = null;
let playerProfile = {};
let currentStep = 1;
const TOTAL_STEPS = 7;
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let currentMetaGame = 'warzone';

/* ─── INIT ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await initLoader();
  await loadData();
  initNavbar();
  initParticles();
  initReveal();
  initMotivation();
  renderMeta('warzone');
  renderGeneralTips();
  renderDrills();
  renderChecklist();
  loadSavedProfile();
  countUpStats();
});

/* ─── LOADER ────────────────────────────────────────────── */
async function initLoader() {
  const statuses = [
    'Chargement des données 2026…',
    'Calibration du système d\'analyse…',
    'Initialisation de l\'IA coaching…',
    'Prêt.'
  ];
  const el = document.getElementById('loaderStatus');
  for (let i = 0; i < statuses.length; i++) {
    await sleep(500);
    if (el) el.textContent = statuses[i];
  }
  await sleep(300);
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}

/* ─── DATA LOADING ──────────────────────────────────────── */
async function loadData() {
  try {
    const res = await fetch('data.json');
    appData = await res.json();
  } catch (e) {
    // Fallback inline data if fetch fails (e.g. file:// protocol)
    appData = getFallbackData();
  }
}

/* ─── NAVBAR ────────────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }
}

/* ─── PARTICLES ─────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '0,212,255' : '99,102,241';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  // Draw connections
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(loop);
  }
  loop();
}

/* ─── SCROLL REVEAL ──────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ─── MOTIVATION ─────────────────────────────────────────── */
function initMotivation() {
  const el = document.getElementById('motivText');
  if (!el) return;
  const motiv = appData?.motivation || getFallbackData().motivation;
  // Déterministe par le jour de l'année
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  el.textContent = motiv[dayOfYear % motiv.length];
}

/* ─── STATS COUNT UP ─────────────────────────────────────── */
function countUpStats() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current).toLocaleString('fr-FR');
    }, 25);
  });
}

/* ─── QUIZ ───────────────────────────────────────────────── */
// Handle option selection
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.option-btn');
  if (!btn) return;
  const key = btn.dataset.key;
  const value = btn.dataset.value;
  if (!key) return;

  // Deselect siblings
  btn.closest('.quiz-options').querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  playerProfile[key] = value;
  document.getElementById('quizNext').disabled = false;
});

function quizNext() {
  if (currentStep < TOTAL_STEPS) {
    // Check something is selected
    const step = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    if (!step) return;
    const selected = step.querySelector('.option-btn.selected');
    if (!selected) return;

    goToStep(currentStep + 1);
  } else {
    // Last step — generate profile
    const step = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    const selected = step?.querySelector('.option-btn.selected');
    if (!selected) return;
    generateProfile();
  }
}

function quizPrev() {
  if (currentStep > 1) goToStep(currentStep - 1);
}

function goToStep(n) {
  document.querySelector(`.quiz-step[data-step="${currentStep}"]`)?.classList.remove('active');
  currentStep = n;
  document.querySelector(`.quiz-step[data-step="${currentStep}"]`)?.classList.add('active');

  // Re-check if already answered
  const key = getKeyForStep(currentStep);
  const val = playerProfile[key];
  const step = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
  const nextBtn = document.getElementById('quizNext');
  const prevBtn = document.getElementById('quizPrev');

  if (val) {
    step?.querySelectorAll('.option-btn').forEach(b => {
      b.classList.toggle('selected', b.dataset.value === val);
    });
    nextBtn.disabled = false;
  } else {
    step?.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    nextBtn.disabled = true;
  }

  // Progress
  const pct = ((currentStep - 1) / TOTAL_STEPS) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = `Question ${currentStep} / ${TOTAL_STEPS}`;

  // Nav buttons
  prevBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
  nextBtn.textContent = currentStep === TOTAL_STEPS ? 'Générer mon profil ⚡' : 'Suivant →';
}

function getKeyForStep(s) {
  const keys = ['game', 'platform', 'style', 'level', 'problem', 'fps', 'ping'];
  return keys[s - 1];
}

/* ─── PROFILE GENERATION ─────────────────────────────────── */
function generateProfile() {
  const p = playerProfile;
  const settings = computeSettings(p);

  // Save to localStorage
  localStorage.setItem('apexSettings_profile', JSON.stringify(p));
  localStorage.setItem('apexSettings_settings', JSON.stringify(settings));

  // Show settings section
  renderProfile(p, settings);
  renderPersonalizedTips(p);

  // Scroll to settings
  setTimeout(() => scrollToSection('settings'), 200);
}

function computeSettings(p) {
  // Base values for controller/console
  let base = {
    sensH: 6, sensV: 6, ads: 0.85, aimAssist: 'Standard',
    deadzone: 0.05, fov: 100, brightness: 55
  };

  // Platform adjustments
  if (p.platform === 'pc') {
    base.sensH = null; // mouse DPI based
    base.mouseDPI = 800;
    base.mouseSens = 6.5;
    base.ads = 0.65;
    base.aimAssist = 'Désactivé';
    base.fov = 110;
  }

  // Style adjustments
  if (p.style === 'aggressive') { base.sensH = (base.sensH || 0) + 2; base.sensV = (base.sensV || 0) + 2; base.fov += 5; }
  if (p.style === 'sniper') { base.sensH = Math.max(3, (base.sensH || 6) - 2); base.ads = 0.5; base.fov = 95; }
  if (p.style === 'defensive') { base.fov += 3; }

  // Level adjustments
  if (p.level === 'beginner') { base.sensH = Math.max(3, (base.sensH || 5) - 1); base.aimAssist = 'Précision (Focus)'; base.deadzone = 0.08; }
  if (p.level === 'tryhard') { base.sensH = (base.sensH || 7) + 1; base.aimAssist = 'Précision (Linear)'; base.deadzone = 0.02; }

  // Problem adjustments
  if (p.problem === 'sensi-fast') { base.sensH = Math.max(2, (base.sensH || 5) - 2); base.sensV = Math.max(2, (base.sensV || 5) - 2); }
  if (p.problem === 'sensi-slow') { base.sensH = (base.sensH || 5) + 2; base.sensV = (base.sensV || 5) + 2; }
  if (p.problem === 'tracking') { base.aimAssist = 'Tracking'; }
  if (p.problem === 'precision') { base.ads = Math.max(0.4, base.ads - 0.1); }

  // FPS adjustments
  if (p.fps === 'low') { base.graphics = 'Performance (Low)'; base.fov = 95; }
  else if (p.fps === 'medium') { base.graphics = 'Équilibré (Medium)'; }
  else if (p.fps === 'high') { base.graphics = 'Qualité (High)'; base.fov = 105; }
  else if (p.fps === 'ultra') { base.graphics = 'Ultra (Max)'; base.fov = 110; }

  // Clamp values
  if (base.sensH) base.sensH = Math.min(20, Math.max(1, Math.round(base.sensH)));
  if (base.sensV) base.sensV = Math.min(20, Math.max(1, Math.round(base.sensV)));
  base.ads = Math.round(base.ads * 100) / 100;
  base.fov = Math.min(120, Math.max(80, Math.round(base.fov)));

  return base;
}

function renderProfile(p, s) {
  const placeholder = document.getElementById('settingsPlaceholder');
  const result = document.getElementById('settingsResult');
  if (placeholder) placeholder.style.display = 'none';
  if (result) result.style.display = 'block';

  // Profile badge
  const badge = document.getElementById('profileBadge');
  const name = document.getElementById('profileName');
  const desc = document.getElementById('profileDesc');

  const gameLabels = { warzone: '💥 Warzone BO7', fortnite: '🌀 Fortnite', both: '⚡ Multi-game' };
  const styleLabels = { aggressive: '⚔️ Agressif', defensive: '🛡️ Défensif', sniper: '🎯 Sniper', polyvalent: '🔄 Polyvalent' };
  const levelLabels = { beginner: '🌱 Débutant', intermediate: '⚡ Intermédiaire', tryhard: '💀 Tryhard' };
  const platformLabels = { pc: '🖥️ PC', ps: '🎮 PS', xbox: '🟢 Xbox' };

  const emoji = { aggressive: '⚔️', defensive: '🛡️', sniper: '🎯', polyvalent: '🔄' }[p.style] || '🎮';
  if (badge) badge.textContent = emoji;
  if (name) name.textContent = `${styleLabels[p.style] || ''} · ${gameLabels[p.game] || ''} · ${platformLabels[p.platform] || ''}`;
  if (desc) desc.textContent = `Niveau ${levelLabels[p.level] || ''} · Problème détecté : ${getProblemLabel(p.problem)} · FPS moyen : ${getFpsLabel(p.fps)}`;

  // Settings cards
  const grid = document.getElementById('settingsGrid');
  if (!grid) return;

  const cards = [];
  if (p.platform === 'pc') {
    cards.push({ label: 'DPI Souris', value: s.mouseDPI, note: 'Recommandé pour ton niveau' });
    cards.push({ label: 'Sensibilité', value: s.mouseSens, note: 'Sensitivity in-game' });
  } else {
    cards.push({ label: 'Sensi Horizontale', value: s.sensH, note: 'Sur 20' });
    cards.push({ label: 'Sensi Verticale', value: s.sensV, note: 'Sur 20' });
  }
  cards.push({ label: 'ADS Multiplier', value: s.ads, note: 'Sensibilité en visée' });
  cards.push({ label: 'Aim Assist', value: s.aimAssist, note: 'Type recommandé' });
  cards.push({ label: 'Deadzone', value: s.deadzone, note: 'Minimum stick input' });
  cards.push({ label: 'FOV', value: s.fov + '°', note: 'Champ de vision' });
  if (s.graphics) cards.push({ label: 'Graphismes', value: s.graphics, note: 'Preset optimisé' });
  cards.push({ label: 'Luminosité', value: s.brightness + '%', note: 'Visibilité ennemis' });

  grid.innerHTML = cards.map(c => `
    <div class="setting-card">
      <div class="setting-label">${c.label}</div>
      <div class="setting-value">${c.value}</div>
      <div class="setting-note">${c.note}</div>
    </div>
  `).join('');

  // Aim profile card
  const aimCard = document.getElementById('aimProfileCard');
  if (aimCard) {
    const profile = getAimProfile(p);
    aimCard.innerHTML = `
      <div class="aim-profile-title">⚡ Ton Aim Profile Unique</div>
      <div class="aim-profile-name">${profile.name}</div>
      <div class="aim-profile-desc">${profile.desc}</div>
    `;
  }

  // Reveal new elements
  document.querySelectorAll('#settingsResult .reveal').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 100);
  });
}

function getAimProfile(p) {
  const profiles = {
    'aggressive-beginner': { name: 'RUSH ROOKIE', desc: 'Tu apprends à jouer agressif avec des réglages stables. Sens modérée pour garder le contrôle pendant les rushes tout en développant la mémoire musculaire.' },
    'aggressive-intermediate': { name: 'FRAG HUNTER', desc: 'Profil taillé pour l\'entrée en scène agressive. Sensi élevée, ADS réactif, aim assist optimisé pour les gunfights courts et intenses.' },
    'aggressive-tryhard': { name: 'APEX PREDATOR', desc: 'Build extrême pour les joueurs élite. Tous les paramètres sont poussés à la limite pour maximiser la vitesse de réaction et l\'efficacité en close range.' },
    'sniper-beginner': { name: 'ROOKIE SCOPE', desc: 'Sensi réduite pour les prises de vue précises. Idéal pour apprendre le long range sans frustration, avec une ADS lente pour la précision maximale.' },
    'sniper-intermediate': { name: 'GHOST RIFLEMAN', desc: 'Équilibre parfait entre mobilité et précision au sniper. Repositionnement fluide et tirs précis à longue portée.' },
    'sniper-tryhard': { name: 'SILENT ELIMINATOR', desc: 'Profil pro sniper. Deadzone ultra-faible, ADS optimisé pour les flick shots longue distance. Chaque balle compte.' },
    'defensive-beginner': { name: 'SOLID ROOKIE', desc: 'Réglages stables et prévisibles pour apprendre à tenir les zones. Focus sur la précision plutôt que la vitesse.' },
    'defensive-intermediate': { name: 'ZONE HOLDER', desc: 'Profil défensif équilibré. FOV large pour la conscience situationnelle, aim assist de tracking pour les cibles éloignées.' },
    'defensive-tryhard': { name: 'FORTRESS TITAN', desc: 'Build pro pour contrôler les choke points et dominer les zones. Précision chirurgicale sur le long range.' },
    'polyvalent-beginner': { name: 'FLEX ROOKIE', desc: 'Réglages universels pour apprendre à s\'adapter. Parfait pour explorer les différents styles de jeu.' },
    'polyvalent-intermediate': { name: 'ADAPTIVE GUNNER', desc: 'Le profil polyvalent parfait. Sensi modulée pour tous les scenarios, aim assist équilibré pour toutes les portées.' },
    'polyvalent-tryhard': { name: 'OMNIFRAG ELITE', desc: 'Profil ultime pour les joueurs qui dominent à toutes les portées. Réglages professionnels finement calibrés pour le tryhard polyvalent.' }
  };

  const key = `${p.style}-${p.level}`;
  return profiles[key] || { name: 'CUSTOM PROFILE', desc: 'Profil personnalisé généré selon tes réponses. Ces réglages sont optimisés pour ton style de jeu unique.' };
}

function getProblemLabel(p) {
  const map = { precision: 'Précision', tracking: 'Tracking', 'sensi-fast': 'Sensi trop rapide', 'sensi-slow': 'Sensi trop lente' };
  return map[p] || p;
}
function getFpsLabel(f) {
  const map = { low: '<60 FPS', medium: '60-120 FPS', high: '120-240 FPS', ultra: '240+ FPS' };
  return map[f] || f;
}

function resetQuiz() {
  playerProfile = {};
  currentStep = 1;
  document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
  document.querySelector('.quiz-step[data-step="1"]')?.classList.add('active');
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('progressFill').style.width = '0%';
  document.getElementById('progressText').textContent = 'Question 1 / 7';
  document.getElementById('quizNext').disabled = true;
  document.getElementById('quizPrev').style.visibility = 'hidden';
  document.getElementById('quizNext').textContent = 'Suivant →';
  document.getElementById('settingsPlaceholder').style.display = '';
  document.getElementById('settingsResult').style.display = 'none';
  localStorage.removeItem('apexSettings_profile');
  localStorage.removeItem('apexSettings_settings');
  scrollToSection('quiz');
}

function loadSavedProfile() {
  const saved = localStorage.getItem('apexSettings_profile');
  const savedSettings = localStorage.getItem('apexSettings_settings');
  if (saved && savedSettings) {
    try {
      playerProfile = JSON.parse(saved);
      const settings = JSON.parse(savedSettings);
      renderProfile(playerProfile, settings);
      renderPersonalizedTips(playerProfile);
      // Mark quiz as complete visually
      document.getElementById('progressFill').style.width = '100%';
      document.getElementById('progressText').textContent = 'Profil complété ✓';
    } catch (e) {
      localStorage.removeItem('apexSettings_profile');
      localStorage.removeItem('apexSettings_settings');
    }
  }
}

/* ─── PERSONALIZED TIPS ──────────────────────────────────── */
function renderPersonalizedTips(p) {
  const container = document.getElementById('tipsContainer');
  if (!container) return;

  const tips = appData?.tips?.byStyle?.[p.style] || getFallbackData().tips.byStyle[p.style] || [];
  if (!tips.length) return;

  const styleLabels = { aggressive: '⚔️ Joueur Agressif', defensive: '🛡️ Joueur Défensif', sniper: '🎯 Sniper', polyvalent: '🔄 Joueur Polyvalent' };

  container.innerHTML = `
    <div class="tips-personalized">
      <div class="tips-title">💡 Tips Personnalisés — ${styleLabels[p.style] || 'Ton Profil'}</div>
      <div class="tips-list">
        ${tips.map(t => `
          <div class="tip-item">
            <div class="tip-ico">${t.icon}</div>
            <div class="tip-body">
              <div class="tip-head">${t.title}</div>
              <div class="tip-desc">${t.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── GENERAL TIPS ───────────────────────────────────────── */
function renderGeneralTips() {
  const grid = document.getElementById('tipsGeneral');
  if (!grid) return;
  const tips = appData?.tips?.universal || getFallbackData().tips.universal;
  grid.innerHTML = tips.map(t => `
    <div class="tip-card">
      <div class="tip-cat">${t.cat}</div>
      <div class="tip-title">${t.icon} ${t.title}</div>
      <div class="tip-text">${t.desc}</div>
    </div>
  `).join('');
}

/* ─── META ───────────────────────────────────────────────── */
function renderMeta(game) {
  currentMetaGame = game;
  const grid = document.getElementById('metaGrid');
  if (!grid) return;

  const weapons = appData?.meta?.[game] || getFallbackData().meta[game] || [];
  grid.innerHTML = weapons.map(w => `
    <div class="weapon-card">
      <div class="weapon-header">
        <div class="weapon-emoji">${w.emoji}</div>
        <div>
          <div class="weapon-name">${w.name}</div>
          <div class="weapon-type">${w.type}</div>
        </div>
        <div class="weapon-tier tier-${w.tier}">Tier ${w.tier}</div>
      </div>
      <div class="weapon-stats">
        <div class="wstat"><div class="wstat-label">TTK</div><div class="wstat-val">${w.ttk}</div></div>
        <div class="wstat"><div class="wstat-label">Portée</div><div class="wstat-val">${w.range}</div></div>
        <div class="wstat"><div class="wstat-label">Recul</div><div class="wstat-val">${w.recoil}</div></div>
        <div class="wstat"><div class="wstat-label">Type</div><div class="wstat-val">${w.type}</div></div>
      </div>
      <div class="weapon-styles">
        ${w.style.map(s => `<span class="style-tag">${s}</span>`).join('')}
      </div>
      <p class="weapon-tip">💡 ${w.tip}</p>
      <div class="weapon-attachments">
        <div class="attach-title">Attachements recommandés</div>
        <div class="attach-list">
          ${(w.attachments || []).map(a => `<div class="attach-item">${a}</div>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function switchMetaTab(game) {
  document.querySelectorAll('.meta-tab').forEach(t => t.classList.toggle('active', t.dataset.game === game));
  renderMeta(game);
}

/* ─── DRILLS ─────────────────────────────────────────────── */
function renderDrills() {
  const grid = document.getElementById('drillsGrid');
  if (!grid) return;
  const drills = appData?.training?.drills || getFallbackData().training.drills;
  grid.innerHTML = drills.map(d => `
    <div class="drill-card">
      <div class="drill-header">
        <div class="drill-icon">${d.icon}</div>
        <div class="drill-name">${d.name}</div>
      </div>
      <div class="drill-meta">
        <span class="drill-duration">⏱ ${d.duration}</span>
        <span class="drill-benefit">${d.benefit}</span>
      </div>
      <div class="drill-desc">${d.desc}</div>
    </div>
  `).join('');
}

/* ─── CHECKLIST ──────────────────────────────────────────── */
function renderChecklist() {
  const el = document.getElementById('checklist');
  if (!el) return;
  const items = appData?.training?.checklist || getFallbackData().training.checklist;
  const saved = JSON.parse(localStorage.getItem('apexSettings_checklist') || '[]');
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem('apexSettings_checklistDate');
  const checks = savedDate === today ? saved : [];

  el.innerHTML = items.map((item, i) => `
    <div class="check-item ${checks.includes(i) ? 'checked' : ''}" onclick="toggleCheck(${i}, this)">
      <div class="check-box"></div>
      <div class="check-label">${item}</div>
    </div>
  `).join('');
}

function toggleCheck(i, el) {
  el.classList.toggle('checked');
  saveChecklist();
}

function saveChecklist() {
  const checked = [];
  document.querySelectorAll('.check-item').forEach((el, i) => {
    if (el.classList.contains('checked')) checked.push(i);
  });
  localStorage.setItem('apexSettings_checklist', JSON.stringify(checked));
  localStorage.setItem('apexSettings_checklistDate', new Date().toDateString());
}

function resetChecklist() {
  document.querySelectorAll('.check-item').forEach(el => el.classList.remove('checked'));
  localStorage.removeItem('apexSettings_checklist');
  localStorage.removeItem('apexSettings_checklistDate');
}

/* ─── TIMER ──────────────────────────────────────────────── */
function setTimer(seconds) {
  if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
  timerSeconds = seconds;
  updateTimerDisplay();
  document.getElementById('timerStartBtn').textContent = '▶ Démarrer';
}

function toggleTimer() {
  if (timerSeconds <= 0) return;
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ Reprendre';
  } else {
    timerRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ Pause';
    timerInterval = setInterval(() => {
      timerSeconds--;
      updateTimerDisplay();
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('timerStartBtn').textContent = '✅ Terminé!';
        // Flash effect
        const display = document.getElementById('timerDisplay');
        display.style.animation = 'none';
        setTimeout(() => display.style.animation = '', 10);
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = 0;
  updateTimerDisplay();
  document.getElementById('timerStartBtn').textContent = '▶ Démarrer';
}

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = `${m}:${s}`;
}

/* ─── PSEUDO GENERATOR ───────────────────────────────────── */
function generatePseudo(type) {
  const data = appData?.pseudos?.[type] || getFallbackData().pseudos[type];
  if (!data) return;
  const prefix = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
  const suffix = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
  const pseudo = prefix + suffix;

  const textEl = document.getElementById('pseudoText');
  const typeEl = document.getElementById('pseudoType');
  if (textEl) {
    textEl.style.transform = 'scale(0.8)';
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = pseudo;
      textEl.style.transform = 'scale(1)';
      textEl.style.opacity = '1';
    }, 150);
  }
  if (typeEl) typeEl.textContent = type === 'tryhard' ? '💀 STYLE TRYHARD' : '😎 STYLE CHILL';
}

/* ─── HELPERS ────────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ─── FALLBACK DATA ──────────────────────────────────────── */
function getFallbackData() {
  return {
    motivation: [
      "Tu ne perds pas — tu apprends.",
      "Chaque game te rapproche du niveau pro.",
      "La discipline bat le talent qui ne travaille pas.",
      "Les pros ont tous commencé au même niveau que toi.",
      "Chaque mort t'apprend quelque chose. Écoute.",
      "Focus sur ce que tu contrôles : ton aim, ta tête, tes réglages."
    ],
    meta: {
      warzone: [
        { name: "HRM-9 Phantom", type: "SMG", tier: "S", ttk: "320ms", range: "Court/Moyen", recoil: "Faible", style: ["Agressif"], attachments: ["Canon: Suppressor Mk4", "Chargeur: 60 Balles"], tip: "Idéal pour les rushes en intérieur.", emoji: "🔫" },
        { name: "XR-90 Tactical", type: "AR", tier: "S", ttk: "410ms", range: "Moyen/Long", recoil: "Moyen", style: ["Polyvalent"], attachments: ["Canon: Longshot", "Viseur: VLK 4x"], tip: "La polyvalence absolue de la méta.", emoji: "⚡" }
      ],
      fortnite: [
        { name: "Striker AR MK2", type: "AR", tier: "S", ttk: "350ms", range: "Moyen/Long", recoil: "Faible", style: ["Polyvalent"], attachments: ["Scope: 2x Tactical"], tip: "Le meilleur AR de la saison.", emoji: "⭐" },
        { name: "Nova Shotgun", type: "Shotgun", tier: "S", ttk: "OSK", range: "Court", recoil: "Moyen", style: ["Agressif"], attachments: ["Ammo: Slug Shells"], tip: "OSK possible en hitbox tête.", emoji: "💥" }
      ]
    },
    tips: {
      universal: [
        { cat: "Positionnement", icon: "🗺️", title: "Hauteur = Avantage", desc: "Sécurise toujours le high ground. +40% de survie en moyenne." },
        { cat: "Gunfight", icon: "⚔️", title: "Burst Control", desc: "Tire en bursts de 3-4 balles. Contrôle = précision." },
        { cat: "Aim", icon: "🎯", title: "Warm-up Obligatoire", desc: "10 minutes de warm-up avant chaque session." }
      ],
      byStyle: {
        aggressive: [
          { icon: "🔥", title: "Entry fragger mindset", desc: "Surprends l'adversaire par ta vitesse." },
          { icon: "💨", title: "Slide-cancel en permanence", desc: "Le mouvement constant te rend imprévisible." }
        ],
        defensive: [
          { icon: "🛡️", title: "Choke points", desc: "Identifie les points de passage obligatoires." },
          { icon: "👁️", title: "Intel avant tout", desc: "L'information est ton atout principal." }
        ],
        sniper: [
          { icon: "🎯", title: "Pixel perfect ADS", desc: "La précision vaut plus que la vitesse." },
          { icon: "📐", title: "Anticipe le mouvement", desc: "Vise là où l'ennemi VA, pas là où il est." }
        ],
        polyvalent: [
          { icon: "🔀", title: "Lit le jeu en temps réel", desc: "Adapte-toi constamment à la situation." },
          { icon: "🗣️", title: "Communication clé", desc: "Partage l'info à ton équipe." }
        ]
      }
    },
    training: {
      drills: [
        { id: "flick", name: "Flick Aim", icon: "⚡", duration: "5 min", desc: "Cible des ennemis lointains en un seul mouvement rapide.", intensity: "Medium", benefit: "+Réflexes" },
        { id: "tracking", name: "Tracking Smooth", icon: "👁️", duration: "5 min", desc: "Suis une cible en mouvement continu.", intensity: "Low", benefit: "+Tracking" },
        { id: "recoil", name: "Recoil Control", icon: "🎯", duration: "5 min", desc: "Mémorise et compense le recul de ton arme META.", intensity: "High", benefit: "+Précision" }
      ],
      checklist: [
        "Warm-up 10 min (aim trainer ou customs)",
        "Flick drill — 5 min",
        "Tracking drill — 5 min",
        "3 games ranked / compétitif",
        "Analyse 1 mort (VOD review)"
      ]
    },
    pseudos: {
      tryhard: {
        prefixes: ["Shadow", "Zayek", "Void", "Phantom", "Ghost", "Apex", "Storm"],
        suffixes: ["X", "Pro", "TTV", "GG", "Frag", "God", "King"]
      },
      chill: {
        prefixes: ["Lazy", "Vibing", "Sleepy", "Chillin", "Cozy", "Mellow"],
        suffixes: ["Sniper", "Ghost", "Dude", "Vibes", "Mode", "Soul"]
      }
    }
  };
}
