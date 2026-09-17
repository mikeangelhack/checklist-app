import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addItem,
  clearCompleted,
  removeItem,
  remainingCount,
  toggleItem,
} from '../lib/checklist.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

test('addItem appends a trimmed, not-done item with a UUID id', () => {
  const items = addItem([], '  Buy milk  ');
  assert.equal(items.length, 1);
  assert.equal(items[0].text, 'Buy milk');
  assert.equal(items[0].done, false);
  assert.match(items[0].id, UUID_PATTERN);
});

test('addItem generates unique ids', () => {
  const [first, second] = addItem(addItem([], 'one'), 'two');
  assert.notEqual(first.id, second.id);
});

test('addItem honors a caller-supplied id', () => {
  const items = addItem([], 'Buy milk', 'fixed-id');
  assert.equal(items[0].id, 'fixed-id');
});

test('addItem rejects blank and non-string text', () => {
  assert.throws(() => addItem([], '   '), TypeError);
  assert.throws(() => addItem([], ''), TypeError);
  assert.throws(() => addItem([], 42), TypeError);
  assert.throws(() => addItem([], null), TypeError);
});

test('addItem preserves existing items and does not mutate the input', () => {
  const original = addItem([], 'first', 'id-1');
  const next = addItem(original, 'second', 'id-2');
  assert.deepEqual(next.map((item) => item.id), ['id-1', 'id-2']);
  assert.deepEqual(original.map((item) => item.id), ['id-1']);
});

test('toggleItem flips only the matching item and keeps the rest', () => {
  const original = [
    { id: 'id-1', text: 'first', done: false },
    { id: 'id-2', text: 'second', done: false },
  ];
  const next = toggleItem(original, 'id-1');
  assert.equal(next[0].done, true);
  assert.equal(next[1].done, false);
  assert.equal(original[0].done, false, 'input array must be untouched');
});

test('toggleItem on an unknown id is a no-op', () => {
  const original = [{ id: 'id-1', text: 'first', done: false }];
  const next = toggleItem(original, 'missing');
  assert.deepEqual(next, original);
});

test('toggleItem twice returns the item to its original state', () => {
  const once = toggleItem(
    [{ id: 'id-1', text: 'first', done: false }],
    'id-1',
  );
  const twice = toggleItem(once, 'id-1');
  assert.equal(twice[0].done, false);
});

test('removeItem deletes only the matching item', () => {
  const original = [
    { id: 'id-1', text: 'first', done: false },
    { id: 'id-2', text: 'second', done: true },
  ];
  const next = removeItem(original, 'id-2');
  assert.deepEqual(next.map((item) => item.id), ['id-1']);
  assert.equal(original.length, 2, 'input array must be untouched');
});

test('removeItem on an unknown id changes nothing', () => {
  const original = [{ id: 'id-1', text: 'first', done: false }];
  assert.deepEqual(removeItem(original, 'missing'), original);
});

test('clearCompleted removes only done items', () => {
  const original = [
    { id: 'id-1', text: 'first', done: true },
    { id: 'id-2', text: 'second', done: false },
    { id: 'id-3', text: 'third', done: true },
  ];
  const next = clearCompleted(original);
  assert.deepEqual(next.map((item) => item.id), ['id-2']);
  assert.equal(original.length, 3, 'input array must be untouched');
});

test('clearCompleted with nothing done returns an equal list', () => {
  const original = [{ id: 'id-1', text: 'first', done: false }];
  assert.deepEqual(clearCompleted(original), original);
});

test('remainingCount counts not-done items', () => {
  const items = [
    { id: 'id-1', text: 'first', done: true },
    { id: 'id-2', text: 'second', done: false },
    { id: 'id-3', text: 'third', done: false },
  ];
  assert.equal(remainingCount(items), 2);
  assert.equal(remainingCount([]), 0);
});
