import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const [html, script, css, radarDecision] = await Promise.all([
  readFile(new URL("index.html", root), "utf8"),
  readFile(new URL("script.js", root), "utf8"),
  readFile(new URL("css/style.css", root), "utf8"),
  readFile(new URL("docs/decisions/001-radar-source.md", root), "utf8"),
]);

test("gli id statici della pagina sono unici", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test("i selettori id usati da JavaScript esistono nel documento", () => {
  const optionalIds = new Set(["pagePlace"]);
  const selectors = [...script.matchAll(/querySelector\("#([A-Za-z][\w-]*)"\)/g)].map((match) => match[1]);
  const missing = [...new Set(selectors)].filter((id) => !optionalIds.has(id) && !html.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});

test("la cache ha TTL, fallback e cancellazione richieste", () => {
  assert.match(script, /const CACHE_TTL = Object\.freeze/);
  assert.match(script, /staleIfError/);
  assert.match(script, /weatherAbortController\?\.abort\(\)/);
  assert.match(script, /atlasAbortController\?\.abort\(\)/);
  assert.match(script, /Request timeout/);
});

test("Atlas usa caricamento giornaliero e limiti di zoom sicuri", () => {
  assert.match(script, /start_date: dayDate/);
  assert.match(script, /end_date: dayDate/);
  assert.match(script, /minZoom: 9/);
  assert.match(script, /maxZoom: 12/);
  assert.doesNotMatch(script, /milano-centro-storico/);
});

test("lo stato dei dati è comunicato anche visivamente", () => {
  assert.match(html, /id="dataFreshnessBadge"/);
  assert.match(script, /renderDataFreshness/);
  assert.match(script, /dataFreshnessBadge\.textContent = "LIVE"/);
  assert.doesNotMatch(script, /dataFreshnessBadge\.textContent = label/);
});

test("la decisione radar resta esplicitamente rinviata", () => {
  assert.match(radarDecision, /Non integrare RainViewer nella milestone corrente/);
  assert.match(radarDecision, /Radar-DPC/);
});
