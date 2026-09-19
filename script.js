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

    if (guest) {
      greetingEl.textContent = 'Дорогие ' + guest.greeting + '!';
    } else {
      greetingEl.textContent = 'Дорогие гости!';
    }
  } catch (e) {
    greetingEl.textContent = 'Дорогие гости!';
    console.error(e);
  }
})();
