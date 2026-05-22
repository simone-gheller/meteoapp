# chetempofa implementation plan

## 1. Implementation strategy

Strategia corretta per questo repository: pubblicare prima una SPA statica solida su Cloudflare Pages, con metadata homepage essenziali, poi affrontare analytics, SEO citta e ads in release separate.

La codebase reale e vanilla: `index.html`, `css/style.css`, `script.js`, nessun `package.json`, nessun router, nessun backend. Il piano deve quindi evitare framework, build step e astrazioni preventive finche non servono davvero.

Ordine consigliato:

1. Stabilizzare UX e mobile.
2. Pubblicare staticamente.
3. Rimandare GA4 a una release successiva con consenso/CMP deciso.
4. Avviare SEO citta con static generation soft solo dopo MVP.
5. Rimandare monetizzazione fino a traffico e baseline performance.

Prima del coding serve conferma solo se si toccano:

- GA4/consenso;
- route pubbliche;
- migrazione/build step;
- ads;
- cambio di dominio produzione.

Modifiche sicure subito:

- hourly piu onesta/utile;
- hero desktop piu compatta;
- forecast mobile/touch/focus piu leggibile;
- loading/error state migliori;
- accessibilita base.

Modifiche da NON fare nel batch 1:

- `trackEvent()` preventivo;
- GA4 reale;
- AdSense o placeholder ads;
- route `/meteo/...`;
- Astro/Eleventy/Next;
- sitemap citta;
- Worker/API proxy.

## 2. Assumptions and blockers

### Assunzioni dal codice reale

- App statica vanilla, senza dipendenze.
- `script.js` contiene stato, fetch, ranking, render UI e geolocalizzazione.
- `css/style.css` contiene tutto il layout responsive.
- `index.html` contiene tutta la struttura.
- Suggerimenti ricerca gia esistono, ma non hanno keyboard navigation completa.
- Localita corrente e recenti usano `localStorage`.
- La citta non e nell'URL.
- `node --check script.js` e il controllo automatico minimo.

### Blocchi reali

- SEO citta: impossibile farla bene solo con la pagina HTML attuale; serve static generation o prerender.
- GA4: rimandato, poi bloccato da consenso/CMP e scelta privacy.
- Ads: rimandati, poi bloccati da traffico, policy review e baseline performance.

### Decisioni chiuse

- Prima release senza GA4.
- Hosting: Cloudflare Pages.
- Dominio canonical: `https://chetempofa.com/`, con `www` redirect.
- Prima release senza ads.
- SEO futura con static generation soft.

### Domande ancora aperte

- Quali 20-50 citta italiane includere nella prima fase SEO?
- Quando iniziare lo spike di static generation rispetto alla release UX/deploy?
- Quale CMP/consenso usare quando GA4 verra introdotto?

## 3. Prioritized roadmap

### Milestone 0 - Baseline

Obiettivo: evitare regressioni prima di toccare la UI.

Task:

- Eseguire `node --check script.js`.
- Aprire l'app con `index.html` o server statico.
- Verificare desktop e mobile.
- Salvare screenshot baseline se possibile.
- Scrivere checklist manuale breve per search, geoloc, daily, hourly, recenti, errori.

Deliverable: app invariata e checklist.

### Milestone 1 - First public release UX

Obiettivo: rendere la SPA abbastanza solida da pubblicare senza cambiare architettura.

Task:

- Hourly forecast: mostrare dati utili o empty state chiaro.
- Hero desktop: ridurre ingombro senza ridisegnare.
- Daily forecast: stato selezionato e touch/focus piu chiari.
- Loading/error: messaggi piu specifici e non distruttivi.
- Accessibilita base: focus visibile, touch target, niente overlap mobile.

Acceptance globale:

- `node --check script.js` passa.
- `milano`, `milan`, `roma`, `tokyo` funzionano.
- A 320px e 390px non ci sono sovrapposizioni.
- Le 7 card daily sono leggibili e selezionabili.
- Hourly non e mai una sezione vuota senza spiegazione.
- Un errore API non cancella dati gia visibili.

### Milestone 2 - Static public deploy

Obiettivo: portare online la SPA statica.

Task:

- Configurare hosting statico no-framework.
- Verificare preview.
- Collegare dominio solo dopo conferma.
- Aggiungere o verificare meta homepage essenziali, canonical, `robots.txt` e `sitemap.xml` homepage-only.
- Verificare Lighthouse/PageSpeed base.

Acceptance:

- Homepage raggiungibile via HTTPS.
- Nessun build command inventato.
- Nessun file segreto o config locale pubblicato.
- Performance baseline registrata.

### Milestone 3 - Search hardening

Obiettivo: migliorare ricerca senza SEO route.

Task:

- Keyboard navigation suggerimenti.
- ARIA combobox/listbox corretta.
- Omonimie piu chiare.
- Error/loading dei suggerimenti.
- Recenti piu leggibili se necessario.

Acceptance:

- Frecce, Enter, Escape e click funzionano.
- Provider down non blocca il form.
- Recenti restano solo in browser.

### Milestone 4 - SEO decision

Obiettivo: decidere se vale la pena generare pagine citta.

Branch A, nessuna migrazione:

- Solo homepage indicizzabile.
- Nessuna sitemap citta.
- Eventuale URL condivisibile client-side solo per UX.

Branch B, SEO locale vero:

- Catalogo iniziale 20-50 citta.
- Generazione statica di pagine `/meteo/{regione}/{citta}`.
- HTML iniziale con title, H1, canonical e testo breve.
- Meteo fresco client-side.
- Partire con uno spike soft: una o poche pagine generate, poi estendere solo se il modello regge.
- Valutare prima script statico o Eleventy/Astro; Next/SSR esclusi salvo nuovo requisito.

Acceptance:

- La scelta e approvata prima di qualunque migrazione.
- Le route client-side non vengono presentate come soluzione SEO.
- Lo spike deve dimostrare HTML city-specific visibile in view source prima di generare molte pagine.

### Milestone 5 - Analytics

Obiettivo: misurare solo cio che serve, dopo decisione consenso.

Task:

- Scegliere CMP/consenso o decidere niente GA4.
- Implementare GA4 solo se approvato.
- Tracciare eventi minimi: city view, search, suggestion, geolocation result, forecast day, API error.
- Non inviare coordinate, accuracy o URL API con lat/lon.

Acceptance:

- Tag Assistant/DebugView conferma eventi.
- Nessun evento duplicato.
- Nessun dato sensibile nei payload.

### Milestone 6 - Monetization

Obiettivo: valutare ads senza rovinare UX.

Task:

- Non fare nulla finche non c'e traffico e baseline performance.
- Fare policy audit AdSense.
- Se approvato, introdurre un solo slot `after_weather_content`.
- Nessun ads nella hero, tra search e risultato, dentro card o vicino controlli.

Acceptance:

- CLS resta sotto controllo.
- Slot etichettato "Pubblicita".
- Nessun click tracking custom.
- Mobile mantiene il meteo come priorita.

## 4. Task breakdown dettagliato

| ID task | Titolo | Obiettivo | Priorita | Dipendenze | File/componenti coinvolti | Modifica prevista | Acceptance criteria | Validazione manuale | Test automatici | Rischio | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M0-01 | Baseline tecnica | Sapere che punto di partenza e sano | P0 | nessuna | `script.js` | Nessuna modifica | `node --check script.js` passa | Aprire app | `node --check script.js` | basso | XS |
| M0-02 | Baseline visuale | Confronto prima/dopo | P0 | M0-01 | `index.html`, `css/style.css` | Nessuna modifica | Screenshot o note desktop/mobile | 390px, 768px, 1280px | n/a | basso | XS |
| M0-03 | Checklist regressione | Verifica ripetibile | P0 | M0-02 | `docs/` | Checklist breve | Copre search, geoloc, daily, hourly, errori | Eseguire checklist | n/a | basso | XS |
| M1-01 | Hourly utile o onesta | Evitare sezione vuota | P0 | M0 | `script.js` `renderHourly()`, `css/style.css` `.hourly-strip` | Migliorare selezione ore o empty state | Hourly mostra card o messaggio chiaro per ogni giorno | Selezionare 7 giorni, provare fine giornata | `node --check script.js` | medio | M |
| M1-02 | Hero desktop compatta | Far emergere piu contenuto | P1 | M0 | `css/style.css` `.current-section`, `.temperature-readout`, `.visual-pane` | Ridurre ingombro desktop | A 1280px si vede hero e inizio metriche; mobile non peggiora | 390px, 768px, 1280px | n/a | medio | S |
| M1-03 | Daily forecast leggibile | Migliorare selezione e mobile | P0 | M0 | `css/style.css` `.daily-list`, `.day-card`; `script.js` `renderDaily()` se serve | Active/focus/touch polish | Stato attivo visibile; card usabili a 320/390px | Click, tab, mobile | `node --check script.js` se JS cambia | medio | M |
| M1-04 | Loading/error migliori | Aumentare fiducia | P0 | M0 | `script.js` `setStatus()`, `loadWeather()`, `searchAndLoad()`; `css/style.css` `.status-row` | Messaggi e stati piu specifici | Errore API conserva dati precedenti; messaggio sparisce/si aggiorna correttamente | Simulare offline o endpoint fallito | `node --check script.js` | medio | M |
| M1-05 | Accessibilita base | Rendere MVP usabile | P0 | M0 | `index.html`, `css/style.css`, `script.js` se serve | Focus visibile, touch target, aria coerente esistente | Tab order chiaro; controlli principali >=44px; niente overlap | Tastiera e mobile | `node --check script.js` se JS cambia | medio | S |
| M2-01 | Deploy statico | Pubblicare MVP | P0 | M1 completata, hosting scelto | Cloudflare Pages o provider | Config no-framework | Homepage HTTPS funzionante | Browser + mobile | n/a | medio | S |
| M2-02 | Homepage SEO minima | Migliorare share/base SEO | P1 | M1 | `index.html`, `robots.txt`, `sitemap.xml` | Title, meta description, canonical, Open Graph, robots e sitemap homepage-only | View source contiene metadata; sitemap include solo homepage | Condivisione/social preview se possibile | n/a | basso | S |
| M2-03 | Performance baseline | Misurare prima di crescere | P1 | M2-01 | sito pubblico | Nessuna modifica o microfix | Lighthouse/PageSpeed registrati | Desktop/mobile PSI | n/a | basso | XS |
| M3-01 | Keyboard autocomplete | Search piu accessibile | P1 | M1 | `script.js`, `index.html`, `css/style.css` | Active index, Enter/Escape/frecce | Mouse e tastiera equivalenti | `milano`, `roma`, `tokyo` | `node --check script.js` | medio | M |
| M3-02 | Omonimie e recenti | Ridurre scelta sbagliata | P2 | M3-01 | `script.js` `placeSubtitle()`, `renderRecent()` | Contesto piu chiaro dove serve | Omonimie distinguibili; recenti non duplicati | Query ambigue, reload | `node --check script.js` | basso | S |
| M3-03 | Geoloc messaging | Migliorare permessi/fallback | P2 | M1 | `script.js` `useCurrentPosition()`, `index.html` se microcopy | Messaggi negato/errore piu chiari | Denied e timeout recuperabili | Blocca/consenti posizione | `node --check script.js` | basso | S |
| M4-01 | SEO gate | Decidere prima di costruire | P0 | MVP pubblicato | `docs/` | Decisione scritta | Branch A/B scelto | Review prodotto | n/a | basso | XS |
| M4-02 | Catalogo citta | Base per SEO vera | P1 | M4-01 Branch B | TBD after architecture decision | Lista 20-50 citta | Slug, regione, coordinate, canonical definiti | Review manuale | TBD | medio | M |
| M4-03 | Static generation spike | Validare approccio SEO soft | P1 | M4-02 | TBD after architecture decision | Una o poche pagine citta generate staticamente | View source mostra title/H1/canonical city-specific | View source, URL diretto | TBD | medio | M |
| M5-01 | Consent decision | Evitare tracking improprio | P0 | MVP pubblicato | TBD | Nessun codice finche non approvato | Decisione CMP/no GA4 documentata | Review | n/a | medio | XS |
| M5-02 | GA4 eventi minimi | Misurare funnel base | P1 | M5-01 approvata | `script.js`, `index.html` | Tag + eventi minimi | DebugView ok, no duplicati, no coordinate | Search/geoloc/forecast | `node --check script.js` | medio | M |
| M6-01 | Ads policy gate | Evitare monetizzazione dannosa | P0 | traffico + baseline | `docs/` | Audit placement | Slot consentito o rimandato | Review | n/a | medio | XS |
| M6-02 | Primo slot ads | Monetizzare con cautela | P2 | M6-01 approvato | `index.html`, `css/style.css`, `script.js` se lazy | Solo `after_weather_content` | No CLS evidente, etichetta, non vicino a controlli | Mobile/desktop + PSI | `node --check script.js` | alto | M |

## 5. Recommended first implementation batch

Batch 1, massimo cinque task:

1. `M1-01` Hourly utile o empty state chiaro.
2. `M1-02` Hero desktop compatta.
3. `M1-03` Daily forecast leggibile, active/focus/touch.
4. `M1-04` Loading/error migliori.
5. `M1-05` Accessibilita base.

Perche questo batch e sicuro:

- Usa solo file gia centrali: `script.js`, `css/style.css`, `index.html`.
- Non cambia architettura.
- Non aggiunge dipendenze.
- Migliora la prima impressione pubblica.
- Non crea debito SEO/ads/analytics.

Verifica batch:

- `node --check script.js`.
- Desktop 1280px.
- Mobile 390px e, se possibile, 320px.
- Query `milano`, `milan`, `roma`, `tokyo`.
- Click/tastiera su daily forecast.
- Geoloc consentita e negata.
- Simulazione errore rete/provider.

Cosa non includere:

- Route citta.
- Meta dinamici per citta.
- GA4 o `trackEvent()`.
- Ads o placeholder.
- Nuovi file di build/config.

Effort stimato complessivo: M, circa 1-2 giornate di lavoro effettivo con verifica manuale.

## 6. SEO decision gate

### La codebase attuale consente pagine SEO citta valide?

No. La risposta iniziale e sempre `index.html` generico; il meteo e la localita arrivano dopo JavaScript e fetch.

### Basta aggiungere route client-side?

No per SEO. Serve solo per condivisione/UX. Una route client-side puo essere utile, ma non deve essere venduta come soluzione per query locali competitive.

### Serve SSG/SSR?

Per SEO locale vera serve almeno prerender/static generation. SSR non e necessario per il side-project se il meteo fresco resta client-side.

### Raccomandazione finale

Per prima release: nessuna SEO citta. Pubblicare homepage/app con metadata, canonical, `robots.txt` e sitemap homepage-only. La fase successiva approvata e una static generation soft con 20-50 citta curate, partendo da uno spike piccolo.

### Decisioni chiuse e richieste

- Chiuso: prima release homepage-only.
- Chiuso: dominio canonical `https://chetempofa.com/`.
- Chiuso: SEO futura via static generation soft.
- Da decidere: catalogo iniziale di 20-50 citta.
- Da decidere: momento in cui fare lo spike static generation.

## 7. Monetization decision gate

### Quando ha senso attivare annunci

Solo dopo:

- MVP pubblico stabile;
- performance baseline;
- scelta consenso/analytics;
- traffico sufficiente;
- policy audit.

### Metriche minime prima degli ads

- page views/city views;
- search success rate;
- uso forecast;
- error rate API;
- Lighthouse/PageSpeed e, se disponibile, CWV field data.

### Slot predisporre ora?

Nessuno visibile nel batch 1. Documentare solo la regola futura: primo slot `after_weather_content`.

### Placement vietati

- Sopra hero.
- Tra search e risultato.
- Dentro daily/hourly.
- Vicino a bottoni.
- Sticky mobile.

### Come evitare danni al brand

Un solo slot, sotto il meteo, etichettato, spazio riservato, lazy-load, nessun click tracking custom.

## 8. Definition of Done globale

### MVP pubblico

- Meteo corrente leggibile su mobile e desktop.
- Search, geoloc, recenti, daily e hourly funzionano.
- Errori API non rompono la UI.
- `node --check script.js` passa.
- Nessun testo sovrapposto a 320/390/768/1280px.
- Nessuna nuova dipendenza.
- Deploy HTTPS statico.

### Fase SEO

- Decisione Branch B approvata.
- Catalogo citta curato.
- HTML iniziale city-specific verificabile con view source.
- Canonical e sitemap coerenti.
- Nessuna route client-side presentata come SEO sufficiente.

### Fase analytics

- Consenso deciso.
- Eventi minimi e non duplicati.
- Nessuna coordinata precisa o query raw non necessaria.

### Fase ads

- Policy audit fatto.
- Slot sotto il contenuto meteo.
- CLS controllato.
- Ads distinguibili dal contenuto.

## 9. Suggested subsequent Codex prompts

Milestone 0:

> Esegui solo una baseline del progetto `chetempofa`: `node --check script.js`, controllo desktop/mobile, screenshot o note visuali, e una checklist manuale breve. Non modificare codice.

Milestone 1:

> Implementa solo il batch 1: hourly utile/empty state, hero desktop compatta, daily forecast leggibile, loading/error migliori e accessibilita base. Non aggiungere route, GA4, ads, dipendenze o build step.

Milestone 2:

> Prepara il deploy statico pubblico no-framework su Cloudflare Pages per lo stack attuale. Non introdurre build step. Documenta impostazioni, preview, HTTPS e verifica performance base.

Milestone 3:

> Migliora solo la search: keyboard navigation dei suggerimenti, ARIA combobox/listbox, omonimie piu chiare e stati errore suggerimenti. Mantieni tutto vanilla.

Milestone 4:

> Prepara lo spike SEO soft: proponi un catalogo iniziale di 20-50 citta e un modo minimo per generare una o poche pagine statiche city-specific. Non introdurre una migrazione framework finche lo spike non e approvato.

Milestone 5:

> Dopo approvazione consenso, implementa GA4 minimo con eventi city view, search, suggestion, geolocation result, forecast day e API error. Non inviare coordinate o query raw non necessarie.

Milestone 6:

> Dopo traffico e policy audit, progetta un solo slot ads `after_weather_content`. Non inserire AdSense reale finche non approvato.
