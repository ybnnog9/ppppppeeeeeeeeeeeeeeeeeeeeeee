document.addEventListener('DOMContentLoaded', () => {
  const announcement = document.querySelector('[data-announcement]');
  if (announcement) {
    setTimeout(() => {
      announcement.classList.add('is-visible');
    }, 300);
  }
});
