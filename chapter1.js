'use strict';

const sections = [...document.querySelectorAll('.chapter1-body > .chapter')];
const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
const mobileToc = document.querySelector('.mobile-toc');
const currentLabel = document.querySelector('#current-chapter');
const progress = document.querySelector('.reading-progress span');
const modeButtons = [...document.querySelectorAll('[data-mode-btn]')];
let scheduled = false;

function updateReading() {
  const visible = sections.filter(section => section.getClientRects().length);
  const offset = window.innerWidth <= 800 ? 145 : 115;
  let current = visible[0];
  for (const section of visible) {
    if (section.getBoundingClientRect().top <= offset) current = section;
  }
  chapterLinks.forEach(link => {
    if (link.dataset.chapter === current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  currentLabel.textContent = current.dataset.tocLabel;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 100}%`;
  scheduled = false;
}

function scheduleReading() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
}

function setMode(mode) {
  document.body.dataset.mode = mode;
  modeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.modeBtn === mode)));
  try { localStorage.setItem('nims-ch1-mode', mode); } catch {}
  scheduleReading();
}

function revealFragment(hash) {
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  if (document.body.dataset.mode === 'brief' && target.closest('.field, .full-only')) setMode('full');
  let parent = target.parentElement;
  while (parent) {
    if (parent.tagName === 'DETAILS') parent.open = true;
    parent = parent.parentElement;
  }
}

let savedMode = 'full';
try { savedMode = localStorage.getItem('nims-ch1-mode') || 'full'; } catch {}
setMode(savedMode === 'brief' ? 'brief' : 'full');
modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.modeBtn)));
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  revealFragment(link.getAttribute('href'));
  if (mobileToc.contains(link)) mobileToc.open = false;
  scheduleReading();
});
window.addEventListener('hashchange', () => { revealFragment(location.hash); scheduleReading(); });
window.addEventListener('scroll', scheduleReading, {passive: true});
window.addEventListener('resize', scheduleReading);
document.addEventListener('toggle', scheduleReading, true);
window.addEventListener('load', () => {
  revealFragment(location.hash);
  if (location.hash) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    document.getElementById(id)?.scrollIntoView();
  }
  updateReading();
});
updateReading();
