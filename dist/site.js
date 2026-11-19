const viewer = document.querySelector('#photo-viewer');
const photo = viewer.querySelector('img');
const caption = viewer.querySelector('#caption');

const hero = document.querySelector('.hero');
const portrait = hero.querySelector('.portrait');
const pointerMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

async function showEntry() {
  const screen = document.querySelector('.entry-screen');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (location.hash || reducedMotion || !screen.showModal ||
      performance.getEntriesByType('navigation')[0]?.type === 'back_forward') return;

  const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
  screen.showModal();
  try {
    const ready = portrait.querySelector('img').decode().catch(() => {});
    await Promise.all([delay(750), Promise.race([ready, delay(2000)])]);
    if (screen.open) {
      screen.classList.add('leaving');
      await delay(300);
    }
  } finally {
    screen.close();
  }
}
showEntry();

function resetPortrait() {
  portrait.style.removeProperty('--tilt-x');
  portrait.style.removeProperty('--tilt-y');
}

hero.addEventListener('pointermove', event => {
  if (!pointerMotion.matches || event.pointerType !== 'mouse') return;
  const bounds = hero.getBoundingClientRect();
  const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
  const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
  portrait.style.setProperty('--tilt-x', (-vertical * 7) + 'deg');
  portrait.style.setProperty('--tilt-y', (horizontal * 10) + 'deg');
});
hero.addEventListener('pointerleave', resetPortrait);
pointerMotion.addEventListener('change', resetPortrait);

document.querySelectorAll('.zoom').forEach(link => {
  link.addEventListener('click', event => {
    if (!viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    photo.src = link.href;
    photo.alt = link.querySelector('img').alt;
    caption.textContent = link.closest('figure').querySelector('figcaption').textContent;
    viewer.showModal();
  });
});

viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const bounds = viewer.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
});
