const fs = require("fs");
const path = require("path");

const SITE_URL = "https://chetempofa.com";
const ROOT = path.resolve(__dirname, "..");
const INDEX_PATH = path.join(ROOT, "index.html");
const CITIES_PATH = path.join(ROOT, "data", "cities.json");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const REDIRECTS_PATH = path.join(ROOT, "_redirects");
const LASTMOD = "2026-05-28";

const template = fs.readFileSync(INDEX_PATH, "utf8");
const cities = JSON.parse(fs.readFileSync(CITIES_PATH, "utf8"));

for (const city of cities) {
  const page = buildCityPage(city);
  const outputDir = path.join(ROOT, "meteo", city.region_slug, city.slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), page);
}

fs.writeFileSync(SITEMAP_PATH, buildSitemap(cities));
fs.writeFileSync(REDIRECTS_PATH, buildRedirects(cities));

function buildCityPage(city) {
  const pathName = cityPath(city);
  const canonical = `${SITE_URL}${pathName}`;
  const title = `Meteo ${city.name}: oggi e prossimi giorni | chetempofa`;
  const description = `Previsioni per ${city.name}: temperatura, pioggia, vento e prossime ore. Dati Open-Meteo, senza account.`;
  const seoCopy = `Consulta il meteo di ${city.name}, ${city.admin1}, con temperatura attuale, probabilità di pioggia, vento e previsioni ora per ora. chetempofa usa dati Open-Meteo e resta leggero: niente account, niente Fahrenheit, solo le informazioni utili per decidere come uscire.`;
  const placeJson = JSON.stringify({
    ...city,
    source: "static",
  });

  return template
    .replace('<meta name="viewport" content="width=device-width, initial-scale=1.0">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <base href="/">')
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeAttribute(description)}">`)
    .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
    .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${escapeAttribute(title)}">`)
    .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${escapeAttribute(description)}">`)
    .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${canonical}">`)
    .replace(/<meta name="twitter:title" content=".*?">/, `<meta name="twitter:title" content="${escapeAttribute(title)}">`)
    .replace(/<meta name="twitter:description" content=".*?">/, `<meta name="twitter:description" content="${escapeAttribute(description)}">`)
    .replace('<script src="script.js" defer></script>', `<script type="application/json" id="pagePlace">${escapeScriptJson(placeJson)}</script>\n    <script src="script.js" defer></script>`)
    .replace('<p class="kicker" id="locationMeta">Carico il cielo...</p>', `<p class="kicker" id="locationMeta">${escapeHtml(city.admin1)}, ${escapeHtml(city.admin2)}, ${escapeHtml(city.country_code)}</p>`)
    .replace('<h1 id="cityName">Meteo</h1>', `<h1 id="cityName">Meteo ${escapeHtml(city.name)}</h1>`)
    .replace('</main>', `        <section class="seo-copy" aria-labelledby="seoTitle">\n          <p class="eyebrow">Meteo locale</p>\n          <h2 id="seoTitle">Meteo ${escapeHtml(city.name)}</h2>\n          <p>${escapeHtml(seoCopy)}</p>\n        </section>\n      </main>`);
}

function buildSitemap(items) {
  const urls = [
    `${SITE_URL}/`,
    ...items.map((city) => `${SITE_URL}${cityPath(city)}`),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n  </url>`).join("\n")}\n</urlset>\n`;
}

function buildRedirects(items) {
  const lines = [
    "# Legacy city aliases",
    "# Keep canonical city URLs under /meteo/{region}/{city}/",
  ];

  for (const city of items) {
    const alias = `/${city.region_slug}/${city.slug}`;
    const canonical = cityPath(city);
    lines.push(`${alias} ${canonical} 301`);
    lines.push(`${alias}/ ${canonical} 301`);
  }

  return `${lines.join("\n")}\n`;
}

function cityPath(city) {
  return `/meteo/${city.region_slug}/${city.slug}/`;
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
