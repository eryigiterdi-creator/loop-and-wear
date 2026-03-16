const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const filterButtons = document.querySelectorAll('.filter-btn');
const campaignCards = document.querySelectorAll('.campaign-card');
const redeemButtons = document.querySelectorAll('.redeem-btn');
const pointsBalance = document.querySelector('#points-balance');
const leaderboardPoints = document.querySelector('#leaderboard-points');

let balance = 280;
let classementPoints = 820;

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
  });
});

redeemButtons.forEach(button => {
  button.addEventListener('click', () => {
    const cost = Number(button.dataset.cost || 0);

    if (balance < cost) {
      alert("Solde insuffisant : il vous faut plus de points pour utiliser cet avantage.");
      return;
    }

    balance -= cost;
    pointsBalance.textContent = balance;

    if (cost === 90) {
      classementPoints += 50;
      leaderboardPoints.textContent = `${classementPoints} pts`;
      alert("Ticket concours activé : +50 points classement ajoutés pour ce mois-ci.");
      return;
    }

    if (cost === 180) {
      alert("Abonnement Loop & Wear Plus activé avec vos points.");
      return;
    }

    alert("Avantage activé dans l'application. Les points ont bien été utilisés.");
  });
});
