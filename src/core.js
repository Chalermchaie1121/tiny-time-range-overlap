/**
 * Core implementation for tiny-time-range-overlap.
 *
 * An interval is { start: number, end: number } where start and end are epoch
 * milliseconds. We deliberately require a normalised form (start <= end) before
 * any comparison is attempted; this keeps the overlap math branchless and makes
 * it impossible to silently swap endpoints on a malformed input.
 */

/**
 * Determines whether a value is a valid, normalised interval.
 *
 * Why require start <= end here rather than "fixing" reversed intervals: a
 * reversed interval almost always indicates a caller bug (wrong argument order,
 * timezone sign flipped, etc.). Swapping silently would hide the bug; throwing
 * surfaces it at the call site.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isInterval(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.start === 'number' &&
    Number.isFinite(value.start) &&
    typeof value.end === 'number' &&
    Number.isFinite(value.end) &&
    value.start <= value.end
  );
}

/**
 * Normalises a two-element array into an interval object.
 *
 * @param {[number, number]} pair
 * @returns {{start: number, end: number}}
 */
export function normalizeInterval(pair) {
  if (!Array.isArray(pair) || pair.length !== 2) {
    throw new TypeError('normalizeInterval expects a two-element array');
  }
  const [start, end] = pair;
  if (typeof start !== 'number' || typeof end !== 'number' ||
      !Number.isFinite(start) || !Number.isFinite(end)) {
    throw new TypeError('interval endpoints must be finite numbers');
  }
  // start <= end enforced; reversed input is a caller error, not silently fixed.
  if (start > end) {
    throw new RangeError('interval start must be <= end');
  }
  return { start, end };
}

/**
 * Returns the duration of an interval in milliseconds.
 *
 * @param {{start: number, end: number}} interval
 * @returns {number}
 */
export function intervalDuration(interval) {
  if (!isInterval(interval)) {
    throw new TypeError('intervalDuration expects a valid interval');
  }
  return interval.end - interval.start;
}

/**
 * Computes the overlap between two intervals.
 *
 * Touching intervals (one's end equals the other's start) count as overlapping
 * with an intersection duration of zero. This matches the common scheduling
 * convention that a meeting ending at 10:00 and one starting at 10:00 do not
 * conflict — the duration is zero, but isOverlap is true so the caller can
 * distinguish "touches" from "disjoint" if they care.
 *
 * @param {{start: number, end: number}} a
 * @param {{start: number, end: number}} b
 * @returns {{isOverlap: boolean, intersectionDuration: number}}
 */
export function computeOverlap(a, b) {
  if (!isInterval(a) || !isInterval(b)) {
    throw new TypeError('computeOverlap requires two valid intervals');
  }
  const latestStart = Math.max(a.start, b.start);
  const earliestEnd = Math.min(a.end, b.end);
  const gap = earliestEnd - latestStart;
  if (gap < 0) {
    return { isOverlap: false, intersectionDuration: 0 };
  }
  // gap >= 0 → intervals touch or overlap; duration is the exact gap.
  return { isOverlap: true, intersectionDuration: gap };
}
