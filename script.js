const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_API = "https://air-quality-api.open-meteo.com/v1/air-quality";
const MAP_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const METEOCONS_BASE = "https://cdn.jsdelivr.net/npm/@meteocons/svg@0.1.0/fill";
const REVERSE_GEOCODE_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const RECENT_KEY = "chetempofa-recent";
const PLACE_KEY = "chetempofa-place";
const API_CACHE_PREFIX = "chetempofa-api-v1:";
const API_TIMEOUT_MS = 12000;
const CACHE_TTL = Object.freeze({
  search: 24 * 60 * 60 * 1000,
  weather: 10 * 60 * 1000,
  airQuality: 30 * 60 * 1000,
  reverseGeocode: 7 * 24 * 60 * 60 * 1000,
  atlas: 10 * 60 * 1000,
});
const SEARCH_RESULT_POOL = 20;
const HOURLY_WINDOW_SIZE = 24;
const HOUR_COLUMN_WIDTH = 78;
const HOURLY_CHART_HEIGHT = 160;
const HOURLY_LOADING_DELAY = 200;
const ANALYTICS_CONFIG = Object.freeze({
  enabled: window.CHE_TEMPOFA_ANALYTICS?.enabled === true,
  debug: window.CHE_TEMPOFA_ANALYTICS?.debug === true,
});
const ANALYTICS_PARAM_ALLOWLIST = Object.freeze({
  weather_city_viewed: ["city_slug", "region_slug", "country_code", "source", "page_type"],
  city_search_submitted: ["query_length", "result_count", "result"],
  city_suggestion_selected: ["city_slug", "region_slug", "country_code", "rank"],
  geolocation_used: ["result"],
  forecast_day_selected: ["day_index"],
  weather_api_error: ["api", "context", "has_cached_weather"],
});
const MAJOR_ITALIAN_CITIES = Object.freeze([
  ["Milano", 45.4642, 9.19, 1371000], ["Monza", 45.5845, 9.2744, 123000],
  ["Busto Arsizio", 45.6113, 8.8491, 84000], ["Rho", 45.5324, 9.0402, 51000],
  ["Gallarate", 45.6602, 8.7934, 54000], ["Legnano", 45.5979, 8.9151, 60000],
  ["Sesto San Giovanni", 45.5345, 9.231, 80000], ["Cinisello Balsamo", 45.558, 9.2149, 75000],
  ["Varese", 45.8206, 8.8251, 79000], ["Como", 45.8081, 9.0852, 84000],
  ["Pavia", 45.1847, 9.1582, 71000], ["Vigevano", 45.3171, 8.8586, 63000],
  ["Lodi", 45.3138, 9.503, 46000], ["Crema", 45.3626, 9.6818, 35000],
  ["Bergamo", 45.6983, 9.6773, 120000], ["Brescia", 45.5416, 10.2118, 198000],
  ["Novara", 45.445, 8.6222, 102000], ["Torino", 45.0703, 7.6869, 847000],
  ["Genova", 44.4056, 8.9463, 558000], ["Piacenza", 45.0526, 9.693, 103000],
  ["Parma", 44.8015, 10.3279, 198000], ["Verona", 45.4384, 10.9916, 256000],
  ["Padova", 45.4064, 11.8768, 206000], ["Venezia", 45.4408, 12.3155, 250000],
  ["Bologna", 44.4949, 11.3426, 390000], ["Firenze", 43.7696, 11.2558, 361000],
  ["Roma", 41.9028, 12.4964, 2750000], ["Napoli", 40.8518, 14.2681, 913000],
  ["Bari", 41.1171, 16.8719, 316000], ["Palermo", 38.1157, 13.3615, 630000],
  ["Catania", 37.5079, 15.083, 299000], ["Cagliari", 39.2238, 9.1217, 148000],
]);

const state = {
  place: null,
  weather: null,
  airQuality: null,
  selectedDay: 0,
  selectedHourIndex: null,
  chartMode: "days",
  mapHourStep: 0,
  atlasZoom: 10,
  atlasGrid: null,
  dataStatus: { source: "network", stale: false, storedAt: null },
  recent: readJson(RECENT_KEY, []),
};

const els = {
  body: document.body,
  searchForm: document.querySelector("#searchForm"),
  citySearch: document.querySelector("#citySearch"),
  suggestions: document.querySelector("#suggestions"),
  locationButton: document.querySelector("#locationButton"),
  status: document.querySelector("#status"),
  cityName: document.querySelector("#cityName"),
  pageDate: document.querySelector("#pageDate"),
  headerDataTime: document.querySelector("#headerDataTime"),
  dataFreshnessBadge: document.querySelector("#dataFreshnessBadge"),
  locationMeta: document.querySelector("#locationMeta"),
  heroKicker: document.querySelector("#heroKicker"),
  currentTemp: document.querySelector("#currentTemp"),
  tempUnit: document.querySelector("#tempUnit"),
  conditionLabel: document.querySelector("#conditionLabel"),
  weatherAdvice: document.querySelector("#weatherAdvice"),
  updatedAt: document.querySelector("#updatedAt"),
  currentIcon: document.querySelector("#currentIcon"),
  temperatureTrend: document.querySelector("#temperatureTrend"),
  miniRainTitle: document.querySelector("#miniRainTitle"),
  miniRainChart: document.querySelector("#miniRainChart"),
  miniRainTimes: document.querySelector("#miniRainTimes"),
  mapDay: document.querySelector("#mapDay"),
  mapTemp: document.querySelector("#mapTemp"),
  mapViewport: document.querySelector("#mapViewport"),
  atlasVectorMap: document.querySelector("#atlasVectorMap"),
  mapZoom: document.querySelector("#mapZoom"),
  mapLayerTitle: document.querySelector("#mapLayerTitle"),
  mapScaleMin: document.querySelector("#mapScaleMin"),
  mapScaleMax: document.querySelector("#mapScaleMax"),
  mapScaleBar: document.querySelector("#mapScaleBar"),
  mapDataNote: document.querySelector("#mapDataNote"),
  mapBaseLayer: document.querySelector("#mapBaseLayer"),
  mapCitiesLayer: document.querySelector("#mapCitiesLayer"),
  mapRainLayer: document.querySelector("#mapRainLayer"),
  mapTempLayer: document.querySelector("#mapTempLayer"),
  mapFrontLayer: document.querySelector("#mapFrontLayer"),
  mapPressureContours: document.querySelector("#mapPressureContours"),
  mapWindLayer: document.querySelector("#mapWindLayer"),
  mapSamplesLayer: document.querySelector("#mapSamplesLayer"),
  mapPlay: document.querySelector("#mapPlay"),
  mapTimeRange: document.querySelector("#mapTimeRange"),
  mapStartTime: document.querySelector("#mapStartTime"),
  mapTimeLabel: document.querySelector("#mapTimeLabel"),
  mapEndTime: document.querySelector("#mapEndTime"),
  chartEyebrow: document.querySelector("#chartEyebrow"),
  overviewTitle: document.querySelector("#overviewTitle"),
  chartLegend: document.querySelector("#chartLegend"),
  forecastChart: document.querySelector("#forecastChart"),
  recentSection: document.querySelector("#recentSection"),
  recentCities: document.querySelector("#recentCities"),
  metricsGrid: document.querySelector("#metricsGrid"),
  dailyList: document.querySelector("#dailyList"),
  forecastSummary: document.querySelector("#forecastSummary"),
  timezoneLabel: document.querySelector("#timezoneLabel"),
  footerUpdatedAt: document.querySelector("#footerUpdatedAt"),
};

let suggestionRun = 0;
let suggestionPlaces = [];
let activeSuggestionIndex = -1;
let statusTimer = 0;
let hourlyRenderTimer = 0;
let overviewRenderTimer = 0;
let mapPlayTimer = 0;
let atlasRequestRun = 0;
let atlasVectorMap = null;
let atlasVectorReady = false;
let atlasZoomTimer = 0;
let atlasIdleHandle = 0;
let weatherRequestRun = 0;
let loadingDepth = 0;
let weatherAbortController = null;
let atlasAbortController = null;
let staticCitiesPromise = null;
const memoryApiCache = new Map();
const inFlightApiRequests = new Map();
const apiResponseMeta = new Map();

init();

function init() {
  wireEvents();
  wireConnectionEvents();
  wireAtlasControls();
  initializeVectorAtlas();
  renderRecent();
  void loadStaticCities();
  boot();
  window.setTimeout(() => pruneApiCache(), 1200);
}

function wireConnectionEvents() {
  window.addEventListener("offline", () => {
    els.body.dataset.connection = "offline";
    renderDataFreshness();
    setStatus("Sei offline: continuo con gli ultimi dati disponibili.", "info", { autoHide: false });
  });

  window.addEventListener("online", () => {
    delete els.body.dataset.connection;
    renderDataFreshness();
    setStatus("Connessione ripristinata. Aggiorno i dati…", "info", { autoHide: true });
    if (state.place) void loadWeather(state.place, { remember: false });
  });

  if (!navigator.onLine) {
    els.body.dataset.connection = "offline";
  }
}

function wireEvents() {
  els.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = els.citySearch.value.trim();
    if (!query) return;

    hideSuggestions();
    await searchAndLoad(query, { trackSearch: true });
  });

  els.citySearch.addEventListener("input", debounce(renderSuggestions, 240));
  els.citySearch.addEventListener("keydown", handleSearchKeydown);

  document.addEventListener("click", (event) => {
    if (!els.searchForm.contains(event.target)) hideSuggestions();
  });

  els.locationButton.addEventListener("click", useCurrentPosition);
}

function initializeVectorAtlas() {
  if (!els.atlasVectorMap || !window.maplibregl) return;

  try {
    atlasVectorMap = new window.maplibregl.Map({
      container: els.atlasVectorMap,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: [9.19, 45.4642],
      zoom: state.atlasZoom,
      minZoom: 9,
      maxZoom: 12,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    atlasVectorMap.on("load", () => {
      styleVectorAtlas();
      atlasVectorReady = true;
      els.mapViewport.classList.add("is-vector-ready");
      els.mapBaseLayer.replaceChildren();
      els.mapBaseLayer.dataset.key = "vector";
      syncVectorAtlasBase();
    });
    atlasVectorMap.on("error", (event) => {
      if (!atlasVectorReady) console.warn("Base vettoriale Atlas non disponibile", event?.error || event);
    });
  } catch (error) {
    console.warn("Impossibile inizializzare la base vettoriale Atlas", error);
  }
}

function styleVectorAtlas() {
  if (!atlasVectorMap) return;
  const layerIds = new Set((atlasVectorMap.getStyle().layers || []).map((layer) => layer.id));
  const setPaint = (id, property, value) => {
    if (layerIds.has(id)) atlasVectorMap.setPaintProperty(id, property, value);
  };
  const setLayout = (id, property, value) => {
    if (layerIds.has(id)) atlasVectorMap.setLayoutProperty(id, property, value);
  };

  setPaint("highway_motorway_casing", "line-color", "#b95f4e");
  setPaint("highway_motorway_casing", "line-opacity", 0.58);
  setPaint("highway_motorway_casing", "line-width", ["interpolate", ["linear"], ["zoom"], 8, 1.2, 10, 2.2, 12, 4]);
  setPaint("highway_motorway_inner", "line-color", "#efaa79");
  setPaint("highway_motorway_inner", "line-opacity", 0.9);
  setPaint("highway_motorway_inner", "line-width", ["interpolate", ["linear"], ["zoom"], 8, 0.8, 10, 1.4, 12, 2.8]);
  setPaint("highway_major_casing", "line-color", "#d4a089");
  setPaint("highway_major_casing", "line-width", ["interpolate", ["linear"], ["zoom"], 9, 0.6, 10, 1, 12, 2.2]);
  setPaint("highway_major_inner", "line-color", "#fff7ed");
  setPaint("highway_major_inner", "line-width", ["interpolate", ["linear"], ["zoom"], 9, 0.4, 10, 0.7, 12, 1.4]);
  setPaint("highway_minor", "line-color", "#b9c2c2");
  setPaint("highway_minor", "line-opacity", 0.55);
  setPaint("highway_minor", "line-width", ["interpolate", ["linear"], ["zoom"], 10, 0.35, 11, 0.48, 12, 0.65]);
  if (layerIds.has("highway_motorway_casing")) atlasVectorMap.setLayoutProperty("highway_motorway_casing", "line-cap", "round");
  if (layerIds.has("highway_major_casing")) atlasVectorMap.setLayoutProperty("highway_major_casing", "line-cap", "round");
  setPaint("boundary_3", "line-color", "#315965");
  setPaint("boundary_3", "line-opacity", 0.22);
  setLayout("label_other", "visibility", "none");
  setLayout("label_village", "visibility", "none");
  if (layerIds.has("label_town")) {
    atlasVectorMap.setLayoutProperty("label_town", "text-size", ["interpolate", ["linear"], ["zoom"], 8, 11, 11, 14, 13, 16]);
  }

  const firstSymbol = (atlasVectorMap.getStyle().layers || []).find((layer) => layer.type === "symbol")?.id;
  atlasVectorMap.addLayer({
    id: "atlas-regional-boundaries",
    type: "line",
    source: "openmaptiles",
    "source-layer": "boundary",
    filter: ["all", ["==", ["get", "admin_level"], 4], ["!=", ["get", "maritime"], 1]],
    paint: {
      "line-color": "#103f4a",
      "line-opacity": 0.92,
      "line-width": ["interpolate", ["linear"], ["zoom"], 7, 1.5, 11, 3.2, 13, 4.2],
      "line-dasharray": [4, 2],
    },
  }, firstSymbol);

}

function syncVectorAtlasBase(animate = false) {
  if (!atlasVectorReady || !atlasVectorMap || !state.place) return;
  atlasVectorMap.resize();
  const camera = { center: [Number(state.place.longitude), Number(state.place.latitude)], zoom: state.atlasZoom };
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    atlasVectorMap.easeTo({ ...camera, duration: 560, easing: (value) => 1 - ((1 - value) ** 3) });
  }
  else atlasVectorMap.jumpTo(camera);
}

function wireAtlasControls() {
  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.addEventListener("click", () => setChartMode(button.dataset.chartMode));
  });

  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-layer]").forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      button.closest("[data-weather-map]").dataset.activeLayer = button.dataset.layer;
      renderMapHour();
    });
  });

  document.querySelectorAll("[data-map-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.mapAction;
      const nextZoom = action === "center" ? 10 : Math.max(9, Math.min(12, state.atlasZoom + (action === "zoom-in" ? 1 : -1)));
      if (nextZoom === state.atlasZoom && action !== "center") return;
      state.atlasZoom = nextZoom;
      els.mapViewport.classList.add("is-zooming");
      renderMapHour({ animateMap: true });
      window.clearTimeout(atlasZoomTimer);
      atlasZoomTimer = window.setTimeout(() => els.mapViewport.classList.remove("is-zooming"), 580);
    });
  });

  els.mapTimeRange.addEventListener("input", () => {
    state.mapHourStep = Number(els.mapTimeRange.value);
    renderMapHour();
  });

  els.mapPlay.addEventListener("click", toggleMapPlayback);
}

async function boot() {
  const staticPlace = readStaticPlace();
  if (staticPlace?.latitude && staticPlace?.longitude) {
    await loadWeather(normalizePlace(staticPlace), { remember: false });
    return;
  }

  const storedPlace = readJson(PLACE_KEY, null);
  if (storedPlace?.latitude && storedPlace?.longitude) {
    let place = normalizePlace(storedPlace);

    if (place.source === "gps" && isGenericGpsName(place.name)) {
      place = await reverseGeocodePosition(place.latitude, place.longitude).catch(() => place);
    }

    await loadWeather(place, { remember: false });
    return;
  }

  await searchAndLoad("Milano", { trackSearch: false });
}

function readStaticPlace() {
  const placeEl = document.querySelector("#pagePlace");
  if (!placeEl?.textContent) return null;

  try {
    return JSON.parse(placeEl.textContent);
  } catch {
    return null;
  }
}

async function searchAndLoad(query, options = {}) {
  const { trackSearch = true } = options;

  try {
    setLoading(true);
    setStatus(`Cerco "${query}"...`);
    const places = await searchPlaces(query, 1);

    if (!places.length) {
      if (trackSearch) {
        trackEvent("city_search_submitted", {
          query_length: query.length,
          result_count: 0,
          result: "empty",
        });
      }
      setStatus("Città non trovata. Prova con un nome più preciso.", "error");
      return;
    }

    if (trackSearch) {
      trackEvent("city_search_submitted", {
        query_length: query.length,
        result_count: places.length,
        result: "success",
      });
    }

    els.citySearch.value = "";
    await openPlace(places[0]);
  } catch (error) {
    if (trackSearch) {
      trackEvent("city_search_submitted", {
        query_length: query.length,
        result_count: 0,
        result: "error",
      });
      trackEvent("weather_api_error", {
        api: "geocoding",
        context: "city_search",
        has_cached_weather: Boolean(state.weather),
      });
    }
    setStatus(humanError(error), "error");
  } finally {
    setLoading(false);
  }
}

async function renderSuggestions() {
  const query = els.citySearch.value.trim();
  const run = ++suggestionRun;

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  activeSuggestionIndex = -1;
  suggestionPlaces = [];
  showSuggestionMessage("Cerco...", "Controllo le località più pertinenti.");

  try {
    const places = await searchPlaces(query, 5);
    if (run !== suggestionRun) return;

    if (!places.length) {
      showSuggestionMessage("Nessun risultato", "Controlla il nome della città.");
      return;
    }

    suggestionPlaces = places;
    els.suggestions.innerHTML = places
      .map((place, index) => {
        const id = suggestionId(index);
        return `
          <button class="suggestion-button" id="${id}" type="button" role="option" aria-selected="false" data-index="${index}">
            <strong>${escapeHtml(place.name)}</strong>
            <span>${escapeHtml(placeSubtitle(place))}</span>
          </button>
        `;
      })
      .join("");

    els.suggestions.querySelectorAll("[data-index]").forEach((button) => {
      button.addEventListener("mouseenter", () => {
        setActiveSuggestion(Number(button.dataset.index));
      });
      button.addEventListener("focus", () => {
        setActiveSuggestion(Number(button.dataset.index));
      });
      button.addEventListener("click", () => {
        selectSuggestion(Number(button.dataset.index));
      });
    });

    setSuggestionsExpanded(true);
  } catch {
    if (run === suggestionRun) {
      showSuggestionMessage("Suggerimenti non disponibili", "Premi Cerca per riprovare.");
    }
  }
}

function handleSearchKeydown(event) {
  if (event.key === "Escape") {
    hideSuggestions();
    return;
  }

  if (els.suggestions.hidden || !suggestionPlaces.length) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveSuggestion((activeSuggestionIndex + 1) % suggestionPlaces.length);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveSuggestion((activeSuggestionIndex - 1 + suggestionPlaces.length) % suggestionPlaces.length);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    selectSuggestion(activeSuggestionIndex >= 0 ? activeSuggestionIndex : 0);
  }
}

function selectSuggestion(index) {
  const place = suggestionPlaces[index];
  if (!place) return;

  hideSuggestions();
  els.citySearch.value = "";
  trackEvent("city_suggestion_selected", {
    ...placeAnalyticsPayload(place),
    rank: index + 1,
  });
  void openPlace(place);
}

function setActiveSuggestion(index) {
  activeSuggestionIndex = index;

  els.suggestions.querySelectorAll("[data-index]").forEach((button) => {
    const selected = Number(button.dataset.index) === index;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });

  els.citySearch.setAttribute("aria-activedescendant", index >= 0 ? suggestionId(index) : "");
}

function showSuggestionMessage(title, subtitle) {
  suggestionPlaces = [];
  activeSuggestionIndex = -1;
  els.suggestions.innerHTML = `
    <div class="suggestion-button suggestion-message" role="option" aria-disabled="true">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(subtitle)}</span>
    </div>
  `;
  setSuggestionsExpanded(true);
}

function setSuggestionsExpanded(isExpanded) {
  els.suggestions.hidden = !isExpanded;
  els.citySearch.setAttribute("aria-expanded", String(isExpanded));

  if (!isExpanded) {
    els.citySearch.setAttribute("aria-activedescendant", "");
  }
}

function suggestionId(index) {
  return `suggestion-${index}`;
}

async function searchPlaces(query, count) {
  const resultCount = Math.max(SEARCH_RESULT_POOL, count);
  const params = new URLSearchParams({
    name: query,
    count: String(resultCount),
    language: "it",
    format: "json",
  });

  const data = await fetchJson(`${GEO_API}?${params.toString()}`, {
    cacheKey: `search:${normalizeSearchText(query)}`,
    ttl: CACHE_TTL.search,
    staleIfError: true,
  });
  const places = (data.results || []).map((place, index) => {
    return normalizePlace({ ...place, original_index: index });
  });

  return rankPlaces(query, places).slice(0, count);
}

async function openPlace(place, options = {}) {
  const { remember = true } = options;
  const staticCity = await findStaticCity(place);

  if (staticCity) {
    const pathname = `/${staticCity.region_slug}/${staticCity.slug}/`;
    if (window.location.pathname !== pathname) {
      const normalizedPlace = normalizePlace({ ...staticCity, source: place.source || "search" });
      if (remember) rememberPlace(normalizedPlace);
      localStorage.setItem(PLACE_KEY, JSON.stringify(normalizedPlace));
      window.location.assign(pathname);
      return;
    }
  }

  if (!staticCity && readStaticPlace()) {
    const normalizedPlace = normalizePlace(place);
    if (remember) rememberPlace(normalizedPlace);
    localStorage.setItem(PLACE_KEY, JSON.stringify(normalizedPlace));
    window.location.assign("/");
    return;
  }

  await loadWeather(place, options);
}

async function findStaticCity(place) {
  const normalizedPlace = normalizePlace(place);
  if (normalizeSearchText(normalizedPlace.country_code) !== "it") return null;

  const cities = await loadStaticCities();
  const name = normalizeSearchText(normalizedPlace.name);
  const region = normalizeSearchText(normalizedPlace.admin1);

  return cities.find((city) => {
    if (normalizeSearchText(city.name) !== name) return false;
    return !region || normalizeSearchText(city.admin1) === region;
  }) || null;
}

function loadStaticCities() {
  if (!staticCitiesPromise) {
    staticCitiesPromise = fetch("/data/cities.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`City index ${response.status}`);
        return response.json();
      })
      .then((cities) => Array.isArray(cities) ? cities : [])
      .catch(() => []);
  }

  return staticCitiesPromise;
}

async function loadWeather(place, options = {}) {
  const { remember = true } = options;
  const requestRun = ++weatherRequestRun;
  weatherAbortController?.abort();
  const requestController = new AbortController();
  weatherAbortController = requestController;
  const normalizedPlace = normalizePlace(place);
  const locationCacheKey = coordinateCacheKey(normalizedPlace);
  const weatherCacheKey = `weather:${locationCacheKey}`;
  const airCacheKey = `air:${locationCacheKey}`;

  try {
    setLoading(true);
    setStatus(`Aggiorno ${place.name}...`, "info", { autoHide: true });
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      timezone: "auto",
      forecast_days: "14",
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "precipitation_probability",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "pressure_msl",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "precipitation_sum",
        "wind_speed_10m_max",
      ].join(","),
    });

    const airParams = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      timezone: "auto",
      current: "european_aqi,pm2_5",
    });
    const [weather, airQuality] = await Promise.all([
      fetchJson(`${FORECAST_API}?${params.toString()}`, {
        cacheKey: weatherCacheKey,
        ttl: CACHE_TTL.weather,
        staleIfError: true,
        signal: requestController.signal,
      }),
      fetchJson(`${AIR_QUALITY_API}?${airParams.toString()}`, {
        cacheKey: airCacheKey,
        ttl: CACHE_TTL.airQuality,
        staleIfError: true,
        signal: requestController.signal,
      }).catch(() => null),
    ]);
    if (requestRun !== weatherRequestRun) return;
    state.place = normalizedPlace;
    state.weather = weather;
    state.airQuality = airQuality;
    state.dataStatus = apiResponseMeta.get(weatherCacheKey) || { source: "network", stale: false, storedAt: Date.now() };
    state.selectedDay = 0;
    state.selectedHourIndex = null;
    state.mapHourStep = 0;
    state.atlasZoom = 10;
    state.atlasGrid = null;

    if (remember) {
      rememberPlace(state.place);
    }

    localStorage.setItem(PLACE_KEY, JSON.stringify(state.place));
    renderAll();
    scheduleAtlasGrid(state.place);
    trackEvent("weather_city_viewed", {
      ...placeAnalyticsPayload(state.place),
      page_type: readStaticPlace() ? "city_static" : "app",
    });
    if (state.dataStatus.stale) {
      setStatus("Connessione instabile: sto mostrando gli ultimi dati salvati.", "info", { autoHide: false });
    } else {
      clearStatus();
    }
  } catch (error) {
    if (requestRun !== weatherRequestRun) return;
    console.error(error);
    trackEvent("weather_api_error", {
      api: "forecast",
      context: "load_weather",
      has_cached_weather: Boolean(state.weather),
    });
    setStatus(humanError(error, Boolean(state.weather)), "error");
  } finally {
    if (weatherAbortController === requestController) weatherAbortController = null;
    setLoading(false);
  }
}

function scheduleAtlasGrid(place) {
  const requestRun = ++atlasRequestRun;
  const dayDate = state.weather?.daily?.time?.[state.selectedDay];
  if (!dayDate) return;
  atlasAbortController?.abort();
  const requestController = new AbortController();
  atlasAbortController = requestController;
  state.atlasGrid = null;
  els.mapDataNote.textContent = "Carico la griglia meteo reale…";
  if (atlasIdleHandle) {
    if ("cancelIdleCallback" in window) window.cancelIdleCallback(atlasIdleHandle);
    else window.clearTimeout(atlasIdleHandle);
  }

  const load = () => {
    atlasIdleHandle = 0;
    void loadAtlasGrid(place, dayDate, requestRun, requestController);
  };
  atlasIdleHandle = "requestIdleCallback" in window
    ? window.requestIdleCallback(load, { timeout: 1200 })
    : window.setTimeout(load, 120);
}

async function loadAtlasGrid(place, dayDate, requestRun, requestController) {
  const points = atlasGridPoints(place);
  const params = new URLSearchParams({
    latitude: points.map((point) => point.latitude.toFixed(4)).join(","),
    longitude: points.map((point) => point.longitude.toFixed(4)).join(","),
    timezone: "auto",
    start_date: dayDate,
    end_date: dayDate,
    hourly: [
      "temperature_2m",
      "precipitation",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
  });

  try {
    const response = await fetchJson(`${FORECAST_API}?${params.toString()}`, {
      cacheKey: `atlas:${coordinateCacheKey(place, 2)}:${dayDate}`,
      ttl: CACHE_TTL.atlas,
      staleIfError: true,
      persistent: false,
      timeout: 18000,
      signal: requestController.signal,
    });
    if (requestRun !== atlasRequestRun) return;
    const datasets = Array.isArray(response) ? response : [response];
    state.atlasGrid = points
      .map((point, index) => ({ ...point, weather: datasets[index] }))
      .filter((point) => point.weather?.hourly);
    els.mapDataNote.textContent = `Previsione Open-Meteo · ${state.atlasGrid.length} punti · non radar`;
    renderMapHour();
  } catch (error) {
    if (requestRun !== atlasRequestRun) return;
    console.warn("Griglia Atlas non disponibile", error);
    state.atlasGrid = null;
    els.mapDataNote.textContent = "Open-Meteo · dato locale reale";
    renderMapHour();
  } finally {
    if (atlasAbortController === requestController) atlasAbortController = null;
  }
}

function atlasGridPoints(place) {
  const latitude = Number(place.latitude);
  const longitude = Number(place.longitude);
  const longitudeStep = Math.min(0.55, 0.13 / Math.max(0.35, Math.cos(latitude * Math.PI / 180)));
  const latitudeSteps = [0.48, 0.32, 0.16, 0, -0.16, -0.32, -0.48];
  const longitudeSteps = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  return latitudeSteps.flatMap((latOffset, row) => longitudeSteps.map((lonOffset, column) => ({
    latitude: Math.max(-89, Math.min(89, latitude + latOffset)),
    longitude: normalizeLongitude(longitude + lonOffset * longitudeStep),
    row,
    column,
  })));
}

function normalizeLongitude(value) {
  return ((value + 180) % 360 + 360) % 360 - 180;
}

function renderAll() {
  if (!state.weather || !state.place) return;

  renderCurrent();
  renderDaily();
  renderSelectedDay();
  renderMiniRain();
  renderMetrics();
  renderOverviewChart();
  renderMapTimeline();
  renderRecent();
}

function renderCurrent() {
  const current = state.weather.current;
  const info = weatherInfo(current.weather_code, current.is_day === 1);
  const timezone = state.weather.timezone || "auto";

  els.body.dataset.condition = info.theme;
  els.cityName.textContent = state.place.name;
  els.locationMeta.textContent = placeSubtitle(state.place);
  els.tempUnit.textContent = tempUnitLabel();
  els.updatedAt.textContent = `Aggiornato ${formatDateTime(current.time, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  els.footerUpdatedAt.textContent = `Ultimo aggiornamento ${formatDateTime(current.time, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  els.headerDataTime.textContent = formatDateTime(current.time, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  });
  renderDataFreshness();
  els.currentIcon.src = info.icon;
  els.currentIcon.alt = info.label;
  els.timezoneLabel.textContent = timezone.replace("_", " ");
}

function renderDataFreshness() {
  if (!els.dataFreshnessBadge) return;
  const offline = navigator.onLine === false;
  const cached = state.dataStatus?.source === "cache";
  const stale = state.dataStatus?.stale === true;

  els.dataFreshnessBadge.textContent = "LIVE";
  els.dataFreshnessBadge.title = stale
    ? "LIVE · ultimi dati salvati: aggiornamento non disponibile"
    : cached
      ? "LIVE · dati recenti caricati dalla cache locale"
      : offline
        ? "LIVE · connessione assente"
        : "LIVE · dati aggiornati dal servizio meteo";

  if (state.weather?.current?.time) {
    const suffix = stale ? " · ultimi dati salvati" : cached ? " · cache locale" : "";
    els.footerUpdatedAt.textContent = `Ultimo aggiornamento ${formatDateTime(
      state.weather.current.time,
      state.weather.timezone || "auto",
      { hour: "2-digit", minute: "2-digit" },
    )}${suffix}`;
  }
}

function renderMetrics() {
  const current = state.weather.current;
  const day = getDaily(state.selectedDay);
  const aqi = state.airQuality?.current?.european_aqi;
  const pm25 = state.airQuality?.current?.pm2_5;
  const humidity = current.relative_humidity_2m;
  const uv = day?.uv_index_max;
  const daylight = daylightDuration(day?.sunrise, day?.sunset);
  const metrics = [
    {
      kind: "air",
      label: "Qualità dell’aria",
      value: isNumber(aqi) ? airQualityLabel(aqi) : "Non disponibile",
      note: isNumber(pm25) ? `${Math.round(pm25)} µg/m³ · PM2.5` : "Dato CAMS non disponibile",
      progress: isNumber(aqi) ? Math.min(100, aqi) : 0,
      icon: "wind",
    },
    {
      kind: "humidity",
      label: "Umidità",
      value: isNumber(humidity) ? `${Math.round(humidity)}%` : "--",
      note: isNumber(humidity) ? humidityLabel(humidity) : "Dato non disponibile",
      progress: humidity || 0,
      icon: "drop",
    },
    {
      kind: "uv",
      label: "Indice UV",
      value: isNumber(uv) ? `${Math.round(uv)} / 11` : "--",
      note: uvLabel(uv),
      progress: isNumber(uv) ? Math.min(100, (uv / 11) * 100) : 0,
      icon: "sun",
    },
    {
      kind: "sun",
      label: "Luce del giorno",
      value: daylight.label,
      note: daylight.note,
      progress: daylight.progress,
      icon: "horizon",
    },
  ];

  els.metricsGrid.innerHTML = metrics.map(metricCard).join("");
}

function renderDaily() {
  const daily = state.weather.daily;
  const timezone = state.weather.timezone || "auto";
  const rainiest = Math.max(...daily.precipitation_probability_max.map((value) => value ?? 0));
  const hottest = Math.max(...daily.temperature_2m_max);

  els.forecastSummary.textContent = `Massima ${formatTemp(hottest)}${tempUnitLabel()} · pioggia fino al ${Math.round(rainiest)}%`;
  els.dailyList.innerHTML = daily.time
    .slice(0, 7)
    .map((date, index) => {
      const info = weatherInfo(daily.weather_code[index], true);
      const selected = index === state.selectedDay;
      const rainChance = Math.round(daily.precipitation_probability_max[index] ?? 0);
      const rainAmount = Number(daily.precipitation_sum?.[index]) || 0;
      const rainLabel = `${rainChance}% · ${rainAmount > 0 ? `${formatRain(rainAmount)} mm` : "asciutto"}`;
      const dayName = index === 0
        ? "Oggi"
        : formatDateTime(date, timezone, { weekday: "short" }).replace(".", "");
      const shortDate = formatDateTime(date, timezone, { day: "numeric", month: "short" }).replace(".", "");
      const maxTemp = daily.temperature_2m_max[index];
      const minTemp = daily.temperature_2m_min[index];

      return `
        <button class="day-card${selected ? " active" : ""}" type="button" role="tab" aria-selected="${selected}" aria-pressed="${selected}" data-day="${index}" aria-label="${escapeHtml(dayForecastLabel(dayName, info.label, maxTemp, minTemp, rainChance))}">
          <time datetime="${date}">${escapeHtml(dayName)} <span>${escapeHtml(shortDate)}</span></time>
          <img src="${info.icon}" alt="${info.label}" decoding="async">
          <div class="day-temps" aria-label="Temperature previste"><strong>${formatDegree(maxTemp)}</strong><small>${formatDegree(minTemp)}</small></div>
          <b class="rain-chance" aria-label="Probabilità pioggia ${rainChance}% e accumulo ${rainAmount} millimetri">${rainLabel}</b>
        </button>
      `;
    })
    .join("");

  els.dailyList.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedDay = Number(button.dataset.day);
      if (state.selectedDay === selectedDay) return;

      trackEvent("forecast_day_selected", { day_index: selectedDay });
      state.selectedDay = selectedDay;
      state.selectedHourIndex = null;
      state.mapHourStep = 0;
      renderDaily();
      renderSelectedDay();
      renderMiniRain();
      renderMetrics();
      renderOverviewChart(true);
      renderMapTimeline();
      scheduleAtlasGrid(state.place);
    });
  });
}

function renderSelectedDay() {
  const current = state.weather.current;
  const daily = getDaily(state.selectedDay);
  const timezone = state.weather.timezone || "auto";
  const isToday = state.selectedDay === 0;
  const code = isToday ? current.weather_code : daily.weather_code;
  const temperature = isToday ? current.temperature_2m : daily.temperature_2m_max;
  const info = weatherInfo(code, isToday ? current.is_day === 1 : true);
  const dateLabel = formatDateTime(daily.time, timezone, { day: "numeric", month: "long" });
  const weekday = formatDateTime(daily.time, timezone, { weekday: "long" });

  els.pageDate.textContent = dateLabel;
  els.heroKicker.textContent = `${isToday ? "Ora" : weekday} · ${state.place.name}`;
  els.conditionLabel.innerHTML = conditionHeadline(info.label);
  els.currentTemp.textContent = formatTemp(temperature);
  els.currentIcon.src = info.icon;
  els.currentIcon.alt = info.label;
  els.weatherAdvice.textContent = isToday ? weatherAdvice(current, daily) : dayAdvice(daily);
  renderTemperatureTrend(temperature);
}

function renderTemperatureTrend(temperature) {
  const next = state.selectedDay === 0
    ? nextHourlyTemperature()
    : getDaily(Math.min(state.selectedDay + 1, state.weather.daily.time.length - 1))?.temperature_2m_max;
  const difference = isNumber(next) ? next - temperature : 0;
  const direction = difference > 0.5 ? "up" : difference < -0.5 ? "down" : "steady";
  const symbols = { up: "↗", down: "↘", steady: "→" };
  const labels = { up: "in aumento", down: "in calo", steady: "stabile" };
  els.temperatureTrend.className = `temperature-trend ${direction}`;
  els.temperatureTrend.textContent = symbols[direction];
  els.temperatureTrend.setAttribute("aria-label", `Temperatura ${labels[direction]}`);
}

function renderMiniRain() {
  const entries = selectedHourlyEntries(6);
  const values = entries.map((item) => Number(state.weather.hourly.precipitation?.[item.index]) || 0);
  const peak = Math.max(...values, 0.2);
  els.miniRainTitle.textContent = state.selectedDay === 0 ? "Pioggia / prossime 6 ore" : "Pioggia / prime 6 ore";
  els.miniRainChart.innerHTML = values.map((value) => {
    const height = Math.max(3, (value / peak) * 100);
    return `<i style="--h:${height}%" title="${value.toFixed(1)} mm"></i>`;
  }).join("");
  const labelItems = [entries[0], entries[2], entries[4], entries[5]].filter(Boolean);
  els.miniRainTimes.innerHTML = labelItems.map((item) => {
    const time = formatDateTime(item.time, state.weather.timezone || "auto", { hour: "2-digit", minute: "2-digit" });
    return `<time datetime="${item.time}">${time}</time>`;
  }).join("");
}

function setChartMode(mode) {
  if (!state.weather || !["days", "hours"].includes(mode) || state.chartMode === mode) return;
  state.chartMode = mode;
  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    const selected = button.dataset.chartMode === mode;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  els.chartEyebrow.textContent = mode === "days" ? "TENDENZA · 14 GIORNI" : "DETTAGLIO · 12 ORE";
  els.overviewTitle.textContent = mode === "days" ? "Panoramica giorno per giorno" : "Panoramica ora per ora";
  els.chartLegend.innerHTML = mode === "days"
    ? '<span class="max">Massime</span><span class="min">Minime</span><span class="rain">Pioggia (mm)</span>'
    : '<span class="hourly">Temperatura</span><span class="rain">Pioggia (mm)</span>';
  renderOverviewChart(true);
}

function renderOverviewChart(animate = false) {
  if (!els.forecastChart || !state.weather) return;
  window.clearTimeout(overviewRenderTimer);
  const draw = () => {
    els.forecastChart.innerHTML = state.chartMode === "hours" ? hourlyOverviewMarkup() : dailyOverviewMarkup();
    els.forecastChart.classList.remove("is-leaving");
    els.forecastChart.classList.add("is-entering");
    window.setTimeout(() => els.forecastChart.classList.remove("is-entering"), 460);
  };
  if (!animate) {
    draw();
    return;
  }
  els.forecastChart.classList.add("is-leaving");
  overviewRenderTimer = window.setTimeout(draw, 180);
}

function dailyOverviewMarkup() {
  const daily = state.weather.daily;
  const count = Math.min(14, daily.time.length);
  const width = Math.max(1120, count * 86);
  const maxValues = daily.temperature_2m_max.slice(0, count);
  const minValues = daily.temperature_2m_min.slice(0, count);
  const rainValues = (daily.precipitation_sum || daily.precipitation_probability_max).slice(0, count).map(Number);
  const allTemps = [...maxValues, ...minValues];
  const y = chartYScale(allTemps, 105, 245);
  const maxPoints = maxValues.map((value, index) => chartPoint(index, count, width, y(value)));
  const minPoints = minValues.map((value, index) => chartPoint(index, count, width, y(value)));
  const icons = Array.from({ length: count }, (_, index) => weatherInfo(daily.weather_code[index], true).icon);
  const labels = daily.time.slice(0, count).map((date) => formatDateTime(date, state.weather.timezone || "auto", { day: "numeric", weekday: "short" }).replace(".", "").toUpperCase());
  return overviewMarkup({ count, width, icons, labels, maxValues, minValues, rainValues, maxPoints, minPoints, aria: "Temperature massime e minime e pioggia previste nei prossimi quattordici giorni" });
}

function hourlyOverviewMarkup() {
  const entries = selectedHourlyEntries(12);
  const hourly = state.weather.hourly;
  const count = entries.length;
  if (!count) return '<p class="chart-empty">Dati orari non disponibili.</p>';
  const width = Math.max(1120, count * 96);
  const values = entries.map((item) => hourly.temperature_2m[item.index]);
  const rainValues = entries.map((item) => Number(hourly.precipitation?.[item.index]) || 0);
  const y = chartYScale(values, 110, 242);
  const points = values.map((value, index) => chartPoint(index, count, width, y(value)));
  const icons = entries.map((item) => weatherInfo(hourly.weather_code[item.index], isHourDay(item.time)).icon);
  const labels = entries.map((item) => formatDateTime(item.time, state.weather.timezone || "auto", { hour: "2-digit", minute: "2-digit" }));
  return overviewMarkup({ count, width, icons, labels, hourlyValues: values, rainValues, hourlyPoints: points, aria: "Temperature e pioggia previste ora per ora nelle prossime dodici ore" });
}

function overviewMarkup(config) {
  const { count, width, icons, labels, rainValues, maxValues, minValues, hourlyValues, maxPoints, minPoints, hourlyPoints, aria } = config;
  const peakRain = Math.max(...rainValues, 1);
  const bars = rainValues.map((value, index) => {
    const x = chartX(index, count, width) - 23;
    const height = Math.max(value > 0 ? 3 : 1, (value / peakRain) * 58);
    return `<g class="chart-rain"><rect x="${x}" y="${326 - height}" width="46" height="${height}"/><text class="chart-text rain" x="${x + 23}" y="${292 - height}">${formatRain(value)}</text></g>`;
  }).join("");
  const line = (points, type, values) => points ? `<polyline class="chart-line-${type}" points="${points.map((point) => `${point.x},${point.y}`).join(" ")}"/>${points.map((point, index) => `<g class="chart-point-${type}"><circle cx="${point.x}" cy="${point.y}" r="6"/><text class="chart-text ${type === "min" ? "min" : ""}" x="${point.x}" y="${point.y - 17}">${formatDegree(values[index])}</text></g>`).join("")}` : "";
  const axes = labels.map((label, index) => `<text class="chart-text axis" x="${chartX(index, count, width)}" y="365">${escapeHtml(label)}</text>`).join("");
  return `<div class="forecast-chart__scroll"><div class="forecast-chart__canvas" style="--chart-count:${count};min-width:${width}px"><div class="forecast-chart__icons">${icons.map((icon, index) => `<img src="${icon}" alt="" loading="lazy" decoding="async" style="grid-column:${index + 1}">`).join("")}</div><svg viewBox="0 0 ${width} 390" preserveAspectRatio="none" role="img" aria-label="${aria}"><g class="chart-guides"><line x1="24" x2="${width - 24}" y1="125" y2="125"/><line x1="24" x2="${width - 24}" y1="205" y2="205"/><line x1="24" x2="${width - 24}" y1="326" y2="326"/></g>${line(maxPoints, "max", maxValues)}${line(minPoints, "min", minValues)}${line(hourlyPoints, "hourly", hourlyValues)}${bars}${axes}</svg></div></div>`;
}

function renderMapTimeline() {
  const entries = selectedHourlyEntries(12);
  if (!entries.length) return;
  state.mapHourStep = Math.min(state.mapHourStep, entries.length - 1);
  els.mapTimeRange.max = String(entries.length - 1);
  els.mapTimeRange.value = String(state.mapHourStep);
  els.mapStartTime.textContent = mapTime(entries[0]);
  els.mapEndTime.textContent = mapTime(entries[entries.length - 1]);
  const day = getDaily(state.selectedDay);
  els.mapDay.textContent = formatDateTime(day.time, state.weather.timezone || "auto", { weekday: "long", day: "numeric", month: "long" });
  renderMapHour();
}

function renderMapHour({ animateMap = false } = {}) {
  const entries = selectedHourlyEntries(12);
  const item = entries[state.mapHourStep] || entries[0];
  if (!item) return;
  const hourly = state.weather.hourly;
  const temperature = hourly.temperature_2m[item.index];
  els.mapTimeLabel.textContent = mapTime(item);
  els.mapTemp.textContent = `${state.place.name.toUpperCase()} · ${formatDegree(temperature)}`;
  renderAtlasBaseMap(animateMap);
  const field = atlasFieldAt(item);
  renderAtlasWeatherField(field);
  renderAtlasScale(field);
}

function renderAtlasBaseMap(animateMap = false) {
  const zoom = state.atlasZoom;
  syncVectorAtlasBase(animateMap);
  const center = mercatorPoint(state.place.latitude, state.place.longitude, zoom);
  const tileSize = 256;
  const worldTiles = 2 ** zoom;
  const minX = Math.floor((center.x - 500) / tileSize);
  const maxX = Math.floor((center.x + 500) / tileSize);
  const minY = Math.max(0, Math.floor((center.y - 370) / tileSize));
  const maxY = Math.min(worldTiles - 1, Math.floor((center.y + 390) / tileSize));
  const key = `${zoom}:${minX}:${maxX}:${minY}:${maxY}:${state.place.latitude}:${state.place.longitude}`;

  if (!atlasVectorReady && els.mapBaseLayer.dataset.key !== key) {
    const tiles = [];
    for (let tileY = minY; tileY <= maxY; tileY += 1) {
      for (let tileX = minX; tileX <= maxX; tileX += 1) {
        const wrappedX = ((tileX % worldTiles) + worldTiles) % worldTiles;
        const url = MAP_TILE_URL.replace("{z}", zoom).replace("{x}", wrappedX).replace("{y}", tileY);
        const x = tileX * tileSize - center.x + 500;
        const y = tileY * tileSize - center.y + 370;
        tiles.push(`<image href="${url}" x="${x}" y="${y}" width="257" height="257" preserveAspectRatio="none"/>`);
      }
    }
    els.mapBaseLayer.innerHTML = tiles.join("");
    els.mapBaseLayer.dataset.key = key;
  }

  renderMajorCityLabels();
  const visibleWidthKm = Math.round((156543.03392 * Math.cos(state.place.latitude * Math.PI / 180) / (2 ** zoom)) * 1000 / 1000);
  els.mapZoom.textContent = `Z${zoom} · ~${visibleWidthKm} km`;
  document.querySelector('[data-map-action="zoom-out"]').disabled = zoom <= 9;
  document.querySelector('[data-map-action="zoom-in"]').disabled = zoom >= 12;
}

function renderMajorCityLabels() {
  const placed = [];
  const labels = MAJOR_ITALIAN_CITIES
    .map(([name, latitude, longitude, population]) => ({ name, latitude, longitude, population, ...projectAtlasCoordinate(latitude, longitude) }))
    .filter((city) => city.x > 75 && city.x < 925 && city.y > 45 && city.y < 665)
    .filter((city) => Math.hypot(city.latitude - state.place.latitude, city.longitude - state.place.longitude) >= 0.065)
    .sort((a, b) => b.population - a.population)
    .filter((city) => {
      const overlaps = placed.some((item) => Math.abs(item.x - city.x) < 105 && Math.abs(item.y - city.y) < 38);
      if (!overlaps) placed.push(city);
      return !overlaps;
    })
    .map((city) => {
      const size = city.population >= 500000 ? "large" : city.population >= 100000 ? "medium" : "small";
      return `<g class="atlas-major-city atlas-major-city--${size}" transform="translate(${city.x.toFixed(1)} ${city.y.toFixed(1)})"><circle r="3"/><text y="-8">${escapeHtml(city.name)}</text></g>`;
    }).join("");
  els.mapCitiesLayer.innerHTML = labels;
}

function mercatorPoint(latitude, longitude, zoom) {
  const size = 256 * (2 ** zoom);
  const lat = Math.max(-85.05112878, Math.min(85.05112878, Number(latitude)));
  const x = ((normalizeLongitude(Number(longitude)) + 180) / 360) * size;
  const sin = Math.sin(lat * Math.PI / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size;
  return { x, y, size };
}

function projectAtlasCoordinate(latitude, longitude) {
  const center = mercatorPoint(state.place.latitude, state.place.longitude, state.atlasZoom);
  const point = mercatorPoint(latitude, longitude, state.atlasZoom);
  let deltaX = point.x - center.x;
  if (deltaX > center.size / 2) deltaX -= center.size;
  if (deltaX < -center.size / 2) deltaX += center.size;
  return { x: 500 + deltaX, y: 370 + point.y - center.y };
}

function atlasFieldAt(item) {
  if (state.atlasGrid?.length) {
    return state.atlasGrid.map((point) => {
      const hourly = point.weather.hourly;
      const index = hourly.time.indexOf(item.time);
      return atlasFieldPoint({ ...point, ...projectAtlasCoordinate(point.latitude, point.longitude) }, hourly, index >= 0 ? index : item.index);
    });
  }

  return [atlasFieldPoint({ ...state.place, x: 500, y: 370, row: 1, column: 2 }, state.weather.hourly, item.index)];
}

function atlasFieldPoint(point, hourly, index) {
  return {
    ...point,
    precipitation: finiteNumber(hourly.precipitation?.[index]),
    temperature: finiteNumber(hourly.temperature_2m?.[index]),
    pressure: finiteNumber(hourly.pressure_msl?.[index]),
    windSpeed: finiteNumber(hourly.wind_speed_10m?.[index]),
    windDirection: finiteNumber(hourly.wind_direction_10m?.[index]),
  };
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function renderAtlasWeatherField(field) {
  const pressures = field.map((point) => point.pressure).filter(Boolean);
  const pressureMin = pressures.length ? Math.min(...pressures) : 1000;
  const pressureMax = pressures.length ? Math.max(...pressures) : 1000;
  const pressureRange = pressureMax - pressureMin || 1;

  els.mapRainLayer.innerHTML = atlasRasterMarkup(field, "precipitation", rainBandColor);
  els.mapTempLayer.innerHTML = atlasRasterMarkup(field, "temperature", temperatureBandColor);
  els.mapFrontLayer.innerHTML = atlasRasterMarkup(field, "pressure", pressureBandColor);

  els.mapPressureContours.innerHTML = pressureContours(field, pressureMin, pressureRange);
  els.mapWindLayer.innerHTML = field.filter((point) => point.row % 2 === 0 && point.column % 2 === 0).map((point) => {
    const rotation = point.windDirection + 180;
    const scale = Math.min(1.45, 0.78 + point.windSpeed / 45);
    return `<g class="map-wind-arrow" transform="translate(${point.x} ${point.y}) rotate(${rotation}) scale(${scale.toFixed(2)})"><path d="M0 22V-22M0-22l-8 10M0-22l8 10"/><text x="12" y="5" transform="rotate(${-rotation})">${Math.round(point.windSpeed)}</text></g>`;
  }).join("");
  els.mapSamplesLayer.innerHTML = field.map((point) => {
    const label = `${point.temperature.toFixed(1)}°, pioggia ${point.precipitation.toFixed(1)} mm/h, vento ${Math.round(point.windSpeed)} km/h, pressione ${Math.round(point.pressure)} hPa`;
    return `<g class="atlas-sample" role="img" aria-label="${escapeHtml(label)}"><circle cx="${point.x}" cy="${point.y}" r="18"/></g>`;
  }).join("");
}

function atlasRasterMarkup(field, valueKey, colorForValue) {
  const gridRowCount = Math.max(...field.map((point) => point.row)) + 1;
  const gridColumnCount = Math.max(...field.map((point) => point.column)) + 1;
  if (gridRowCount < 2 || gridColumnCount < 2 || field.length < gridRowCount * gridColumnCount) return "";
  const columns = 180;
  const rows = 112;
  const grid = Array.from({ length: gridRowCount }, () => Array(gridColumnCount));
  field.forEach((point) => { grid[point.row][point.column] = point; });
  const xValues = field.map((point) => point.x);
  const yValues = field.map((point) => point.y);
  const xStep = (Math.max(...xValues) - Math.min(...xValues)) / (gridColumnCount - 1);
  const yStep = (Math.max(...yValues) - Math.min(...yValues)) / (gridRowCount - 1);
  const left = Math.min(...xValues) - xStep / 2;
  const top = Math.min(...yValues) - yStep / 2;
  const width = xStep * gridColumnCount;
  const height = yStep * gridRowCount;
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  const markup = [];

  for (let row = 0; row < rows; row += 1) {
    let runColor = null;
    let runStart = 0;
    for (let column = 0; column <= columns; column += 1) {
      let color = null;
      if (column < columns) {
        const gridX = ((column + 0.5) / columns) * (gridColumnCount - 1);
        const gridY = ((row + 0.5) / rows) * (gridRowCount - 1);
        color = colorForValue(bilinearGridValue(grid, gridX, gridY, valueKey));
      }
      if (color !== runColor) {
        if (runColor) {
          markup.push(`<rect class="atlas-field-band" x="${left + runStart * cellWidth}" y="${top + row * cellHeight}" width="${(column - runStart) * cellWidth + 0.6}" height="${cellHeight + 0.6}" fill="${runColor}"/>`);
        }
        runColor = color;
        runStart = column;
      }
    }
  }
  return markup.join("");
}

function bilinearGridValue(grid, gridX, gridY, valueKey) {
  const x0 = Math.min(grid[0].length - 2, Math.floor(gridX));
  const y0 = Math.min(grid.length - 2, Math.floor(gridY));
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const tx = Math.min(1, gridX - x0);
  const ty = Math.min(1, gridY - y0);
  const top = grid[y0][x0][valueKey] * (1 - tx) + grid[y0][x1][valueKey] * tx;
  const bottom = grid[y1][x0][valueKey] * (1 - tx) + grid[y1][x1][valueKey] * tx;
  return top * (1 - ty) + bottom * ty;
}

function rainBandColor(value) {
  if (value < 0.2) return null;
  if (value < 0.5) return "#2acbff";
  if (value < 1) return "#11aeea";
  if (value < 2) return "#087fc2";
  if (value < 4) return "#086b78";
  if (value < 8) return "#008e54";
  if (value < 16) return "#00c944";
  return "#6beb1b";
}

function temperatureBandColor(value) {
  if (value < 0) return "#315fa8";
  if (value < 5) return "#387fc1";
  if (value < 10) return "#32a7ca";
  if (value < 15) return "#4bbf9b";
  if (value < 20) return "#93c968";
  if (value < 25) return "#e6c84d";
  if (value < 30) return "#ed9144";
  if (value < 35) return "#e65b4d";
  return "#b93c6b";
}

function pressureBandColor(value) {
  if (value < 985) return "#5a3a99";
  if (value < 995) return "#5b52b2";
  if (value < 1005) return "#466fb5";
  if (value < 1010) return "#3f9db8";
  if (value < 1020) return null;
  if (value < 1030) return "#9cbd70";
  return "#d0b65e";
}

function pressureContours(field, pressureMin, pressureRange) {
  if (field.length < 5) return "";
  const rowCount = Math.max(...field.map((point) => point.row)) + 1;
  const contourRows = Array.from({ length: rowCount }, (_, row) => row).filter((row) => row % 3 === 0 || row === rowCount - 1);
  return contourRows.map((row) => {
    const points = field.filter((point) => point.row === row).sort((a, b) => a.column - b.column);
    const line = points.map((point) => {
      const midpoint = pressureMin + pressureRange / 2;
      const offset = ((point.pressure - midpoint) / Math.max(12, pressureRange)) * 72;
      return `${point.x},${point.y + offset}`;
    }).join(" ");
    const average = points.reduce((sum, point) => sum + point.pressure, 0) / points.length;
    const last = points.at(-1);
    return `<polyline points="${line}"/><text x="${last.x - 36}" y="${last.y - 22}">${Math.round(average)} hPa</text>`;
  }).join("");
}

function renderAtlasScale(field) {
  const layer = document.querySelector("[data-weather-map]").dataset.activeLayer;
  if (layer === "temp") {
    els.mapLayerTitle.textContent = "TEMPERATURA";
    els.mapScaleMin.textContent = "−10°";
    els.mapScaleMax.textContent = "40°";
    els.mapScaleBar.style.background = "linear-gradient(90deg,#4d9bd5,#70c8cc,#f1b853,#e45067)";
    return;
  }
  if (layer === "front") {
    els.mapLayerTitle.textContent = "PRESSIONE + VENTO";
    els.mapScaleMin.textContent = "980";
    els.mapScaleMax.textContent = "1040 hPa";
    els.mapScaleBar.style.background = "linear-gradient(90deg,#5b52b2,#3f9db8,#9cbd70,#d0b65e)";
    return;
  }
  els.mapLayerTitle.textContent = "PIOGGIA PREVISTA · mm/h";
  els.mapScaleMin.textContent = "0,2";
  els.mapScaleMax.textContent = "16+";
  els.mapScaleBar.style.background = "linear-gradient(90deg,#2acbff 0 14.2%,#11aeea 14.2% 28.4%,#087fc2 28.4% 42.6%,#086b78 42.6% 56.8%,#008e54 56.8% 71%,#00c944 71% 85.2%,#6beb1b 85.2% 100%)";
}

function toggleMapPlayback() {
  if (mapPlayTimer) {
    window.clearInterval(mapPlayTimer);
    mapPlayTimer = 0;
    els.mapPlay.textContent = "▶";
    els.mapPlay.setAttribute("aria-label", "Avvia animazione");
    return;
  }
  els.mapPlay.textContent = "Ⅱ";
  els.mapPlay.setAttribute("aria-label", "Metti in pausa");
  mapPlayTimer = window.setInterval(() => {
    const max = Number(els.mapTimeRange.max) || 0;
    state.mapHourStep = state.mapHourStep >= max ? 0 : state.mapHourStep + 1;
    els.mapTimeRange.value = String(state.mapHourStep);
    renderMapHour();
  }, 850);
}

function selectedHourlyEntries(limit = 12) {
  const hourly = state.weather.hourly;
  const date = state.weather.daily.time[state.selectedDay];
  const currentTime = weatherDate(state.weather.current.time).getTime();
  return hourlyWindow(hourly, date, state.selectedDay, currentTime).slice(0, limit);
}

function nextHourlyTemperature() {
  const entries = selectedHourlyEntries(2);
  return entries[1] ? state.weather.hourly.temperature_2m[entries[1].index] : null;
}

function mapTime(item) {
  return formatDateTime(item.time, state.weather.timezone || "auto", { hour: "2-digit", minute: "2-digit" });
}

function chartX(index, count, width) {
  return count <= 1 ? width / 2 : ((index + 0.5) * width) / count;
}

function chartPoint(index, count, width, y) {
  return { x: chartX(index, count, width).toFixed(1), y: y.toFixed(1) };
}

function chartYScale(values, top, bottom) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (value) => bottom - ((value - min) / range) * (bottom - top);
}

function formatRain(value) {
  const amount = Number(value) || 0;
  return amount >= 10 ? Math.round(amount) : amount.toFixed(amount > 0 && amount < 1 ? 1 : 0);
}

function conditionHeadline(label) {
  const headlines = {
    Sereno: "Tutto sereno.<em>Quello vero.</em>",
    "Poco nuvoloso": "Nuvole leggere.<em>Si respira.</em>",
    Coperto: "Cielo coperto.<em>Ma gestibile.</em>",
    Nebbia: "Poca vista.<em>Vai piano.</em>",
    Pioviggine: "Piove piano.<em>Ma piove.</em>",
    Pioggia: "Piove ancora,<em>ma poco.</em>",
    Neve: "Arriva la neve.<em>Passo leggero.</em>",
    Temporale: "Cielo acceso.<em>Meglio dentro.</em>",
  };
  return headlines[label] || `${escapeHtml(label)}.<em>Occhio al cielo.</em>`;
}

function dayAdvice(day) {
  const rain = day?.precipitation_probability_max || 0;
  if (rain >= 65) return "Ombrello consigliato: meglio averlo che rincorrerlo.";
  if (day?.temperature_2m_max >= 29) return "Acqua e ombra nelle ore centrali.";
  if (day?.wind_speed_10m_max >= 35) return "Giornata ventilata: tieni saldo il cappello.";
  return "Giornata tranquilla: vestiti a strati e vai.";
}

function airQualityLabel(value) {
  if (!isNumber(value)) return "Non disponibile";
  if (value <= 20) return "Buona";
  if (value <= 40) return "Discreta";
  if (value <= 60) return "Moderata";
  if (value <= 80) return "Scarsa";
  if (value <= 100) return "Molto scarsa";
  return "Estremamente scarsa";
}

function uvLabel(value) {
  if (!isNumber(value)) return "Dato non disponibile";
  if (value < 3) return "Basso · protezione minima";
  if (value < 6) return "Moderato · usa protezione";
  if (value < 8) return "Alto · cerca ombra";
  return "Molto alto · limita l’esposizione";
}

function daylightDuration(sunrise, sunset) {
  if (!sunrise || !sunset) return { label: "--", note: "Dato non disponibile", progress: 0 };
  const start = weatherDate(sunrise);
  const end = weatherDate(sunset);
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return {
    label: `${formatDateTime(sunrise, state.weather.timezone || "auto", { hour: "2-digit", minute: "2-digit" })} → ${formatDateTime(sunset, state.weather.timezone || "auto", { hour: "2-digit", minute: "2-digit" })}`,
    note: `${hours} h ${rest} min di luce`,
    progress: Math.min(100, (minutes / 960) * 100),
  };
}

function metricCard(metric) {
  return `<article class="metric-card ${metric.kind}" style="--value:${Math.max(0, Math.min(100, metric.progress))}%"><div class="metric-card__ring"><span class="metric-card__icon">${metricIcon(metric.icon)}</span></div><div><small>${metric.label}</small><strong>${metric.value}</strong><em>${metric.note}</em></div></article>`;
}

function metricIcon(name) {
  const icons = {
    wind: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 11h15c5 0 5-7 1-7-3 0-4 2-4 4M4 16h21c5 0 5 7 1 7-3 0-4-2-4-4M4 22h12"/></svg>',
    drop: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3S7 13 7 20a9 9 0 0 0 18 0c0-7-9-17-9-17Z"/><path d="M12 21c1 3 4 4 7 2"/></svg>',
    sun: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6"/><path d="M16 2v5m0 18v5M2 16h5m18 0h5M6 6l4 4m12 12 4 4M26 6l-4 4M10 22l-4 4"/></svg>',
    horizon: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 24h24M8 20a8 8 0 0 1 16 0M16 4v5M6 11l4 3m16-3-4 3"/></svg>',
  };
  return icons[name] || icons.sun;
}

function renderHourlyWithLoading() {
  clearHourlyRenderTimer();
  renderHourlySkeleton();
  hourlyRenderTimer = window.setTimeout(() => {
    hourlyRenderTimer = 0;
    renderHourly();
  }, HOURLY_LOADING_DELAY);
}

function clearHourlyRenderTimer() {
  if (!hourlyRenderTimer) return;

  window.clearTimeout(hourlyRenderTimer);
  hourlyRenderTimer = 0;
}

function renderHourlySkeleton() {
  const daily = state.weather.daily;
  const timezone = state.weather.timezone || "auto";
  const date = daily.time[state.selectedDay];
  const title = state.selectedDay === 0
    ? "Prossime 24 ore"
    : formatDateTime(date, timezone, { weekday: "long", day: "numeric", month: "short" });
  const topRain = daily.precipitation_probability_max[state.selectedDay] ?? 0;

  els.timelineTitle.textContent = title;
  els.timelineSummary.textContent = `Giornata completa · ${rainSummary(topRain)}`;
  els.hourlyStrip.innerHTML = `
    <div class="hourly-skeleton" role="status" aria-live="polite">
      <span class="sr-only">Aggiorno le previsioni ora per ora</span>
      <div class="hourly-skeleton-chart" aria-hidden="true">
        <span class="hourly-skeleton-line"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 8%; --dot-y: 42%;"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 24%; --dot-y: 48%;"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 40%; --dot-y: 52%;"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 56%; --dot-y: 50%;"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 72%; --dot-y: 44%;"></span>
        <span class="hourly-skeleton-dot" style="--dot-x: 88%; --dot-y: 38%;"></span>
      </div>
      <div class="hourly-skeleton-detail" aria-hidden="true">
        <span class="hourly-loading-spinner"></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
}

function renderHourly() {
  clearHourlyRenderTimer();

  const hourly = state.weather.hourly;
  const daily = state.weather.daily;
  const timezone = state.weather.timezone || "auto";
  const date = daily.time[state.selectedDay];
  const currentTime = weatherDate(state.weather.current.time).getTime();
  const selectedHours = hourlyWindow(hourly, date, state.selectedDay, currentTime);

  const title = state.selectedDay === 0
    ? "Prossime 24 ore"
    : formatDateTime(date, timezone, { weekday: "long", day: "numeric", month: "short" });
  const topRain = daily.precipitation_probability_max[state.selectedDay] ?? 0;

  els.timelineTitle.textContent = title;
  els.timelineSummary.textContent = selectedHours.length
    ? `Giornata completa · ${rainSummary(topRain)}`
    : "Ore non disponibili";

  if (!selectedHours.length) {
    els.hourlyStrip.innerHTML = `
      <div class="hourly-empty">
        <strong>Ore non disponibili</strong>
        <span>Per questo giorno Open-Meteo non ha restituito fasce orarie utili.</span>
      </div>
    `;
    return;
  }

  const hasSelectedHour = selectedHours.some((item) => item.index === state.selectedHourIndex);
  if (!hasSelectedHour) {
    state.selectedHourIndex = selectedHours[0].index;
  }

  const selectedItem = selectedHours.find((item) => item.index === state.selectedHourIndex) || selectedHours[0];
  const panelWidth = selectedHours.length * HOUR_COLUMN_WIDTH;
  const chart = hourlyChart(selectedHours, hourly, panelWidth);
  const detail = hourDetail(selectedItem, hourly, timezone, state.selectedDay === 0 && selectedItem.index === selectedHours[0].index);

  els.hourlyStrip.innerHTML = `
    <div class="hourly-panel" style="--hour-count: ${selectedHours.length}; --hour-width: ${panelWidth}px;">
      <button class="hourly-nav hourly-nav-prev" type="button" data-hour-scroll="-1" aria-label="Ore precedenti" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15.7 5.3a1 1 0 0 1 0 1.4L10.42 12l5.3 5.3a1 1 0 1 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z"></path>
        </svg>
      </button>
      <div class="hourly-scroll" data-hourly-scroll tabindex="0" role="region" aria-label="Scorri le ore">
        <div class="hourly-track">
          <div class="hourly-chart" role="group" aria-label="Andamento temperatura ora per ora">
            <svg class="temperature-chart" viewBox="0 0 ${panelWidth} ${HOURLY_CHART_HEIGHT}" preserveAspectRatio="xMinYMin meet" focusable="false" aria-hidden="true">
              <polyline class="temperature-line" points="${chart.points}"></polyline>
            </svg>
            ${selectedHours
              .map((item) => {
                const isDay = isHourDay(item.time);
                const info = weatherInfo(hourly.weather_code[item.index], isDay);
                const wind = Math.round(hourly.wind_speed_10m[item.index] ?? 0);
                const rainChance = Math.round(hourly.precipitation_probability[item.index] ?? 0);
                const isCurrent = state.selectedDay === 0 && item.index === selectedHours[0].index;
                const isSelected = item.index === state.selectedHourIndex;
                const point = chart.coords.find((coord) => coord.index === item.index);

                return `
                  <button class="hour-point${isCurrent ? " is-current" : ""}" type="button" data-hour-index="${item.index}" aria-pressed="${isSelected}" aria-label="${escapeHtml(hourForecastLabel(item.time, timezone, info.label, hourly.temperature_2m[item.index], rainChance, wind, isCurrent))}" style="--point-y: ${toChartNumber(point.y)}px;">
                    <span class="hour-temp-label">${formatDegree(hourly.temperature_2m[item.index])}</span>
                    <span class="hour-dot" aria-hidden="true"></span>
                    <img class="hour-icon" src="${info.icon}" alt="${info.label}" loading="lazy" decoding="async">
                    <time class="hour-time" datetime="${item.time}">${isCurrent ? "Adesso" : formatDateTime(item.time, timezone, { hour: "2-digit", minute: "2-digit" })}</time>
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      </div>
      <button class="hourly-nav hourly-nav-next" type="button" data-hour-scroll="1" aria-label="Ore successive" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.3 18.7a1 1 0 0 1 0-1.4l5.28-5.3-5.3-5.3a1 1 0 0 1 1.42-1.4l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.42 0Z"></path>
        </svg>
      </button>
      <div class="hourly-detail" aria-live="polite">
        <div class="hourly-detail-main">
          <time datetime="${selectedItem.time}">${escapeHtml(detail.time)}</time>
          <strong>${escapeHtml(detail.temperature)}</strong>
          <span>${escapeHtml(detail.condition)}</span>
        </div>
        <div class="hourly-detail-meta">${escapeHtml(detail.meta)}</div>
      </div>
    </div>
  `;

  const scrollEl = els.hourlyStrip.querySelector("[data-hourly-scroll]");
  const navButtons = els.hourlyStrip.querySelectorAll("[data-hour-scroll]");
  updateHourlyScrollState(scrollEl);

  scrollEl.addEventListener("scroll", () => {
    updateHourlyScrollState(scrollEl);
  });

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      scrollEl.scrollLeft += Number(button.dataset.hourScroll) * HOUR_COLUMN_WIDTH * 4;
      window.setTimeout(() => updateHourlyScrollState(scrollEl), 120);
    });
  });

  els.hourlyStrip.querySelectorAll("[data-hour-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const scrollLeft = scrollEl.scrollLeft;
      state.selectedHourIndex = Number(button.dataset.hourIndex);
      renderHourly();
      const nextScrollEl = els.hourlyStrip.querySelector("[data-hourly-scroll]");
      nextScrollEl.scrollLeft = scrollLeft;
      updateHourlyScrollState(nextScrollEl);
    });
  });
}

function updateHourlyScrollState(scrollEl) {
  if (!scrollEl) return;

  const panel = scrollEl.closest(".hourly-panel");
  const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
  const canScrollLeft = scrollEl.scrollLeft > 2;
  const canScrollRight = scrollEl.scrollLeft < maxScroll - 2;

  panel.classList.toggle("can-scroll-left", canScrollLeft);
  panel.classList.toggle("can-scroll-right", canScrollRight);
  panel.querySelector(".hourly-nav-prev").hidden = !canScrollLeft;
  panel.querySelector(".hourly-nav-next").hidden = !canScrollRight;
}

function compactRainLabel(value) {
  const chance = Math.round(value ?? 0);

  if (chance <= 0) {
    return { text: "—", muted: true };
  }

  return {
    text: `${chance}%`,
    muted: chance < 10,
  };
}

function rainSummary(value) {
  const chance = Math.round(value ?? 0);

  if (chance <= 0) return "Pioggia assente";
  return `Picco pioggia ${chance}%`;
}

function dayForecastLabel(dayName, condition, maxTemp, minTemp, rainChance) {
  return `${dayName}: ${condition}, massima ${formatTemp(maxTemp)}${tempUnitLabel()}, minima ${formatTemp(minTemp)}${tempUnitLabel()}, pioggia ${rainChance}%`;
}

function hourForecastLabel(time, timezone, condition, temperature, rainChance, wind, isCurrent = false) {
  const hour = isCurrent ? "Adesso" : formatDateTime(time, timezone, { hour: "2-digit", minute: "2-digit" });
  return `${hour}: ${condition}, ${formatTemp(temperature)}${tempUnitLabel()}, pioggia ${rainChance}%, vento ${wind} km/h`;
}

function hourDetail(item, hourly, timezone, isCurrent = false) {
  const isDay = isHourDay(item.time);
  const info = weatherInfo(hourly.weather_code[item.index], isDay);
  const time = isCurrent ? "Adesso" : formatDateTime(item.time, timezone, { hour: "2-digit", minute: "2-digit" });
  const temperature = `${formatTemp(hourly.temperature_2m[item.index])}${tempUnitLabel()}`;
  const rainChance = Math.round(hourly.precipitation_probability[item.index] ?? 0);
  const rain = rainChance <= 0 ? "Pioggia assente" : `Pioggia ${rainChance}%`;
  const wind = Math.round(hourly.wind_speed_10m[item.index] ?? 0);
  const humidityValue = hourly.relative_humidity_2m[item.index];
  const humidity = isNumber(humidityValue) ? `${Math.round(humidityValue)}%` : "--";

  return {
    condition: info.label,
    meta: `${rain} · Vento ${wind} km/h · Umidità ${humidity}`,
    temperature,
    time,
  };
}

function hourlyChart(selectedHours, hourly, panelWidth) {
  const temps = selectedHours.map((item) => Number(hourly.temperature_2m[item.index]) || 0);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const padding = Math.max(1, (maxTemp - minTemp) * 0.12);
  const chartMin = minTemp - padding;
  const chartMax = maxTemp + padding;
  const range = chartMax - chartMin || 1;
  const top = 34;
  const bottom = 96;
  const coords = temps.map((temp, index) => {
    const x = HOUR_COLUMN_WIDTH / 2 + HOUR_COLUMN_WIDTH * index;
    const y = bottom - ((temp - chartMin) / range) * (bottom - top);

    return { index: selectedHours[index].index, x, y };
  });
  const points = coords.map((point) => `${toChartNumber(point.x)},${toChartNumber(point.y)}`).join(" ");

  return {
    coords,
    height: HOURLY_CHART_HEIGHT,
    maxTemp,
    minTemp,
    panelWidth,
    points,
  };
}

function toChartNumber(value) {
  return Number(value).toFixed(1);
}

function hourlyWindow(hourly, date, selectedDay, currentTime) {
  const entries = hourly.time.map((time, index) => ({ time, index }));

  if (selectedDay === 0) {
    return entries
      .filter((item) => weatherDate(item.time).getTime() >= currentTime)
      .slice(0, HOURLY_WINDOW_SIZE);
  }

  const dayEntries = entries.filter((item) => item.time.startsWith(date));
  return dayEntries.slice(0, HOURLY_WINDOW_SIZE);
}

function renderRecent() {
  const recent = state.recent.filter((place) => {
    return !state.place || placeKey(place) !== placeKey(state.place);
  });

  if (!recent.length) {
    els.recentSection.hidden = true;
    els.recentCities.innerHTML = "";
    return;
  }

  els.recentSection.hidden = false;
  els.recentCities.innerHTML = recent
    .slice(0, 6)
    .map((place, index) => {
      const label = `${place.name}, ${placeSubtitle(place)}`;
      return `<button class="recent-button" type="button" data-recent="${index}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">${escapeHtml(place.name)}</button>`;
    })
    .join("");

  els.recentCities.querySelectorAll("[data-recent]").forEach((button) => {
    button.addEventListener("click", () => {
      void openPlace(recent[Number(button.dataset.recent)], { remember: true });
    });
  });
}

function useCurrentPosition() {
  if (!navigator.geolocation) {
    trackEvent("geolocation_used", { result: "unsupported" });
    setStatus("Geolocalizzazione non disponibile in questo browser.", "error");
    return;
  }

  setStatus("Cerco la tua posizione...");
  setLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const place = await reverseGeocodePosition(latitude, longitude)
        .catch(() => {
          trackEvent("weather_api_error", {
            api: "reverse_geocode",
            context: "geolocation",
            has_cached_weather: Boolean(state.weather),
          });
          return gpsFallbackPlace(latitude, longitude);
        });

      trackEvent("geolocation_used", { result: "allowed" });
      await loadWeather(place);
      setLoading(false);
    },
    (error) => {
      setLoading(false);
      trackEvent("geolocation_used", {
        result: error?.code === 1 ? "denied" : "error",
      });
      setStatus("Posizione non autorizzata. Puoi cercare una città a mano.", "error");
    },
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 },
  );
}

function getDaily(index) {
  const daily = state.weather?.daily;
  if (!daily) return null;

  return {
    time: daily.time[index],
    weather_code: daily.weather_code[index],
    temperature_2m_max: daily.temperature_2m_max[index],
    temperature_2m_min: daily.temperature_2m_min[index],
    precipitation_probability_max: daily.precipitation_probability_max[index],
    precipitation_sum: daily.precipitation_sum?.[index],
    sunrise: daily.sunrise[index],
    sunset: daily.sunset[index],
    uv_index_max: daily.uv_index_max[index],
    wind_speed_10m_max: daily.wind_speed_10m_max[index],
  };
}

function weatherInfo(code, isDay) {
  if (code === 0) {
    return {
      label: "Sereno",
      icon: meteocon(isDay ? "clear-day" : "clear-night"),
      theme: "clear",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Poco nuvoloso",
      icon: meteocon(isDay ? "partly-cloudy-day" : "partly-cloudy-night"),
      theme: "cloud",
    };
  }

  if (code === 3) {
    return {
      label: "Coperto",
      icon: meteocon(isDay ? "overcast-day" : "overcast-night"),
      theme: "cloud",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Nebbia",
      icon: meteocon("fog"),
      theme: "fog",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      label: "Pioviggine",
      icon: meteocon(isDay ? "partly-cloudy-day-drizzle" : "partly-cloudy-night-drizzle"),
      theme: "rain",
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      label: "Pioggia",
      icon: meteocon(isDay ? "overcast-day-rain" : "overcast-night-rain"),
      theme: "rain",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Neve",
      icon: meteocon(isDay ? "partly-cloudy-day-snow" : "partly-cloudy-night-snow"),
      theme: "snow",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Temporale",
      icon: meteocon(isDay ? "thunderstorms-day-rain" : "thunderstorms-night-rain"),
      theme: "storm",
    };
  }

  return {
    label: "Variabile",
    icon: meteocon(isDay ? "partly-cloudy-day" : "partly-cloudy-night"),
    theme: "cloud",
  };
}

function meteocon(name) {
  return `${METEOCONS_BASE}/${name}.svg`;
}

function weatherAdvice(current, today) {
  const code = current.weather_code;
  const rainChance = today?.precipitation_probability_max ?? 0;
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;

  if ([95, 96, 99].includes(code)) return "Temporali in zona: tieni un piano B al coperto e occhio al vento.";
  if (rainChance >= 60 || current.precipitation > 0) return "Ombrello nello zaino. Il look resta salvo, la maglietta pure.";
  if (temp >= 29) return "Fa caldo serio: acqua, ombra e zero eroismi nelle ore centrali.";
  if (temp <= 5) return "Strati caldi. Il cielo puo essere bello, ma l'aria morde.";
  if (wind >= 35) return "Vento vivace: giacca leggera e cappello ben saldo.";
  if (code === 0) return "Occhiali pronti. La giornata sta collaborando.";
  return "Meteo gestibile: vestiti a strati e vai tranquillo.";
}

function comfortLabel(value) {
  if (value >= 29) return "caldo";
  if (value <= 5) return "freddo";
  return "comodo";
}

function humidityLabel(value) {
  if (value >= 75) return "aria pesante";
  if (value <= 35) return "aria secca";
  return "nella norma";
}

function cloudLabel(value) {
  if (value >= 75) return "cielo coperto";
  if (value <= 25) return "molto aperto";
  return "variabile";
}

function windDirection(degrees) {
  if (!isNumber(degrees)) return "--";
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(degrees / 45) % 8];
}

function normalizePlace(place) {
  return {
    name: place.name || "Località",
    admin1: place.admin1 || "",
    admin2: place.admin2 || "",
    country: place.country || place.countryName || "",
    country_code: place.country_code || place.countryCode || "",
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    population: Number(place.population) || 0,
    feature_code: place.feature_code || "",
    original_index: Number(place.original_index) || 0,
    timezone: place.timezone || "",
    source: place.source || "search",
  };
}

function rankPlaces(query, places) {
  const normalizedQuery = normalizeSearchText(query);

  return [...places].sort((a, b) => {
    const scoreDiff = placeScore(b, normalizedQuery) - placeScore(a, normalizedQuery);
    if (scoreDiff !== 0) return scoreDiff;

    const populationDiff = b.population - a.population;
    if (populationDiff !== 0) return populationDiff;

    return a.original_index - b.original_index;
  });
}

function placeScore(place, normalizedQuery) {
  const name = normalizeSearchText(place.name);
  const admin1 = normalizeSearchText(place.admin1);
  const admin2 = normalizeSearchText(place.admin2);
  const country = normalizeSearchText(place.country);
  const countryCode = normalizeSearchText(place.country_code);
  const textScore =
    matchScore(name, normalizedQuery, 4000, 3000, 2200) +
    matchScore(admin2, normalizedQuery, 1200, 900, 650) +
    matchScore(admin1, normalizedQuery, 1000, 760, 520) +
    matchScore(country, normalizedQuery, 260, 160, 90) +
    matchScore(countryCode, normalizedQuery, 220, 140, 80);
  let score = textScore;

  if (textScore > 0 && normalizeSearchText(place.country_code) === "it") {
    score += 1500;
  }

  if (textScore > 0) {
    score += Math.min(place.population / 10000, 500);
  }

  return score;
}

function matchScore(value, normalizedQuery, exact, startsWith, includes) {
  if (!value || !normalizedQuery) return 0;
  if (value === normalizedQuery) return exact;
  if (value.startsWith(normalizedQuery)) return startsWith;
  if (value.includes(normalizedQuery)) return includes;
  return 0;
}

async function reverseGeocodePosition(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "it",
  });

  const data = await fetchJson(`${REVERSE_GEOCODE_API}?${params.toString()}`, {
    cacheKey: `reverse:${coordinateCacheKey({ latitude, longitude }, 3)}`,
    ttl: CACHE_TTL.reverseGeocode,
    staleIfError: true,
  });
  const name = data.city || data.locality || data.principalSubdivision || data.countryName;

  if (!name) {
    throw new Error("Reverse geocode empty response");
  }

  return normalizePlace({
    name,
    admin1: data.principalSubdivision || "",
    country: data.countryName || "",
    country_code: data.countryCode || "",
    latitude,
    longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    source: "gps",
  });
}

function gpsFallbackPlace(latitude, longitude) {
  return normalizePlace({
    name: "Posizione GPS",
    admin1: "",
    country_code: "",
    latitude,
    longitude,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    source: "gps",
  });
}

function rememberPlace(place) {
  const normalized = normalizePlace(place);
  state.recent = [
    normalized,
    ...state.recent.filter((item) => placeKey(item) !== placeKey(normalized)),
  ].slice(0, 8);

  localStorage.setItem(RECENT_KEY, JSON.stringify(state.recent));
}

function placeKey(place) {
  return `${place.name}|${place.latitude.toFixed(2)}|${place.longitude.toFixed(2)}`;
}

function placeSubtitle(place) {
  const parts = [place.admin1, place.admin2, place.country_code || place.country]
    .filter(Boolean)
    .filter((part, index, list) => list.indexOf(part) === index);

  return parts.join(", ") || formatCoordinates(place);
}

function trackEvent(name, params = {}) {
  const safeParams = sanitizeAnalyticsParams(name, params);

  if (!ANALYTICS_CONFIG.enabled) {
    if (ANALYTICS_CONFIG.debug) {
      console.info("[analytics disabled]", name, safeParams);
    }
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, safeParams);
  }
}

function sanitizeAnalyticsParams(name, params) {
  const allowedParams = ANALYTICS_PARAM_ALLOWLIST[name] || [];

  return allowedParams.reduce((safeParams, key) => {
    if (!Object.prototype.hasOwnProperty.call(params, key)) return safeParams;

    const value = params[key];
    if (typeof value === "string") {
      safeParams[key] = value.slice(0, 80);
    } else if (Number.isFinite(value)) {
      safeParams[key] = value;
    } else if (typeof value === "boolean") {
      safeParams[key] = value;
    }

    return safeParams;
  }, {});
}

function placeAnalyticsPayload(place) {
  const normalized = normalizePlace(place);

  return {
    city_slug: analyticsSlug(normalized.slug || normalized.name),
    region_slug: analyticsSlug(normalized.region_slug || normalized.admin1),
    country_code: String(normalized.country_code || "").toUpperCase().slice(0, 2),
    source: normalized.source || "search",
  };
}

function analyticsSlug(value) {
  return normalizeSearchText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "unknown";
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isGenericGpsName(name) {
  return ["La tua posizione", "Posizione GPS"].includes(name);
}

function formatCoordinates(place) {
  return `${place.latitude.toFixed(2)}, ${place.longitude.toFixed(2)}`;
}

function formatTemp(value) {
  return String(Math.round(value));
}

function formatDegree(value) {
  return `${formatTemp(value)}°`;
}

function tempUnitLabel() {
  return "°C";
}

function isNumber(value) {
  return Number.isFinite(Number(value));
}

function formatDateTime(value, _timezone, options) {
  return new Intl.DateTimeFormat("it-IT", options).format(weatherDate(value));
}

function isHourDay(time) {
  const hour = weatherDate(time).getHours();
  return hour >= 7 && hour <= 19;
}

function weatherDate(value) {
  const parts = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!parts) return new Date(value);

  const [, year, month, day, hour = "12", minute = "00"] = parts;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

async function fetchJson(url, options = {}) {
  const {
    cacheKey = url,
    ttl = 0,
    staleIfError = false,
    persistent = true,
    timeout = API_TIMEOUT_MS,
    signal = null,
  } = options;
  const cached = ttl > 0 ? readApiCache(cacheKey, persistent) : null;
  const now = Date.now();

  if (cached?.expiresAt > now) {
    apiResponseMeta.set(cacheKey, { source: "cache", stale: false, storedAt: cached.storedAt || null });
    return cached.data;
  }
  const inFlight = inFlightApiRequests.get(url);
  if (inFlight && !inFlight.signal?.aborted) return inFlight.promise;
  if (inFlight) inFlightApiRequests.delete(url);

  const request = (async () => {
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort();
    if (signal?.aborted) abortFromCaller();
    else signal?.addEventListener("abort", abortFromCaller, { once: true });
    const timeoutId = window.setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (ttl > 0) writeApiCache(cacheKey, data, ttl, persistent);
      apiResponseMeta.set(cacheKey, { source: "network", stale: false, storedAt: Date.now() });
      return data;
    } catch (error) {
      if (signal?.aborted) throw new Error("Request cancelled");
      const canUseStale = staleIfError
        && cached
        && now - cached.expiresAt <= Math.max(ttl * 6, 60 * 60 * 1000);
      if (canUseStale) {
        apiResponseMeta.set(cacheKey, { source: "cache", stale: true, storedAt: cached.storedAt || null });
        return cached.data;
      }
      if (error?.name === "AbortError") throw new Error("Request timeout");
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromCaller);
    }
  })();

  inFlightApiRequests.set(url, { promise: request, signal });
  try {
    return await request;
  } finally {
    if (inFlightApiRequests.get(url)?.promise === request) inFlightApiRequests.delete(url);
  }
}

function readApiCache(cacheKey, persistent) {
  const memoryEntry = memoryApiCache.get(cacheKey);
  if (memoryEntry) return memoryEntry;
  if (!persistent) return null;

  try {
    const entry = JSON.parse(localStorage.getItem(`${API_CACHE_PREFIX}${cacheKey}`));
    if (!entry?.expiresAt || !("data" in entry)) return null;
    memoryApiCache.set(cacheKey, entry);
    return entry;
  } catch {
    return null;
  }
}

function writeApiCache(cacheKey, data, ttl, persistent) {
  const storedAt = Date.now();
  const entry = { data, storedAt, expiresAt: storedAt + ttl };
  memoryApiCache.set(cacheKey, entry);
  if (!persistent) return;

  try {
    localStorage.setItem(`${API_CACHE_PREFIX}${cacheKey}`, JSON.stringify(entry));
  } catch {
    pruneApiCache(true);
  }
}

function pruneApiCache(force = false) {
  const now = Date.now();
  try {
    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith(API_CACHE_PREFIX)) return;
      const entry = JSON.parse(localStorage.getItem(key));
      if (force || !entry?.expiresAt || entry.expiresAt < now - (7 * 24 * 60 * 60 * 1000)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Storage can be unavailable in private browsing; memory cache still works.
  }
}

function coordinateCacheKey(place, precision = 3) {
  return `${Number(place.latitude).toFixed(precision)}:${Number(place.longitude).toFixed(precision)}`;
}

function setStatus(message, type = "info", options = {}) {
  const { autoHide = type === "info" } = options;
  clearTimeout(statusTimer);
  els.status.textContent = message;
  els.status.classList.toggle("error", type === "error");
  els.status.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  els.status.hidden = false;

  if (autoHide) {
    statusTimer = window.setTimeout(clearStatus, type === "error" ? 6000 : 1800);
  }
}

function clearStatus() {
  clearTimeout(statusTimer);
  els.status.hidden = true;
  els.status.textContent = "";
  els.status.classList.remove("error");
}

function setLoading(isLoading) {
  loadingDepth = Math.max(0, loadingDepth + (isLoading ? 1 : -1));
  const active = loadingDepth > 0;
  els.body.classList.toggle("is-loading", active);
  els.body.setAttribute("aria-busy", String(active));
  els.searchForm.querySelector("button").disabled = active;
  els.locationButton.disabled = active;
}

function hideSuggestions() {
  suggestionRun += 1;
  suggestionPlaces = [];
  activeSuggestionIndex = -1;
  els.suggestions.hidden = true;
  els.suggestions.innerHTML = "";
  setSuggestionsExpanded(false);
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

function humanError(error, hasWeather = false) {
  if (/Failed to fetch|Request timeout/.test(String(error?.message || ""))) {
    return hasWeather
      ? "Non riesco ad aggiornare ora: tengo gli ultimi dati disponibili."
      : "Non riesco a raggiungere il servizio meteo. Controlla la connessione e riprova.";
  }
  return hasWeather
    ? "Meteo caricato, ma un dettaglio non si e aggiornato."
    : "Il meteo non ha risposto bene. Riprova tra poco.";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
