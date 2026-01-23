(() => {
  const root = document.getElementById('IntroOpening');
  if (!root) return;

  const video = document.getElementById('IntroVideo');
  const enterBtn = document.getElementById('IntroEnterBtn');
  const skipBtn = document.getElementById('IntroSkipBtn');

  const showOnce = root.dataset.showOnce === 'true';
  const storageKey = root.dataset.storageKey || 'intro_opening_seen_v1';
  const startMuted = root.dataset.startMuted !== 'false';

  const canAutoplayInline = () => !!video && typeof video.play === 'function';

  function lockPage() {
    document.documentElement.classList.add('intro-lock');
    document.body.classList.add('intro-lock');
    root.setAttribute('aria-hidden', 'false');
  }

  function unlockPage() {
    document.documentElement.classList.remove('intro-lock');
    document.body.classList.remove('intro-lock');
    root.setAttribute('aria-hidden', 'true');
  }

  function showIntro() {
    root.classList.add('is-visible');
    lockPage();
  }

  function hideIntro() {
    root.classList.remove('is-visible', 'is-playing');
    unlockPage();
    if (showOnce) {
      try {
        localStorage.setItem(storageKey, '1');
      } catch (error) {
        console.warn(error);
      }
    }
  }

  function alreadySeen() {
    if (!showOnce) return false;
    try {
      return localStorage.getItem(storageKey) === '1';
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  async function playIntro() {
    if (!canAutoplayInline()) {
      hideIntro();
      return;
    }

    root.classList.add('is-playing');
    video.muted = !!startMuted;

    try {
      await video.play();
    } catch (error) {
      console.warn(error);
      hideIntro();
      return;
    }

    const onEnd = () => {
      video.removeEventListener('ended', onEnd);
      hideIntro();
      try {
        video.currentTime = 0;
      } catch (error) {
        console.warn(error);
      }
    };
    video.addEventListener('ended', onEnd);
  }

  function skipIntro() {
    try {
      video.pause();
    } catch (error) {
      console.warn(error);
    }
    hideIntro();
  }

  if (!alreadySeen()) {
    showIntro();
  } else {
    return;
  }

  if (enterBtn) enterBtn.addEventListener('click', playIntro);
  if (skipBtn) skipBtn.addEventListener('click', skipIntro);

  if (video) {
    video.addEventListener('error', () => hideIntro());
  }

  document.addEventListener('keydown', (event) => {
    if (!root.classList.contains('is-visible')) return;
    if (event.key === 'Escape') skipIntro();
  });
})();
