/**
 * Pure checklist state operations.
 *
 * Every function accepts and returns plain arrays of items shaped
 * `{ id, text, done }` and never mutates its input, so the module runs
 * in Node with no DOM — which is what makes it testable with `node --test`.
 *
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 */

/**
 * Validate `text` as an item label and return its trimmed form.
 *
 * @param {unknown} text
 * @returns {string}
 * @throws {TypeError} when text is not a non-empty string
 */
function trimmedLabel(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    throw new TypeError('Item text must be a non-empty string');
  }
  return text.trim();
}

/**
 * Return a new list with `text` appended as a new, not-done item.
 *
 * @param {ChecklistItem[]} items
 * @param {string} text
 * @param {string} [id] unique item id; defaults to a random UUID
 * @returns {ChecklistItem[]}
 * @throws {TypeError} when text is blank
 */
export function addItem(items, text, id = crypto.randomUUID()) {
  return [...items, { id, text: trimmedLabel(text), done: false }];
}

/**
 * Return a new list with the `id` item's done flag flipped.
 * An unknown id leaves the list unchanged.
 *
 * @param {ChecklistItem[]} items
 * @param {string} id
 * @returns {ChecklistItem[]}
 */
export function toggleItem(items, id) {
  return items.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item,
  );
}

/**
 * Return a new list without the `id` item.
 * An unknown id changes nothing.
 *
 * @param {ChecklistItem[]} items
 * @param {string} id
 * @returns {ChecklistItem[]}
 */
export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

/**
 * Return a new list with every done item removed.
 *
 * @param {ChecklistItem[]} items
 * @returns {ChecklistItem[]}
 */
export function clearCompleted(items) {
  return items.filter((item) => !item.done);
}

/**
 * Count items still to do.
 *
 * @param {ChecklistItem[]} items
 * @returns {number}
 */
export function remainingCount(items) {
  return items.filter((item) => !item.done).length;
}
