const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const ALNUM = LOWER + UPPER + DIGITS;
const EXTENDED = ALNUM + '!@#$%^&*-_+=';

function randomInt(max) {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

function shuffleString(str) {
  const arr = [...str];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

/**
 * No two adjacent characters are the same.
 */
export function generateNoConsecutiveIdentical(length = 16) {
  const pool = EXTENDED;
  let result = '';
  let last = null;
  for (let i = 0; i < length; i++) {
    const candidates = [...pool].filter((c) => c !== last);
    const c = candidates[randomInt(candidates.length)];
    result += c;
    last = c;
  }
  return result;
}

/**
 * At least one lowercase, one uppercase, one digit.
 */
export function generateWithMixedCaseAndDigits(length = 16) {
  const len = Math.max(length, 3);
  const chars = [
    LOWER[randomInt(LOWER.length)],
    UPPER[randomInt(UPPER.length)],
    DIGITS[randomInt(DIGITS.length)],
  ];
  for (let i = 3; i < len; i++) {
    chars.push(ALNUM[randomInt(ALNUM.length)]);
  }
  return shuffleString(chars.join(''));
}

/**
 * Random password with length >= minLen using mixed character set.
 */
export function generateWithMinimumLength(minLen) {
  const n = Math.floor(Number(minLen));
  if (!Number.isFinite(n) || n < 1) {
    throw new Error('Invalid minimum length');
  }
  const len = Math.min(256, Math.max(n, 8));
  const chars = [
    LOWER[randomInt(LOWER.length)],
    UPPER[randomInt(UPPER.length)],
    DIGITS[randomInt(DIGITS.length)],
  ];
  for (let i = 3; i < len; i++) {
    chars.push(EXTENDED[randomInt(EXTENDED.length)]);
  }
  return shuffleString(chars.join(''));
}
