import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cities = JSON.parse(fs.readFileSync(path.join(root, "data/cities.json"), "utf8"));
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const redirects = fs.readFileSync(path.join(root, "_redirects"), "utf8");

test("il dataset contiene i 100 comuni più popolati in ordine", () => {
  assert.equal(cities.length, 100);
  assert.equal(new Set(cities.map((city) => city.istat_code)).size, 100);
  assert.equal(new Set(cities.map((city) => `${city.region_slug}/${city.slug}`)).size, 100);
  assert.ok(cities.every((city, index) => index === 0 || cities[index - 1].population >= city.population));
  assert.ok(cities.every((city) => city.population_year === 2026));
});

test("ogni comune ha una pagina Atlas canonica", () => {
  for (const city of cities) {
    const pathname = `/${city.region_slug}/${city.slug}/`;
    const file = path.join(root, city.region_slug, city.slug, "index.html");
    assert.ok(fs.existsSync(file), `pagina mancante: ${pathname}`);
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="https://chetempofa\\.com${pathname}">`));
    assert.match(html, /id="pagePlace"/);
    assert.match(html, new RegExp(`<span id="cityName">${escapeRegex(escapeHtml(city.name))}</span>`));
    assert.match(html, /class="atlas-app"/);
  }
});

test("sitemap e redirect usano la nuova struttura", () => {
  assert.equal((sitemap.match(/<url>/g) || []).length, 101);
  assert.doesNotMatch(sitemap, /\/meteo\//);
  assert.match(sitemap, /https:\/\/chetempofa\.com\/lombardia\/milano\//);
  assert.match(redirects, /\/meteo\/lombardia\/milano\/ \/lombardia\/milano\/ 301/);
  assert.equal(fs.existsSync(path.join(root, "meteo")), false);
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
