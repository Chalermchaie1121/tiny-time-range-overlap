# tiny-time-range-overlap

Determines whether two time intervals overlap and returns the intersection duration in milliseconds. Useful for scheduling and availability checks.

## Usage

```js
import { computeOverlap, normalizeInterval } from 'tiny-time-range-overlap';

const a = normalizeInterval([10, 20]);
const b = normalizeInterval([15, 25]);

const { isOverlap, intersectionDuration } = computeOverlap(a, b);
// isOverlap === true, intersectionDuration === 5
```

## Why this exists

Scheduling code ends up rewriting the same `max(start) / min(end)` arithmetic over and over, and getting the boundary conditions wrong each time. This library does that one computation correctly and returns both a boolean and the exact intersection duration so callers can distinguish "touches at an instant" from "genuinely disjoint".

Intervals are plain `{ start, end }` objects with epoch-millisecond endpoints. A reversed interval (`start > end`) is treated as a caller error and rejected, not silently swapped — reversed input almost always indicates an argument-order bug or a timezone sign mistake, and hiding it makes the downstream bug harder to find.

## Edge case: touching intervals

Two intervals that share only a boundary point (one ends exactly where the other starts) report `isOverlap: true` with `intersectionDuration: 0`. This matches the scheduling convention that a meeting ending at 10:00 and one starting at 10:00 do not conflict. If your definition of "overlap" requires a positive duration, check `intersectionDuration > 0` rather than `isOverlap`.

## Exports

- `computeOverlap(a, b)` — `{ isOverlap: boolean, intersectionDuration: number }`
- `isInterval(value)` — boolean guard for a normalised interval
- `normalizeInterval([start, end])` — `{ start, end }`, throws if reversed or non-finite
- `intervalDuration(interval)` — milliseconds

Zero runtime dependencies. ESM only. Tests run under `node --test`.
