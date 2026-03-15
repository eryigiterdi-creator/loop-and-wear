

window.addEventListener('DOMContentLoaded', async ()=>{
  const data = await ReLoopSite.loadSiteData();
  ReLoopSite.renderPartners(document.getElementById('partners'), data.partners);
  ReLoopSite.renderPersonas(document.getElementById('personas'), data.personas);
  ReLoopSite.renderTestimonials(document.getElementById('testimonials'), data.testimonials);
});
