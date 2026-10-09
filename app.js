'use strict';
const chapters = [...document.querySelectorAll('.chapter')];
const chapterLinks = [...document.querySelectorAll('[data-chapter]')];
const mobileToc = document.querySelector('.mobile-toc');
const currentLabel = document.querySelector('#current-chapter');
const progress = document.querySelector('.reading-progress span');
let scheduled = false;
function updateReading() {
  const offset = window.innerWidth <= 800 ? 145 : 115;
  let current = chapters[0];
  for (const chapter of chapters) {
    if (chapter.getBoundingClientRect().top <= offset) current = chapter;
  }
  chapterLinks.forEach(link => {
    if (link.dataset.chapter === current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  currentLabel.textContent = current.querySelector('h2').textContent;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 100}%`;
  scheduled = false;
}
function scheduleReading() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
}
window.addEventListener('scroll', scheduleReading, {passive:true});
window.addEventListener('resize', scheduleReading);
window.addEventListener('load', updateReading);
mobileToc.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { mobileToc.open = false; }));
updateReading();

const viewer = document.querySelector('#image-viewer');
const viewerImage = document.querySelector('#viewer-image');
const scroller = viewer.querySelector('.viewer-scroll');
let fitWidth = 1;
let zoom = 1;
let opener;
function applyZoom() { viewerImage.style.width = `${fitWidth * zoom}px`; }
function fitImage() {
  const style = getComputedStyle(scroller);
  fitWidth = Math.max(1, Math.min(viewerImage.naturalWidth || 1600, scroller.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
  zoom = 1;
  applyZoom();
  scroller.scrollTo(0, 0);
}
document.querySelectorAll('.figure-open').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  opener = link;
  const image = link.querySelector('img');
  document.querySelector('#viewer-title').textContent = image.alt;
  viewerImage.alt = image.alt;
  viewerImage.onload = fitImage;
  viewerImage.src = link.getAttribute('href');
  viewer.showModal();
  document.body.classList.add('viewer-active');
  requestAnimationFrame(fitImage);
  document.querySelector('#viewer-close').focus();
}));
document.querySelector('#zoom-in').addEventListener('click', () => { zoom = Math.min(4, zoom * 1.4); applyZoom(); });
document.querySelector('#zoom-out').addEventListener('click', () => { zoom = Math.max(.5, zoom / 1.4); applyZoom(); });
document.querySelector('#zoom-fit').addEventListener('click', fitImage);
document.querySelector('#viewer-close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => { document.body.classList.remove('viewer-active'); opener?.focus({preventScroll:true}); });
window.addEventListener('resize', () => { if (viewer.open) fitImage(); });
