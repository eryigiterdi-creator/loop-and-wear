
window.addEventListener('DOMContentLoaded', async ()=>{
  const d = await ReLoopSite.loadSiteData();
  const container = document.getElementById('points');
  const table = document.createElement('table');
  table.className = 'table';
  let html = '<thead><tr><th>ID</th><th>Point</th><th>Adresse</th><th>QR</th><th>Maps</th></tr></thead><tbody>';
  d.points.forEach(p=>{
    html += '<tr>'
      + '<td class="mono">'+p.id+'</td>'
      + '<td><strong>'+p.name+'</strong></td>'
      + '<td>'+p.address+'</td>'
      + '<td><a class="navlink" href="./qrcodes/'+p.id+'.png" target="_blank">QR</a></td>'
      + '<td><a class="navlink" href="'+p.maps+'" target="_blank" rel="noopener">Maps</a></td>'
      + '</tr>';
  });
  html += '</tbody>';
  table.innerHTML = html;
  container.appendChild(table);
});
