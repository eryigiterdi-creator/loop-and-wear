const pointsData = [
  { id: "STR-01", nom: "Campus Esplanade", adresse: "Université de Strasbourg", type: "Campus", bonus: 20 },
  { id: "STR-02", nom: "Gare Centrale", adresse: "Place de la Gare", type: "Hub urbain", bonus: 15 },
  { id: "STR-03", nom: "Meinau", adresse: "Quartier Meinau", type: "Association", bonus: 18 },
  { id: "STR-04", nom: "Neudorf", adresse: "Place du Marché", type: "Commerce partenaire", bonus: 12 },
  { id: "STR-05", nom: "Cronenbourg", adresse: "Secteur ouest Strasbourg", type: "Campus / relais", bonus: 16 }
];

const categories = [
  { id: "jean", nom: "Jean", points: 18, kg: 0.7 },
  { id: "tshirt", nom: "T-shirt", points: 8, kg: 0.2 },
  { id: "pull", nom: "Pull", points: 14, kg: 0.5 },
  { id: "veste", nom: "Veste", points: 20, kg: 0.9 },
  { id: "chaussures", nom: "Chaussures", points: 16, kg: 0.8 },
  { id: "linge", nom: "Linge", points: 10, kg: 0.4 }
];

const leaderboardDefault = [
  { nom: "Lina", points: 240 },
  { nom: "Yanis", points: 215 },
  { nom: "Camille", points: 190 },
  { nom: "Noah", points: 160 }
];

function getStore(key, fallback){
  try{
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){
    return fallback;
  }
}
function setStore(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function getStats(){
  return getStore("reloop_stats", { depots: 0, kg: 0, points: 0 });
}
function setStats(stats){
  setStore("reloop_stats", stats);
}
function getHistory(){
  return getStore("reloop_history", []);
}
function setHistory(history){
  setStore("reloop_history", history);
}
function getLeaderboard(){
  return getStore("reloop_leaderboard", leaderboardDefault);
}
function setLeaderboard(data){
  setStore("reloop_leaderboard", data);
}

function updateStatsDisplays(){
  const stats = getStats();
  document.querySelectorAll("[data-stat='depots']").forEach(el => el.textContent = stats.depots);
  document.querySelectorAll("[data-stat='kg']").forEach(el => el.textContent = stats.kg.toFixed(1));
  document.querySelectorAll("[data-stat='points']").forEach(el => el.textContent = stats.points);
}

function renderPointsList(){
  const wrap = document.getElementById("points-list");
  if(!wrap) return;
  wrap.innerHTML = pointsData.map(p => `
    <div class="point">
      <div class="inline">
        <div>
          <h4>${p.id} – ${p.nom}</h4>
          <div class="small">${p.adresse} · ${p.type}</div>
        </div>
        <span class="pill">Bonus ${p.bonus} pts</span>
      </div>
      <div class="actions">
        <a class="btn primary" href="app.html?point=${encodeURIComponent(p.id)}">Déposer ici</a>
      </div>
    </div>
  `).join("");
}

function populatePointSelect(){
  const select = document.getElementById("point-select");
  if(!select) return;
  select.innerHTML = pointsData.map(p => `<option value="${p.id}">${p.id} – ${p.nom}</option>`).join("");
  const params = new URLSearchParams(window.location.search);
  const point = params.get("point");
  if(point) select.value = point;
}

function populateCategorySelect(){
  const select = document.getElementById("categorie-select");
  if(!select) return;
  select.innerHTML = categories.map(c => `<option value="${c.id}">${c.nom} (+${c.points} pts)</option>`).join("");
}

function renderLeaderboard(){
  const wrap = document.getElementById("leaderboard");
  if(!wrap) return;
  const data = [...getLeaderboard()].sort((a,b)=>b.points-a.points);
  wrap.innerHTML = data.map((u,i)=>`
    <div class="rank">
      <div>#${i+1} — ${u.nom}</div>
      <strong>${u.points} pts</strong>
    </div>
  `).join("");
}

function renderHistory(){
  const wrap = document.getElementById("history");
  if(!wrap) return;
  const history = getHistory().slice().reverse();
  if(!history.length){
    wrap.innerHTML = `<div class="history-item small">Aucun dépôt pour le moment.</div>`;
    return;
  }
  wrap.innerHTML = history.map(item => `
    <div class="history-item">
      <strong>${item.categorieNom}</strong> — ${item.point}
      <div class="small">${item.nom} · ${item.kg.toFixed(1)} kg · ${item.points} pts · ${item.date}</div>
    </div>
  `).join("");
}

function initDepositForm(){
  const form = document.getElementById("deposit-form");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const nom = document.getElementById("nom").value.trim() || "Déposant";
    const point = document.getElementById("point-select").value;
    const categorieId = document.getElementById("categorie-select").value;
    const quantite = Number(document.getElementById("quantite").value || 1);

    const cat = categories.find(c => c.id === categorieId);
    const p = pointsData.find(x => x.id === point);

    const gainedPoints = (cat.points * quantite) + (p ? p.bonus : 0);
    const gainedKg = cat.kg * quantite;

    const stats = getStats();
    stats.depots += quantite;
    stats.kg += gainedKg;
    stats.points += gainedPoints;
    setStats(stats);

    const history = getHistory();
    history.push({
      nom,
      point,
      categorieNom: cat.nom,
      kg: gainedKg,
      points: gainedPoints,
      date: new Date().toLocaleString("fr-FR")
    });
    setHistory(history);

    const leaderboard = getLeaderboard();
    const found = leaderboard.find(x => x.nom.toLowerCase() === nom.toLowerCase());
    if(found){
      found.points += gainedPoints;
    } else {
      leaderboard.push({ nom, points: gainedPoints });
    }
    setLeaderboard(leaderboard);

    const msg = document.getElementById("deposit-message");
    if(msg){
      msg.innerHTML = `✅ Dépôt validé : <strong>${cat.nom}</strong> au point <strong>${point}</strong>.<br>+${gainedPoints} points · ${gainedKg.toFixed(1)} kg ajoutés.`;
      msg.style.display = "block";
    }

    updateStatsDisplays();
    renderLeaderboard();
    renderHistory();
    form.reset();
    populatePointSelect();
    populateCategorySelect();
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  updateStatsDisplays();
  renderPointsList();
  populatePointSelect();
  populateCategorySelect();
  renderLeaderboard();
  renderHistory();
  initDepositForm();
});
