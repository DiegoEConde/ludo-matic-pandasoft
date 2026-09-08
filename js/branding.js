// Branding stays independent from game state and dice timers.
(() => {
  const intro = document.querySelector('#intro-screen');
  const app = document.querySelector('.app-shell');
  const logo = intro.querySelector('img');
  app.inert = true;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    intro.remove();
    app.inert = false;
  };
  // A delayed logo must never keep the game locked.
  window.setTimeout(finish, 5000);
  const start = () => {
    window.setTimeout(() => {
      intro.classList.add('is-leaving');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
      else {
        intro.addEventListener('transitionend', finish, { once: true });
        window.setTimeout(finish, 650);
      }
    }, 2000);
  };
  if (logo.complete) start();
  else {
    logo.addEventListener('load', start, { once: true });
    logo.addEventListener('error', start, { once: true });
  }
})();
