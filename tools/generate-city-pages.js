const fs = require("fs");
const path = require("path");

const SITE_URL = "https://chetempofa.com";
const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "index.html");
const CITIES_PATH = path.join(ROOT, "data", "cities.json");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const REDIRECTS_PATH = path.join(ROOT, "_redirects");
const LEGACY_ROOT = path.join(ROOT, "meteo");
const LASTMOD = process.env.CITY_PAGES_LASTMOD || new Date().toISOString().slice(0, 10);
const EXPECTED_CITY_COUNT = 100;

const template = fs.readFileSync(INDEX_PATH, "utf8");
const cities = JSON.parse(fs.readFileSync(CITIES_PATH, "utf8"));

validateCities(cities);
removeLegacyGeneratedPages();

for (const city of cities) {
  const outputDir = path.join(ROOT, city.region_slug, city.slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), buildCityPage(city));
}

fs.writeFileSync(SITEMAP_PATH, buildSitemap(cities));
fs.writeFileSync(REDIRECTS_PATH, buildRedirects(cities));

console.log(`Generate ${cities.length} pagine comunali in /{regione}/{comune}/.`);
console.log(`Sitemap: ${cities.length + 1} URL · lastmod ${LASTMOD}.`);

function buildCityPage(city) {
  const pathname = cityPath(city);
  const canonical = `${SITE_URL}${pathname}`;
  const title = `Meteo ${city.name}: oggi e prossimi giorni | chetempofa`;
  const description = `Previsioni meteo per ${city.name}: temperatura, pioggia, vento e prossime ore. Dati Open-Meteo aggiornati, senza account.`;
  const seoCopy = `Consulta le previsioni meteo di ${city.name}, in ${city.admin1}: temperatura attuale, probabilità di pioggia, vento, qualità dell’aria e andamento ora per ora. I dati sono aggiornati da Open-Meteo e presentati sempre in gradi Celsius.`;
  const placeJson = JSON.stringify({ ...city, source: "static" });
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    about: {
      "@type": "Place",
      name: city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: city.admin1,
        addressCountry: "IT",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
  });

  return template
    .replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <base href="/">',
    )
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeAttribute(description)}">`)
    .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${escapeAttribute(title)}">`)
    .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${canonical}">`)
    .replace('<meta name="twitter:card" content="summary">', `<meta property="og:description" content="${escapeAttribute(description)}">\n    <meta name="twitter:card" content="summary">\n    <meta name="twitter:title" content="${escapeAttribute(title)}">\n    <meta name="twitter:description" content="${escapeAttribute(description)}">`)
    .replace('</head>', `    <script type="application/ld+json">${escapeScriptJson(structuredData)}</script>\n  </head>`)
    .replace(/(<script src="script\.js\?v=[^"]+" defer><\/script>)/, `<script type="application/json" id="pagePlace">${escapeScriptJson(placeJson)}</script>$1`)
    .replace('<span id="cityName">Milano</span>', `<span id="cityName">${escapeHtml(city.name)}</span>`)
    .replace('<p id="locationMeta">Carico il cielo...</p>', `<p id="locationMeta">${escapeHtml(city.admin1)}, ${escapeHtml(city.admin2)}, IT</p>`)
    .replace('</main>', `${buildSeoSection(city, seoCopy)}\n    </main>`);
}

function buildSeoSection(city, copy) {
  return `      <section class="city-seo" aria-labelledby="citySeoTitle">
        <p>PREVISIONI LOCALI</p>
        <h2 id="citySeoTitle">Meteo ${escapeHtml(city.name)}</h2>
        <p>${escapeHtml(copy)}</p>
      </section>`;
}

function buildSitemap(items) {
  const urls = [`${SITE_URL}/`, ...items.map((city) => `${SITE_URL}${cityPath(city)}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`)
    .join("\n")}\n</urlset>\n`;
}

function buildRedirects(items) {
  const lines = [
    "# Keep the exact Google Search Console verification URL.",
    "/googlec6278b16ee9c24ea.html /googlec6278b16ee9c24ea 200",
    "",
    "# Canonical city URLs: /{region}/{city}/",
  ];

  for (const city of items) {
    const canonical = cityPath(city);
    const legacy = `/meteo/${city.region_slug}/${city.slug}`;
    lines.push(`/${city.region_slug}/${city.slug} ${canonical} 301`);
    lines.push(`${legacy} ${canonical} 301`);
    lines.push(`${legacy}/ ${canonical} 301`);
  }

  return `${lines.join("\n")}\n`;
}

function cityPath(city) {
  return `/${city.region_slug}/${city.slug}/`;
}

function validateCities(items) {
  if (!Array.isArray(items) || items.length !== EXPECTED_CITY_COUNT) {
    throw new Error(`data/cities.json deve contenere esattamente ${EXPECTED_CITY_COUNT} comuni.`);
  }

  const routes = new Set();
  let previousPopulation = Infinity;

  for (const [index, city] of items.entries()) {
    const required = ["name", "admin1", "admin2", "latitude", "longitude", "population", "slug", "region_slug"];
    for (const key of required) {
      if (city[key] === undefined || city[key] === "") throw new Error(`Comune ${index + 1}: manca ${key}.`);
    }
    if (city.population > previousPopulation) throw new Error("I comuni devono essere ordinati per popolazione decrescente.");
    previousPopulation = city.population;
    const route = cityPath(city);
    if (routes.has(route)) throw new Error(`Rotta duplicata: ${route}`);
    routes.add(route);
  }
}

function removeLegacyGeneratedPages() {
  if (!fs.existsSync(LEGACY_ROOT)) return;
  const unexpected = walkFiles(LEGACY_ROOT).filter((file) => path.basename(file) !== "index.html");
  if (unexpected.length) throw new Error(`La cartella meteo/ contiene file non generati: ${unexpected.join(", ")}`);
  fs.rmSync(LEGACY_ROOT, { recursive: true });
}

function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(target) : [target];
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function escapeScriptJson(value) {
  return value.replaceAll("<", "\\u003C").replaceAll("&", "\\u0026");
}
