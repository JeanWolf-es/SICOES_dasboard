import { normalizeText } from './classifier.js';

let currentRecords = [];
let displayRecords = [];
let currentPage = 1;
let pageSize = 25;
let currentSort = 'date_desc';
let searchQuery = '';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getModalityBadge(mod) {
  const m = (mod || '').toUpperCase();
  if (m === 'LP') {
    return `<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">LP</span>`;
  }
  if (m === 'CD') {
    return `<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">CD</span>`;
  }
  if (m === 'ANPE' || m === 'ANPP') {
    return `<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">${escapeHtml(m)}</span>`;
  }
  return `<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-highest text-on-surface-variant border border-outline-variant/50">${escapeHtml(mod || 'N/D')}</span>`;
}

function getStatusBadge(estado, group) {
  if (group === 'active') {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-container/20 text-secondary border border-secondary/30"><span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>${escapeHtml(estado)}</span>`;
  }
  if (group === 'concluded') {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/15 text-primary border border-primary/30">${escapeHtml(estado)}</span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">${escapeHtml(estado)}</span>`;
}

function formatMoney(monto) {
  if (monto === null || monto === undefined || Number.isNaN(monto)) {
    return '<span class="text-outline">N/D</span>';
  }
  return `Bs. ${monto.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function applySearchAndSort() {
  const q = normalizeText(searchQuery);
  let list = q
    ? currentRecords.filter((r) => r.searchBlob.includes(q))
    : [...currentRecords];

  list.sort((a, b) => {
    switch (currentSort) {
      case 'date_asc':
        return (a.fechaPublicacion || '').localeCompare(b.fechaPublicacion || '');
      case 'amount_desc':
        return (b.monto ?? -1) - (a.monto ?? -1);
      case 'amount_asc':
        return (a.monto ?? Number.MAX_SAFE_INTEGER) - (b.monto ?? Number.MAX_SAFE_INTEGER);
      case 'entity_asc':
        return (a.entidad || '').localeCompare(b.entidad || '');
      case 'date_desc':
      default:
        return (b.fechaPublicacion || '').localeCompare(a.fechaPublicacion || '');
    }
  });

  displayRecords = list;
  currentPage = 1;
  renderTable();
}

export function setTableData(records) {
  currentRecords = records;
  applySearchAndSort();
}

function renderTable() {
  const tbody = document.getElementById('table-body');
  const summary = document.getElementById('table-summary');
  const pageInfo = document.getElementById('pagination-info');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const pageNumbers = document.getElementById('page-numbers');
  if (!tbody) return;

  const total = displayRecords.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageItems = displayRecords.slice(start, end);

  if (summary) {
    summary.textContent =
      total === 0
        ? 'No se encontraron convocatorias con los filtros actuales'
        : `Mostrando ${(start + 1).toLocaleString('es-BO')}–${end.toLocaleString('es-BO')} de ${total.toLocaleString('es-BO')} procesos`;
  }

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-outline">Sin registros coincidentes. Intenta ajustar los filtros o el periodo.</td></tr>`;
  } else {
    tbody.innerHTML = pageItems
      .map(
        (r, idx) => `
      <tr data-row-idx="${start + idx}" class="data-row cursor-pointer">
        <td class="py-2.5 px-4 font-mono text-[11px] text-primary whitespace-nowrap tabular-nums">${escapeHtml(r.cuce)}</td>
        <td class="py-2.5 px-4 max-w-[240px]">
          <div class="font-medium text-on-surface truncate" title="${escapeHtml(r.entidad)}">${escapeHtml(r.entidad)}</div>
          <div class="text-[11px] text-outline">${escapeHtml(r.departamento)} • ${escapeHtml(r.nivel)}</div>
        </td>
        <td class="py-2.5 px-4 max-w-[340px]">
          <div class="text-on-surface-variant line-clamp-2" title="${escapeHtml(r.objeto)}">${escapeHtml(r.objeto)}</div>
        </td>
        <td class="py-2.5 px-4 whitespace-nowrap">${getModalityBadge(r.modalidad)}</td>
        <td class="py-2.5 px-4 text-right whitespace-nowrap tabular-nums font-medium">${formatMoney(r.monto)}</td>
        <td class="py-2.5 px-4 whitespace-nowrap tabular-nums text-on-surface-variant">${escapeHtml(r.fechaPublicacion || '—')}</td>
        <td class="py-2.5 px-4 whitespace-nowrap">${getStatusBadge(r.estado, r.statusGroup)}</td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('tr[data-row-idx]').forEach((row) => {
      row.addEventListener('click', () => {
        const rec = displayRecords[parseInt(row.dataset.rowIdx, 10)];
        if (rec) openDetailModal(rec);
      });
    });
  }

  if (pageInfo) {
    pageInfo.textContent = `Página ${currentPage.toLocaleString('es-BO')} de ${totalPages.toLocaleString('es-BO')}`;
  }
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  if (pageNumbers) {
    const pages = [];
    const maxButtons = 5;
    let pStart = Math.max(1, currentPage - 2);
    let pEnd = Math.min(totalPages, pStart + maxButtons - 1);
    if (pEnd - pStart < maxButtons - 1) {
      pStart = Math.max(1, pEnd - maxButtons + 1);
    }

    for (let p = pStart; p <= pEnd; p++) {
      const active = p === currentPage;
      pages.push(
        `<button data-page="${p}" class="px-2.5 py-1 rounded text-xs tabular-nums ${
          active
            ? 'bg-primary-container text-white font-semibold'
            : 'bg-surface-high text-on-surface-variant hover:text-on-surface border border-outline-variant/50'
        }">${p}</button>`
      );
    }
    pageNumbers.innerHTML = pages.join('');
    pageNumbers.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page, 10);
        renderTable();
      });
    });
  }
}

function openDetailModal(rec) {
  const modal = document.getElementById('detail-modal');
  const cuceEl = document.getElementById('modal-cuce');
  const entEl = document.getElementById('modal-entity');
  const bodyEl = document.getElementById('modal-body');
  if (!modal || !bodyEl) return;

  cuceEl.textContent = `CUCE: ${rec.cuce}`;
  entEl.textContent = rec.entidad;

  const fields = [
    ['Objeto de Contratación', rec.objeto, true],
    ['Tipo de Contratación', rec.tipo],
    ['Modalidad', rec.modalidad],
    ['Estado', rec.estado],
    ['Subasta Electrónica', rec.subasta ? 'Sí' : 'No'],
    ['Nivel de Gobierno', rec.nivel],
    ['Departamento', rec.departamento],
    ['Fecha de Publicación', rec.fechaPublicacion || '—'],
    ['Fecha de Presentación', rec.fechaPresentacion || '—'],
    ['Fecha Adjudicación / Desierta', rec.fechaAdjudicacion || '—'],
    ['Precio Referencial', rec.monto !== null ? `Bs. ${rec.monto.toLocaleString('es-BO')}` : 'N/D en fuente'],
    ['Normativa', rec.normativa || '—'],
    ['Persona de Contacto', rec.contacto || '—', true],
    ['Formularios', rec.formularios || '—', true],
    ['Archivos', rec.archivos || '—', true]
  ];

  bodyEl.innerHTML = fields
    .map(
      ([label, val, full]) => `
      <div class="${full ? 'col-span-2' : ''} bg-surface-low border border-outline-variant/50 rounded-lg p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-outline mb-1">${escapeHtml(label)}</div>
        <div class="text-xs text-on-surface break-words">${escapeHtml(String(val || '—'))}</div>
      </div>`
    )
    .join('');

  modal.classList.remove('hidden');
}

export function initTableControls() {
  const searchInput = document.getElementById('table-search');
  const sortSelect = document.getElementById('table-sort');
  const sizeSelect = document.getElementById('page-size-select');
  const prevBtn = document.getElementById('prev-page-btn');
  const nextBtn = document.getElementById('next-page-btn');
  const closeModal = document.getElementById('close-detail-modal');
  const modal = document.getElementById('detail-modal');

  let debounceTimer = null;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      searchQuery = searchInput.value;
      applySearchAndSort();
    }, 180);
  });

  sortSelect?.addEventListener('change', () => {
    currentSort = sortSelect.value;
    applySearchAndSort();
  });

  sizeSelect?.addEventListener('change', () => {
    pageSize = parseInt(sizeSelect.value, 10) || 25;
    currentPage = 1;
    renderTable();
  });

  prevBtn?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  nextBtn?.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(displayRecords.length / pageSize));
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });

  closeModal?.addEventListener('click', () => modal?.classList.add('hidden'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
}

export function exportFilteredCsv() {
  if (!displayRecords.length) return;
  const headers = [
    'CUCE',
    'Entidad',
    'Nivel',
    'Departamento',
    'Tipo',
    'Modalidad',
    'Objeto',
    'Estado',
    'Fecha Publicacion',
    'Fecha Presentacion',
    'Precio Referencial'
  ];
  const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [headers.join(',')];

  for (let i = 0; i < displayRecords.length; i++) {
    const r = displayRecords[i];
    rows.push(
      [
        r.cuce,
        r.entidad,
        r.nivel,
        r.departamento,
        r.tipo,
        r.modalidad,
        r.objeto,
        r.estado,
        r.fechaPublicacion,
        r.fechaPresentacion,
        r.monto ?? ''
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sicoes_convocatorias_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
