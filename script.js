document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const campaignCards = document.querySelectorAll('.campaign-card');
  const reserveButtons = document.querySelectorAll('.reserve-btn');
  const usageButtons = document.querySelectorAll('.usage-btn');
  const redeemButtons = document.querySelectorAll('.redeem-btn');
  const mapCards = document.querySelectorAll('.map-card');

  const pointsBalance = document.getElementById('points-balance');
  const walletBalanceBig = document.getElementById('wallet-balance-big');
  const leaderboardPoints = document.getElementById('leaderboard-points');
  const leaderboardSidebarPoints = document.getElementById('leaderboard-sidebar-points');
  const leaderboardRank = document.getElementById('leaderboard-rank');
  const liveFeedback = document.getElementById('live-feedback');
  const walletHistory = document.getElementById('wallet-history');
  const activeBonLabel = document.getElementById('active-bon-label');
  const userLevel = document.getElementById('user-level');
  const validatedCount = document.getElementById('validated-count');
  const badgeCount = document.getElementById('badge-count');
  const subscriptionStatus = document.getElementById('subscription-status');
  const badgeItems = document.querySelectorAll('.badge-item');
  const notificationList = document.getElementById('notification-list');
  const historyList = document.getElementById('deposit-history');
  const notifBtn = document.getElementById('notif-btn');

  const trackerCode = document.getElementById('tracker-code');
  const trackerScan = document.getElementById('tracker-scan');
  const trackerValidation = document.getElementById('tracker-validation');
  const trackerNote = document.getElementById('tracker-note');
  const scanBtn = document.getElementById('scan-btn');
  const validateBtn = document.getElementById('validate-btn');

  const bonStatusChip = document.getElementById('bon-status-chip');
  const bonExpiry = document.getElementById('bon-expiry');
  const bonTitle = document.getElementById('bon-title');
  const bonSubtitle = document.getElementById('bon-subtitle');
  const bonCode = document.getElementById('bon-code');
  const bonLocation = document.getElementById('bon-location');
  const bonPoints = document.getElementById('bon-points');
  const bonStatus = document.getElementById('bon-status');
  const qrCanvas = document.getElementById('qr-canvas');

  let balance = 280;
  let concoursPoints = 820;
  let rank = 12;
  let validatedDeposits = 3;
  let unlockedBadges = 2;
  let activeDeposit = null;
  let qr = null;

  const notificationsPool = [
    'Nouvelle campagne manteaux publiée près de Rivetoile.',
    'Votre bonus campus est disponible pendant 24 h.',
    'Une benne proche accepte maintenant le denim en bon état.',
    'Une mission flash vous donne +30 pts concours sur les sweats.',
    'Votre profil approche du niveau Recyclage Argent.'
  ];

  if (window.QRious && qrCanvas) {
    qr = new QRious({ element: qrCanvas, size: 170, value: 'Loop & Wear' });
  }

  const updateFeedback = (message) => {
    if (liveFeedback) liveFeedback.textContent = message;
  };

  const updateWallet = (message) => {
    if (walletHistory) walletHistory.textContent = message;
  };

  const updateLevel = () => {
    let level = 'Recyclage Bronze';
    if (validatedDeposits >= 7) level = 'Recyclage Or';
    else if (validatedDeposits >= 5) level = 'Recyclage Argent';
    userLevel.textContent = level;
  };

  const refreshScoreboard = () => {
    pointsBalance.textContent = balance;
    walletBalanceBig.textContent = balance;
    leaderboardPoints.textContent = concoursPoints;
    leaderboardSidebarPoints.textContent = `${concoursPoints} pts`;
    leaderboardRank.textContent = rank;
    validatedCount.textContent = validatedDeposits;
    badgeCount.textContent = unlockedBadges;
    updateLevel();
  };

  const estimateRank = () => {
    if (concoursPoints >= 1180) rank = 1;
    else if (concoursPoints >= 1105) rank = 2;
    else if (concoursPoints >= 1030) rank = 3;
    else if (concoursPoints >= 970) rank = 4;
    else if (concoursPoints >= 900) rank = 5;
    else if (concoursPoints >= 860) rank = 8;
    else rank = 12;
  };

  const unlockBadge = (index) => {
    if (badgeItems[index] && !badgeItems[index].classList.contains('active')) {
      badgeItems[index].classList.add('active');
      unlockedBadges += 1;
    }
  };

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      campaignCards.forEach((card) => {
        const shouldShow = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('hidden', !shouldShow);
      });

      updateFeedback(`Filtre appliqué : ${button.textContent}.`);
    });
  });

  const renderDeposit = () => {
    if (!activeDeposit) return;

    bonStatusChip.textContent = activeDeposit.statusChip;
    bonExpiry.textContent = `Validité : ${activeDeposit.expiry}`;
    bonTitle.textContent = activeDeposit.campaign;
    bonSubtitle.textContent = `${activeDeposit.category} · dépôt prévu à ${activeDeposit.location}`;
    bonCode.textContent = activeDeposit.code;
    bonLocation.textContent = activeDeposit.location;
    bonPoints.textContent = `${activeDeposit.points} pts max`;
    bonStatus.textContent = activeDeposit.statusText;
    activeBonLabel.textContent = activeDeposit.code;

    trackerCode.textContent = `Bon ${activeDeposit.code} créé pour « ${activeDeposit.campaign} ».`;
    trackerScan.textContent = activeDeposit.scanned
      ? `QR code scanné à ${activeDeposit.location}. Le dépôt est enregistré.`
      : 'En attente du scan à la benne ou au point relais.';
    trackerValidation.textContent = activeDeposit.validated
      ? `Dépôt validé. +${activeDeposit.points} points portefeuille crédités.`
      : 'En attente du contrôle qualité et de la confirmation terrain.';

    trackerNote.textContent = activeDeposit.validated
      ? 'Le dépôt a été contrôlé et accepté. Les points sont utilisables dans la boutique cashback et le concours.'
      : activeDeposit.scanned
        ? 'Le scan a bien associé le dépôt au bon. Il reste maintenant la validation par le point de collecte ou le centre de tri.'
        : 'Le client montre ce QR code à la benne connectée ou au point partenaire. Le scan déclenche l’enregistrement du dépôt.';

    scanBtn.disabled = activeDeposit.scanned;
    validateBtn.disabled = !activeDeposit.scanned || activeDeposit.validated;

    if (qr) {
      qr.value = JSON.stringify({
        app: 'Loop & Wear',
        code: activeDeposit.code,
        campaign: activeDeposit.campaign,
        location: activeDeposit.location,
        points: activeDeposit.points
      });
    }
  };

  reserveButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const code = `LNW-${Math.floor(10000 + Math.random() * 90000)}`;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 2);
      const expiry = expiryDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      activeDeposit = {
        code,
        campaign: button.dataset.campaign,
        category: button.dataset.category,
        location: button.dataset.location,
        points: Number(button.dataset.points),
        scanned: false,
        validated: false,
        statusChip: 'Bon créé',
        statusText: 'À présenter au scan',
        expiry
      };

      reserveButtons.forEach((btn) => {
        btn.disabled = false;
        btn.textContent = 'Créer un bon de dépôt';
      });
      button.disabled = true;
      button.textContent = 'Bon généré';

      renderDeposit();
      document.querySelector('#bons')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateFeedback(`Bon ${code} généré pour « ${activeDeposit.campaign} ». Le client peut maintenant aller à ${activeDeposit.location} et faire scanner le QR code.`);
    });
  });

  scanBtn?.addEventListener('click', () => {
    if (!activeDeposit) {
      updateFeedback('Crée d’abord un bon de dépôt.');
      return;
    }

    activeDeposit.scanned = true;
    activeDeposit.statusChip = 'Scanné';
    activeDeposit.statusText = 'Dépôt reçu · contrôle en attente';
    renderDeposit();
    updateFeedback(`Le bon ${activeDeposit.code} a été scanné à ${activeDeposit.location}. Le dépôt est maintenant traçable dans l’application.`);
  });

  validateBtn?.addEventListener('click', () => {
    if (!activeDeposit || !activeDeposit.scanned) {
      updateFeedback('Le QR code doit être scanné avant validation.');
      return;
    }
    if (activeDeposit.validated) {
      updateFeedback('Ce dépôt est déjà validé.');
      return;
    }

    activeDeposit.validated = true;
    activeDeposit.statusChip = 'Validé';
    activeDeposit.statusText = 'Contrôle accepté';
    balance += activeDeposit.points;
    concoursPoints += Math.round(activeDeposit.points * 0.35);
    validatedDeposits += 1;
    unlockBadge(2);
    estimateRank();
    refreshScoreboard();
    renderDeposit();
    updateWallet(`Dépôt validé pour ${activeDeposit.campaign}, +${activeDeposit.points} points ajoutés au portefeuille.`);

    const item = document.createElement('li');
    item.innerHTML = `<strong>${activeDeposit.code}</strong> · ${activeDeposit.campaign} · Validé · +${activeDeposit.points} pts`;
    historyList.prepend(item);

    updateFeedback(`Dépôt validé : ${activeDeposit.points} points crédités et bonus concours ajouté automatiquement.`);
  });

  usageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(button.dataset.scroll || '#cashback')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      updateFeedback('Les points gagnés peuvent être convertis directement dans la boutique cashback ci-dessous.');
    });
  });

  redeemButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const cost = Number(button.dataset.cost || 0);
      const reward = button.dataset.reward;

      if (balance < cost) {
        updateFeedback(`Solde insuffisant : il manque ${cost - balance} points pour cet avantage.`);
        return;
      }

      balance -= cost;
      let action = 'Avantage activé';

      if (reward === 'contest') {
        concoursPoints += 50;
        action = 'Booster concours activé, +50 pts concours ajoutés';
      }
      if (reward === 'subscription') {
        action = 'Loop & Wear Plus activé pour 1 mois';
        subscriptionStatus.textContent = 'Plus';
        unlockBadge(3);
      }
      if (reward === 'cinema') action = 'Place de cinéma ajoutée dans l’espace avantages';
      if (reward === 'nike') action = 'Coupon 5 € marque partenaire débloqué';
      if (reward === 'atelier') action = 'Atelier upcycling premium réservé';
      if (reward === 'friperie') action = 'Bon 10 € friperie partenaire ajouté au portefeuille';

      estimateRank();
      refreshScoreboard();
      button.disabled = true;
      button.textContent = 'Activé';
      updateWallet(action + '.');
      updateFeedback(`Récompense activée : ${action}. Les points ont été débités du portefeuille.`);
    });
  });

  notifBtn?.addEventListener('click', () => {
    const li = document.createElement('li');
    li.textContent = notificationsPool[Math.floor(Math.random() * notificationsPool.length)];
    notificationList.prepend(li);
    updateFeedback('Nouvelle notification ajoutée au profil utilisateur.');
  });

  if (window.L && document.getElementById('collecte-map')) {
    const map = L.map('collecte-map').setView([48.579, 7.746], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapCards.forEach((card) => {
      const lat = Number(card.dataset.lat);
      const lng = Number(card.dataset.lng);
      const name = card.dataset.name;
      const address = card.dataset.address;
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${name}</strong><br>${address}`);

      card.addEventListener('click', () => {
        mapCards.forEach((item) => item.classList.remove('active'));
        card.classList.add('active');
        map.flyTo([lat, lng], 15, { duration: 0.8 });
        marker.openPopup();
        updateFeedback(`Point de collecte sélectionné : ${name}.`);
      });
    });

    if (mapCards[0]) mapCards[0].click();
  }

  refreshScoreboard();
});
