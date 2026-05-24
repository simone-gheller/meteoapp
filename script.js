const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEOCODE_API = "https://api.bigdatacloud.net/data/reverse-geocode-client";
const RECENT_KEY = "chetempofa-recent";
const PLACE_KEY = "chetempofa-place";
const SEARCH_RESULT_POOL = 20;
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

const state = {
  place: null,
  weather: null,
  selectedDay: 0,
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
  locationMeta: document.querySelector("#locationMeta"),
  currentTemp: document.querySelector("#currentTemp"),
  tempUnit: document.querySelector("#tempUnit"),
  conditionLabel: document.querySelector("#conditionLabel"),
  weatherAdvice: document.querySelector("#weatherAdvice"),
  updatedAt: document.querySelector("#updatedAt"),
  currentIcon: document.querySelector("#currentIcon"),
  sunriseTime: document.querySelector("#sunriseTime"),
  sunsetTime: document.querySelector("#sunsetTime"),
  uvIndex: document.querySelector("#uvIndex"),
  recentSection: document.querySelector("#recentSection"),
  recentCities: document.querySelector("#recentCities"),
  metricsGrid: document.querySelector("#metricsGrid"),
  dailyList: document.querySelector("#dailyList"),
  forecastSummary: document.querySelector("#forecastSummary"),
  timelineTitle: document.querySelector("#timelineTitle"),
  timelineSummary: document.querySelector("#timelineSummary"),
  hourlyStrip: document.querySelector("#hourlyStrip"),
  timezoneLabel: document.querySelector("#timezoneLabel"),
  footerUpdatedAt: document.querySelector("#footerUpdatedAt"),
};

let suggestionRun = 0;
let suggestionPlaces = [];
let activeSuggestionIndex = -1;
let statusTimer = 0;

init();

function init() {
  wireEvents();
  renderRecent();
  boot();
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

    await loadWeather(places[0]);
    els.citySearch.value = "";
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
  loadWeather(place);
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

  const data = await fetchJson(`${GEO_API}?${params.toString()}`);
  const places = (data.results || []).map((place, index) => {
    return normalizePlace({ ...place, original_index: index });
  });

  return rankPlaces(query, places).slice(0, count);
}

async function loadWeather(place, options = {}) {
  const { remember = true } = options;

  try {
    setLoading(true);
    setStatus(`Aggiorno ${place.name}...`, "info", { autoHide: true });
    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      timezone: "auto",
      forecast_days: "7",
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
        "precipitation_probability",
        "weather_code",
        "wind_speed_10m",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_probability_max",
        "wind_speed_10m_max",
      ].join(","),
    });

    const weather = await fetchJson(`${FORECAST_API}?${params.toString()}`);
    state.place = normalizePlace(place);
    state.weather = weather;
    state.selectedDay = 0;

    if (remember) {
      rememberPlace(state.place);
    }

    localStorage.setItem(PLACE_KEY, JSON.stringify(state.place));
    renderAll();
    trackEvent("weather_city_viewed", {
      ...placeAnalyticsPayload(state.place),
      page_type: readStaticPlace() ? "city_static" : "app",
    });
    clearStatus();
  } catch (error) {
    console.error(error);
    trackEvent("weather_api_error", {
      api: "forecast",
      context: "load_weather",
      has_cached_weather: Boolean(state.weather),
    });
    setStatus(humanError(error, Boolean(state.weather)), "error");
  } finally {
    setLoading(false);
  }
}

function renderAll() {
  if (!state.weather || !state.place) return;

  renderCurrent();
  renderMetrics();
  renderDaily();
  renderHourly();
  renderRecent();
}

function renderCurrent() {
  const current = state.weather.current;
  const today = getDaily(0);
  const info = weatherInfo(current.weather_code, current.is_day === 1);
  const timezone = state.weather.timezone || "auto";

  els.body.dataset.condition = info.theme;
  els.cityName.textContent = state.place.name;
  els.locationMeta.textContent = `${placeSubtitle(state.place)} · ${formatDateTime(current.time, timezone, {
    weekday: "long",
    day: "numeric",
    month: "long",
  })}`;
  els.currentTemp.textContent = formatTemp(current.temperature_2m);
  els.tempUnit.textContent = tempUnitLabel();
  els.conditionLabel.textContent = info.label;
  els.weatherAdvice.textContent = weatherAdvice(current, today);
  els.updatedAt.textContent = `Aggiornato ${formatDateTime(current.time, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  els.footerUpdatedAt.textContent = `Ultimo aggiornamento ${formatDateTime(current.time, timezone, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  els.currentIcon.src = info.icon;
  els.currentIcon.alt = info.label;
  els.sunriseTime.textContent = today?.sunrise ? formatDateTime(today.sunrise, timezone, { hour: "2-digit", minute: "2-digit" }) : "--";
  els.sunsetTime.textContent = today?.sunset ? formatDateTime(today.sunset, timezone, { hour: "2-digit", minute: "2-digit" }) : "--";
  els.uvIndex.textContent = isNumber(today?.uv_index_max) ? Math.round(today.uv_index_max) : "--";
  els.timezoneLabel.textContent = timezone.replace("_", " ");
}

function renderMetrics() {
  const current = state.weather.current;
  const today = getDaily(0);
  const metrics = [
    {
      label: "Percepita",
      value: `${formatTemp(current.apparent_temperature)}${tempUnitLabel()}`,
      note: comfortLabel(current.apparent_temperature),
    },
    {
      label: "Umidita",
      value: `${Math.round(current.relative_humidity_2m)}%`,
      note: humidityLabel(current.relative_humidity_2m),
    },
    {
      label: "Vento",
      value: `${Math.round(current.wind_speed_10m)} km/h`,
      note: `${windDirection(current.wind_direction_10m)} · raffiche ${Math.round(current.wind_gusts_10m)} km/h`,
    },
    {
      label: "Pioggia",
      value: `${Math.round(today?.precipitation_probability_max ?? 0)}%`,
      note: current.precipitation > 0 ? `${current.precipitation} mm adesso` : "Niente accumulo ora",
    },
    {
      label: "Nuvole",
      value: `${Math.round(current.cloud_cover)}%`,
      note: cloudLabel(current.cloud_cover),
    },
  ];

  els.metricsGrid.innerHTML = metrics
    .map((metric) => {
      return `
        <article class="metric-card">
          <span>${metric.label}</span>
          <strong>${metric.value}</strong>
          <em>${metric.note}</em>
        </article>
      `;
    })
    .join("");
}

function renderDaily() {
  const daily = state.weather.daily;
  const timezone = state.weather.timezone || "auto";
  const rainiest = Math.max(...daily.precipitation_probability_max.map((value) => value ?? 0));
  const hottest = Math.max(...daily.temperature_2m_max);

  els.forecastSummary.textContent = `Massima ${formatTemp(hottest)}${tempUnitLabel()} · pioggia fino al ${Math.round(rainiest)}%`;
  els.dailyList.innerHTML = daily.time
    .map((date, index) => {
      const info = weatherInfo(daily.weather_code[index], true);
      const selected = index === state.selectedDay;
      const dayName = index === 0
        ? "Oggi"
        : formatDateTime(date, timezone, { weekday: "short" }).replace(".", "");

      return `
        <button class="day-card" type="button" aria-pressed="${selected}" data-day="${index}">
          <strong>${dayName}</strong>
          <div class="day-main">
            <img src="${info.icon}" alt="${info.label}">
            <div class="day-temps" aria-label="Temperature previste">
              <span class="day-temp day-temp-min">${formatTemp(daily.temperature_2m_min[index])}${tempUnitLabel()}</span>
              <span class="day-temp day-temp-max">${formatTemp(daily.temperature_2m_max[index])}${tempUnitLabel()}</span>
            </div>
          </div>
          <div class="rain-chance">${Math.round(daily.precipitation_probability_max[index] ?? 0)}% pioggia</div>
        </button>
      `;
    })
    .join("");

  els.dailyList.querySelectorAll("[data-day]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedDay = Number(button.dataset.day);
      if (state.selectedDay !== selectedDay) {
        trackEvent("forecast_day_selected", { day_index: selectedDay });
      }
      state.selectedDay = selectedDay;
      renderDaily();
      renderHourly();
    });
  });
}

function renderHourly() {
  const hourly = state.weather.hourly;
  const daily = state.weather.daily;
  const timezone = state.weather.timezone || "auto";
  const date = daily.time[state.selectedDay];
  const currentTime = weatherDate(state.weather.current.time).getTime();
  const selectedHours = hourlyWindow(hourly, date, state.selectedDay, currentTime);

  const title = state.selectedDay === 0
    ? "Prossime ore"
    : formatDateTime(date, timezone, { weekday: "long", day: "numeric", month: "short" });
  const topRain = selectedHours.reduce((max, item) => {
    return Math.max(max, hourly.precipitation_probability[item.index] ?? 0);
  }, 0);

  els.timelineTitle.textContent = title;
  els.timelineSummary.textContent = selectedHours.length
    ? `${state.selectedDay === 0 ? "Da adesso" : "Dal mattino"} · picco pioggia ${Math.round(topRain)}%`
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

  els.hourlyStrip.innerHTML = selectedHours
    .map((item) => {
      const isDay = isHourDay(item.time);
      const info = weatherInfo(hourly.weather_code[item.index], isDay);
      const wind = Math.round(hourly.wind_speed_10m[item.index] ?? 0);
      return `
        <article class="hour-card">
          <span>${formatDateTime(item.time, timezone, { hour: "2-digit", minute: "2-digit" })}</span>
          <img src="${info.icon}" alt="${info.label}">
          <strong>${formatTemp(hourly.temperature_2m[item.index])}${tempUnitLabel()}</strong>
          <em>${Math.round(hourly.precipitation_probability[item.index] ?? 0)}% pioggia</em>
          <small>${wind} km/h vento</small>
        </article>
      `;
    })
    .join("");
}

function hourlyWindow(hourly, date, selectedDay, currentTime) {
  const entries = hourly.time.map((time, index) => ({ time, index }));

  if (selectedDay === 0) {
    return entries
      .filter((item) => weatherDate(item.time).getTime() >= currentTime)
      .slice(0, 12);
  }

  const dayEntries = entries.filter((item) => item.time.startsWith(date));
  const daytimeEntries = dayEntries.filter((item) => {
    const hour = weatherDate(item.time).getHours();
    return hour >= 6 && hour <= 23;
  });

  return (daytimeEntries.length ? daytimeEntries : dayEntries).slice(0, 12);
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
      loadWeather(recent[Number(button.dataset.recent)], { remember: true });
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
      icon: isDay ? "icons/animated/day.svg" : "icons/animated/night.svg",
      theme: "clear",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Poco nuvoloso",
      icon: isDay ? "icons/animated/cloudy-day-2.svg" : "icons/animated/cloudy-night-2.svg",
      theme: "cloud",
    };
  }

  if (code === 3) {
    return {
      label: "Coperto",
      icon: "icons/animated/cloudy.svg",
      theme: "cloud",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Nebbia",
      icon: "icons/animated/cloudy.svg",
      theme: "fog",
    };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      label: "Pioviggine",
      icon: "icons/animated/rainy-2.svg",
      theme: "rain",
    };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      label: "Pioggia",
      icon: "icons/animated/rainy-5.svg",
      theme: "rain",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Neve",
      icon: "icons/animated/snowy-5.svg",
      theme: "snow",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Temporale",
      icon: "icons/animated/thunder.svg",
      theme: "storm",
    };
  }

  return {
    label: "Variabile",
    icon: "icons/animated/weather.svg",
    theme: "cloud",
  };
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

  const data = await fetchJson(`${REVERSE_GEOCODE_API}?${params.toString()}`);
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
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
  els.body.classList.toggle("is-loading", isLoading);
  els.body.setAttribute("aria-busy", String(isLoading));
  els.searchForm.querySelector("button").disabled = isLoading;
  els.locationButton.disabled = isLoading;
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
  if (String(error?.message || "").includes("Failed to fetch")) {
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
