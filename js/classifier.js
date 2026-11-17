/**
 * Classification & geographic matching utilities for Bolivian public entities.
 */

/**
 * Normalizes a string by removing accents, converting to lowercase, and collapsing spaces.
 * @param {string} str
 * @returns {string}
 */
export function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies an entity into Nacional, Departamental, or Municipal jurisdiction.
 * @param {string} entidadNorm - Pre-normalized entity name
 * @returns {'Municipal' | 'Departamental' | 'Nacional'}
 */
export function classifyJurisdiction(entidadNorm) {
  if (
    entidadNorm.includes('gobierno autonomo municipal') ||
    entidadNorm.includes('alcaldia') ||
    entidadNorm.includes('concejo municipal') ||
    entidadNorm.includes('empresa municipal') ||
    /\bgam\b/.test(entidadNorm) ||
    /\bgamp\b/.test(entidadNorm)
  ) {
    return 'Municipal';
  }

  if (
    entidadNorm.includes('gobierno autonomo departamental') ||
    entidadNorm.includes('gobernacion') ||
    entidadNorm.includes('asamblea legislativa departamental') ||
    entidadNorm.includes('servicio departamental') ||
    /\bsedes\b/.test(entidadNorm) ||
    /\bsedeges\b/.test(entidadNorm) ||
    /\bsedcam\b/.test(entidadNorm) ||
    /\bgad\b/.test(entidadNorm)
  ) {
    return 'Departamental';
  }

  return 'Nacional';
}

/**
 * Checks if a normalized entity matches a quick-access key entity group.
 * @param {string} entidadNorm
 * @param {string} groupKey
 * @returns {boolean}
 */
export function matchesEntityGroup(entidadNorm, groupKey) {
  switch (groupKey) {
    case 'ABC':
      return (
        entidadNorm.includes('administradora boliviana de carreteras') ||
        /\babc\b/.test(entidadNorm)
      );
    case 'BOA':
      return (
        entidadNorm.includes('boliviana de aviacion') ||
        entidadNorm.includes('bo a') ||
        /\bboa\b/.test(entidadNorm)
      );
    case 'YPFB':
      return (
        entidadNorm.includes('yacimientos petroliferos') ||
        /\bypfb\b/.test(entidadNorm)
      );
    case 'MINISTERIOS':
      return entidadNorm.includes('ministerio de');
    case 'SALUD':
      return (
        entidadNorm.includes('caja nacional de salud') ||
        entidadNorm.includes('caja de salud') ||
        entidadNorm.includes('hospital') ||
        entidadNorm.includes('seguro social universitario') ||
        /\bsedes\b/.test(entidadNorm)
      );
    default:
      return true;
  }
}

/**
 * Checks if a record belongs to a selected municipality's local government.
 * @param {Object} record - Enriched record with entidadNorm and nivel
 * @param {{ nombreMunNorm: string, nombreDepNorm: string, nombreMun: string }} munInfo
 * @returns {boolean}
 */
export function matchesMunicipality(record, munInfo) {
  if (!munInfo) return true;
  const { nombreMunNorm, nombreDepNorm } = munInfo;
  const ent = record.entidadNorm;

  // Must be municipal-level or explicitly mention the municipal government
  const isMunicipalEntity =
    record.nivel === 'Municipal' ||
    ent.includes('municipal') ||
    ent.includes('alcaldia');

  if (!isMunicipalEntity) return false;

  // Special disambiguation for La Paz vs El Alto
  if (nombreMunNorm === 'la paz' && ent.includes('el alto')) {
    return false;
  }

  // Handle "Santa Cruz de la Sierra" -> often written as "Santa Cruz de la Sierra" or "Santa Cruz" in GAM
  if (nombreMunNorm === 'santa cruz de la sierra') {
    return (
      ent.includes('santa cruz de la sierra') ||
      (ent.includes('gobierno autonomo municipal de santa cruz') &&
        record.departamentoNorm === 'santa cruz')
    );
  }

  // Exact municipality name match inside entity string, optionally reinforced by department
  if (ent.includes(nombreMunNorm)) {
    if (
      record.departamentoNorm &&
      nombreDepNorm &&
      record.departamentoNorm !== 'sin especificar' &&
      record.departamentoNorm !== nombreDepNorm
    ) {
      // Allow if entity explicitly names the municipality, but guard against homonyms across departments
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Categorizes a process status into Active (Vigente/En curso), Concluded (Adjudicado/Contratado), or Other.
 * @param {string} estado
 * @returns {'active' | 'concluded' | 'other'}
 */
export function classifyStatus(estado) {
  const e = normalizeText(estado);
  if (e.includes('vigente') || e.includes('en curso') || e.includes('publicado')) {
    return 'active';
  }
  if (
    e.includes('contratado') ||
    e.includes('adjudicado') ||
    e.includes('formalizado')
  ) {
    return 'concluded';
  }
  return 'other';
}

/**
 * Enriches parsed records once at load time for ultra-fast client-side filtering.
 * @param {Object[]} records
 * @returns {Object[]}
 */
export function enrichRecords(records) {
  return records.map((r) => {
    const entidadNorm = normalizeText(r.entidad);
    const departamentoNorm = normalizeText(r.departamento);
    const nivel = classifyJurisdiction(entidadNorm);
    const statusGroup = classifyStatus(r.estado);
    const searchBlob = normalizeText(`${r.cuce} ${r.entidad} ${r.objeto}`);

    return {
      ...r,
      entidadNorm,
      departamentoNorm,
      nivel,
      statusGroup,
      searchBlob
    };
  });
}
