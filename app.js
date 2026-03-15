const POINTS = [
  { id: 'STR-01', name: 'Campus Esplanade', address: 'Pôle étudiant – Strasbourg', access: 'Lun–Ven 8h–19h', partner: 'BDE / CROUS', capacity: 'Moyenne', bonus: 25 },
  { id: 'STR-02', name: 'Gare Centrale', address: 'Espace logistique centre-ville', access: '7j/7 6h–22h', partner: 'CTS / Retail local', capacity: 'Élevée', bonus: 20 },
  { id: 'STR-03', name: 'Meinau Industrie', address: 'Zone sud – proche ateliers', access: 'Lun–Sam 9h–18h', partner: 'Atelier textile', capacity: 'Très élevée', bonus: 35 },
  { id: 'STR-04', name: 'Neudorf', address: 'Maison des associations', access: 'Mar–Sam 10h–18h', partner: 'Association locale', capacity: 'Moyenne', bonus: 18 },
  { id: 'STR-05', name: 'Cronenbourg', address: 'Pôle commerce de quartier', access: 'Lun–Sam 9h–19h', partner: 'Commerçants partenaires', capacity: 'Faible', bonus: 15 }
];

const CATEGORIES = [
  { key: 'jeans', label: 'Jean', points: 18, kg: 0.7 },
  { key: 'tshirts', label: 'T-shirt', points: 8, kg: 0.2 },
  { key: 'pulls', label: 'Pull / sweat', points: 14, kg: 0.45 },
  { key: 'vestes', label: 'Veste', points: 24, kg: 0.9 },
  { key: 'chaussures', label: 'Chaussures', points: 20, kg: 0.8 },
  { key: 'linge', label: 'Linge maison', points: 12, kg: 0.5 }
];

const defaultState = {
  userName: 'Visiteur ReLoop',
  deposits: [],
  enterprises: [
    { name: 'TextiNord', zone: 'Meinau', needKg: 280, material: 'coton / denim', status: 'active' },
    { name: 'Atelier Fil Vert', zone: 'Neudorf', needKg: 120, material: 'maille', status: 'active' },
    { name: 'EcoTLC Strasbourg', zone: 'Port du Rhin', needKg: 430, material: 'mix textile', status: 'active' }
  ]
};

function readState() {
  try {
    const raw = localStorage.getItem('reloop_state');
    if (!raw) {
      localStorage.setItem('reloop_state', JSON.stringify(defaultState));
      return structuredClone(defaultState);
    }
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaultState), ...parsed };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(state) {
  localStorage.setItem('reloop_state', JSON.stringify(state));
}

function euros(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
}

function getPointById(id) {
  return POINTS.find(p => p.id === id) || POINTS[0];
}

function parseSelectedPoint() {
  const hash = window.location.hash || '';
  const q = hash.includes('?') ? hash.split('?')[1] : '';
  const params = new URLSearchParams(q);
  const paramPoint = params.get('point');
  const searchParams = new URLSearchParams(window.location.search);
  return paramPoint || searchParams.get('point') || POINTS[0].id;
}

function renderPointsList() {
  const mount = document.getElementById('points-list');
  if (!mount) return;
  mount.innerHTML = POINTS.map(point => `
    <article class="card point-card">
      <span class="chip">${point.id}</span>
      <h3>${point.name}</h3>
      <p class="muted">${point.address}</p>
      <div class="point-meta">
        <span>${point.access}</span>
        <span>${point.partner}</span>
        <span>Capacité ${point.capacity}</span>
      </div>
      <p class="small muted">Bonus de validation : <strong class="success">+${point.bonus} pts</strong></p>
      <div class="row">
        <a class="btn primary" href="app.html#app?point=${point.id}">Déposer ici</a>
        <button class="btn" data-copy="${window.location.origin}${window.location.pathname.replace('collecte.html','app.html')}#app?point=${point.id}">Copier le lien QR</button>
      </div>
    </article>
  `).join('');
}

function renderCategoryOptions() {
  const mount = document.getElementById('category-options');
  if (!mount) return;
  mount.innerHTML = CATEGORIES.map(cat => `
    <label class="card mini-card">
      <h3>${cat.label}</h3>
      <p class="muted small">${cat.points} pts / pièce • ${cat.kg} kg estimé</p>
      <div class="row" style="margin-top:10px">
        <input class="input" type="number" min="0" step="1" value="0" data-category="${cat.key}" aria-label="Quantité ${cat.label}">
      </div>
    </label>
  `).join('');
}

function computeDepositSummary(form) {
  let totalItems = 0;
  let totalPoints = 0;
  let totalKg = 0;
  const lines = [];
  CATEGORIES.forEach(cat => {
    const input = form.querySelector(`[data-category="${cat.key}"]`);
    const qty = Number(input?.value || 0);
    if (qty > 0) {
      totalItems += qty;
      totalPoints += qty * cat.points;
      totalKg += qty * cat.kg;
      lines.push(`${qty} × ${cat.label}`);
    }
  });
  return { totalItems, totalPoints, totalKg: Number(totalKg.toFixed(2)), lines };
}

function renderApp() {
  const pointSelect = document.getElementById('point-select');
  const catMount = document.getElementById('category-options');
  const form = document.getElementById('deposit-form');
  if (!pointSelect || !catMount || !form) return;

  const state = readState();
  pointSelect.innerHTML = POINTS.map(p => `<option value="${p.id}">${p.id} – ${p.name}</option>`).join('');
  pointSelect.value = parseSelectedPoint();
  renderCategoryOptions();
  syncPointDetails(pointSelect.value);

  pointSelect.addEventListener('change', () => syncPointDetails(pointSelect.value));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const summary = computeDepositSummary(form);
    const userName = document.getElementById('user-name').value.trim() || 'Visiteur ReLoop';
    const pointId = pointSelect.value;
    const point = getPointById(pointId);

    if (summary.totalItems <= 0) {
      showResult('Ajoute au moins un vêtement pour valider le dépôt.', true);
      return;
    }

    const record = {
      id: crypto.randomUUID(),
      userName,
      pointId,
      pointName: point.name,
      date: new Date().toISOString(),
      items: summary.totalItems,
      kg: summary.totalKg,
      lines: summary.lines,
      points: summary.totalPoints + point.bonus,
      reward: summary.totalPoints >= 60 ? 'Bon d’achat partenaire' : 'Cashback fidélité'
    };

    state.userName = userName;
    state.deposits.unshift(record);
    saveState(state);
    form.reset();
    pointSelect.value = pointId;
    renderCategoryOptions();
    syncPointDetails(pointId);
    renderDashboard();
    showResult(`Dépôt validé à ${point.name} : ${summary.totalItems} article(s), ${summary.totalKg} kg, <strong>+${record.points} points</strong>. Récompense : ${record.reward}.`);
  });

  renderDashboard();
}

function syncPointDetails(pointId) {
  const point = getPointById(pointId);
  const box = document.getElementById('selected-point-details');
  if (!box) return;
  box.innerHTML = `
    <div class="inline-kpi">
      <span class="tag">${point.id}</span>
      <span class="tag">${point.access}</span>
      <span class="tag">${point.partner}</span>
      <span class="tag">Bonus +${point.bonus} pts</span>
    </div>
    <p class="muted">${point.address} • capacité ${point.capacity.toLowerCase()}</p>
  `;
}

function showResult(message, isError = false) {
  const box = document.getElementById('deposit-result');
  if (!box) return;
  box.className = 'result-box';
  box.innerHTML = `<p class="${isError ? 'warning' : 'success'}"><strong>${isError ? 'Attention' : 'Succès'}</strong></p><p>${message}</p>`;
}

function renderDashboard() {
  const state = readState();
  const deposits = state.deposits;
  const summaryMount = document.getElementById('app-summary');
  const latestMount = document.getElementById('latest-deposits');
  const rankingMount = document.getElementById('ranking-table');
  if (summaryMount) {
    const totalDeposits = deposits.length;
    const totalKg = deposits.reduce((s, d) => s + d.kg, 0).toFixed(1);
    const totalPoints = deposits.reduce((s, d) => s + d.points, 0);
    summaryMount.innerHTML = `
      <div class="kpi card"><strong>${totalDeposits}</strong><span class="muted">dépôts validés</span></div>
      <div class="kpi card"><strong>${totalKg} kg</strong><span class="muted">textiles collectés</span></div>
      <div class="kpi card"><strong>${totalPoints}</strong><span class="muted">points distribués</span></div>
    `;
  }

  if (latestMount) {
    latestMount.innerHTML = deposits.length ? deposits.slice(0, 5).map(dep => `
      <div class="card mini-card">
        <h3>${dep.userName}</h3>
        <p class="muted small">${new Date(dep.date).toLocaleString('fr-FR')} • ${dep.pointId} – ${dep.pointName}</p>
        <p>${dep.lines.join(', ')}</p>
        <div class="point-meta"><span>${dep.kg} kg</span><span>+${dep.points} pts</span><span>${dep.reward}</span></div>
      </div>
    `).join('') : '<div class="empty">Aucun dépôt pour le moment. Fais un premier test juste au-dessus.</div>';
  }

  if (rankingMount) {
    const ranking = Object.values(deposits.reduce((acc, dep) => {
      if (!acc[dep.userName]) acc[dep.userName] = { userName: dep.userName, points: 0, kg: 0, deposits: 0 };
      acc[dep.userName].points += dep.points;
      acc[dep.userName].kg += dep.kg;
      acc[dep.userName].deposits += 1;
      return acc;
    }, {})).sort((a,b) => b.points - a.points);

    rankingMount.innerHTML = ranking.length ? `
      <table class="table">
        <thead><tr><th>Rang</th><th>Profil</th><th>Points</th><th>Kg</th><th>Dépôts</th></tr></thead>
        <tbody>
          ${ranking.map((r, i) => `<tr><td>#${i+1}</td><td>${r.userName}</td><td>${r.points}</td><td>${r.kg.toFixed(1)}</td><td>${r.deposits}</td></tr>`).join('')}
        </tbody>
      </table>
    ` : '<div class="empty">Le classement apparaîtra après les premiers dépôts.</div>';
  }
}

function renderImpactPage() {
  const kpiMount = document.getElementById('impact-kpis');
  const monthlyMount = document.getElementById('impact-monthly');
  const state = readState();
  if (!kpiMount || !monthlyMount) return;
  const deps = state.deposits;
  const kg = deps.reduce((s, d) => s + d.kg, 0);
  const co2 = (kg * 8.4).toFixed(1);
  const reuse = Math.round(kg * 6);
  const value = kg * 2.1;
  kpiMount.innerHTML = `
    <div class="kpi card"><strong>${kg.toFixed(1)} kg</strong><span class="muted">collectés</span></div>
    <div class="kpi card"><strong>${co2} kg</strong><span class="muted">CO₂ évités (estimation)</span></div>
    <div class="kpi card"><strong>${reuse}</strong><span class="muted">articles revalorisables</span></div>
    <div class="kpi card"><strong>${euros(value)}</strong><span class="muted">valeur matière estimée</span></div>
  `;

  const byPoint = POINTS.map(p => {
    const totalKg = deps.filter(d => d.pointId === p.id).reduce((s, d) => s + d.kg, 0);
    return { ...p, totalKg };
  }).sort((a,b) => b.totalKg - a.totalKg);

  monthlyMount.innerHTML = `
    <table class="table">
      <thead><tr><th>Point</th><th>Kg collectés</th><th>Dépôts</th><th>Lecture</th></tr></thead>
      <tbody>
      ${byPoint.map(p => {
        const count = deps.filter(d => d.pointId === p.id).length;
        return `<tr><td>${p.id} – ${p.name}</td><td>${p.totalKg.toFixed(1)} kg</td><td>${count}</td><td>${count > 0 ? 'Point actif' : 'À dynamiser'}</td></tr>`;
      }).join('')}
      </tbody>
    </table>
  `;
}

function renderEnterprisePage() {
  const listMount = document.getElementById('enterprise-list');
  const form = document.getElementById('enterprise-form');
  if (!listMount || !form) return;

  const draw = () => {
    const state = readState();
    listMount.innerHTML = state.enterprises.map((ent, idx) => `
      <article class="card mini-card">
        <span class="chip">Demande matière</span>
        <h3>${ent.name}</h3>
        <p class="muted">Zone ${ent.zone} • besoin ${ent.needKg} kg/mois</p>
        <div class="point-meta"><span>${ent.material}</span><span>${ent.status}</span></div>
        <p class="small muted">Index de matching estimé : <strong>${Math.min(97, 52 + idx * 11)}%</strong></p>
      </article>
    `).join('');
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const state = readState();
    state.enterprises.unshift({
      name: fd.get('name'),
      zone: fd.get('zone'),
      needKg: Number(fd.get('needKg') || 0),
      material: fd.get('material'),
      status: 'nouveau lead'
    });
    saveState(state);
    form.reset();
    draw();
    const box = document.getElementById('enterprise-result');
    if (box) box.innerHTML = '<p class="success"><strong>Entreprise ajoutée.</strong> La demande apparaît désormais dans la démo.</p>';
  });

  draw();
}

function activateNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

function activateCopyButtons() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const value = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(value);
      btn.textContent = 'Lien copié';
      setTimeout(() => btn.textContent = 'Copier le lien QR', 1400);
    } catch {
      alert(value);
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  activateNav();
  activateCopyButtons();
  renderPointsList();
  renderApp();
  renderImpactPage();
  renderEnterprisePage();
});
