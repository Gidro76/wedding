// === Дата свадьбы ===
// Формат: Год, Месяц(0-11!), День, Часы, Минуты
// 23 июля 2027, 15:00  →  месяц ИЮЛЬ = 6 (январь=0)
const WEDDING_DATE = new Date(2027, 6, 23, 15, 0, 0);

// === Приветствие по имени гостя ===
(async function () {
  const greetingEl = document.getElementById('greeting');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    greetingEl.textContent = 'Дорогие гости!';
    return;
  }

  try {
    const res = await fetch('guests.json');
    const data = await res.json();
    const guest = data.guests.find(g => g.id === id);
    greetingEl.textContent = guest
      ? 'Дорогие ' + guest.greeting + '!'
      : 'Дорогие гости!';
  } catch (e) {
    greetingEl.textContent = 'Дорогие гости!';
    console.error(e);
  }
})();

// === Счётчик ===
(function () {
  const days  = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const mins  = document.getElementById('cd-min');
  const secs  = document.getElementById('cd-sec');
  const wrap  = document.getElementById('countdown');

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    let diff = WEDDING_DATE - now;

    if (diff <= 0) {
      wrap.innerHTML = '<p class="countdown-title">Этот день настал ✦</p>';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    days.textContent  = pad(d);
    hours.textContent = pad(h);
    mins.textContent  = pad(m);
    secs.textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();