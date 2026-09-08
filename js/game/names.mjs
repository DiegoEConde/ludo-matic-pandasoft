export const DEFAULT_NAMES = ['Eri', 'Melina', 'Diego', 'Gustavo'];
export const NAMES_KEY = 'ludo-matic.names.v1';
export const cleanName = value => typeof value === 'string' ? value.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ').slice(0, 32) : '';
export const nameKey = value => cleanName(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
export function mergeNames(values) {
  const seen = new Set();
  return [...DEFAULT_NAMES, ...values].map(cleanName).filter(name => {
    const key = nameKey(name);
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  });
}
export function readNames(storage) {
  try {
    const saved = JSON.parse(storage.getItem(NAMES_KEY) || '[]');
    return mergeNames(Array.isArray(saved) ? saved : []);
  } catch { return [...DEFAULT_NAMES]; }
}
export function saveNames(storage, names) {
  const merged = mergeNames([...readNames(storage), ...names]);
  try { storage.setItem(NAMES_KEY, JSON.stringify(merged)); return { names: merged, saved: true }; }
  catch { return { names: merged, saved: false }; }
}
