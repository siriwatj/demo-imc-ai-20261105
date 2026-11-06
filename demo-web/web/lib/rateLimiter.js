const LIMIT = 100;
const WINDOW_MS = 60 * 60 * 1000;

let windowStart = Date.now();
let count = 0;

function tryConsume() {
  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    count = 0;
  }
  if (count >= LIMIT) {
    return { allowed: false, resetAt: windowStart + WINDOW_MS };
  }
  count += 1;
  return { allowed: true, remaining: LIMIT - count };
}

module.exports = { tryConsume };
