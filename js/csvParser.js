/**
 * Non-blocking RFC-4180 CSV parser for SICOES datasets.
 * Yields control back to the browser event loop every CHUNK_SIZE rows
 * to keep the UI responsive when parsing tens of thousands of records.
 */

const CHUNK_SIZE = 4000;

const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Parses a single CSV line respecting quoted fields and escaped double quotes ("").
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses raw CSV text into normalized record objects asynchronously.
 * @param {string} text
 * @returns {Promise<{ records: Object[], hasNumericAmount: boolean }>}
 */
export async function parseCsvAsync(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    return { records: [], hasNumericAmount: false };
  }

  const headers = parseCsvLine(lines[0]);
  const colIndex = {};
  headers.forEach((h, idx) => {
    colIndex[h.toLowerCase()] = idx;
  });

  // Detect optional numeric price/amount column if present in source
  const amountKey = headers.find((h) =>
    /precio|monto|importe|referencial|adjudicado/i.test(h)
  );
  const amountIdx = amountKey ? colIndex[amountKey.toLowerCase()] : -1;

  const idxCuce = colIndex['cuce'] ?? 0;
  const idxEntidad = colIndex['entidad'] ?? 1;
  const idxTipo = colIndex['tipo de contratación'] ?? colIndex['tipo de contratacion'] ?? 2;
  const idxModalidad = colIndex['modalidad'] ?? 3;
  const idxObjeto = colIndex['objeto de contratación'] ?? colIndex['objeto de contratacion'] ?? 4;
  const idxEstado = colIndex['estado'] ?? 5;
  const idxSubasta = colIndex['subasta'] ?? 6;
  const idxFechaPres = colIndex['fecha presentación'] ?? colIndex['fecha presentacion'] ?? 7;
  const idxFechaPub = colIndex['fecha publicación'] ?? colIndex['fecha publicacion'] ?? 8;
  const idxArchivos = colIndex['archivos'] ?? 9;
  const idxFormularios = colIndex['formularios'] ?? 10;
  const idxContacto = colIndex['persona contacto'] ?? 11;
  const idxFechaAdj = colIndex['fecha adjudicación / desierta'] ?? colIndex['fecha adjudicacion / desierta'] ?? 12;
  const idxDepto = colIndex['departamento'] ?? 13;
  const idxNormativa = colIndex['normativa'] ?? 14;

  const records = [];
  let hasNumericAmount = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const cols = parseCsvLine(line);
    if (cols.length < 5) continue;

    let amount = null;
    if (amountIdx !== -1 && cols[amountIdx]) {
      const parsed = parseFloat(cols[amountIdx].replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(parsed)) {
        amount = parsed;
        hasNumericAmount = true;
      }
    }

    records.push({
      cuce: cols[idxCuce] || '',
      entidad: cols[idxEntidad] || 'Sin entidad',
      tipo: cols[idxTipo] || '',
      modalidad: cols[idxModalidad] || 'N/D',
      objeto: cols[idxObjeto] || '',
      estado: cols[idxEstado] || 'Desconocido',
      subasta: (cols[idxSubasta] || '').toLowerCase() === 'true',
      fechaPresentacion: cols[idxFechaPres] || '',
      fechaPublicacion: cols[idxFechaPub] || '',
      archivos: cols[idxArchivos] || '',
      formularios: cols[idxFormularios] || '',
      contacto: cols[idxContacto] || '',
      fechaAdjudicacion: cols[idxFechaAdj] || '',
      departamento: cols[idxDepto] || 'Sin especificar',
      normativa: cols[idxNormativa] || '',
      monto: amount
    });

    if (i % CHUNK_SIZE === 0) {
      await yieldToMain();
    }
  }

  return { records, hasNumericAmount };
}

/**
 * Parses indice.csv (`mes,convocatorias`)
 * @param {string} text
 * @returns {Array<{mes: string, convocatorias: number, fileId: string}>}
 */
export function parseIndiceCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const list = [];
  for (let i = 1; i < lines.length; i++) {
    const [mes, count] = lines[i].split(',');
    if (!mes) continue;
    const cleanMes = mes.trim();
    const parts = cleanMes.split('-');
    if (parts.length >= 2) {
      list.push({
        mes: cleanMes,
        convocatorias: parseInt(count, 10) || 0,
        fileId: `${parts[0]}${parts[1]}`
      });
    }
  }
  return list;
}
