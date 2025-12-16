// --- Реєстрація Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW зареєстровано!', reg))
      .catch(err => console.log('Помилка:', err));
  });
}

// --- Відображення блоку офлайн/онлайн ---
window.addEventListener('online', () => {
  const el = document.getElementById('offline');
  if (el) el.style.display = 'none';
});

window.addEventListener('offline', () => {
  const el = document.getElementById('offline');
  if (el) el.style.display = 'block';
});

// --- Функція для оновлення SW ---
async function updateSW() {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return alert('Немає SW');

  reg.update();

  reg.addEventListener('updatefound', () => {
    const newSW = reg.installing;

    newSW.addEventListener('statechange', () => {
      if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
        if (confirm('Нова версія! Оновити?')) {
          newSW.postMessage({ action: 'skipWaiting' });
        }
      }
    });
  });
}

// --- Автоматичне перезавантаження після активації нового SW ---
navigator.serviceWorker.addEventListener('controllerchange', () => {
  window.location.reload();
});

// --- Функція для офлайн-замовлення ---
async function placeOrder() {
  const reg = await navigator.serviceWorker.ready;
  if ('sync' in reg) {
    await reg.sync.register('send-order');
    alert('Замовлення в черзі! Відправиться автоматично.');
  } else {
    alert('Sync не підтримується');
  }
}

// --- Слухач повідомлень від Service Worker ---
navigator.serviceWorker.addEventListener('message', event => {
  alert(event.data);
});
