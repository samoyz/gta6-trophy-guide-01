// Leonida Platinum: an offline trophy guide and tracker for GTA VI.
// Loads the official trophy list from data/trophies.json, renders one card per
// trophy with its guide and source, and keeps the checklist in localStorage
// with export and import. No network: everything it reads lives under app/.

const STORAGE_KEY = 'leonida-platinum-checklist-v1';
const SPOILER_KEY = 'leonida-platinum-spoilers-v1';

const cardsEl = document.getElementById('cards');
const countEl = document.getElementById('list-count');
const earnedEl = document.getElementById('earned-count');
const progressTextEl = document.getElementById('progress-text');
const progressPctEl = document.getElementById('progress-pct');
const progressFillEl = document.getElementById('progress-fill');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const spoilerEl = document.getElementById('spoiler');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind[0].toUpperCase() + kind.slice(1);
}

function isHidden(t) {
  // Spoiler mode hides the name and description of story trophies
  // until the player has earned them.
  return spoilerEl.checked && t.spoiler && !earned.has(t.id);
}

function matchesFilters(t) {
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (kindEl.value === 'missable') {
    if (!t.missable) return false;
  } else if (kindEl.value !== 'all' && t.kind !== kindEl.value) {
    return false;
  }
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.source}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderMissables() {
  const list = document.getElementById('missable-list');
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = t.name;
    li.append(name, document.createTextNode(` — ${t.description} `));
    const why = document.createElement('span');
    why.className = 'missable-why';
    why.textContent = 'One attempt or choice-locked. Do it before the point of no return.';
    li.append(why);
    list.append(li);
  }
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  earnedEl.textContent = String(n);
  progressTextEl.textContent = `${n} of ${total} earned`;
  const pct = Math.round((n / total) * 100);
  progressPctEl.textContent = `${pct}% to the platinum`;
  progressFillEl.style.width = `${pct}%`;
}

function renderCards() {
  cardsEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  for (const t of shown) {
    const card = document.createElement('article');
    card.className = `card grade-${t.grade}${earned.has(t.id) ? ' earned' : ''}`;

    const head = document.createElement('div');
    head.className = 'card-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderCards();
    });
    head.append(box);

    const title = document.createElement('h3');
    title.textContent = isHidden(t) ? 'Hidden trophy' : t.name;
    head.append(title);

    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge grade-${t.grade}`;
    gradeBadge.textContent = gradeLabel(t.grade);
    badges.append(gradeBadge);
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge kind';
    kindBadge.textContent = kindLabel(t.kind);
    badges.append(kindBadge);
    if (t.missable) {
      const miss = document.createElement('span');
      miss.className = 'badge missable';
      miss.textContent = 'Missable';
      badges.append(miss);
    }
    head.append(badges);
    card.append(head);

    const desc = document.createElement('p');
    desc.className = 'official';
    desc.textContent = isHidden(t)
      ? 'Story trophy — its name and description stay hidden until you earn it.'
      : t.description;
    card.append(desc);

    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = isHidden(t) ? 'Guide hidden with the spoiler setting.' : t.guide;
    card.append(guide);

    const src = document.createElement('p');
    src.className = 'source';
    src.textContent = `Source: ${t.source}`;
    card.append(src);

    cardsEl.append(card);
  }
  countEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function renderAll() {
  renderProgress();
  renderCards();
}

document.getElementById('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify([...earned].sort((a, b) => a - b), null, 2)], {
    type: 'application/json',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const ids = JSON.parse(await file.text());
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});

for (const el of [searchEl, gradeEl, kindEl]) {
  el.addEventListener('input', renderCards);
  el.addEventListener('change', renderCards);
}

spoilerEl.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
  renderCards();
});

renderMissables();
renderAll();
