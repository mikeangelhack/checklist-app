// UI layer for the checklist app. All checklist math lives in the pure
// module (./lib/checklist.js); this file touches only the DOM and
// localStorage, and re-renders from state after every change.

import {
  addItem,
  clearCompleted,
  removeItem,
  remainingCount,
  toggleItem,
} from './lib/checklist.js';

const STORAGE_KEY = 'checklist-app:items:v1';

const formEl = document.querySelector('#add-form');
const inputEl = document.querySelector('#new-item-text');
const listEl = document.querySelector('#list');
const emptyEl = document.querySelector('#empty-state');
const summaryEl = document.querySelector('#summary');
const clearEl = document.querySelector('#clear-completed');

let items = loadItems();

// --- persistence ---------------------------------------------------------

function isWellFormedItem(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    entry.id !== '' &&
    typeof entry.text === 'string' &&
    entry.text.trim() !== ''
  );
}

function loadItems() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Checklist storage is unavailable; starting empty.', err);
    return [];
  }
  if (raw === null) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('Ignoring unreadable saved checklist; starting empty.', err);
    return [];
  }
  if (!Array.isArray(parsed)) {
    console.warn('Ignoring saved checklist with unexpected shape; starting empty.');
    return [];
  }
  return parsed.flatMap((entry) => {
    if (isWellFormedItem(entry)) {
      return [{ id: entry.id, text: entry.text, done: Boolean(entry.done) }];
    }
    console.warn('Skipping malformed saved checklist item:', entry);
    return [];
  });
}

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    // Private-browsing mode or a full quota: keep the session usable,
    // but surface the failure instead of failing silently.
    console.error('Could not save the checklist:', err);
  }
}

// --- rendering -----------------------------------------------------------

function renderItem(item) {
  const li = document.createElement('li');
  li.className = item.done ? 'item done' : 'item';
  li.dataset.id = item.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = item.done;
  const checkboxId = `check-${item.id}`;
  checkbox.id = checkboxId;
  checkbox.setAttribute('aria-label', `Mark "${item.text}" as done`);

  const label = document.createElement('label');
  label.className = 'item-text';
  label.htmlFor = checkboxId;
  label.textContent = item.text;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-button';
  remove.textContent = '×';
  remove.setAttribute('aria-label', `Remove "${item.text}"`);

  li.append(checkbox, label, remove);
  return li;
}

function render() {
  listEl.replaceChildren(...items.map(renderItem));

  const remaining = remainingCount(items);
  const doneCount = items.length - remaining;
  summaryEl.textContent = `${doneCount} of ${items.length} completed`;

  emptyEl.hidden = items.length > 0;
  clearEl.disabled = doneCount === 0;
}

// --- events --------------------------------------------------------------

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    items = addItem(items, inputEl.value);
  } catch (err) {
    // Blank input (whitespace passes `required`): inline field-level message.
    inputEl.setCustomValidity('An item needs at least one visible character.');
    inputEl.reportValidity();
    return;
  }
  inputEl.setCustomValidity('');
  inputEl.value = '';
  saveItems();
  render();
  inputEl.focus();
});

inputEl.addEventListener('input', () => {
  if (inputEl.validity.customError) {
    inputEl.setCustomValidity('');
  }
});

listEl.addEventListener('change', (event) => {
  const li = event.target.closest('li[data-id]');
  if (!li || event.target.type !== 'checkbox') return;
  items = toggleItem(items, li.dataset.id);
  saveItems();
  render();
});

listEl.addEventListener('click', (event) => {
  const button = event.target.closest('.remove-button');
  if (!button) return;
  const li = button.closest('li[data-id]');
  items = removeItem(items, li.dataset.id);
  saveItems();
  render();
});

clearEl.addEventListener('click', () => {
  items = clearCompleted(items);
  saveItems();
  render();
});

render();
