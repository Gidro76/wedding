// === Дата свадьбы ===
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
  if (!wrap) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = new Date();
    let diff = WEDDING_DATE - now;

    if (diff <= 0) {
      wrap.innerHTML = '<p class="countdown-title">Этот день настал ✦</p>';
      return;
    }

    days.textContent  = pad(Math.floor(diff / 86400000));
    hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    mins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
    secs.textContent  = pad(Math.floor((diff % 60000) / 1000));
  }

  tick();
  setInterval(tick, 1000);
})();

// === Анкета гостя ===
(function () {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3Di0fhP0wGKQFnJrIeTsYo_2ovb0H59zwFKFYQPRz2uDvnphbNMRb867cYj_x93i4Zg/exec';
  const container = document.getElementById('forms-container');
  if (!container) return;

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
            <label><input type="checkbox" name="alcohol-${index}" value="Самогон от М.Н.Озерова"> Самогон от М.Н.Озерова</label>
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
        allergies:  formData.get(`allergies-${index}`) || ''
      };

      console.log('Отправляем:', data); // ← диагностика, потом уберём

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
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
        console.error(err);
      }
    });
  }

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
// === Появление блоков при скролле ===
(function () {
  const pages = document.querySelectorAll('.page');
  if (!pages.length) return;

  if (!('IntersectionObserver' in window)) {
    pages.forEach(p => p.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  pages.forEach(p => obs.observe(p));

  // Первую страницу показываем сразу
  if (pages[0]) pages[0].classList.add('visible');
})();

// === Универсальная ссылка для добавления в календарь ===
(function () {
  const calendarLinks = document.querySelectorAll('.calendar-link');

  calendarLinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const icsUrl = 'https://gidro76.github.io/wedding/wedding.ics'; // Ваша прямая ссылка

      // Для iPhone, iPad, Mac — используем webcal://
      if (/iPad|iPhone|iPod|Macintosh/.test(userAgent)) {
        window.location.href = 'webcal://' + icsUrl.replace(/^https?:\/\//, '');
      }
      // Для Android — предлагаем добавить в Google Календарь
      else if (/android/i.test(userAgent)) {
        const googleCalendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
                                  '&text=' + encodeURIComponent('Свадьба Ивана и Дарьи') +
                                  '&dates=20270723T120000Z/20270723T210000Z' +
                                  '&location=' + encodeURIComponent('Прибрежный Ярбург') +
                                  '&details=' + encodeURIComponent('Торжественная церемония бракосочетания');
        window.open(googleCalendarUrl, '_blank');
      }
      // Для всех остальных (компьютер) — скачиваем .ics файл
      else {
        // Просто переходим по ссылке, чтобы начать скачивание
        window.location.href = icsUrl;
      }
    });
  });
})();