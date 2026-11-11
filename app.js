const cover = document.querySelector('#cover');
const letter = document.querySelector('#letter');
const activities = document.querySelector('#activities');
const accepted = document.querySelector('#accepted');
const openButtons = [document.querySelector('#open-letter'), document.querySelector('#cat-open')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const activityForm = document.querySelector('#activities-form');
const choices = [...activityForm.querySelectorAll('.activity-ticket')];
const ticketSlots = [...document.querySelectorAll('#ticket-slots li')];
const selectedTickets = new Set();
const viewChoices = document.querySelector('#view-activities');
const activityCount = document.querySelector('#activity-count');
const selectedList = document.querySelector('#selected-activities');
const copyStatus = document.querySelector('#copy-status');
const answer = document.querySelector('#activity-answer');
const message = document.querySelector('#activity-message');
const maxChoices = 3;
let heartTimer;

function showSection(section, focusTarget) {
  for (const item of [cover, letter, activities, accepted]) {
    item.hidden = item !== section;
    item.classList.remove('state-enter');
  }
  section.classList.add('state-enter');
  for (const button of openButtons) {
    button.setAttribute('aria-expanded', String(section === letter));
  }
  window.scrollTo({top: 0, behavior: 'instant'});
  focusTarget.focus({preventScroll: true});
}

function playHearts() {
  if (reducedMotion.matches) return;
  const shower = document.querySelector('#heart-shower');
  window.clearTimeout(heartTimer);
  shower.replaceChildren();
  for (let index = 0; index < 16; index++) {
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    particle.classList.add('heart-particle');
    particle.setAttribute('viewBox', '0 0 24 24');
    particle.style.setProperty('--left', `${8 + Math.random() * 84}%`);
    particle.style.setProperty('--delay', `${Math.random() * .55}s`);
    particle.style.setProperty('--rotation', `${Math.random() * 100 - 50}deg`);
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#heart');
    particle.append(use);
    shower.append(particle);
  }
  heartTimer = window.setTimeout(() => shower.replaceChildren(), 3500);
}

function updateChoices() {
  const count = selectedTickets.size;
  for (const choice of choices) {
    const selected = selectedTickets.has(choice);
    choice.setAttribute('aria-pressed', String(selected));
    choice.setAttribute('aria-disabled', String(count >= maxChoices && !selected));
  }
  const titles = [...selectedTickets].map(choice => choice.dataset.ticket ?? choice.querySelector('.ticket-title').textContent);
  for (const [index, slot] of ticketSlots.entries()) {
    slot.textContent = titles[index] ?? 'Свободно';
    slot.classList.toggle('has-ticket', index < count);
  }
  activityCount.textContent = `${count} из ${maxChoices} билетов`;
  viewChoices.disabled = count === 0;
}

for (const button of openButtons) {
  button.addEventListener('click', () => showSection(letter, document.querySelector('#letter-title')));
}
document.querySelector('#close-letter').addEventListener('click', () => showSection(cover, openButtons[0]));
document.querySelector('#open-activities').addEventListener('click', () => showSection(activities, document.querySelector('#activities-title')));
document.querySelector('#activities-back').addEventListener('click', () => showSection(letter, document.querySelector('#letter-title')));
document.querySelector('#edit-activities').addEventListener('click', () => showSection(activities, document.querySelector('#activities-title')));
for (const choice of choices) {
  choice.addEventListener('click', () => {
    if (selectedTickets.has(choice)) {
      selectedTickets.delete(choice);
    } else if (selectedTickets.size < maxChoices) {
      selectedTickets.add(choice);
    }
    updateChoices();
  });
}
updateChoices();

activityForm.addEventListener('submit', event => {
  event.preventDefault();
  if (selectedTickets.size === 0) return;

  const labels = [...selectedTickets].map(choice => choice.dataset.answer);
  const items = labels.map(label => {
    const item = document.createElement('li');
    item.textContent = label;
    return item;
  });
  selectedList.replaceChildren(...items);
  message.value = ['Вот чем я хочу заняться с тобой 12 ноября:', ...labels.map(label => `• ${label}`)].join('\n');
  answer.hidden = true;
  copyStatus.textContent = '';
  showSection(accepted, document.querySelector('#accepted-title'));
  playHearts();
});

document.querySelector('#copy-activities').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    copyStatus.textContent = 'Скопировано. Вставь ответ в наш чат.';
  } catch {
    answer.hidden = false;
    copyStatus.textContent = 'Скопируй текст ниже и вставь его в наш чат.';
    message.focus();
    message.select();
  }
});
