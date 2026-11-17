/**
 * Chart.js visualizations for Top 10 Entities and Modality Distribution.
 */

let entitiesChart = null;
let modalityChart = null;
let currentModalityMode = 'doughnut';
let lastRecordsForModality = [];

const MODALITY_NAMES = {
  ANPE: 'ANPE (Apoyo Nacional a la Producción y Empleo)',
  LP: 'LP (Licitación Pública)',
  CD: 'CD (Contratación Directa)',
  CM: 'CM (Contratación Menor)',
  ANPP: 'ANPP (Apoyo Nac. Prod. y Empleo - Proyectos)',
  OF: 'OF (Otras / Normativa Específica)',
  CE: 'CE (Contratación por Excepción)',
  EM: 'EM (Emergencia)'
};

const PALETTE = [
  '#4d8eff',
  '#4edea3',
  '#a078ff',
  '#f59e0b',
  '#adc6ff',
  '#38bdf8',
  '#fb7185',
  '#94a3b8'
];

function truncateLabel(text, max = 34) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

/**
 * Updates or creates the Top 10 Entities Horizontal Bar Chart.
 * @param {Object[]} records
 * @param {(entityName: string) => void} onBarClick
 */
export function updateTopEntitiesChart(records, onBarClick) {
  const counts = new Map();
  for (let i = 0; i < records.length; i++) {
    const ent = records[i].entidad || 'Sin entidad';
    counts.set(ent, (counts.get(ent) || 0) + 1);
  }

  const top10 = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = top10.map(([name]) => truncateLabel(name, 38));
  const fullNames = top10.map(([name]) => name);
  const values = top10.map(([, cnt]) => cnt);

  const ctx = document.getElementById('top-entities-chart');
  if (!ctx) return;

  if (entitiesChart) {
    entitiesChart.destroy();
  }

  entitiesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Convocatorias',
          data: values,
          backgroundColor: 'rgba(77, 142, 255, 0.78)',
          hoverBackgroundColor: '#4edea3',
          borderColor: '#adc6ff',
          borderWidth: 1,
          borderRadius: 4,
          barThickness: 18
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_, elements) => {
        if (elements.length > 0 && onBarClick) {
          const idx = elements[0].index;
          onBarClick(fullNames[idx]);
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#131b2e',
          borderColor: '#424754',
          borderWidth: 1,
          titleColor: '#adc6ff',
          bodyColor: '#dae2fd',
          callbacks: {
            title: (items) => fullNames[items[0].dataIndex] || '',
            label: (item) => ` ${item.raw.toLocaleString('es-BO')} procesos`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(66, 71, 84, 0.35)' },
          ticks: { color: '#8c909f', font: { size: 11 } }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#dae2fd', font: { size: 11 } }
        }
      }
    }
  });
}

/**
 * Updates or creates the Modality Distribution Chart.
 * @param {Object[]} records
 * @param {'doughnut' | 'bar'} [mode]
 */
export function updateModalityChart(records, mode = currentModalityMode) {
  currentModalityMode = mode;
  lastRecordsForModality = records;

  const counts = new Map();
  for (let i = 0; i < records.length; i++) {
    const mod = records[i].modalidad || 'N/D';
    counts.set(mod, (counts.get(mod) || 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 7);
  if (sorted.length > 7) {
    const otherSum = sorted.slice(7).reduce((acc, [, v]) => acc + v, 0);
    top.push(['Otras', otherSum]);
  }

  const labels = top.map(([k]) => k);
  const values = top.map(([, v]) => v);
  const total = records.length || 1;

  const ctx = document.getElementById('modality-chart');
  if (!ctx) return;

  if (modalityChart) {
    modalityChart.destroy();
  }

  const isDoughnut = mode === 'doughnut';

  modalityChart = new Chart(ctx, {
    type: isDoughnut ? 'doughnut' : 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Procesos',
          data: values,
          backgroundColor: labels.map((_, idx) => PALETTE[idx % PALETTE.length]),
          borderColor: '#171f33',
          borderWidth: isDoughnut ? 2 : 0,
          borderRadius: isDoughnut ? 0 : 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: isDoughnut ? '62%' : undefined,
      plugins: {
        legend: {
          display: isDoughnut,
          position: 'right',
          labels: {
            color: '#dae2fd',
            boxWidth: 12,
            padding: 12,
            font: { size: 11 }
          }
        },
        tooltip: {
          backgroundColor: '#131b2e',
          borderColor: '#424754',
          borderWidth: 1,
          titleColor: '#adc6ff',
          bodyColor: '#dae2fd',
          callbacks: {
            title: (items) => {
              const code = items[0].label;
              return MODALITY_NAMES[code] || code;
            },
            label: (item) => {
              const pct = ((item.raw / total) * 100).toFixed(1);
              return ` ${item.raw.toLocaleString('es-BO')} procesos (${pct}%)`;
            }
          }
        }
      },
      scales: isDoughnut
        ? {}
        : {
            x: {
              grid: { display: false },
              ticks: { color: '#dae2fd', font: { size: 11 } }
            },
            y: {
              grid: { color: 'rgba(66, 71, 84, 0.35)' },
              ticks: { color: '#8c909f', font: { size: 11 } }
            }
          }
    }
  });
}

export function setModalityChartMode(mode) {
  updateModalityChart(lastRecordsForModality, mode);
}
