export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function parseLines(text) {
  return text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}
