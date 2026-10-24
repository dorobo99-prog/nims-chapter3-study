'use strict';

const entries = [...document.querySelectorAll('.glossary-entry')];
const groups = [...document.querySelectorAll('.glossary-group')];
const sections = [...document.querySelectorAll('.chapter')];
const links = [...document.querySelectorAll('[data-chapter]')];
const search = document.querySelector('#glossary-search');
const clear = document.querySelector('#search-clear');
const status = document.querySelector('#search-status');
const empty = document.querySelector('#empty-results');
const mobileToc = document.querySelector('.mobile-toc');
const currentLabel = document.querySelector('#current-chapter');
const progress = document.querySelector('.reading-progress span');
const normalize = text => text.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
const searchable = entries.map(entry => normalize(entry.querySelector('.definition-pair').textContent));
let scheduled = false;

function updateReading() {
  const visible = sections.filter(section => !section.hidden);
  const offset = window.innerWidth <= 800 ? 145 : 115;
  let current = visible[0];
  for (const section of visible) {
    if (section.getBoundingClientRect().top <= offset) current = section;
  }
  links.forEach(link => {
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

function filterEntries() {
  const words = normalize(search.value).split(' ').filter(Boolean);
  let terms = 0;
  let abbreviations = 0;
  entries.forEach((entry, index) => {
    entry.hidden = !words.every(word => searchable[index].includes(word));
    if (!entry.hidden) {
      if (entry.id.startsWith('term-')) terms += 1;
      else abbreviations += 1;
    }
  });
  groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.glossary-entry')].some(entry => !entry.hidden); });
  links.forEach(link => {
    const unavailable = document.getElementById(link.dataset.chapter).hidden;
    if (unavailable) link.setAttribute('aria-disabled', 'true');
    else link.removeAttribute('aria-disabled');
  });
  const totalTerms = entries.filter(entry => entry.id.startsWith('term-')).length;
  const totalAbbreviations = entries.length - totalTerms;
  const counts = totalTerms ? `용어 ${words.length ? terms : totalTerms}개 · 약어 ${words.length ? abbreviations : totalAbbreviations}개` : `약어 ${words.length ? abbreviations : totalAbbreviations}개`;
  status.textContent = `${words.length ? '검색 결과' : '전체'}: ${counts}`;
  empty.hidden = terms + abbreviations > 0;
  clear.disabled = !search.value;
  scheduleReading();
}

search.addEventListener('input', filterEntries);
search.addEventListener('search', filterEntries);
clear.addEventListener('click', () => { search.value = ''; filterEntries(); search.focus(); });
links.forEach(link => link.addEventListener('click', event => {
  if (link.getAttribute('aria-disabled') === 'true') event.preventDefault();
  else mobileToc.open = false;
}));
window.addEventListener('scroll', scheduleReading, {passive: true});
window.addEventListener('resize', scheduleReading);
window.addEventListener('load', updateReading);
filterEntries();
