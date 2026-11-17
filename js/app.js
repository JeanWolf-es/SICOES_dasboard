import { loadPeriodData } from './dataService.js';
import {
  matchesEntityGroup,
  matchesMunicipality
} from './classifier.js';
import { initBoliviaMap, clearMapSelection } from './mapModule.js';
import {
  updateTopEntitiesChart,
  updateModalityChart,
  setModalityChartMode
} from './charts.js';
import {
  setTableData,
  initTableControls,
  exportFilteredCsv
} from './table.js';

const state = {
  rawRecords: [],
  filteredRecords: [],
  hasNumericAmount: false,
  period: 'recent3',
  entityGroup: 'ALL',
  specificEntity: '',
  level: 'ALL',
  department: '',
  municipality: null,
  modality: '',
  status: ''
};

let indicePopulated = false;

function showLoading(show, text = '', pct = 0) {
  const banner = document.getElementById('loading-banner');
  const txt = document.getElementById('loading-text');
  const bar = document.getElementById('loading-bar');
  if (!banner) return;
  if (show) {
    banner.classList.remove('hidden');
    if (txt) txt.textContent = text;
    if (bar) bar.style.width = `${pct}%`;
  } else {
    banner.classList.add('hidden');
  }
}

function showError(msg) {
  const banner = document.getElementById('error-banner');
  const txt = document.getElementById('error-text');
  if (!banner || !txt) return;
  txt.textContent = msg;
  banner.classList.remove('hidden');
}

function populatePeriodOptions(indice) {
  if (indicePopulated || !indice?.length) return;
  const select = document.getElementById('period-select');
  if (!select) return;

  const group = document.createElement('optgroup');
  group.label = 'Meses individuales';
  group.className = 'bg-surface-container text-outline';

  [...indice]
    .sort((a, b) => b.fileId.localeCompare(a.fileId))
    .forEach((m) => {
      const opt = document.createElement('option');
      opt.value = m.fileId;
      opt.className = 'bg-surface-container text-on-surface';
      opt.textContent = `${m.mes.slice(0, 7)} (${m.convocatorias.toLocaleString('es-BO')} proc.)`;
      group.appendChild(opt);
    });

  select.appendChild(group);
  indicePopulated = true;
}

function populateDynamicSelects(records) {
  const entityCounts = new Map();
  const modSet = new Set();
  const statusSet = new Set();
  let nac = 0;
  let dep = 0;
  let mun = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    entityCounts.set(r.entidad, (entityCounts.get(r.entidad) || 0) + 1);
    if (r.modalidad) modSet.add(r.modalidad);
    if (r.estado) statusSet.add(r.estado);
    if (r.nivel === 'Nacional') nac++;
    else if (r.nivel === 'Departamental') dep++;
    else if (r.nivel === 'Municipal') mun++;
  }

  // Update jurisdiction counters
  document.getElementById('cnt-lvl-all').textContent = records.length.toLocaleString('es-BO');
  document.getElementById('cnt-lvl-nac').textContent = nac.toLocaleString('es-BO');
  document.getElementById('cnt-lvl-dep').textContent = dep.toLocaleString('es-BO');
  document.getElementById('cnt-lvl-mun').textContent = mun.toLocaleString('es-BO');

  // Populate specific entity dropdown (sorted by frequency)
  const entitySelect = document.getElementById('entity-select');
  if (entitySelect) {
    const prev = state.specificEntity;
    const sortedEntities = Array.from(entityCounts.entries()).sort((a, b) => b[1] - a[1]);
    entitySelect.innerHTML = `<option value="">-- Todas las entidades (${sortedEntities.length.toLocaleString('es-BO')}) --</option>`;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < sortedEntities.length; i++) {
      const [name, cnt] = sortedEntities[i];
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${name} (${cnt})`;
      frag.appendChild(opt);
    }
    entitySelect.appendChild(frag);
    entitySelect.value = prev;
  }

  // Populate Modality dropdown
  const modSelect = document.getElementById('modality-select');
  if (modSelect) {
    const prev = state.modality;
    modSelect.innerHTML = `<option value="">Todas</option>`;
    Array.from(modSet)
      .sort()
      .forEach((m) => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modSelect.appendChild(opt);
      });
    modSelect.value = prev;
  }

  // Populate Status dropdown
  const statusSelect = document.getElementById('status-select');
  if (statusSelect) {
    const prev = state.status;
    statusSelect.innerHTML = `<option value="">Todos</option>`;
    Array.from(statusSet)
      .sort()
      .forEach((s) => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        statusSelect.appendChild(opt);
      });
    statusSelect.value = prev;
  }
}

function applyFilters() {
  const {
    rawRecords,
    entityGroup,
    specificEntity,
    level,
    department,
    municipality,
    modality,
    status
  } = state;

  const filtered = rawRecords.filter((r) => {
    if (entityGroup !== 'ALL' && !matchesEntityGroup(r.entidadNorm, entityGroup)) {
      return false;
    }
    if (specificEntity && r.entidad !== specificEntity) {
      return false;
    }
    if (level !== 'ALL' && r.nivel !== level) {
      return false;
    }
    if (department && r.departamento !== department) {
      return false;
    }
    if (municipality && !matchesMunicipality(r, municipality)) {
      return false;
    }
    if (modality && r.modalidad !== modality) {
      return false;
    }
    if (status && r.estado !== status) {
      return false;
    }
    return true;
  });

  state.filteredRecords = filtered;
  updateKPIs(filtered);
  updateActiveFiltersRibbon();
  updateTopEntitiesChart(filtered, (entityName) => {
    state.specificEntity = entityName;
    const sel = document.getElementById('entity-select');
    if (sel) sel.value = entityName;
    applyFilters();
  });
  updateModalityChart(filtered);
  setTableData(filtered);
}

function updateKPIs(records) {
  const totalRaw = state.rawRecords.length;
  const total = records.length;

  document.getElementById('kpi-total').textContent = total.toLocaleString('es-BO');
  document.getElementById('kpi-total-sub').textContent = `De ${totalRaw.toLocaleString('es-BO')} cargados`;
  const pct = totalRaw > 0 ? ((total / totalRaw) * 100).toFixed(1) : '0.0';
  document.getElementById('kpi-total-pct').textContent = `${pct}%`;

  // Amount & Electronic Auctions
  let sumAmount = 0;
  let subastas = 0;
  let activeCount = 0;
  let concludedCount = 0;
  const uniqueEntities = new Set();
  const modCounts = new Map();

  for (let i = 0; i < total; i++) {
    const r = records[i];
    if (r.monto !== null) sumAmount += r.monto;
    if (r.subasta) subastas++;
    if (r.statusGroup === 'active') activeCount++;
    else if (r.statusGroup === 'concluded') concludedCount++;
    uniqueEntities.add(r.entidad);
    modCounts.set(r.modalidad, (modCounts.get(r.modalidad) || 0) + 1);
  }

  const amountEl = document.getElementById('kpi-amount');
  const amountSubEl = document.getElementById('kpi-amount-sub');
  if (state.hasNumericAmount) {
    amountEl.textContent = `Bs. ${sumAmount.toLocaleString('es-BO', { maximumFractionDigits: 0 })}`;
    amountSubEl.textContent = 'Monto acumulado filtrado';
  } else {
    amountEl.textContent = 'N/D en fuente';
    amountSubEl.textContent = 'Dataset sin columna monetaria';
  }
  document.getElementById('kpi-subasta-badge').textContent = `${subastas.toLocaleString('es-BO')} subastas`;

  document.getElementById('kpi-active').textContent = activeCount.toLocaleString('es-BO');
  document.getElementById('kpi-concluded').textContent = concludedCount.toLocaleString('es-BO');

  const denom = total || 1;
  document.getElementById('bar-active').style.width = `${(activeCount / denom) * 100}%`;
  document.getElementById('bar-concluded').style.width = `${(concludedCount / denom) * 100}%`;

  document.getElementById('kpi-entities').textContent = uniqueEntities.size.toLocaleString('es-BO');
  const topMod = Array.from(modCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('kpi-top-modality').textContent = topMod
    ? `Modalidad líder: ${topMod[0]} (${((topMod[1] / denom) * 100).toFixed(0)}%)`
    : 'Modalidad líder: —';
}

function updateActiveFiltersRibbon() {
  const ribbon = document.getElementById('active-filters-ribbon');
  const pills = document.getElementById('active-filter-pills');
  if (!ribbon || !pills) return;

  const active = [];
  if (state.entityGroup !== 'ALL') active.push(`Grupo: ${state.entityGroup}`);
  if (state.specificEntity) active.push(`Entidad: ${state.specificEntity}`);
  if (state.level !== 'ALL') active.push(`Nivel: ${state.level}`);
  if (state.department) active.push(`Depto: ${state.department}`);
  if (state.municipality) active.push(`GAM: ${state.municipality.nombreMun}`);
  if (state.modality) active.push(`Modalidad: ${state.modality}`);
  if (state.status) active.push(`Estado: ${state.status}`);

  if (active.length === 0) {
    ribbon.classList.add('hidden');
    ribbon.classList.remove('flex');
    return;
  }

  ribbon.classList.remove('hidden');
  ribbon.classList.add('flex');
  pills.innerHTML = active
    .map(
      (label) =>
        `<span class="px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary font-medium">${label}</span>`
    )
    .join('');
}

async function fetchAndRender(forceRefresh = false) {
  try {
    showLoading(true, 'Conectando con GitHub Raw...', 5);
    const { records, hasNumericAmount, indice } = await loadPeriodData(
      state.period,
      (done, total, currentId) => {
        const pct = total > 0 ? Math.round((done / total) * 100) : 100;
        const msg = currentId
          ? `Descargando ${currentId}.csv (${done + 1}/${total})...`
          : 'Procesando registros...';
        showLoading(true, msg, pct);
      },
      forceRefresh
    );

    populatePeriodOptions(indice);
    state.rawRecords = records;
    state.hasNumericAmount = hasNumericAmount;

    populateDynamicSelects(records);
    applyFilters();
  } catch (err) {
    console.error(err);
    showError(`Error al cargar datos de GitHub: ${err.message}`);
  } finally {
    showLoading(false);
  }
}

function bindUIEvents() {
  // Period selector
  document.getElementById('period-select')?.addEventListener('change', (e) => {
    state.period = e.target.value;
    fetchAndRender(false);
  });

  // Refresh button
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    const icon = document.getElementById('refresh-icon');
    icon?.classList.add('rotate-180');
    setTimeout(() => icon?.classList.remove('rotate-180'), 600);
    fetchAndRender(true);
  });

  // Export CSV
  document.getElementById('export-csv-btn')?.addEventListener('click', exportFilteredCsv);

  // Error close
  document.getElementById('error-close')?.addEventListener('click', () => {
    document.getElementById('error-banner')?.classList.add('hidden');
  });

  // Quick Entity Chips
  document.querySelectorAll('.entity-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.entity-chip').forEach((b) => {
        b.classList.remove('active', 'bg-primary-container', 'text-white', 'border-primary/40', 'font-semibold');
        b.classList.add('bg-surface-high', 'text-on-surface-variant', 'border-outline-variant/60', 'font-medium');
      });
      btn.classList.add('active', 'bg-primary-container', 'text-white', 'border-primary/40', 'font-semibold');
      btn.classList.remove('bg-surface-high', 'text-on-surface-variant', 'border-outline-variant/60', 'font-medium');

      state.entityGroup = btn.dataset.entity;
      applyFilters();
    });
  });

  // Specific Entity Select
  document.getElementById('entity-select')?.addEventListener('change', (e) => {
    state.specificEntity = e.target.value;
    applyFilters();
  });

  // Jurisdiction Level Buttons
  document.querySelectorAll('.level-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.level-btn').forEach((b) => {
        b.classList.remove('active', 'bg-primary-container/20', 'border-primary/50', 'text-primary', 'font-semibold');
        b.classList.add('bg-surface-lowest', 'border-outline-variant/60', 'text-on-surface-variant', 'font-medium');
      });
      btn.classList.add('active', 'bg-primary-container/20', 'border-primary/50', 'text-primary', 'font-semibold');
      btn.classList.remove('bg-surface-lowest', 'border-outline-variant/60', 'text-on-surface-variant', 'font-medium');

      state.level = btn.dataset.level;
      applyFilters();
    });
  });

  // Department Select
  document.getElementById('dept-select')?.addEventListener('change', (e) => {
    state.department = e.target.value;
    applyFilters();
  });

  // Modality & Status Selects
  document.getElementById('modality-select')?.addEventListener('change', (e) => {
    state.modality = e.target.value;
    applyFilters();
  });

  document.getElementById('status-select')?.addEventListener('change', (e) => {
    state.status = e.target.value;
    applyFilters();
  });

  // Clear Municipality Button
  document.getElementById('clear-mun-btn')?.addEventListener('click', () => {
    state.municipality = null;
    clearMapSelection();
    document.getElementById('selected-mun-bar')?.classList.add('hidden');
    document.getElementById('selected-mun-bar')?.classList.remove('flex');
    applyFilters();
  });

  // Reset All Filters
  document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
    state.entityGroup = 'ALL';
    state.specificEntity = '';
    state.level = 'ALL';
    state.department = '';
    state.municipality = null;
    state.modality = '';
    state.status = '';

    document.getElementById('entity-select').value = '';
    document.getElementById('dept-select').value = '';
    document.getElementById('modality-select').value = '';
    document.getElementById('status-select').value = '';
    document.getElementById('table-search').value = '';

    clearMapSelection();
    document.getElementById('selected-mun-bar')?.classList.add('hidden');
    document.getElementById('selected-mun-bar')?.classList.remove('flex');

    // Reset chip & level styles
    document.querySelector('.entity-chip[data-entity="ALL"]')?.click();
    document.querySelector('.level-btn[data-level="ALL"]')?.click();
  });

  // Chart mode switcher
  const btnDoughnut = document.getElementById('chart-mode-doughnut');
  const btnBar = document.getElementById('chart-mode-bar');
  btnDoughnut?.addEventListener('click', () => {
    btnDoughnut.classList.add('bg-surface-high', 'text-primary', 'font-semibold');
    btnDoughnut.classList.remove('text-outline');
    btnBar?.classList.remove('bg-surface-high', 'text-primary', 'font-semibold');
    btnBar?.classList.add('text-outline');
    setModalityChartMode('doughnut');
  });
  btnBar?.addEventListener('click', () => {
    btnBar.classList.add('bg-surface-high', 'text-primary', 'font-semibold');
    btnBar.classList.remove('text-outline');
    btnDoughnut?.classList.remove('bg-surface-high', 'text-primary', 'font-semibold');
    btnDoughnut?.classList.add('text-outline');
    setModalityChartMode('bar');
  });
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  initTableControls();
  bindUIEvents();

  initBoliviaMap((munInfo) => {
    state.municipality = munInfo;
    const bar = document.getElementById('selected-mun-bar');
    const nameEl = document.getElementById('selected-mun-name');
    const deptEl = document.getElementById('selected-mun-dept');

    if (munInfo && bar) {
      nameEl.textContent = `GAM ${munInfo.nombreMun}`;
      deptEl.textContent = `${munInfo.nombreDep} • Prov. ${munInfo.nombreProv}`;
      bar.classList.remove('hidden');
      bar.classList.add('flex');
    } else if (bar) {
      bar.classList.add('hidden');
      bar.classList.remove('flex');
    }

    applyFilters();
  });

  fetchAndRender(false);
});
