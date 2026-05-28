# chetempofa release plan

Questo documento divide l'implementazione in release piccole, ciascuna spezzata in phases verificabili.

Principio guida: pubblicare prima una SPA statica solida, poi aggiungere search hardening, SEO city pages, GA4 e monetizzazione solo quando servono davvero.

## Release 0 - Foundation e SEO homepage minima

Stato: completata in `v0.1`.

Obiettivo: preparare la base pubblicabile senza cambiare architettura.

Scope:

- documentazione prodotto/implementazione;
- metadata homepage;
- canonical `https://chetempofa.com/`;
- `robots.txt`;
- `sitemap.xml` homepage-only.

Non-goals:

- route citta;
- sitemap citta;
- GA4;
- ads;
- build step;
- framework.

### Phase 0.1 - Product docs

File:

- `docs/chetempofa-design-document.md`
- `docs/chetempofa-implementation-plan.md`
- `docs/chetempofa-release-plan.md`

Acceptance:

- decisioni chiuse e aperte sono esplicite;
- MVP, SEO, analytics e ads sono separati;
- nessuna proposta richiede React/Vite/router non presenti.

### Phase 0.2 - Homepage metadata

File:

- `index.html`
- `robots.txt`
- `sitemap.xml`

Acceptance:

- `index.html` contiene title, meta description, canonical, Open Graph/Twitter base;
- `robots.txt` punta alla sitemap;
- `sitemap.xml` contiene solo `https://chetempofa.com/`;
- `xmllint --noout sitemap.xml` passa.

### Phase 0.3 - Baseline check

Comandi:

- `node --check script.js`

Acceptance:

- JS syntax valida;
- app apribile localmente;
- nessuna dipendenza nuova.

## Release 1 - Public MVP UX hardening

Stato: completata in `v1.0`.

Obiettivo: rendere l'app abbastanza solida da andare online come MVP pubblico.

Scope:

- hourly forecast utile o empty state chiaro;
- hero desktop piu compatta;
- daily forecast leggibile su mobile;
- stati loading/error piu affidabili;
- accessibilita base.

Non-goals:

- GA4;
- route citta;
- static generation;
- ads;
- nuove dipendenze.

### Phase 1.1 - Baseline visuale e regressione

File probabili:

- nessuna modifica app;
- eventuale checklist in `docs/`.

Acceptance:

- screenshot o note per desktop 1280px, tablet 768px, mobile 390px e 320px;
- checklist manuale copre search, geoloc, daily, hourly, recenti, errori;
- `node --check script.js` passa.

### Phase 1.2 - Hourly forecast

File probabili:

- `script.js`
- `css/style.css`

Acceptance:

- `renderHourly()` non produce una sezione vuota muta;
- per ogni giorno selezionato appaiono card orarie o un messaggio chiaro;
- oggi gestisce bene fine giornata;
- mobile mantiene scroll orizzontale usabile;
- `node --check script.js` passa.

### Phase 1.3 - Hero e daily forecast

File probabili:

- `css/style.css`
- `script.js` solo se serve markup/stato.

Acceptance:

- a 1280px si vede la hero e almeno l'inizio delle metriche;
- la hero resta leggibile su mobile;
- daily forecast ha stato selezionato evidente;
- day card usabili a 320px e 390px;
- focus/touch non causano layout shift.

### Phase 1.4 - Loading, error e accessibilita base

File probabili:

- `script.js`
- `css/style.css`
- `index.html` solo per piccoli attributi/label.

Acceptance:

- errore API non cancella dati gia visibili;
- messaggi in `#status` sono chiari e recuperabili;
- focus visibile su input, search, posizione, recenti e day card;
- controlli principali hanno target almeno 44px;
- nessun testo sovrapposto a 320px, 390px, 768px, 1280px.

### Phase 1.5 - QA release

Comandi:

- `node --check script.js`

Manual test:

- query `milano`;
- query `milan`;
- query `roma`;
- query `tokyo`;
- geoloc consentita;
- geoloc negata;
- selezione di tutti i 7 giorni;
- mobile 390px e 320px.

Release gate:

- tutte le acceptance di Release 1 passano;
- nessun file di build/package aggiunto;
- nessun tracking o ads introdotto.

## Release 2 - Static public deploy

Stato: completata in `v2.0` per la parte repository. Il collegamento effettivo Cloudflare/DNS va completato o verificato in dashboard.

Obiettivo: pubblicare la SPA statica su Cloudflare Pages con dominio canonical.

Scope:

- Cloudflare Pages no-framework;
- dominio `chetempofa.com`;
- redirect `www` verso dominio nudo;
- smoke test produzione;
- performance baseline.

Non-goals:

- Worker;
- backend;
- SSR;
- GA4;
- ads;
- city pages.

### Phase 2.0 - Repository domain target

File:

- `index.html`
- `robots.txt`
- `sitemap.xml`
- `docs/chetempofa-design-document.md`
- `docs/chetempofa-implementation-plan.md`
- `docs/chetempofa-release-plan.md`

Acceptance:

- canonical homepage punta a `https://chetempofa.com/`;
- Open Graph URL punta a `https://chetempofa.com/`;
- `robots.txt` punta alla sitemap `.com`;
- `sitemap.xml` contiene solo `https://chetempofa.com/`;
- i piani non citano piu il vecchio dominio come destinazione.

### Phase 2.1 - Cloudflare Pages setup

Configurazione attesa:

- framework preset: none / static;
- build command: vuoto o no-op secondo dashboard;
- output directory: root del repository finche `index.html` resta in root.

Acceptance:

- preview deploy raggiungibile;
- nessun build command inventato;
- `index.html`, `css/`, `script.js`, `icons/`, `robots.txt`, `sitemap.xml` serviti correttamente.

### Phase 2.2 - Domain setup

Acceptance:

- `https://chetempofa.com/` serve l'app;
- `www.chetempofa.com` redirige a `https://chetempofa.com/`;
- canonical in HTML resta coerente;
- sitemap usa dominio canonical.

### Phase 2.3 - Production smoke test

Manual test:

- carico iniziale Milano o localita salvata;
- search `milano`, `roma`, `tokyo`;
- geoloc negata;
- daily e hourly;
- mobile browser reale se disponibile.

Acceptance:

- nessun errore console bloccante;
- API meteo/geocoding raggiungibili;
- PageSpeed/Lighthouse baseline annotata.

## Release 3 - Search hardening

Stato: completata in `v3.0`.

Obiettivo: rendere la ricerca adatta a un sito pubblico, senza introdurre route.

Scope:

- keyboard navigation suggerimenti;
- ARIA combobox/listbox;
- suggerimenti loading/error;
- omonimie piu leggibili;
- recenti piu utili se necessario.

Non-goals:

- URL citta;
- SEO city pages;
- GA4;
- ads.

### Phase 3.1 - Autocomplete keyboard

File probabili:

- `script.js`
- `index.html`
- `css/style.css`

Acceptance:

- freccia giu/su cambia suggerimento attivo;
- Enter seleziona suggerimento attivo;
- Escape chiude la lista;
- Tab non intrappola il focus;
- click/tap resta funzionante.

### Phase 3.2 - Autocomplete accessibile

Acceptance:

- input espone `aria-expanded`;
- lista e opzioni hanno id/ruoli coerenti;
- suggerimento attivo e comunicabile con `aria-activedescendant`;
- stato "nessun risultato" e comprensibile.

### Phase 3.3 - Omonimie, errori, recenti

Acceptance:

- suggerimenti mostrano contesto sufficiente;
- provider error non blocca il form;
- recenti non duplicano la citta corrente;
- recenti restano solo in `localStorage`.

## Release 4 - SEO city pages soft

Stato: completata in `v4.0`.

Obiettivo: validare static generation senza trasformare subito il progetto in una piattaforma.

Scope iniziale:

- catalogo 20-50 citta italiane;
- spike con una o poche pagine generate;
- HTML city-specific visibile in view source;
- meteo fresco ancora client-side.

Non-goals:

- 500+ pagine;
- SSR;
- Worker;
- Next.js;
- pagine `/domani` o `/weekend`;
- ads.

### Phase 4.1 - Catalogo citta

Deliverable:

- file o documento con 20-50 citta iniziali;
- per ogni citta: nome, regione, slug, latitudine, longitudine, country code, canonical path.

Acceptance:

- omonimie principali risolte;
- URL canonical in formato `/meteo/{regione}/{citta}`;
- catalogo revisionato manualmente.

### Phase 4.2 - Static generation spike

Opzioni da valutare:

- script statico minimale;
- Eleventy se serve template piu mantenibile;
- Astro solo se il template cresce.

Acceptance:

- almeno una pagina citta generata staticamente;
- `view-source` mostra title, meta description, H1, canonical e testo city-specific;
- pagina carica il meteo fresco client-side;
- nessuna route client-side viene presentata come SEO sufficiente.

### Phase 4.3 - Estensione controllata

Acceptance:

- sitemap citta generata solo per pagine statiche reali;
- 20-50 pagine generate;
- deploy statico resta semplice;
- performance non peggiora in modo significativo.

## Release 5 - Analytics readiness soft

Stato: completata in `v5.0`.

Obiettivo: preparare la misurazione prodotto senza attivare GA4, senza caricare script esterni e senza inviare dati.

Decisione:

- Release 5A soft approvata;
- GA4 reale rimandato a una release successiva;
- consenso/CMP ancora da decidere prima di qualunque tracking in produzione.

Scope completato:

- wrapper `trackEvent()` disattivato di default;
- allowlist dei parametri evento;
- hook privacy-safe sui principali eventi prodotto;
- nessuna query raw;
- nessuna latitudine, longitudine o accuracy;
- nessun Measurement ID;
- nessun tag GA4.

Eventi predisposti:

- `weather_city_viewed`;
- `city_search_submitted`;
- `city_suggestion_selected`;
- `geolocation_used`;
- `forecast_day_selected`;
- `weather_api_error`.

Acceptance:

- produzione non invia analytics;
- eventi futuri passano da una sola funzione;
- i payload ammessi sono documentati nel codice;
- `node --check script.js` passa.

## Release 5B - GA4 e misurazione reale

Obiettivo: misurare l'uso reale senza inviare dati sensibili.

Prerequisito:

- decisione CMP/consenso approvata.
- Measurement ID GA4 disponibile.

Scope:

- GA4 minimo;
- eventi prodotto essenziali;
- no coordinate precise;
- no query raw di default.

Non-goals:

- heatmap;
- session recording;
- click tracking ads;
- scroll tracking esteso nella prima iterazione.

### Phase 5.1 - Consent decision

Acceptance:

- scelta documentata: CMP, consent mode o niente GA4;
- comportamento locale/staging definito;
- produzione non invia tag prima della regola scelta.

### Phase 5.2 - Eventi minimi

Eventi:

- `weather_city_viewed`;
- `city_search_submitted`;
- `city_suggestion_selected`;
- `geolocation_used`;
- `forecast_day_selected`;
- `weather_api_error`.

Acceptance:

- eventi visibili in DebugView/Tag Assistant;
- nessun duplicato per singola azione;
- nessuna latitudine/longitudine/accuracy nei payload;
- `node --check script.js` passa.

## Release 5.1 - Public launch polish

Stato: completata in `v5.1`.

Obiettivo: sistemare i piccoli problemi emersi dopo il deploy pubblico senza aprire GA4, ads o nuove feature.

Scope completato:

- favicon SVG minimale;
- link logo verso homepage;
- redirect statici dagli alias brevi `/regione/citta/` agli URL canonici `/meteo/regione/citta/`;
- rigenerazione pagine citta e sitemap con `lastmod` aggiornato.

Non-goals:

- cambio architettura;
- GA4 reale;
- ads;
- ampliamento catalogo citta;
- modifica DNS `www`, da completare in Cloudflare dashboard.

Acceptance:

- `/lazio/roma/` redirige a `/meteo/lazio/roma/` dopo deploy Cloudflare;
- favicon raggiungibile da `/favicon.svg`;
- pagine citta mantengono canonical e dati statici;
- `node --check script.js` passa;
- `node --check tools/generate-city-pages.js` passa;
- `xmllint --noout sitemap.xml` passa.

## Release 6 - Monetization readiness

Obiettivo: valutare monetizzazione senza tradire il brand.

Prerequisiti:

- traffico minimo;
- performance baseline;
- policy audit AdSense o alternativa;
- decisione esplicita di attivazione.

Scope:

- massimo un primo slot `after_weather_content`;
- spazio riservato;
- label "Pubblicita";
- lazy-load.

Non-goals:

- ads sopra hero;
- sticky mobile;
- ads dentro card;
- ads tra search e risultato;
- click tracking custom.

### Phase 6.1 - Policy e placement review

Acceptance:

- placement non vicino a controlli interattivi;
- nessun annuncio confondibile con meteo;
- mobile mantiene meteo corrente prioritario.

### Phase 6.2 - Primo slot controllato

Acceptance:

- CLS non peggiora sensibilmente;
- slot spento facilmente se necessario;
- nessun click tracking custom;
- performance verificata dopo deploy.

## Release order summary

1. Release 0: foundation e homepage SEO minima.
2. Release 1: UX hardening per MVP pubblico.
3. Release 2: deploy statico Cloudflare Pages.
4. Release 3: search hardening.
5. Release 4: static generation soft per city pages.
6. Release 5: analytics readiness soft, senza tracking attivo.
7. Release 5.1: public launch polish.
8. Release 6: monetizzazione cauta.
9. Release 5B: GA4 reale dopo consenso e Measurement ID.

## Immediate next release

La prossima release da scegliere e una tra:

1. Release 6: monetization readiness, solo placeholder/documentazione, se si vuole preparare ads senza attivarli.
2. Release 5B: GA4 reale, solo dopo Measurement ID e decisione consenso/CMP.
3. Release 4B: estensione controllata delle city pages, se si vuole ampliare il catalogo statico.
