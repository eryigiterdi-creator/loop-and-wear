
async function loadSiteData(){
  const res = await fetch('./js/site_data.json');
  if(!res.ok) throw new Error('site_data.json introuvable');
  return await res.json();
}
function mk(tag, cls){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  return e;
}
function renderPartners(container, partners){
  const wall = mk('div','logoWall');
  partners.forEach(p=>{
    const tile = mk('div','logoTile');
    const img = mk('img'); img.src = p.logo; img.alt = p.name;
    tile.appendChild(img);
    wall.appendChild(tile);
  });
  container.appendChild(wall);
}
function renderPersonas(container, personas){
  const grid = mk('div','grid');
  personas.forEach(x=>{
    const c = mk('div','card span4');
    c.innerHTML = '<h3 class="sectionTitle" style="margin:0 0 8px;">'+x.name+'</h3>'
      +'<p class="p"><strong>Objectif :</strong> '+x.goal+'<br><strong>Problème :</strong> '+x.pain+'<br><strong>Usage ReLoop :</strong> '+x.use+'</p>';
    grid.appendChild(c);
  });
  container.appendChild(grid);
}
function renderEnterpriseTypes(container, types){
  const table = mk('table','table');
  let html = '<thead><tr><th>Type d’entreprise</th><th>Besoin principal</th></tr></thead><tbody>';
  types.forEach(t=>{ html += '<tr><td><strong>'+t.name+'</strong></td><td>'+t.need+'</td></tr>'; });
  html += '</tbody>';
  table.innerHTML = html;
  container.appendChild(table);
}
function renderTestimonials(container, items){
  const grid = mk('div','grid');
  items.forEach(t=>{
    const c = mk('div','card span4');
    c.innerHTML = '<p class="p" style="margin:0 0 10px;">“'+t.quote+'”</p><div class="small">— '+t.name+'</div>';
    grid.appendChild(c);
  });
  container.appendChild(grid);
}
window.ReLoopSite = { loadSiteData, renderPartners, renderPersonas, renderEnterpriseTypes, renderTestimonials };
