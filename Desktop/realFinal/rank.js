import { scores } from 'lvl1.js';

document.addEventListener('DOMContentLoaded', function() {
  const userName = localStorage.getItem('userName');

  // Get stored users and their scores from localStorage or initialize an empty array
  let users = JSON.parse(localStorage.getItem('users')) || [];

  if (userName) {
    const userScore = scores[userName] || 0;
    const userIndex = users.findIndex(user => user.name === userName);

    if (userIndex === -1) {
      users.push({ name: userName, score: userScore });
    } else {
      users[userIndex].score = userScore;
    }

    // Store updated users list back to localStorage
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Sort users by score in descending order and take the top 3
  users.sort((a, b) => b.score - a.score);
  const topUsers = users.slice(0, 3);

  const rankingWrap = document.getElementById('ranking-wrap');
  rankingWrap.innerHTML = '';

  topUsers.forEach((user, index) => {
    const rank = ['first', 'second', 'third'][index];
    rankingWrap.innerHTML += `
      <div class="ranking" id="${rank}">
        <i class="fa-solid fa-medal fa-2xl"></i>
        <div class="user">
          <p class="user-name">${user.name}</p>
          <p class="user-score">${user.score.toLocaleString()}</p>
        </div>
      </div>
    `;
  });
});
