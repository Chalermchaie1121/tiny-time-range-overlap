import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeOverlap,
  isInterval,
  normalizeInterval,
  intervalDuration,
} from '../src/index.js';

describe('isInterval', () => {
  it('accepts a well-formed interval', () => {
    assert.equal(isInterval({ start: 0, end: 10 }), true);
  });
  it('accepts a zero-length interval', () => {
    assert.equal(isInterval({ start: 5, end: 5 }), true);
  });
  it('rejects a reversed interval', () => {
    assert.equal(isInterval({ start: 10, end: 0 }), false);
  });
  it('rejects non-numeric endpoints', () => {
    assert.equal(isInterval({ start: 'a', end: 10 }), false);
  });
  it('rejects NaN/Infinity endpoints', () => {
    assert.equal(isInterval({ start: NaN, end: 10 }), false);
    assert.equal(isInterval({ start: 0, end: Infinity }), false);
  });
  it('rejects null and arrays', () => {
    assert.equal(isInterval(null), false);
    assert.equal(isInterval([0, 10]), false);
  });
});

describe('normalizeInterval', () => {
  it('converts a valid pair', () => {
    assert.deepEqual(normalizeInterval([1, 2]), { start: 1, end: 2 });
  });
  it('throws on a reversed pair', () => {
    assert.throws(() => normalizeInterval([2, 1]), RangeError);
  });
  it('throws on a non-finite endpoint', () => {
    assert.throws(() => normalizeInterval([0, Infinity]), TypeError);
  });
});

describe('intervalDuration', () => {
  it('returns end minus start', () => {
    assert.equal(intervalDuration({ start: 100, end: 250 }), 150);
  });
  it('returns 0 for a zero-length interval', () => {
    assert.equal(intervalDuration({ start: 7, end: 7 }), 0);
  });
});

describe('computeOverlap', () => {
  it('returns full intersection when one contains the other', () => {
    const a = { start: 0, end: 100 };
    const b = { start: 10, end: 20 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: true, intersectionDuration: 10 });
  });
  it('returns the overlap of two partially overlapping intervals', () => {
    const a = { start: 0, end: 50 };
    const b = { start: 30, end: 80 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: true, intersectionDuration: 20 });
  });
  it('returns zero duration when intervals touch at a single point', () => {
    const a = { start: 0, end: 50 };
    const b = { start: 50, end: 100 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: true, intersectionDuration: 0 });
  });
  it('returns no overlap for disjoint intervals', () => {
    const a = { start: 0, end: 10 };
    const b = { start: 20, end: 30 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: false, intersectionDuration: 0 });
  });
  it('is symmetric in argument order', () => {
    const a = { start: 0, end: 50 };
    const b = { start: 30, end: 80 };
    assert.deepEqual(computeOverlap(a, b), computeOverlap(b, a));
  });
  it('handles two identical zero-length intervals at the same point', () => {
    const a = { start: 5, end: 5 };
    const b = { start: 5, end: 5 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: true, intersectionDuration: 0 });
  });
  it('reports no overlap between two distinct zero-length intervals', () => {
    const a = { start: 5, end: 5 };
    const b = { start: 6, end: 6 };
    assert.deepEqual(computeOverlap(a, b), { isOverlap: false, intersectionDuration: 0 });
  });
  it('throws when an interval is reversed', () => {
    assert.throws(() => computeOverlap({ start: 10, end: 0 }, { start: 5, end: 8 }), TypeError);
  });
});
