import { normalizeText } from './classifier.js';

let sidebarMap = null;
let modalMap = null;
let geojsonLayer = null;
let modalGeojsonLayer = null;
let geojsonData = null;
let selectedMunKey = null;
let munFeaturesIndex = [];
let onSelectCallback = null;

const DEFAULT_STYLE = {
  fillColor: '#1e293b',
  weight: 0.7,
  opacity: 0.9,
  color: '#424754',
  fillOpacity: 0.75
};

const HOVER_STYLE = {
  fillColor: '#4d8eff',
  weight: 1.5,
  color: '#adc6ff',
  fillOpacity: 0.85
};

const SELECTED_STYLE = {
  fillColor: '#4edea3',
  weight: 2,
  color: '#6ffbbe',
  fillOpacity: 0.9
};

function getFeatureKey(props) {
  return `${props.idep || ''}-${props.iprov || ''}-${props.imun || ''}-${props.nombre_mun || ''}`;
}

function styleFeature(feature) {
  if (selectedMunKey && getFeatureKey(feature.properties) === selectedMunKey) {
    return SELECTED_STYLE;
  }
  return DEFAULT_STYLE;
}

function buildLayer(mapInstance, targetData, isModal = false) {
  return L.geoJSON(targetData, {
    style: styleFeature,
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.bindTooltip(
        `<div class="font-semibold text-primary">${p.nombre_mun || 'Municipio'}</div>
         <div class="text-[11px] text-on-surface-variant">${p.nombre_dep || ''} • Prov. ${p.nombre_prov || ''}</div>`,
        { sticky: true, direction: 'top', className: 'mun-tooltip' }
      );

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          if (getFeatureKey(p) !== selectedMunKey) {
            l.setStyle(HOVER_STYLE);
          }
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            l.bringToFront();
          }
        },
        mouseout: (e) => {
          const l = e.target;
          l.setStyle(styleFeature(feature));
        },
        click: () => {
          selectMunicipalityFeature(feature);
          if (isModal) {
            document.getElementById('map-modal')?.classList.add('hidden');
          }
        }
      });
    }
  }).addTo(mapInstance);
}

/**
 * Selects a municipality feature, updates map styles, and triggers dashboard filter.
 * @param {Object|null} feature
 */
export function selectMunicipalityFeature(feature) {
  if (!feature) {
    selectedMunKey = null;
  } else {
    const key = getFeatureKey(feature.properties);
    // Toggle off if clicking the already-selected municipality
    selectedMunKey = selectedMunKey === key ? null : key;
  }

  if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
  if (modalGeojsonLayer) modalGeojsonLayer.setStyle(styleFeature);

  if (!selectedMunKey || !feature) {
    if (onSelectCallback) onSelectCallback(null);
    return;
  }

  const p = feature.properties;
  if (onSelectCallback) {
    onSelectCallback({
      nombreMun: p.nombre_mun,
      nombreDep: p.nombre_dep,
      nombreProv: p.nombre_prov,
      nombreMunNorm: normalizeText(p.nombre_mun),
      nombreDepNorm: normalizeText(p.nombre_dep)
    });
  }
}

export function clearMapSelection() {
  selectedMunKey = null;
  if (geojsonLayer) geojsonLayer.setStyle(styleFeature);
  if (modalGeojsonLayer) modalGeojsonLayer.setStyle(styleFeature);
}

/**
 * Initializes the Leaflet map with ./mapa/municipios_bolivia_2024.geojson
 * @param {(munInfo: Object|null) => void} onMunicipalitySelect
 */
export async function initBoliviaMap(onMunicipalitySelect) {
  onSelectCallback = onMunicipalitySelect;
  const overlay = document.getElementById('map-loading-overlay');

  sidebarMap = L.map('bolivia-map', {
    zoomControl: true,
    attributionControl: false,
    minZoom: 4,
    maxZoom: 12
  }).setView([-16.5, -64.5], 5);

  try {
    const res = await fetch('./mapa/municipios_bolivia_2024.geojson');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    geojsonData = await res.json();

    geojsonLayer = buildLayer(sidebarMap, geojsonData, false);
    sidebarMap.fitBounds(geojsonLayer.getBounds(), { padding: [8, 8] });

    munFeaturesIndex = (geojsonData.features || []).map((f) => ({
      feature: f,
      name: f.properties?.nombre_mun || '',
      dep: f.properties?.nombre_dep || '',
      norm: normalizeText(f.properties?.nombre_mun || '')
    }));

    setupMunicipalitySearch();
    setupExpandedModal();
  } catch (err) {
    console.error('Error cargando GeoJSON:', err);
    if (overlay) {
      overlay.innerHTML = `<span class="text-xs text-error px-3 text-center">No se pudo cargar ./mapa/municipios_bolivia_2024.geojson. Abre la app mediante un servidor local (ej. Live Server o python -m http.server).</span>`;
    }
    return;
  }

  if (overlay) overlay.classList.add('hidden');
}

function setupMunicipalitySearch() {
  const input = document.getElementById('mun-search-input');
  const resultsBox = document.getElementById('mun-search-results');
  if (!input || !resultsBox) return;

  input.addEventListener('input', () => {
    const q = normalizeText(input.value);
    if (q.length < 2) {
      resultsBox.classList.add('hidden');
      resultsBox.innerHTML = '';
      return;
    }

    const matches = munFeaturesIndex
      .filter((m) => m.norm.includes(q))
      .slice(0, 12);

    if (matches.length === 0) {
      resultsBox.innerHTML = `<div class="px-3 py-2 text-xs text-outline">Sin resultados</div>`;
      resultsBox.classList.remove('hidden');
      return;
    }

    resultsBox.innerHTML = matches
      .map(
        (m, idx) => `
        <button data-idx="${idx}" class="w-full text-left px-3 py-1.5 hover:bg-surface-highest flex items-center justify-between text-xs border-b border-outline-variant/30 last:border-0">
          <span class="font-medium text-on-surface">${m.name}</span>
          <span class="text-[11px] text-outline">${m.dep}</span>
        </button>`
      )
      .join('');
    resultsBox.classList.remove('hidden');

    resultsBox.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = matches[parseInt(btn.dataset.idx, 10)];
        if (item) {
          selectMunicipalityFeature(item.feature);
          input.value = '';
          resultsBox.classList.add('hidden');
          if (sidebarMap && geojsonLayer) {
            const tempLayer = L.geoJSON(item.feature);
            sidebarMap.fitBounds(tempLayer.getBounds(), { maxZoom: 9, padding: [20, 20] });
          }
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !resultsBox.contains(e.target)) {
      resultsBox.classList.add('hidden');
    }
  });
}

function setupExpandedModal() {
  const expandBtn = document.getElementById('expand-map-btn');
  const modal = document.getElementById('map-modal');
  const closeBtn = document.getElementById('close-map-modal');
  if (!expandBtn || !modal || !closeBtn) return;

  expandBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    setTimeout(() => {
      if (!modalMap && geojsonData) {
        modalMap = L.map('bolivia-map-large', {
          zoomControl: true,
          attributionControl: false
        }).setView([-16.5, -64.5], 6);
        modalGeojsonLayer = buildLayer(modalMap, geojsonData, true);
        modalMap.fitBounds(modalGeojsonLayer.getBounds(), { padding: [15, 15] });
      } else if (modalMap) {
        modalMap.invalidateSize();
        if (modalGeojsonLayer) modalGeojsonLayer.setStyle(styleFeature);
      }
    }, 50);
  });

  closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
}
