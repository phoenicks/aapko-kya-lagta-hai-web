export function makeSlug(categoryId) {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const rand = Math.random().toString(36).slice(2, 7);
  return `${categoryId}-${date}-${rand}`;
}
