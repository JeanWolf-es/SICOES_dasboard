import { parseCsvAsync, parseIndiceCsv } from './csvParser.js';
import { enrichRecords } from './classifier.js';

const BASE_RAW_URL =
  'https://raw.githubusercontent.com/mauforonda/convocatorias_publicas/master';

// In-memory cache: fileId (e.g. '202208') -> { records, hasNumericAmount }
const monthCache = new Map();
let cachedIndice = null;

/**
 * Fetches and caches indice.csv from the GitHub repository.
 * @returns {Promise<Array<{mes: string, convocatorias: number, fileId: string}>>}
 */
export async function fetchIndice() {
  if (cachedIndice) return cachedIndice;
  const res = await fetch(`${BASE_RAW_URL}/indice.csv`);
  if (!res.ok) {
    throw new Error(`No se pudo obtener indice.csv (HTTP ${res.status})`);
  }
  const text = await res.text();
  cachedIndice = parseIndiceCsv(text);
  return cachedIndice;
}

/**
 * Resolves a period preset key into an array of fileIds to load.
 * @param {string} periodKey
 * @param {Array<{mes: string, fileId: string}>} indice
 * @returns {string[]}
 */
export function resolvePeriodFiles(periodKey, indice) {
  if (!indice || indice.length === 0) return [];
  const sorted = [...indice].sort((a, b) => b.fileId.localeCompare(a.fileId));

  switch (periodKey) {
    case 'recent1':
      return sorted.slice(0, 1).map((m) => m.fileId);
    case 'recent3':
      return sorted.slice(0, 3).map((m) => m.fileId);
    case 'year2022':
      return sorted.filter((m) => m.fileId.startsWith('2022')).map((m) => m.fileId);
    case 'year2021':
      return sorted.filter((m) => m.fileId.startsWith('2021')).map((m) => m.fileId);
    case 'year2020':
      return sorted.filter((m) => m.fileId.startsWith('2020')).map((m) => m.fileId);
    case 'all':
      return sorted.map((m) => m.fileId);
    default:
      // Specific month fileId
      return [periodKey];
  }
}

/**
 * Fetches, parses, and caches a single monthly CSV file.
 * @param {string} fileId
 * @returns {Promise<{records: Object[], hasNumericAmount: boolean}>}
 */
async function loadMonth(fileId) {
  if (monthCache.has(fileId)) {
    return monthCache.get(fileId);
  }
  const url = `${BASE_RAW_URL}/data/${fileId}.csv`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error al descargar ${fileId}.csv (HTTP ${res.status})`);
  }
  const text = await res.text();
  const parsed = await parseCsvAsync(text);
  const enriched = {
    records: enrichRecords(parsed.records),
    hasNumericAmount: parsed.hasNumericAmount
  };
  monthCache.set(fileId, enriched);
  return enriched;
}

/**
 * Loads all months for a given period with progress callback.
 * @param {string} periodKey
 * @param {(done: number, total: number, currentId: string) => void} onProgress
 * @param {boolean} forceRefresh
 * @returns {Promise<{records: Object[], hasNumericAmount: boolean, indice: Array}>}
 */
export async function loadPeriodData(periodKey, onProgress, forceRefresh = false) {
  if (forceRefresh) {
    monthCache.clear();
    cachedIndice = null;
  }

  const indice = await fetchIndice();
  const fileIds = resolvePeriodFiles(periodKey, indice);

  const allRecords = [];
  let hasNumericAmount = false;

  for (let i = 0; i < fileIds.length; i++) {
    const fid = fileIds[i];
    if (onProgress) onProgress(i, fileIds.length, fid);
    const data = await loadMonth(fid);
    for (let j = 0; j < data.records.length; j++) {
      allRecords.push(data.records[j]);
    }
    if (data.hasNumericAmount) hasNumericAmount = true;
  }

  if (onProgress) onProgress(fileIds.length, fileIds.length, '');

  return { records: allRecords, hasNumericAmount, indice };
}
