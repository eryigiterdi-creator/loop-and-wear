const pointsData = [
  { id: 'STR-01', nom: 'Rivetoile', adresse: '3 Place Dauphine, Strasbourg', type: 'Centre commercial' },
  { id: 'STR-02', nom: 'Gare de Strasbourg', adresse: 'Place de la Gare, Strasbourg', type: 'Hub transport' },
  { id: 'STR-03', nom: 'Campus Esplanade', adresse: 'Université de Strasbourg', type: 'Campus' },
  { id: 'STR-04', nom: 'Les Halles', adresse: '24 Place des Halles, Strasbourg', type: 'Centre commercial' },
  { id: 'STR-05', nom: 'Place Kléber', adresse: 'Centre-ville Strasbourg', type: 'Point urbain' }
];

const categories = [
  { id: 'jean', nom: 'Jean', points: 18, kg: 0.7 },
  { id: 'tshirt', nom: 'T-shirt', points: 8, kg: 0.2 },
  { id: 'pull', nom: 'Pull', points: 14, kg: 0.5 },
  { id: 'veste', nom: 'Veste', points: 20, kg: 0.9 },
  { id: 'chaussures', nom: 'Chaussures', points: 16, kg: 0.8 },
  { id: 'linge', nom: 'Linge / draps', points: 10, kg: 0.4 }
];

const partenairesData = [
  { nom: 'Cinéma Vox Strasbourg', offre: '120 points = 1 place de cinéma', type: 'Loisir', zone: 'Centre-ville' },
  { nom: 'Boutique officielle Racing Club de Strasbourg', offre: '200 points = 10% de réduction', type: 'Sport', zone: 'Meinau / boutique officielle' },
  { nom: 'Rivetoile', offre: '150 points = bon shopping de 5€', type: 'Retail', zone: 'Rivetoile' },
  { nom: 'Librairie Kléber', offre: '150 points = 5€ de bon d’achat', type: 'Culture', zone: 'Place Kléber' },
  { nom: 'Café Bretelles', offre: '60 points = 1 café offert', type: 'Food', zone: 'Strasbourg centre' },
  { nom: 'UGC Ciné Cité Strasbourg', offre: '220 points = 1 place weekend', type: 'Loisir', zone: 'Strasbourg' }
];

const entreprisesDefault = [
  { nom: 'Atelier Rive Neuve', secteur: 'Upcycling denim', besoin: 'Jean, veste, toile épaisse', volume: '120 kg / mois', zone: 'Strasbourg sud' },
  { nom: 'TextiCycle Alsace', secteur: 'Tri et revalorisation', besoin: 'T-shirt, pull, linge', volume: '250 kg / mois', zone: 'Eurométropole' },
  { nom: 'Studio ReFab', secteur: 'Mode circulaire', besoin: 'Pièces premium, vestes, denim', volume: '80 kg / mois', zone: 'Centre-ville' },
  { nom: 'Insertion Textile 67', secteur: 'Association / insertion', besoin: 'Textiles du quotidien', volume: '180 kg / mois', zone: 'Strasbourg ouest' }
];

const leaderboardDefault = [
  { nom: 'Lina', points: 240 },
  { nom: 'Yanis', points: 215 },
  { nom: 'Camille', points: 190 },
  { nom: 'Noah', points: 160 }
];

function getStore(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) { return fallback; }
}
function setStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function getStats() { return getStore('lw_stats', { depots: 25, kg: 17.6, points: 503 }); }
function setStats(stats) { setStore('lw_stats', stats); }
function getHistory() { return getStore('lw_history', []); }
function setHistory(history) { setStore('lw_history', history); }
function getLeaderboard() { return getStore('lw_leaderboard', leaderboardDefault); }
function setLeaderboard(data) { setStore('lw_leaderboard', data); }
function getEntreprises() { return getStore('lw_entreprises', entreprisesDefault); }
function setEntreprises(data) { setStore('lw_entreprises', data); }

function updateStatsDisplays() {
  const stats = getStats();
  document.querySelectorAll("[data-stat='depots']").forEach(el => el.textContent = stats.depots);
  document.querySelectorAll("[data-stat='kg']").forEach(el => el.textContent = Number(stats.kg).toFixed(1));
  document.querySelectorAll("[data-stat='points']").forEach(el => el.textContent = stats.points);
}

function renderPointsList() {
  const wrap = document.getElementById('points-list');
  if (!wrap) return;
  wrap.innerHTML = pointsData.map(point => `
    <div class="point">
      <div class="inline">
        <div>
          <h4>${point.id} – ${point.nom}</h4>
          <div class="small">${point.adresse} · ${point.type}</div>
        </div>
      </div>
      <div class="actions">
        <a class="btn primary" href="app.html?point=${encodeURIComponent(point.id)}">Déposer ici</a>
      </div>
    </div>
  `).join('');
}

function populatePointSelect() {
  const select = document.getElementById('point-select');
  if (!select) return;
  select.innerHTML = pointsData.map(point => `<option value="${point.id}">${point.id} – ${point.nom}</option>`).join('');
  const params = new URLSearchParams(window.location.search);
  const pointFromUrl = params.get('point');
  if (pointFromUrl) select.value = pointFromUrl;
}
function populateCategorySelect() {
  const select = document.getElementById('categorie-select');
  if (!select) return;
  select.innerHTML = categories.map(category => `<option value="${category.id}">${category.nom} (+${category.points} pts)</option>`).join('');
}

function renderLeaderboard() {
  const wrap = document.getElementById('leaderboard');
  if (!wrap) return;
  const data = [...getLeaderboard()].sort((a,b)=>b.points-a.points);
  wrap.innerHTML = data.map((user,index)=>`
    <div class="rank ${index===0?'top1':index===1?'top2':index===2?'top3':''}">
      <div>#${index+1} — ${user.nom}</div>
      <strong>${user.points} pts</strong>
    </div>`).join('');
}

function renderHistory() {
  const wrap = document.getElementById('history');
  if (!wrap) return;
  const history = getHistory().slice().reverse();
  if (!history.length) {
    wrap.innerHTML = `<div class="history-item small">Aucun dépôt pour le moment.</div>`;
    return;
  }
  wrap.innerHTML = history.map(item => `
    <div class="history-item">
      <strong>${item.categorieNom}</strong> — ${item.point}
      <div class="small">${item.nom} · ${item.quantite} article(s) · ${item.kg.toFixed(1)} kg · ${item.points} pts · ${item.date}</div>
    </div>`).join('');
}

function renderEntreprises() {
  const wrap = document.getElementById('entreprises-list');
  if (!wrap) return;
  wrap.innerHTML = getEntreprises().map(ent => `
    <div class="partner">
      <h4>${ent.nom}</h4>
      <div class="small"><strong>Secteur :</strong> ${ent.secteur}</div>
      <div class="small"><strong>Besoin :</strong> ${ent.besoin}</div>
      <div class="small"><strong>Volume estimé :</strong> ${ent.volume}</div>
      <div class="small"><strong>Zone :</strong> ${ent.zone}</div>
    </div>`).join('');
}

function renderPartenaires() {
  const wrap = document.getElementById('partenaires-list');
  if (!wrap) return;
  wrap.innerHTML = partenairesData.map(item => `
    <div class="partner">
      <div class="inline"><h4>${item.nom}</h4><span class="pill">${item.type}</span></div>
      <div class="small"><strong>Offre :</strong> ${item.offre}</div>
      <div class="small"><strong>Zone :</strong> ${item.zone}</div>
    </div>`).join('');
}

function initDepositForm() {
  const form = document.getElementById('deposit-form');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const nomInput = document.getElementById('nom');
    const pointSelect = document.getElementById('point-select');
    const categorieSelect = document.getElementById('categorie-select');
    const quantiteInput = document.getElementById('quantite');
    const message = document.getElementById('deposit-message');
    if (!nomInput || !pointSelect || !categorieSelect || !quantiteInput) return;
    const nom = nomInput.value.trim() || 'Déposant';
    const pointId = pointSelect.value;
    const categorieId = categorieSelect.value;
    const quantite = Math.max(1, Number(quantiteInput.value || 1));
    const point = pointsData.find(p => p.id === pointId);
    const categorie = categories.find(c => c.id === categorieId);
    if (!point || !categorie) return;
    const gainedPoints = categorie.points * quantite;
    const gainedKg = categorie.kg * quantite;
    const stats = getStats();
    stats.depots += quantite;
    stats.kg += gainedKg;
    stats.points += gainedPoints;
    setStats(stats);
    const history = getHistory();
    history.push({ nom, point: point.id + ' – ' + point.nom, categorieNom: categorie.nom, quantite, kg: gainedKg, points: gainedPoints, date: new Date().toLocaleString('fr-FR') });
    setHistory(history);
    const leaderboard = getLeaderboard();
    const existingUser = leaderboard.find(user => user.nom.toLowerCase() === nom.toLowerCase());
    if (existingUser) existingUser.points += gainedPoints; else leaderboard.push({ nom, points: gainedPoints });
    setLeaderboard(leaderboard);
    if (message) {
      message.style.display = 'block';
      message.innerHTML = `✅ Dépôt validé : <strong>${categorie.nom}</strong> au point <strong>${point.id} – ${point.nom}</strong>.<br>Quantité : <strong>${quantite}</strong> · +<strong>${gainedPoints}</strong> points · <strong>${gainedKg.toFixed(1)} kg</strong> ajoutés.`;
    }
    form.reset();
    populatePointSelect();
    populateCategorySelect();
    updateStatsDisplays();
    renderHistory();
    renderLeaderboard();
  });
}

function initEntrepriseForm() {
  const form = document.getElementById('entreprise-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nom = document.getElementById('ent-nom').value.trim();
    const secteur = document.getElementById('ent-secteur').value.trim();
    const besoin = document.getElementById('ent-besoin').value.trim();
    const volume = document.getElementById('ent-volume').value.trim();
    const zone = document.getElementById('ent-zone').value.trim();
    if (!nom || !secteur || !besoin || !volume || !zone) return;
    const data = getEntreprises();
    data.unshift({ nom, secteur, besoin, volume, zone });
    setEntreprises(data);
    form.reset();
    const msg = document.getElementById('entreprise-message');
    if (msg) { msg.style.display = 'block'; msg.textContent = '✅ Demande entreprise ajoutée et visible sur la page.'; }
    renderEntreprises();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  updateStatsDisplays();
  renderPointsList();
  populatePointSelect();
  populateCategorySelect();
  renderLeaderboard();
  renderHistory();
  renderEntreprises();
  renderPartenaires();
  initDepositForm();
  initEntrepriseForm();
});
