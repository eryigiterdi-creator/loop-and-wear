document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const campaignCards = document.querySelectorAll('.campaign-card');
  const redeemButtons = document.querySelectorAll('.redeem-btn');
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const usageButtons = document.querySelectorAll('.usage-btn');
  const mapCards = document.querySelectorAll('.map-card');
  const pointsBalance = document.querySelector('#points-balance');
  const leaderboardPoints = document.querySelector('#leaderboard-points');
  const liveFeedback = document.querySelector('#live-feedback');
  const walletHistory = document.querySelector('#wallet-history');
  const subscriptionStatus = document.querySelector('#subscription-status');

  let balance = 280;
  let classementPoints = 820;

  const setFeedback = (message) => {
    if (liveFeedback) liveFeedback.textContent = message;
    if (walletHistory && message.toLowerCase().includes('points')) walletHistory.textContent = `Dernière action : ${message}`;
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      campaignCards.forEach(card => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || filter === category;
        card.classList.toggle('hidden', !shouldShow);
      });

      setFeedback(`Filtre appliqué : ${button.textContent}.`);
    });
  });

  reserveButtons.forEach(button => {
    button.addEventListener('click', () => {
      const campaign = button.dataset.campaign || 'campagne';
      const points = Number(button.dataset.points || 0);
      button.textContent = 'Dépôt réservé';
      button.disabled = true;
      button.classList.add('is-disabled');
      setFeedback(`Dépôt réservé pour « ${campaign} ». Jusqu'à ${points} points pourront être crédités après validation en borne.`);
    });
  });

  usageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const usage = button.dataset.usage || 'usage concret visible dans la boutique cashback';
      document.querySelector('#cashback-shop')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelectorAll('.reward-card').forEach(card => card.classList.remove('highlighted'));
      document.querySelector('.reward-card')?.classList.add('highlighted');
      setFeedback(`Usage des points : ${usage}. Consulte la boutique cashback pour l'activer immédiatement.`);
    });
  });

  redeemButtons.forEach(button => {
    button.addEventListener('click', () => {
      const cost = Number(button.dataset.cost || 0);

      if (balance < cost) {
        setFeedback(`Solde insuffisant : il vous manque ${cost - balance} points pour cet avantage.`);
        return;
      }

      balance -= cost;
      if (pointsBalance) pointsBalance.textContent = balance;
      button.textContent = 'Activé';
      button.disabled = true;
      button.classList.add('is-disabled');

      if (cost === 90) {
        classementPoints += 50;
        if (leaderboardPoints) leaderboardPoints.textContent = `${classementPoints} pts`;
        setFeedback('Ticket concours activé : 90 points débités et +50 points ajoutés au classement mensuel.');
        return;
      }

      if (cost === 180) {
        if (subscriptionStatus) subscriptionStatus.textContent = 'Abonnement actuel : Loop & Wear Plus actif via cashback';
        setFeedback('Abonnement Plus activé : 180 points débités pour 1 mois premium.');
        return;
      }

      if (cost === 120) {
        setFeedback('Bon d’achat activé : 120 points débités pour un crédit de 5€ dans l’app.');
        return;
      }

      if (cost === 240) {
        setFeedback('Atelier partenaire réservé : 240 points débités avec accès prioritaire confirmé.');
        return;
      }

      setFeedback('Avantage activé : les points ont bien été débités dans le portefeuille.');
    });
  });

  const planEuroButton = Array.from(document.querySelectorAll('.plan-actions .btn-primary')).find(Boolean);
  if (planEuroButton) {
    planEuroButton.addEventListener('click', () => {
      if (subscriptionStatus) subscriptionStatus.textContent = 'Abonnement actuel : Loop & Wear Plus actif via paiement mensuel';
      planEuroButton.textContent = 'Abonnement activé';
      planEuroButton.disabled = true;
      planEuroButton.classList.add('is-disabled');
      setFeedback('Abonnement Plus activé par paiement mensuel : accès premium débloqué.');
    });
  }

  if (window.L && document.querySelector('#collecte-map')) {
    const first = mapCards[0];
    const map = L.map('collecte-map').setView([48.579, 7.746], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markers = [];

    mapCards.forEach((card) => {
      const lat = Number(card.dataset.lat);
      const lng = Number(card.dataset.lng);
      const name = card.dataset.name;
      const address = card.querySelector('span')?.textContent || '';
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br>${address}<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}">Ouvrir dans Google Maps</a>`);
      markers.push(marker);

      card.addEventListener('click', () => {
        mapCards.forEach(item => item.classList.remove('active'));
        card.classList.add('active');
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        marker.openPopup();
        setFeedback(`Point de collecte sélectionné : ${name}.`);
      });
    });

    if (first) first.click();
  }
});
