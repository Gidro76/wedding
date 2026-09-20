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

// === Анкета гостя ===
(function () {
  // ⚠️ ЗАМЕНИ на URL веб-приложения из Apps Script (шаг 5)
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzy8-QEVWyjPowcGi21S6N0sN52NxX1kjmsapEP8e310UQcYRLDbbPylTGQHcClBg-6eA/exec';

  const container = document.getElementById('forms-container');
  if (!container) return; // на случай, если секции нет на странице

  // Строим форму одного человека
  function buildForm(guestId, coupleName, personName, index) {
    const wrap = document.createElement('div');
    wrap.className = 'guest-form-block';

    wrap.innerHTML = `
      <h3 class="form-person-name">${personName}</h3>
      <form class="rsvp-form" data-person="${personName}">
        <input type="hidden" name="guestId" value="${guestId}">
        <input type="hidden" name="coupleName" value="${coupleName}">
        <input type="hidden" name="personName" value="${personName}">

        <div class="form-group">
          <label class="form-label">Планируете ли Вы присутствовать на нашей свадьбе? *</label>
          <div class="radio-group">
            <label><input type="radio" name="attendance-${index}" value="Да" required> Да, с радостью!</label>
            <label><input type="radio" name="attendance-${index}" value="Нет"> К сожалению, не смогу</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Какой алкоголь вы предпочитаете?</label>
          <div class="checkbox-group">
            <label><input type="checkbox" name="alcohol-${index}" value="Вино"> Вино</label>
            <label><input type="checkbox" name="alcohol-${index}" value="Шампанское"> Шампанское</label>
            <label><input type="checkbox" name="alcohol-${index}" value="Виски"> Виски</label>
            <label><input type="checkbox" name="alcohol-${index}" value="Водка"> Водка</label>
            <label><input type="checkbox" name="alcohol-${index}" value="Коньяк"> Коньяк</label>
            <label><input type="checkbox" name="alcohol-${index}" value="Безалкогольные напитки"> Безалкогольные напитки</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Какое горячее Вы предпочитаете?</label>
          <div class="checkbox-group">
            <label><input type="checkbox" name="hotDish-${index}" value="Мясо"> Мясо</label>
            <label><input type="checkbox" name="hotDish-${index}" value="Рыба"> Рыба</label>
            <label><input type="checkbox" name="hotDish-${index}" value="Птица"> Птица</label>
            <label><input type="checkbox" name="hotDish-${index}" value="Вегетарианское блюдо"> Вегетарианское блюдо</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Есть ли у Вас аллергия на какие-либо продукты?</label>
          <textarea name="allergies-${index}" rows="2" placeholder="Напишите здесь, если есть..."></textarea>
        </div>

        <button type="submit" class="rsvp-btn">Отправить</button>
        <div class="form-message"></div>
      </form>
    `;

    attachSubmitHandler(wrap.querySelector('form'), index);
    return wrap;
  }

  // Обработка отправки
  function attachSubmitHandler(form, index) {
    const submitBtn = form.querySelector('.rsvp-btn');
    const messageEl = form.querySelector('.form-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
      messageEl.textContent = '';
      messageEl.className = 'form-message';

      const formData = new FormData(form);
      const alcohol = [];
      const hotDish = [];
      form.querySelectorAll(`input[name="alcohol-${index}"]:checked`).forEach(cb => alcohol.push(cb.value));
      form.querySelectorAll(`input[name="hotDish-${index}"]:checked`).forEach(cb => hotDish.push(cb.value));

      const data = {
        guestId:    formData.get('guestId'),
        coupleName: formData.get('coupleName'),
        guestName:  formData.get('personName'),
        attendance: formData.get(`attendance-${index}`),
        alcohol:    alcohol,
        hotDish:    hotDish,
        allergies:  formData.get('allergies') || ''
      };

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        messageEl.textContent = 'Спасибо! Ваш ответ отправлен 🎉';
        messageEl.className = 'form-message success';
        submitBtn.textContent = 'Отправлено';
        form.querySelectorAll('input, textarea, button').forEach(el => el.disabled = true);
      } catch (err) {
        messageEl.textContent = 'Ошибка. Попробуйте ещё раз.';
        messageEl.className = 'form-message error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';
      }
    });
  }

  // Загружаем данные и строим формы
  (async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      container.innerHTML = '<p class="form-message error">Перейдите по персональной ссылке из приглашения.</p>';
      return;
    }

    try {
      const res = await fetch('guests.json');
      const data = await res.json();
      const guest = data.guests.find(g => g.id === id);

      if (!guest || !guest.people || guest.people.length === 0) {
        container.innerHTML = '<p class="form-message error">Не удалось найти информацию о вас.</p>';
        return;
      }

      container.innerHTML = '';
      guest.people.forEach((personName, i) => {
        container.appendChild(buildForm(guest.id, guest.name, personName, i));
      });
    } catch (err) {
      container.innerHTML = '<p class="form-message error">Ошибка загрузки. Обновите страницу.</p>';
      console.error(err);
    }
  })();
})();