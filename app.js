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

const entreprisesDefault = [
  { nom: 'Atelier Rive Neuve', secteur: 'Upcycling denim', besoin: 'Jean, veste, toile épaisse', volume: '120 kg / mois', zone: 'Strasbourg sud' },
  { nom: 'TextiCycle Alsace', secteur: 'Tri et revalorisation', besoin: 'T-shirt, pull, linge', volume: '250 kg / mois', zone: 'Eurométropole' },
  { nom: 'Studio ReFab', secteur: 'Mode circulaire', besoin: 'Pièces premium, vestes, denim', volume: '80 kg / mois', zone: 'Centre-ville' },
  { nom: 'Insertion Textile 67', secteur: 'Association / insertion', besoin: 'Textiles du quotidien', volume: '180 kg / mois', zone: 'Strasbourg ouest' }
];

const partnersData = [
  { nom: 'Cinéma Vox Strasbourg', offre: '1 place à tarif réduit dès 90 points', type: 'Culture / loisir' },
  { nom: 'Boutique officielle Racing Club de Strasbourg', offre: '10 % de réduction dès 200 points', type: 'Sport / merchandising' },
  { nom: 'Rivetoile – boutiques partenaires', offre: 'Bon shopping de 5 € dès 120 points', type: 'Centre commercial' },
  { nom: 'Librairie Kléber', offre: 'Bon lecture de 7 € dès 100 points', type: 'Culture' },
  { nom: 'Café Bretelles Strasbourg', offre: 'Boisson offerte dès 60 points', type: 'Food' },
  { nom: 'UGC Ciné Cité Strasbourg', offre: 'Réduction séance dès 100 points', type: 'Cinéma' }
];

const offersData = [
  { nom: 'Starter', prix: '19 € / mois', avantages: ['1 point de collecte inclus', 'Reporting mensuel simplifié', 'Visibilité sur la plateforme'] },
  { nom: 'Croissance', prix: '49 € / mois', avantages: ['Jusqu’à 3 points de collecte', 'Dashboard impact', 'Campagnes cashback partenaires', 'Support prioritaire'] },
  { nom: 'Réseau', prix: '99 € / mois', avantages: ['Jusqu’à 8 points de collecte', 'Reporting ESG avancé', 'Concours sponsorisés', 'Exports de données'] }
];

const leaderboardDefault = [
  { nom: 'Lina', points: 240 },
  { nom: 'Yanis', points: 215 },
  { nom: 'Camille', points: 190 },
  { nom: 'Noah', points: 160 },
  { nom: 'Sarah', points: 142 }
];

function getStore(key, fallback){
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e){ return fallback; }
}
function setStore(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
function getStats(){ return getStore('reloop_stats', { depots: 184, kg: 512.4, points: 4310 }); }
function setStats(v){ setStore('reloop_stats', v); }
function getHistory(){ return getStore('reloop_history', []); }
function setHistory(v){ setStore('reloop_history', v); }
function getLeaderboard(){ return getStore('reloop_leaderboard', leaderboardDefault); }
function setLeaderboard(v){ setStore('reloop_leaderboard', v); }
function getEntrepriseRequests(){ return getStore('reloop_requests', entreprisesDefault); }
function setEntrepriseRequests(v){ setStore('reloop_requests', v); }

function updateStatsDisplays(){
  const s = getStats();
  document.querySelectorAll("[data-stat='depots']").forEach(el=>el.textContent=s.depots);
  document.querySelectorAll("[data-stat='kg']").forEach(el=>el.textContent=s.kg.toFixed(1));
  document.querySelectorAll("[data-stat='points']").forEach(el=>el.textContent=s.points);
}

function renderPointsList(){
  const wrap = document.getElementById('points-list'); if(!wrap) return;
  wrap.innerHTML = pointsData.map(p=>`
    <div class="point">
      <div class="inline"><div><h4>${p.id} – ${p.nom}</h4><div class="small">${p.adresse} · ${p.type}</div></div></div>
      <div class="actions"><a class="btn primary" href="app.html?point=${encodeURIComponent(p.id)}">Déposer ici</a></div>
    </div>`).join('');
}

function populatePointSelect(){
  const select = document.getElementById('point-select'); if(!select) return;
  select.innerHTML = pointsData.map(p=>`<option value="${p.id}">${p.id} – ${p.nom}</option>`).join('');
  const params = new URLSearchParams(window.location.search); const point = params.get('point'); if(point) select.value = point;
}
function populateCategorySelect(){
  const select = document.getElementById('categorie-select'); if(!select) return;
  select.innerHTML = categories.map(c=>`<option value="${c.id}">${c.nom} (+${c.points} pts)</option>`).join('');
}
function renderLeaderboard(){
  const wrap = document.getElementById('leaderboard'); if(!wrap) return;
  const data = [...getLeaderboard()].sort((a,b)=>b.points-a.points);
  wrap.innerHTML = data.map((u,i)=>`<div class="rank"><div>#${i+1} — ${u.nom}</div><strong>${u.points} pts</strong></div>`).join('');
  const top3 = document.getElementById('top3');
  if(top3){
    top3.innerHTML = data.slice(0,3).map((u,i)=>`<div class="topbox"><div>${['🥇','🥈','🥉'][i]}</div><strong>${u.nom}</strong><div class="small">${u.points} pts</div><div class="small">${i===0?'Bon partenaire 50 €':i===1?'Bon partenaire 30 €':'Bon partenaire 15 €'}</div></div>`).join('');
  }
}
function renderHistory(){
  const wrap = document.getElementById('history'); if(!wrap) return;
  const history = getHistory().slice().reverse();
  if(!history.length){ wrap.innerHTML = `<div class="history-item small">Aucun dépôt pour le moment.</div>`; return; }
  wrap.innerHTML = history.map(item=>`<div class="history-item"><strong>${item.categorieNom}</strong> — ${item.point}<div class="small">${item.nom} · ${item.quantite} article(s) · ${item.kg.toFixed(1)} kg · ${item.points} pts · ${item.date}</div></div>`).join('');
}
function renderEntreprises(){
  const wrap = document.getElementById('entreprises-list'); if(!wrap) return;
  wrap.innerHTML = getEntrepriseRequests().map(ent=>`<div class="partner"><h4>${ent.nom}</h4><div class="small"><strong>Secteur :</strong> ${ent.secteur}</div><div class="small"><strong>Besoin :</strong> ${ent.besoin}</div><div class="small"><strong>Volume estimé :</strong> ${ent.volume}</div><div class="small"><strong>Zone :</strong> ${ent.zone}</div></div>`).join('');
}
function renderPartners(){
  const wrap = document.getElementById('partners-list'); if(!wrap) return;
  wrap.innerHTML = partnersData.map(p=>`<div class="partner"><h4>${p.nom}</h4><div class="small">${p.type}</div><div style="margin-top:8px"><span class="pill">${p.offre}</span></div></div>`).join('');
}
function renderOffers(){
  const wrap = document.getElementById('offers-list'); if(!wrap) return;
  wrap.innerHTML = offersData.map(o=>`<div class="offer"><h4>${o.nom}</h4><div class="pill">${o.prix}</div><ul>${o.avantages.map(a=>`<li>${a}</li>`).join('')}</ul></div>`).join('');
}
function initDepositForm(){
  const form = document.getElementById('deposit-form'); if(!form) return;
  form.addEventListener('submit', function(event){
    event.preventDefault();
    const nomInput = document.getElementById('nom');
    const pointSelect = document.getElementById('point-select');
    const categorieSelect = document.getElementById('categorie-select');
    const quantiteInput = document.getElementById('quantite');
    const message = document.getElementById('deposit-message');
    const nom = nomInput.value.trim() || 'Déposant';
    const point = pointsData.find(p=>p.id===pointSelect.value);
    const categorie = categories.find(c=>c.id===categorieSelect.value);
    const quantite = Math.max(1, Number(quantiteInput.value || 1));
    if(!point || !categorie){ if(message){ message.style.display='block'; message.innerHTML='❌ Impossible de valider le dépôt.'; } return; }
    const gainedPoints = categorie.points * quantite;
    const gainedKg = categorie.kg * quantite;
    const stats = getStats(); stats.depots += quantite; stats.kg += gainedKg; stats.points += gainedPoints; setStats(stats);
    const history = getHistory(); history.push({ nom, point: `${point.id} – ${point.nom}`, categorieNom: categorie.nom, quantite, kg: gainedKg, points: gainedPoints, date: new Date().toLocaleString('fr-FR') }); setHistory(history);
    const leaderboard = getLeaderboard(); const existingUser = leaderboard.find(u=>u.nom.toLowerCase()===nom.toLowerCase()); if(existingUser){ existingUser.points += gainedPoints; } else { leaderboard.push({ nom, points: gainedPoints }); } setLeaderboard(leaderboard);
    if(message){ message.style.display='block'; message.innerHTML=`✅ Dépôt validé : <strong>${categorie.nom}</strong> au point <strong>${point.id} – ${point.nom}</strong>.<br>Quantité : <strong>${quantite}</strong> · +<strong>${gainedPoints}</strong> points · <strong>${gainedKg.toFixed(1)} kg</strong> ajoutés.`; }
    form.reset(); populatePointSelect(); populateCategorySelect(); updateStatsDisplays(); renderHistory(); renderLeaderboard();
  });
}
function initEntrepriseForm(){
  const form = document.getElementById('request-form'); if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const nom = document.getElementById('ent-nom').value.trim();
    const secteur = document.getElementById('ent-secteur').value.trim();
    const besoin = document.getElementById('ent-besoin').value.trim();
    const volume = document.getElementById('ent-volume').value.trim();
    const zone = document.getElementById('ent-zone').value.trim();
    const msg = document.getElementById('request-message');
    if(!nom || !besoin){ if(msg){ msg.style.display='block'; msg.innerHTML='❌ Merci de remplir au moins le nom et le besoin.'; } return; }
    const data = getEntrepriseRequests();
    data.unshift({ nom, secteur: secteur || 'Non précisé', besoin, volume: volume || 'À définir', zone: zone || 'Strasbourg' });
    setEntrepriseRequests(data);
    if(msg){ msg.style.display='block'; msg.innerHTML='✅ Demande entreprise publiée sur la plateforme.'; }
    form.reset(); renderEntreprises();
  });
}

document.addEventListener('DOMContentLoaded', function(){
  updateStatsDisplays(); renderPointsList(); populatePointSelect(); populateCategorySelect(); renderLeaderboard(); renderHistory(); renderEntreprises(); renderPartners(); renderOffers(); initDepositForm(); initEntrepriseForm();
});
