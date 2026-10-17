'use strict';
const legacyChapter3Anchors = new Set(["current-chapter","overview","heading-overview","principles","heading-principles","ics","heading-ics","command-comparison","ics-staff","figure-3","figure-4","figure-5","multiple","heading-multiple","multiple-comparison","figure-6","eoc","heading-eoc","figure-7","figure-8","figure-9","mac","heading-mac","jis","heading-jis","connections","heading-connections","figure-10","terms","heading-terms","q-research","heading-q-research","review","heading-review","image-viewer","viewer-title","zoom-out","zoom-in","zoom-fit","viewer-close","viewer-image"]);
function resolveLegacyChapter3Link() {
  const anchor = decodeURIComponent(location.hash.slice(1));
  if (legacyChapter3Anchors.has(anchor)) location.replace('chapters/03/' + location.hash);
}
resolveLegacyChapter3Link();
window.addEventListener('hashchange', resolveLegacyChapter3Link);
