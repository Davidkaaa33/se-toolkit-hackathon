const API_URL = window.location.origin;

// Language toggle
let currentLang = 'en';

function switchLanguage(lang) {
  currentLang = lang;
  const toggle = document.getElementById('langToggle');
  if (!toggle) return;

  toggle.textContent = lang === 'en' ? 'EN' : 'RU';

  // Toggle text content
  document.querySelectorAll('[data-ru]').forEach((el) => {
    if (lang === 'ru') {
      el.dataset.en = el.textContent;
      el.textContent = el.dataset.ru;
    } else {
      if (el.dataset.en) {
        el.textContent = el.dataset.en;
      }
    }
  });

  // Toggle placeholders
  document.querySelectorAll('[data-placeholder-ru]').forEach((el) => {
    if (lang === 'ru') {
      el.dataset.placeholderEn = el.placeholder;
      el.placeholder = el.dataset.placeholderRu;
    } else {
      if (el.dataset.placeholderEn) {
        el.placeholder = el.dataset.placeholderEn;
      }
    }
  });

  // Toggle sort filter labels
  const sortOptions = document.querySelectorAll('#filterSortMenu .filter-option');
  sortOptions.forEach((opt) => {
    if (opt.dataset.ru) {
      if (lang === 'ru') {
        opt.dataset.en = opt.textContent;
        opt.textContent = opt.dataset.ru;
      } else if (opt.dataset.en) {
        opt.textContent = opt.dataset.en;
      }
    }
  });

  // Update sort trigger label if it has stored translations
  const sortTrigger = document.querySelector('[data-filter-trigger="sort"] span');
  if (sortTrigger && sortTrigger.dataset.en && sortTrigger.dataset.ru) {
    sortTrigger.textContent = lang === 'ru' ? sortTrigger.dataset.ru : sortTrigger.dataset.en;
  }

  // Update empty state if visible
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) {
    const enMsg = 'No one found with these filters. Try changing filters or add a new profile.';
    const ruMsg = 'По этим фильтрам пока никого нет. Попробуй изменить фильтры или добавь новую анкету.';
    if (lang === 'ru') {
      emptyState.dataset.en = enMsg;
      emptyState.textContent = ruMsg;
    } else {
      emptyState.textContent = emptyState.dataset.en || enMsg;
    }
  }
}

document.getElementById('langToggle')?.addEventListener('click', () => {
  switchLanguage(currentLang === 'en' ? 'ru' : 'en');
});

const defaultPlayers = [];

const playersGrid = document.getElementById('playersGrid');
const playerForm = document.getElementById('playerForm');
const clearDataBtn = document.getElementById('clearDataBtn');
const siteToast = document.getElementById('siteToast');
const clearConfirmModal = document.getElementById('clearConfirmModal');
const cancelClearBtn = document.getElementById('cancelClearBtn');
const confirmClearBtn = document.getElementById('confirmClearBtn');
const existingProfileModal = document.getElementById('existingProfileModal');
const existingProfileTitle = document.getElementById('existingProfileTitle');
const existingProfileActions = document.getElementById('existingProfileActions');
const editExistingProfileBtn = document.getElementById('editExistingProfileBtn');
const createNewProfileBtn = document.getElementById('createNewProfileBtn');
const editProfileList = document.getElementById('editProfileList');
const playerProfileModal = document.getElementById('playerProfileModal');
const playerProfileContent = document.getElementById('playerProfileContent');
const deleteProfileModal = document.getElementById('deleteProfileModal');
const cancelDeleteProfileBtn = document.getElementById('cancelDeleteProfileBtn');
const confirmDeleteProfileBtn = document.getElementById('confirmDeleteProfileBtn');
const filterDropdowns = Array.from(document.querySelectorAll('[data-filter-dropdown]'));
const filterTriggers = Array.from(document.querySelectorAll('[data-filter-trigger]'));
const filterOptions = Array.from(document.querySelectorAll('.filter-option'));
const filterLevelTriggerLabel = document.querySelector('#filterLevelTrigger span');
const filterLevelMin = document.getElementById('filterLevelMin');
const filterLevelMax = document.getElementById('filterLevelMax');
const filterLevelReset = document.getElementById('filterLevelReset');
const filterAgeTriggerLabel = document.querySelector('#filterAgeTrigger span');
const filterAgeMin = document.getElementById('filterAgeMin');
const filterAgeMax = document.getElementById('filterAgeMax');
const filterAgeReset = document.getElementById('filterAgeReset');
const filterSortTriggerLabel = document.querySelector('#filterSortTrigger span');
const filterOwnBtn = document.getElementById('filterOwnBtn');
const submitFormBtn = document.getElementById('submitFormBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const filterState = {
  language: 'all',
  role: 'all',
  style: 'all',
  sort: 'default',
  ownOnly: false,
  levelMin: '',
  levelMax: '',
  ageMin: '',
  ageMax: ''
};
const nicknameInput = document.getElementById('nickname');
const ageInput = document.getElementById('age');
const playtimeInput = document.getElementById('playtime');
const playtimeGroup = document.getElementById('playtimeGroup');
const playtimeError = document.getElementById('playtimeError');
const playtimeStartHourInput = document.getElementById('playtimeStartHour');
const playtimeStartMinuteInput = document.getElementById('playtimeStartMinute');
const playtimeEndHourInput = document.getElementById('playtimeEndHour');
const playtimeEndMinuteInput = document.getElementById('playtimeEndMinute');
const playtimeAnyBtn = document.getElementById('playtimeAnyBtn');
const levelInput = document.getElementById('level');
const languageInput = document.getElementById('language');
const languageButtons = Array.from(document.querySelectorAll('.language-btn'));
const languageButtonsWrap = document.querySelector('.language-buttons');
const languageError = document.getElementById('languageError');
const roleInput = document.getElementById('role');
const roleButtons = Array.from(document.querySelectorAll('.role-btn'));
const styleInput = document.getElementById('style');
const styleButtons = Array.from(document.querySelectorAll('.style-btn'));
const styleButtonsWrap = document.querySelector('.style-buttons');
const styleError = document.getElementById('styleError');
const discordInput = document.getElementById('discord');
const bioInput = document.getElementById('bio');
let toastTimerId;
const playtimeFields = [
  playtimeStartHourInput,
  playtimeStartMinuteInput,
  playtimeEndHourInput,
  playtimeEndMinuteInput
];
const DEFAULT_PLAYTIME_PART = '00';
let pendingFormPlayer = null;
let editingPlayerId = null;
let pendingDeletePlayerId = null;
let allPlayersCache = [];

// API helpers
async function apiFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  const response = await fetch(`${API_URL}${url}`, { ...defaultOptions, ...options });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

async function fetchPlayers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.language && filters.language !== 'all') params.set('language', filters.language);
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.style && filters.style !== 'all') params.set('style', filters.style);
  if (filters.level_min) params.set('level_min', filters.level_min);
  if (filters.level_max) params.set('level_max', filters.level_max);
  if (filters.age_min) params.set('age_min', filters.age_min);
  if (filters.age_max) params.set('age_max', filters.age_max);
  if (filters.sort && filters.sort !== 'default') params.set('sort', filters.sort);
  if (filters.own_only === 'true') params.set('own_only', 'true');

  const data = await apiFetch(`/api/players?${params.toString()}`);
  allPlayersCache = data;
  return data;
}

async function createPlayer(playerData) {
  return apiFetch('/api/players', {
    method: 'POST',
    body: JSON.stringify(playerData),
  });
}

async function updatePlayer(id, playerData) {
  return apiFetch(`/api/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(playerData),
  });
}

async function deletePlayer(id) {
  return apiFetch(`/api/players/${id}`, { method: 'DELETE' });
}

async function deleteAllOwnPlayers() {
  return apiFetch('/api/players/session/all', { method: 'DELETE' });
}

// Error message translations
function errorMsg(key) {
  const messages = {
    'fill-field': currentLang === 'ru' ? 'Заполните поле' : 'Please fill in this field',
    'only-digits': currentLang === 'ru' ? 'Только цифры' : 'Only digits allowed',
    'age-range': currentLang === 'ru' ? 'Введите значение от 0 до 99' : 'Enter a value from 0 to 99',
    'level-range': currentLang === 'ru' ? 'Введите значение от 0 до 10' : 'Enter a value from 0 to 10',
    'playtime-format': currentLang === 'ru' ? 'Введите время в формате ЧЧ:ММ - ЧЧ:ММ' : 'Enter time in HH:MM - HH:MM format',
    'playtime-range': currentLang === 'ru' ? 'Часы: 00-23, минуты: 00-59' : 'Hours: 00-23, minutes: 00-59',
    'select-field': currentLang === 'ru' ? 'Заполните поле' : 'Please select an option'
  };
  return messages[key] || '';
}

// UI Functions
function selectLanguage(language) {
  languageInput.value = language;
  clearChoiceError(languageButtonsWrap, languageError);
  languageButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.language === language);
  });
}

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectLanguage(button.dataset.language);
  });
});

function selectRole(role) {
  roleInput.value = role;
  roleButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.role === role);
  });
}

function selectStyle(style) {
  styleInput.value = style;
  clearChoiceError(styleButtonsWrap, styleError);
  styleButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.style === style);
  });
}

roleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectRole(button.dataset.role);
  });
});

styleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectStyle(button.dataset.style);
  });
});

selectRole(roleInput.value || 'Any');
selectLanguage(languageInput.value || '');
selectStyle(styleInput.value || '');

function showFieldError(field, message, options = {}) {
  const { focusField = true } = options;
  if (!field.dataset.defaultPlaceholder) {
    field.dataset.defaultPlaceholder = field.placeholder || '';
  }
  field.classList.add('field-error');
  field.value = '';
  field.placeholder = message;
  if (focusField) {
    field.focus();
  }
}

function clearFieldError(field) {
  field.classList.remove('field-error');
  if (field.dataset.defaultPlaceholder !== undefined) {
    field.placeholder = field.dataset.defaultPlaceholder;
  }
}

function showChoiceError(container, errorNode) {
  container.classList.add('choice-error-state');
  errorNode.textContent = errorMsg('select-field');
}

function clearChoiceError(container, errorNode) {
  container.classList.remove('choice-error-state');
  errorNode.textContent = '';
}

[nicknameInput, ageInput, playtimeInput, levelInput, discordInput].forEach((field) => {
  field.addEventListener('input', () => clearFieldError(field));
});

function ensureDiscordPrefix() {
  const valueWithoutPrefix = discordInput.value.replace(/^@+/, '');
  discordInput.value = `@${valueWithoutPrefix}`;
}

discordInput.addEventListener('focus', () => {
  if (!discordInput.value.trim()) {
    discordInput.value = '@';
  } else {
    ensureDiscordPrefix();
  }

  window.requestAnimationFrame(() => {
    const position = discordInput.value.length;
    discordInput.setSelectionRange(position, position);
  });
});

discordInput.addEventListener('input', () => {
  if (!discordInput.value) {
    discordInput.value = '@';
  } else {
    ensureDiscordPrefix();
  }
});

discordInput.addEventListener('keydown', (event) => {
  const selectionStart = discordInput.selectionStart ?? 0;
  const selectionEnd = discordInput.selectionEnd ?? 0;

  if ((event.key === 'Backspace' && selectionStart <= 1) || (event.key === 'Delete' && selectionStart === 0 && selectionEnd <= 1)) {
    event.preventDefault();
  }
});

discordInput.addEventListener('blur', () => {
  if (discordInput.value.trim() === '@') {
    discordInput.value = '';
    clearFieldError(discordInput);
  }
});

function setPlaytimeAnyActive(isActive) {
  playtimeAnyBtn.classList.toggle('is-active', isActive);
}

function fillDefaultPlaytimeParts() {
  playtimeFields.forEach((field) => {
    field.value = DEFAULT_PLAYTIME_PART;
  });
}

playtimeAnyBtn?.addEventListener('click', () => {
  fillDefaultPlaytimeParts();
  playtimeInput.value = 'Любое';
  setPlaytimeAnyActive(true);
  clearPlaytimeError();
});

function showPlaytimeError(message, options = {}) {
  const { focusField = true } = options;
  playtimeGroup.classList.add('playtime-error');
  playtimeError.textContent = message;

  if (focusField) {
    playtimeStartHourInput.focus();
  }
}

function clearPlaytimeError() {
  playtimeGroup.classList.remove('playtime-error');
  playtimeError.textContent = '';
}

function updatePlaytimeValue() {
  const values = playtimeFields.map((field) => field.value.trim());

  if (values.every((value) => value.length === 2)) {
    playtimeInput.value = `${values[0]}:${values[1]} - ${values[2]}:${values[3]}`;
    return;
  }

  playtimeInput.value = '';
}

function validatePlaytimeField(options = {}) {
  const { focusField = true } = options;
  const [startHoursRaw, startMinutesRaw, endHoursRaw, endMinutesRaw] = playtimeFields.map((field) => field.value.trim());

  if (playtimeInput.value === 'Любое') {
    return true;
  }

  if (!startHoursRaw && !startMinutesRaw && !endHoursRaw && !endMinutesRaw) {
    showPlaytimeError(errorMsg('fill-field'), { focusField });
    return false;
  }

  if ([startHoursRaw, startMinutesRaw, endHoursRaw, endMinutesRaw].some((value) => !/^\d{2}$/.test(value))) {
    showPlaytimeError(errorMsg('playtime-format'), { focusField });
    return false;
  }

  const startHours = Number(startHoursRaw);
  const startMinutes = Number(startMinutesRaw);
  const endHours = Number(endHoursRaw);
  const endMinutes = Number(endMinutesRaw);

  if (startHours > 23 || endHours > 23 || startMinutes > 59 || endMinutes > 59) {
    showPlaytimeError(errorMsg('playtime-range'), { focusField });
    return false;
  }

  updatePlaytimeValue();
  return true;
}

playtimeFields.forEach((field, index) => {
  field.addEventListener('pointerdown', (event) => {
    if (document.activeElement !== field) {
      event.preventDefault();
      field.focus();
      field.select();
    }
  });

  field.addEventListener('focus', () => {
    field.select();
  });

  field.addEventListener('click', () => {
    field.select();
  });

  field.addEventListener('input', () => {
    field.value = field.value.replace(/\D/g, '').slice(0, 2);
    clearPlaytimeError();
    setPlaytimeAnyActive(false);
    playtimeInput.value = '';

    if (field.value.length === 2 && index < playtimeFields.length - 1) {
      playtimeFields[index + 1].focus();
    }

    if (playtimeFields.some((item) => item.value.trim())) {
      updatePlaytimeValue();
    }
  });

  field.addEventListener('keydown', (event) => {
    if (event.key === 'Backspace' && !field.value && index > 0) {
      playtimeFields[index - 1].focus();
    }
  });

  field.addEventListener('blur', () => {
    if (field.value.length === 1) {
      field.value = field.value.padStart(2, '0');
    }

    if (!playtimeFields.some((item) => item.value.trim()) || playtimeInput.value === 'Любое') {
      return;
    }

    updatePlaytimeValue();
    validatePlaytimeField({ focusField: false });
  });
});

function validateRangeField(field, { min, max, emptyMessage, rangeMessage, focusField = true }) {
  const rawValue = field.value.trim();

  if (!rawValue) {
    showFieldError(field, errorMsg('fill-field'), { focusField });
    return false;
  }

  if (!/^\d+$/.test(rawValue)) {
    showFieldError(field, errorMsg('only-digits'), { focusField });
    return false;
  }

  const numericValue = Number(rawValue);
  if (numericValue < min || numericValue > max) {
    showFieldError(field, rangeMessage, { focusField });
    return false;
  }

  return true;
}

ageInput.addEventListener('blur', () => {
  if (!ageInput.value.trim()) {
    return;
  }

  validateRangeField(ageInput, {
    min: 0,
    max: 99,
    emptyMessage: errorMsg('fill-field'),
    rangeMessage: errorMsg('age-range'),
    focusField: false
  });
});

levelInput.addEventListener('blur', () => {
  if (!levelInput.value.trim()) {
    return;
  }

  validateRangeField(levelInput, {
    min: 0,
    max: 10,
    emptyMessage: errorMsg('fill-field'),
    rangeMessage: errorMsg('level-range'),
    focusField: false
  });
});

function validateFormInOrder() {
  clearChoiceError(languageButtonsWrap, languageError);
  clearChoiceError(styleButtonsWrap, styleError);

  if (!nicknameInput.value.trim()) {
    showFieldError(nicknameInput, errorMsg('fill-field'));
    return false;
  }

  if (!validateRangeField(ageInput, {
    min: 0,
    max: 99,
    emptyMessage: errorMsg('fill-field'),
    rangeMessage: errorMsg('age-range')
  })) {
    return false;
  }

  if (!validatePlaytimeField()) {
    return false;
  }

  if (!validateRangeField(levelInput, {
    min: 0,
    max: 10,
    emptyMessage: errorMsg('fill-field'),
    rangeMessage: errorMsg('level-range')
  })) {
    return false;
  }

  if (!languageInput.value.trim()) {
    showChoiceError(languageButtonsWrap, languageError);
    languageButtons[0]?.focus();
    return false;
  }

  if (!styleInput.value.trim()) {
    showChoiceError(styleButtonsWrap, styleError);
    styleButtons[0]?.focus();
    return false;
  }

  if (!discordInput.value.trim() || discordInput.value.trim() === '@') {
    showFieldError(discordInput, errorMsg('fill-field'));
    return false;
  }

  return true;
}

function createCard(player, options = {}) {
  const ownerLabel = player.isOwn ? (currentLang === 'ru' ? 'Моя анкета' : 'My profile') : '';
  const { extraClass = '', dataAttributes = '' } = options;
  const playtimeLabel = player.playtime === 'Любое' ? (currentLang === 'ru' ? 'Любое время' : 'Any time') : player.playtime;
  const ownCardClass = player.isOwn ? ' player-card-own' : '';
  const className = `player-card${ownCardClass}${extraClass ? ` ${extraClass}` : ''}`;
  const ownerLabelAttribute = ownerLabel ? `data-owner-label="${ownerLabel}"` : '';
  const cardDataAttributes = dataAttributes || `data-player-id="${player.id}"`;
  const cardActions = player.isOwn && !extraClass.includes('edit-player-card')
    ? `
      <div class="card-owner-actions">
        <button type="button" class="card-delete-btn" data-delete-card-id="${player.id}">${currentLang === 'ru' ? 'Удалить' : 'Delete'}</button>
        <button type="button" class="card-edit-btn" data-edit-card-id="${player.id}">${currentLang === 'ru' ? 'Редактировать' : 'Edit'}</button>
      </div>
    `
    : '';

  return `
    <article class="${className}" ${ownerLabelAttribute} ${cardDataAttributes}>
      <div class="player-card-header">
        <div class="avatar-card">${player.nickname.charAt(0).toUpperCase()}</div>
        <div>
          <h3>${player.nickname}</h3>
          <small>Faceit ${player.level} • ${player.role} • ${player.age} ${currentLang === 'ru' ? 'лет' : 'years old'}</small>
        </div>
      </div>

      <div class="player-tags">
        <span>${player.language}</span>
        <span>${player.style}</span>
        <span>${playtimeLabel}</span>
      </div>

      <p>${player.bio || ''}</p>
      <a class="discord-link" href="#" onclick="copyDiscord('${player.discord}'); return false;">
        Discord: ${player.discord}
      </a>
      ${cardActions}
    </article>
  `;
}

function parsePlaytimeValue(value) {
  if (!value || value === 'Любое') {
    return null;
  }

  const match = value.match(/^(\d{2}):(\d{2})\s*(?:-|–)\s*(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  return [match[1], match[2], match[3], match[4]];
}

function populateFormFromPlayer(player) {
  nicknameInput.value = player.nickname;
  ageInput.value = String(player.age);
  levelInput.value = String(player.level);
  discordInput.value = player.discord;
  bioInput.value = player.bio || '';
  selectLanguage(player.language);
  selectRole(player.role);
  selectStyle(player.style);

  const playtimeParts = parsePlaytimeValue(player.playtime);
  if (playtimeParts) {
    playtimeFields.forEach((field, index) => {
      field.value = playtimeParts[index];
    });
    setPlaytimeAnyActive(false);
    updatePlaytimeValue();
  } else {
    fillDefaultPlaytimeParts();
    playtimeInput.value = 'Любое';
    setPlaytimeAnyActive(true);
  }

  clearPlaytimeError();
  [nicknameInput, ageInput, levelInput, discordInput, bioInput].forEach((field) => clearFieldError(field));
  clearChoiceError(languageButtonsWrap, languageError);
  clearChoiceError(styleButtonsWrap, styleError);
}

function setFormEditingMode(isEditing) {
  submitFormBtn.textContent = isEditing
    ? (currentLang === 'ru' ? 'Сохранить изменения' : 'Save changes')
    : (currentLang === 'ru' ? 'Добавить анкету' : 'Add profile');
  clearDataBtn.hidden = isEditing;
  cancelEditBtn.hidden = !isEditing;
}

function openExistingProfileModal() {
  existingProfileTitle.textContent = currentLang === 'ru' ? 'У Вас уже есть анкеты' : 'You already have profiles';
  existingProfileActions.hidden = false;
  editProfileList.hidden = true;
  editProfileList.innerHTML = '';
  existingProfileModal.hidden = false;
  document.body.style.overflow = 'hidden';
  editExistingProfileBtn.focus();
}

function closeExistingProfileModal({ restoreFocus = true } = {}) {
  existingProfileModal.hidden = true;
  editProfileList.hidden = true;
  existingProfileActions.hidden = false;
  editProfileList.innerHTML = '';
  existingProfileTitle.textContent = currentLang === 'ru' ? 'У Вас уже есть анкеты' : 'You already have profiles';
  document.body.style.overflow = '';
  if (restoreFocus) {
    playerForm.querySelector('button[type="submit"]')?.focus();
  }
}

function renderEditableOwnProfiles(players) {
  editProfileList.innerHTML = players.map((player) => createCard(player, {
    extraClass: 'edit-player-card',
    ownerLabel: currentLang === 'ru' ? 'Редактировать эту' : 'Edit this',
    dataAttributes: `data-edit-player-id="${player.id}"`
  })).join('');
}

function beginEditingPlayer(playerId) {
  const player = allPlayersCache.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  editingPlayerId = player.id;
  populateFormFromPlayer(player);
  setFormEditingMode(true);
  closePlayerProfileModal();
  document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
  nicknameInput.focus();
}

function renderPlayers() {
  const languageValue = filterState.language;
  const roleValue = filterState.role;
  const styleValue = filterState.style;
  const ownOnlyValue = filterState.ownOnly;
  const sortValue = filterState.sort;
  const levelMinValue = filterState.levelMin ? Number(filterState.levelMin) : null;
  const levelMaxValue = filterState.levelMax ? Number(filterState.levelMax) : null;
  const ageMinValue = filterState.ageMin ? Number(filterState.ageMin) : null;
  const ageMaxValue = filterState.ageMax ? Number(filterState.ageMax) : null;

  let filteredPlayers = allPlayersCache.filter((player) => {
    const languageMatch = languageValue === 'all' || player.language === languageValue;
    const roleMatch = roleValue === 'all' || player.role === roleValue;
    const styleMatch = styleValue === 'all' || player.style === styleValue;
    const ownMatch = !ownOnlyValue || player.isOwn;
    const levelMinMatch = levelMinValue === null || player.level >= levelMinValue;
    const levelMaxMatch = levelMaxValue === null || player.level <= levelMaxValue;
    const ageMinMatch = ageMinValue === null || player.age >= ageMinValue;
    const ageMaxMatch = ageMaxValue === null || player.age <= ageMaxValue;
    return languageMatch && roleMatch && styleMatch && ownMatch && levelMinMatch && levelMaxMatch && ageMinMatch && ageMaxMatch;
  });

  filteredPlayers.sort((left, right) => {
    if (sortValue === 'age-desc') {
      return right.age - left.age;
    }
    if (sortValue === 'age-asc') {
      return left.age - right.age;
    }
    if (sortValue === 'level-desc') {
      return right.level - left.level;
    }
    if (sortValue === 'level-asc') {
      return left.level - right.level;
    }
    return 0;
  });

  if (!filteredPlayers.length) {
    const emptyMsg = currentLang === 'ru'
      ? 'По этим фильтрам пока никого нет. Попробуй изменить фильтры или добавь новую анкету.'
      : 'No one found with these filters. Try changing filters or add a new profile.';
    playersGrid.innerHTML = `<div class="empty-state" data-en="${emptyMsg}">${emptyMsg}</div>`;
    return;
  }

  playersGrid.innerHTML = filteredPlayers.map(createCard).join('');
}

function renderPlayerProfile(player) {
  const playtimeLabel = player.playtime === 'Любое' ? (currentLang === 'ru' ? 'Любое время' : 'Any time') : player.playtime;
  playerProfileContent.innerHTML = `
    <div class="player-profile-head">
      <div class="player-profile-identity">
        <div class="avatar-card">${player.nickname.charAt(0).toUpperCase()}</div>
        <div class="player-profile-meta">
          <button type="button" class="player-profile-discord" id="playerProfileDiscord" data-copy-label="Копировать">${player.discord}</button>
          <small>${player.nickname} • Faceit ${player.level} • ${player.role} • ${player.age} ${currentLang === 'ru' ? 'лет' : 'years old'}</small>
        </div>
      </div>
      <button type="button" class="player-profile-close" id="playerProfileClose" aria-label="Закрыть">×</button>
    </div>
    <div class="player-profile-body">
      <p>${player.bio || (currentLang === 'ru' ? 'Игрок пока ничего не написал о себе.' : 'Player hasn\'t written anything yet.')}</p>
      <div class="player-tags">
        <span>${player.language}</span>
        <span>${player.style}</span>
        <span>${playtimeLabel}</span>
      </div>
    </div>
  `;

  playerProfileContent.querySelector('#playerProfileDiscord')?.addEventListener('click', () => {
    navigator.clipboard.writeText(player.discord)
      .then(() => showToast(`${player.discord} ${currentLang === 'ru' ? 'скопирован' : 'copied'}`))
      .catch(() => showToast(`${currentLang === 'ru' ? 'Не удалось скопировать' : 'Failed to copy'}: ${player.discord}`));
  });

  playerProfileContent.querySelector('#playerProfileClose')?.addEventListener('click', closePlayerProfileModal);
}

function openPlayerProfileModal(playerId) {
  const player = allPlayersCache.find((item) => item.id === playerId);
  if (!player) {
    return;
  }

  renderPlayerProfile(player);
  playerProfileModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closePlayerProfileModal() {
  playerProfileModal.hidden = true;
  playerProfileContent.innerHTML = '';
  document.body.style.overflow = '';
}

function openDeleteProfileModal(playerId) {
  pendingDeletePlayerId = playerId;
  deleteProfileModal.hidden = false;
  document.body.style.overflow = 'hidden';
  cancelDeleteProfileBtn.focus();
}

function closeDeleteProfileModal() {
  deleteProfileModal.hidden = true;
  pendingDeletePlayerId = null;
  document.body.style.overflow = '';
}

function copyDiscord(discord) {
  navigator.clipboard.writeText(discord)
    .then(() => showToast(`${discord} ${currentLang === 'ru' ? 'скопирован' : 'copied'}`))
    .catch(() => showToast(`${currentLang === 'ru' ? 'Не удалось скопировать' : 'Failed to copy'}: ${discord}`));
}

function scrollToForm() {
  document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
}

function openClearConfirmModal() {
  clearConfirmModal.hidden = false;
  document.body.style.overflow = 'hidden';
  cancelClearBtn.focus();
}

function closeClearConfirmModal() {
  clearConfirmModal.hidden = true;
  document.body.style.overflow = '';
  clearDataBtn.focus();
}

function showToast(message) {
  window.clearTimeout(toastTimerId);
  siteToast.textContent = message;
  siteToast.hidden = false;

  toastTimerId = window.setTimeout(() => {
    siteToast.hidden = true;
  }, 3000);
}

function resetFormState(options = {}) {
  const { emptyAfterReset = false } = options;
  playerForm.reset();
  pendingFormPlayer = null;
  editingPlayerId = null;

  [nicknameInput, ageInput, playtimeInput, levelInput, discordInput, bioInput].forEach((field) => {
    clearFieldError(field);
  });
  if (emptyAfterReset) {
    playtimeFields.forEach((field) => {
      field.value = '';
    });
    setPlaytimeAnyActive(false);
    playtimeInput.value = '';
  } else {
    fillDefaultPlaytimeParts();
    setPlaytimeAnyActive(true);
    playtimeInput.value = 'Любое';
  }
  clearPlaytimeError();

  clearChoiceError(languageButtonsWrap, languageError);
  clearChoiceError(styleButtonsWrap, styleError);

  selectRole('Any');
  selectLanguage('');
  selectStyle('');
  setFormEditingMode(false);
}

window.copyDiscord = copyDiscord;
window.scrollToForm = scrollToForm;

function closeAllFilterMenus() {
  filterDropdowns.forEach((dropdown) => {
    dropdown.classList.remove('is-open');
    dropdown.querySelector('.filter-menu')?.setAttribute('hidden', '');
  });
}

function updateRangeFilterLabel(triggerLabelNode, minValue, maxValue, defaultLabel) {
  if (minValue || maxValue) {
    triggerLabelNode.textContent = `${minValue || 'От'} - ${maxValue || 'До'}`;
  } else {
    triggerLabelNode.textContent = defaultLabel;
  }
}

function setupRangeFilter({ minInput, maxInput, resetButton, triggerLabelNode, stateMinKey, stateMaxKey, defaultLabel, maxValue }) {
  [minInput, maxInput].forEach((input) => {
    input.addEventListener('pointerdown', (event) => {
      if (document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
      input.dataset.replaceOnNextDigit = 'true';
      window.requestAnimationFrame(() => input.select());
    });

    input.addEventListener('focus', () => {
      input.dataset.replaceOnNextDigit = 'true';
      input.select();
    });

    input.addEventListener('click', () => {
      input.dataset.replaceOnNextDigit = 'true';
      input.select();
    });

    input.addEventListener('beforeinput', (event) => {
      if (input.dataset.replaceOnNextDigit !== 'true') {
        return;
      }

      if (event.inputType !== 'insertText' || !event.data || !/\d/.test(event.data)) {
        return;
      }

      event.preventDefault();
      input.value = event.data.replace(/\D/g, '').slice(0, 2);
      input.dataset.replaceOnNextDigit = 'false';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '');
      if (input.value) {
        input.value = String(Math.min(maxValue, Math.max(0, Number(input.value))));
      }
      input.dataset.replaceOnNextDigit = 'false';

      filterState[stateMinKey] = minInput.value;
      filterState[stateMaxKey] = maxInput.value;
      updateRangeFilterLabel(triggerLabelNode, filterState[stateMinKey], filterState[stateMaxKey], defaultLabel);
      renderPlayers();
    });

    input.addEventListener('blur', () => {
      if (minInput.value && maxInput.value && Number(maxInput.value) < Number(minInput.value)) {
        maxInput.value = minInput.value;
        filterState[stateMaxKey] = maxInput.value;
        updateRangeFilterLabel(triggerLabelNode, filterState[stateMinKey], filterState[stateMaxKey], defaultLabel);
        renderPlayers();
      }
    });
  });

  resetButton.addEventListener('click', () => {
    minInput.value = '';
    maxInput.value = '';
    filterState[stateMinKey] = '';
    filterState[stateMaxKey] = '';
    updateRangeFilterLabel(triggerLabelNode, '', '', defaultLabel);
    renderPlayers();
  });
}

function setFilterValue(filterName, value, label) {
  filterState[filterName] = value;
  const trigger = document.querySelector(`[data-filter-trigger="${filterName}"] span`);
  if (trigger) {
    trigger.textContent = label;
    // Store translations for sort filter
    if (filterName === 'sort') {
      const clickedOption = document.querySelector(`.filter-option[data-filter-name="sort"][data-value="${value}"]`);
      if (clickedOption) {
        trigger.dataset.en = clickedOption.dataset.en || label;
        trigger.dataset.ru = clickedOption.dataset.ru || getCurrentRuLabel(filterName, value);
      }
    }
  }

  filterOptions
    .filter((option) => option.dataset.filterName === filterName)
    .forEach((option) => {
      option.classList.toggle('is-selected', option.dataset.value === value);
    });

  renderPlayers();
}

function getCurrentRuLabel(filterName, value) {
  const ruMap = {
    sort: {
      'default': 'Сначала новые',
      'age-desc': 'Возраст: сначала старше',
      'age-asc': 'Возраст: сначала младше',
      'level-desc': 'Faceit: высокий level',
      'level-asc': 'Faceit: низкий level'
    }
  };
  return (ruMap[filterName] && ruMap[filterName][value]) || '';
}

function setOwnOnlyFilter(isActive) {
  filterState.ownOnly = isActive;
  filterOwnBtn.classList.toggle('is-active', isActive);
  renderPlayers();
}

filterTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const filterName = trigger.dataset.filterTrigger;
    const dropdown = document.querySelector(`[data-filter-dropdown="${filterName}"]`);
    const menu = dropdown?.querySelector('.filter-menu');
    const isOpen = dropdown?.classList.contains('is-open');

    closeAllFilterMenus();
    if (!dropdown || !menu || isOpen) {
      return;
    }

    dropdown.classList.add('is-open');
    menu.removeAttribute('hidden');
  });
});

filterOptions.forEach((option) => {
  option.addEventListener('click', () => {
    setFilterValue(option.dataset.filterName, option.dataset.value, option.textContent.trim());
    closeAllFilterMenus();
  });
});

filterOwnBtn.addEventListener('click', () => {
  setOwnOnlyFilter(!filterState.ownOnly);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-filter-dropdown]')) {
    closeAllFilterMenus();
  }
});

setupRangeFilter({
  minInput: filterLevelMin,
  maxInput: filterLevelMax,
  resetButton: filterLevelReset,
  triggerLabelNode: filterLevelTriggerLabel,
  stateMinKey: 'levelMin',
  stateMaxKey: 'levelMax',
  defaultLabel: 'Faceit level',
  maxValue: 10
});

setupRangeFilter({
  minInput: filterAgeMin,
  maxInput: filterAgeMax,
  resetButton: filterAgeReset,
  triggerLabelNode: filterAgeTriggerLabel,
  stateMinKey: 'ageMin',
  stateMaxKey: 'ageMax',
  defaultLabel: 'Age',
  maxValue: 99
});

filterSortTriggerLabel.textContent = 'Newest first';
filterSortTriggerLabel.dataset.en = 'Newest first';
filterSortTriggerLabel.dataset.ru = 'Сначала новые';

// Form submission with API
playerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateFormInOrder()) {
    return;
  }

  const formPlayer = {
    nickname: nicknameInput.value.trim(),
    level: Number(levelInput.value),
    age: Number(ageInput.value),
    language: languageInput.value,
    role: roleInput.value,
    style: styleInput.value,
    playtime: playtimeInput.value.trim(),
    discord: discordInput.value.trim(),
    bio: bioInput.value.trim()
  };

  try {
    submitFormBtn.disabled = true;
    submitFormBtn.textContent = 'Отправка...';

    if (editingPlayerId) {
      await updatePlayer(editingPlayerId, formPlayer);
      resetFormState({ emptyAfterReset: true });
      await loadAndRenderPlayers();
      document.getElementById('profiles').scrollIntoView({ behavior: 'smooth' });
      showToast(currentLang === 'ru' ? 'Анкета успешно редактирована!' : 'Profile updated successfully!');
    } else {
      await createPlayer(formPlayer);
      resetFormState();
      await loadAndRenderPlayers();
      document.getElementById('profiles').scrollIntoView({ behavior: 'smooth' });
      showToast(currentLang === 'ru' ? 'Анкета успешно добавлена!' : 'Profile added successfully!');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showToast(`${currentLang === 'ru' ? 'Ошибка' : 'Error'}: ${error.message}`);
  } finally {
    submitFormBtn.disabled = false;
    setFormEditingMode(!!editingPlayerId);
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetFormState({ emptyAfterReset: true });
  document.getElementById('profiles').scrollIntoView({ behavior: 'smooth' });
  showToast(currentLang === 'ru' ? 'Редактирование отменено!' : 'Editing cancelled!');
});

clearDataBtn.addEventListener('click', () => {
  const ownPlayers = allPlayersCache.filter(p => p.isOwn);
  if (!ownPlayers.length) {
    showToast(currentLang === 'ru' ? 'Нет активных анкет!' : 'No active profiles!');
    return;
  }

  openClearConfirmModal();
});

cancelClearBtn.addEventListener('click', closeClearConfirmModal);

confirmClearBtn.addEventListener('click', async () => {
  try {
    await deleteAllOwnPlayers();
    resetFormState();
    await loadAndRenderPlayers();
    closeClearConfirmModal();
    document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
    showToast(currentLang === 'ru' ? 'Ваши анкеты успешно очищены!' : 'Your profiles cleared successfully!');
  } catch (error) {
    console.error('Error clearing profiles:', error);
    showToast(`${currentLang === 'ru' ? 'Ошибка' : 'Error'}: ${error.message}`);
  }
});

clearConfirmModal.addEventListener('click', (event) => {
  if (event.target.dataset.closeModal === 'true') {
    closeClearConfirmModal();
  }
});

editExistingProfileBtn.addEventListener('click', () => {
  const ownPlayers = allPlayersCache.filter(p => p.isOwn);
  if (ownPlayers.length <= 1) {
    beginEditingPlayer(ownPlayers[0]?.id);
    return;
  }

  existingProfileTitle.textContent = currentLang === 'ru' ? 'Выберите какую анкету редактировать' : 'Choose which profile to edit';
  existingProfileActions.hidden = true;
  editProfileList.hidden = false;
  renderEditableOwnProfiles(ownPlayers);
});

createNewProfileBtn.addEventListener('click', () => {
  closeExistingProfileModal({ restoreFocus: false });
});

editProfileList.addEventListener('click', (event) => {
  const card = event.target.closest('[data-edit-player-id]');
  if (!card) {
    return;
  }

  beginEditingPlayer(card.dataset.editPlayerId);
});

playersGrid.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('[data-delete-card-id]');
  if (deleteButton) {
    openDeleteProfileModal(deleteButton.dataset.deleteCardId);
    return;
  }

  const editButton = event.target.closest('[data-edit-card-id]');
  if (editButton) {
    beginEditingPlayer(editButton.dataset.editCardId);
    return;
  }

  const card = event.target.closest('[data-player-id]');
  if (!card) {
    return;
  }

  if (event.target.closest('.discord-link')) {
    return;
  }

  openPlayerProfileModal(card.dataset.playerId);
});

existingProfileModal.addEventListener('click', (event) => {
  if (event.target.dataset.closeExistingModal === 'true') {
    closeExistingProfileModal();
  }
});

deleteProfileModal.addEventListener('click', (event) => {
  if (event.target.dataset.closeDeleteProfile === 'true') {
    closeDeleteProfileModal();
  }
});

cancelDeleteProfileBtn.addEventListener('click', closeDeleteProfileModal);

confirmDeleteProfileBtn.addEventListener('click', async () => {
  if (!pendingDeletePlayerId) {
    closeDeleteProfileModal();
    return;
  }

  try {
    await deletePlayer(pendingDeletePlayerId);

    if (editingPlayerId === pendingDeletePlayerId) {
      resetFormState({ emptyAfterReset: true });
    }

    closeDeleteProfileModal();
    await loadAndRenderPlayers();
    showToast(currentLang === 'ru' ? 'Анкета удалена!' : 'Profile deleted!');
  } catch (error) {
    console.error('Error deleting profile:', error);
    showToast(`${currentLang === 'ru' ? 'Ошибка' : 'Error'}: ${error.message}`);
  }
});

playerProfileModal.addEventListener('click', (event) => {
  if (event.target.dataset.closePlayerProfile === 'true') {
    closePlayerProfileModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !clearConfirmModal.hidden) {
    closeClearConfirmModal();
  }
  if (event.key === 'Escape' && !existingProfileModal.hidden) {
    closeExistingProfileModal();
  }
  if (event.key === 'Escape' && !deleteProfileModal.hidden) {
    closeDeleteProfileModal();
  }
  if (event.key === 'Escape' && !playerProfileModal.hidden) {
    closePlayerProfileModal();
  }
});

async function loadAndRenderPlayers() {
  try {
    const filters = {
      language: filterState.language,
      role: filterState.role,
      style: filterState.style,
      sort: filterState.sort,
      own_only: filterState.ownOnly ? 'true' : 'false',
      level_min: filterState.levelMin || undefined,
      level_max: filterState.levelMax || undefined,
      age_min: filterState.ageMin || undefined,
      age_max: filterState.ageMax || undefined,
    };

    const players = await fetchPlayers(filters);

    // Mark own players
    players.forEach(player => {
      player.isOwn = true;
    });

    allPlayersCache = players;
    renderPlayers();
  } catch (error) {
    console.error('Error loading players:', error);
    playersGrid.innerHTML = '<div class="empty-state">Ошибка загрузки данных. Попробуйте обновить страницу.</div>';
  }
}

fillDefaultPlaytimeParts();
setPlaytimeAnyActive(true);
playtimeInput.value = 'Любое';

document.addEventListener('DOMContentLoaded', loadAndRenderPlayers);
