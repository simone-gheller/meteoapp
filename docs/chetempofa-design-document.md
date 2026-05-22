# chetempofa design document

## 1. Executive summary

`chetempofa` e una SPA meteo italiana minimale in HTML, CSS e JavaScript vanilla.
La base visuale e gia buona: veloce, leggibile, senza account, backend, build step o chiavi API.
La prima release pubblica deve restare lean: migliorare affidabilita percepita, mobile, stati e accessibilita, poi pubblicare staticamente su Cloudflare Pages.
Non serve migrare framework per l'MVP.
Non serve introdurre ads, GA4 reale o route SEO nella prima release.
La promessa da preservare e "meteo senza sbatti": meteo corrente chiaro prima di qualsiasi altra cosa.
La SEO locale e una fase separata gia orientata a una static generation soft: partire da poche pagine citta curate, non da una migrazione grande.
La monetizzazione e una fase ancora successiva: prima traffico, misure e policy review, poi al massimo uno slot non invasivo.
Decisione principale: pubblicare bene una SPA statica pulita prima di costruire una piattaforma.

## 2. Current state audit

### Stack e struttura reale

- Framework: nessuno. `index.html` carica direttamente `css/style.css` e `script.js`.
- Bundler/build step: nessuno. Non esiste `package.json`.
- Router: assente. La citta non vive nell'URL.
- Styling: CSS vanilla in `css/style.css`, custom properties, grid e media query a `980px`, `680px`, `420px`.
- UI/icon set: nessuna libreria UI; icone inline SVG e asset locali in `icons/animated/` e `icons/static/`.
- Stato: oggetto globale `state` in `script.js` con `place`, `weather`, `selectedDay`, `recent`.
- API: Open-Meteo geocoding, Open-Meteo forecast, BigDataCloud reverse geocoding.
- Variabili ambiente/segreti: assenti.
- Deployment configurato: assente.
- Test: nessuna suite; `node --check script.js` passa.
- Analytics: assenti.
- Documentazione: `README.md` e `agents.md`.

### Architettura UI esistente

- Header/search: `.topbar`, `.brand`, `#searchForm`, `#citySearch`, `#suggestions`, `#locationButton` in `index.html`.
- Hero meteo corrente: `.current-section` con citta, temperatura, condizione, advice, icona, alba/tramonto/UV.
- Recenti: `.recent-section`, `#recentCities`, `renderRecent()` in `script.js`.
- Dettagli meteo: `#metricsGrid`, `renderMetrics()`, metriche percepita/umidita/vento/pioggia/nuvole.
- Forecast giornaliero: `.forecast-section`, `#dailyList`, `renderDaily()`, 7 card.
- Hourly: `.timeline-section`, `#hourlyStrip`, `renderHourly()`, fino a 12 ore del giorno selezionato.
- Footer: `.app-footer` con fonte dati, posizione, timezone, aggiornamento e nota privacy.

### Data flow reale

- `boot()` legge `chetempofa-place`; se manca, carica Milano.
- La ricerca submit chiama `searchPlaces(query, 1)` e carica il primo risultato.
- L'autocomplete chiama `searchPlaces(query, 5)` con debounce a 240ms.
- `searchPlaces()` chiede fino a 20 risultati a Open-Meteo e li ordina con `rankPlaces()`.
- `loadWeather()` chiama Open-Meteo forecast, salva il place, resetta `selectedDay`, renderizza tutto.
- La geolocalizzazione usa `navigator.geolocation`, reverse geocode BigDataCloud e fallback "Posizione GPS".
- `localStorage`: `chetempofa-place` e `chetempofa-recent`.
- Nota tecnica: `formatDateTime(value, _timezone, options)` ignora il timezone passato; per citta lontane puo creare ambiguita.

### Stato UX, SEO, analytics, deploy

- Responsive buono come base, ma daily forecast e troppo compresso su mobile.
- Hourly puo sembrare vuoto o povero, soprattutto a fine giornata.
- Loading/error sono funzionali ma poco rassicuranti.
- Autocomplete e cliccabile ma non e ancora una combobox tastiera/ARIA completa.
- SEO attuale: homepage con title/description/canonical/social preview base, `robots.txt` e `sitemap.xml` homepage-only; nessuna pagina citta.
- Tracking: nessun evento.
- Deploy: la natura statica rende Cloudflare Pages o hosting equivalente una scelta semplice, ma non e configurato nel repo.

### Punti forti

- Stack estremamente semplice e adatto a side-project.
- UI riconoscibile, italiana, non corporate.
- Nessun backend o secret.
- Dipendenze zero.
- Fonti dati pubbliche e gratuite.

### Debolezze con impatto prodotto

- Nessun URL per citta: niente condivisione locale, niente SEO citta.
- Stati incompleti: nei fallimenti API/geoloc l'app sembra meno affidabile.
- Forecast mobile fragile: rischio lettura difficile e tap piccoli.
- Hourly non abbastanza utile: la sezione promette piu di quanto mostra in alcuni casi.
- Nessuna misurazione: non si sa se utenti cercano, usano geoloc o leggono forecast.
- Ads non progettati: inserirli dopo senza regole rischia CLS e perdita di fiducia.

## 3. Product positioning e principi di design

### Target utenti

- Utenti italiani mobile-first che vogliono sapere subito che tempo fa.
- Utenti ricorrenti che controllano poche citta senza account.
- Utenti da ricerca organica locale, ma solo nella fase SEO successiva.

### Use case primario

"Cerco una citta e capisco in pochi secondi temperatura, pioggia e prossime ore."

### Differenziatore

Meno pesante dei portali meteo classici: niente interfaccia affollata, niente ansia da banner, niente account.

### Principi non negoziabili

- Meteo corrente prima di tutto.
- Nessuna pubblicita sopra o dentro l'informazione essenziale.
- Mobile first.
- UI veloce e leggibile.
- Tono umano ma asciutto.
- Solo Celsius.
- Nessun account.
- Nessun backend per MVP.
- Nessun invio di coordinate precise ad analytics.

## 4. Information architecture target

### MVP desktop

1. Header: brand, search, usa posizione.
2. Status row solo quando serve.
3. Hero meteo corrente.
4. Dettagli meteo.
5. Forecast 7 giorni.
6. Hourly forecast.
7. Footer leggero.

Above the fold desktop: header, hero corrente e inizio metriche. Nessun annuncio.

### MVP mobile

1. Brand.
2. Search full-width.
3. Usa posizione.
4. Status row.
5. Hero corrente.
6. Dettagli principali.
7. Forecast 7 giorni leggibile.
8. Hourly forecast.
9. Footer.

Above the fold mobile: search, citta, temperatura, condizione, advice breve. Nessun annuncio.

### Fase SEO

Solo dopo decisione architetturale:

- contenuto testuale breve sotto dati meteo;
- breadcrumb/canonical;
- pagine citta statiche o prerenderizzate;
- sitemap da catalogo citta.

### Fase monetizzazione

Nessun placeholder ads nella prima release. Gli spazi vuoti "futuri" peggiorano una UI minimale. Quando si attivano ads, progettare un solo slot dopo il contenuto meteo principale.

## 5. UX flows

### Ricerca citta

MVP:

1. L'utente digita almeno 2 caratteri.
2. I suggerimenti mostrano massimo 5 risultati.
3. Ogni suggerimento mostra nome e contesto `Regione, Provincia, Paese`.
4. Click/tap carica la citta.
5. Submit senza selezione carica il miglior risultato.
6. Errore provider: messaggio chiaro e dati precedenti conservati se presenti.
7. La citta entra nelle recenti solo dopo meteo caricato.

Miglioramento post-MVP:

- frecce su/giu, Enter, Escape e stato attivo;
- `aria-expanded`, `aria-activedescendant`, option id stabili;
- gestione piu chiara delle omonimie.

Non fare in MVP: route pubbliche citta, sitemap citta, contenuto SEO generato client-side.

### Geolocalizzazione

MVP:

1. Click su "Usa posizione".
2. Il browser chiede permesso.
3. Se accordato: reverse geocode, poi meteo.
4. Se negato o fallisce: messaggio recuperabile e invito alla search.
5. Nessun invio di latitudine/longitudine ad analytics.

Miglioramento post-MVP:

- microcopy privacy piu visibile;
- distinguere negato, timeout e reverse geocode fallito.

### Navigazione forecast

MVP:

- Le 7 card restano bottoni.
- Stato selezionato evidente anche senza affidarsi solo al colore.
- Selezione giorno aggiorna hourly.
- Mobile: card leggibili e touch target adeguati; carousel solo se la griglia non regge.
- Hourly: se non ci sono ore utili, mostrare empty state, non una sezione muta.

### Condivisione / ritorno

MVP:

- ritorno utente via `localStorage`;
- recenti nel browser.

Fase successiva:

- URL condivisibili client-side, esplicitamente non venduti come SEO;
- pagine SEO vere solo con prerender/static generation.

## 6. Visual design evolution

### Cosa mantenere

- Brand `chetempofa` e payoff "meteo senza sbatti".
- Palette crema, verde petrolio, giallo caldo, rosso temperatura, blu pioggia.
- Bordi a 8px o meno.
- Icone meteo locali.
- Layout pulito.

### Cosa semplificare per MVP

- Hero desktop: ridurre altezza percepita senza cambiare struttura.
- Hourly: rendere la sezione utile o onesta quando i dati sono pochi.
- Footer: meno rumore, stessa informazione essenziale.
- Daily mobile: evitare testo microscopico e tap difficili.
- Non aggiungere decorazioni, nuove palette, nuove icone o animazioni.

### Sistema visuale consigliato

- App max-width: mantenere 1180px.
- Gap sezioni: 16-24px.
- Gap card/liste: 8-12px.
- Touch target: minimo 44px.
- Metriche: 5 colonne desktop, 3 tablet, 2 mobile, 1 sotto 420px.
- Daily: 7 colonne desktop; su mobile decidere tra griglia compatta leggibile o carousel.
- Hourly: card stabili, scroll orizzontale, niente cambio layout al caricamento.
- Shadow: leggere, non aumentare profondita.

## 7. Accessibility requirements

MVP verificabile:

- Focus visibile su input, search button, location button, recenti e day card.
- Touch target minimo 44px sui controlli principali.
- Loading/error dentro `#status` con `aria-live`.
- Immagini decorative con `alt=""`; icone informative con testo o label.
- Stato day selezionato chiaro con `aria-pressed`.
- Nessun testo che si sovrappone a 320px, 390px, 768px, 1280px.

Post-MVP:

- combobox autocomplete completa;
- test screen reader;
- `prefers-reduced-motion` se si aumentano animazioni.

## 8. SEO strategy

Fonti ufficiali verificate: Google Search esegue JavaScript ma segnala limiti di crawling/rendering; raccomanda URL accessibili, title distinti, canonical coerenti, sitemap come hint e dati strutturati rappresentativi del contenuto visibile. Riferimenti: [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [fix JavaScript issues](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript), [title links](https://developers.google.com/search/docs/appearance/title-link), [SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

### Opzione A: MVP statico attuale

Cosa fare:

- title, meta description, canonical e social preview base per la homepage;
- `robots.txt` per consentire crawling;
- `sitemap.xml` homepage-only;
- nessuna sitemap citta;
- nessuna promessa SEO locale.

Stato: approvato per la prima release. Questa opzione non richiede router, framework, build step o backend.

Costi:

- Complessita XS/S.
- Compatibilita massima.
- SEO: brand/homepage, non query locali.
- Raccomandata per prima release pubblica.

### Opzione B: URL condivisibili client-side

Cosa fare:

- leggere una citta da URL o query param;
- aggiornare `history.pushState`;
- gestire back/forward e not found;
- aggiornare title via JS.

Limiti:

- utile per UX e condivisione;
- non sufficiente per "meteo Milano oggi" in modo serio;
- non generare sitemap massiva di URL che servono lo stesso HTML generico.

Costi:

- Complessita M.
- Da fare solo se la condivisione diventa prioritaria dopo MVP.

### Opzione C: SEO locale serio

Strada lean consigliata:

- generare pagine statiche da un catalogo citta curato;
- ogni pagina deve avere HTML iniziale con title, H1, canonical, testo breve e link interni;
- il meteo fresco resta client-side;
- iniziare con 20-50 citta, non 500.
- trattarla come spike soft dopo MVP: una o poche pagine generate prima di investire in un sistema completo.

Tecnologia:

- prima valutare un generatore statico minimo o script dedicato;
- Eleventy/Astro sono opzioni se la manutenzione del template cresce;
- Next.js/SSR/Worker non sono raccomandati per il side-project finche non c'e un bisogno reale.

URL:

- canonical consigliato: `/meteo/{regione}/{citta}`;
- alias `/meteo/{citta}` solo se gestito con redirect/canonical;
- pagine `/domani` o `/weekend` non prima di avere dati/contenuto davvero distinti.

Template:

- Title: `Meteo {Citta}: oggi e prossimi giorni | chetempofa`
- Meta: `Previsioni per {Citta}: temperatura, pioggia, vento e prossime ore. Dati Open-Meteo, senza account.`
- H1: `Meteo {Citta}`
- Contenuto testuale: 60-120 parole utili, non keyword stuffing.
- Structured data: al massimo `WebSite` e `BreadcrumbList`; evitare markup meteo non supportato.

## 9. Advertising and monetization design

Fonti ufficiali verificate: AdSense supporta unita responsive, ma le policy vietano layout che inducano click accidentali o facciano sembrare gli annunci contenuto/navigazione. Riferimenti: [responsive ad units](https://support.google.com/adsense/answer/9183362) e [ad placement policies](https://support.google.com/adsense/answer/1346295).

### MVP

Nessun annuncio e nessun placeholder visibile.

Motivo: un sito meteo minimale senza traffico deve prima guadagnare fiducia. Spazi vuoti o "pubblicita futura" rovinano la promessa.

### Soft monetization futura

Un solo slot iniziale:

| Slot ID | Posizione | Breakpoint | Spazio riservato | Regola |
|---|---|---:|---|---|
| `after_weather_content` | Dopo hourly forecast e prima del footer/testo finale | tutti | desktop min-height 90; mobile min-height 100 | lazy-load, etichetta "Pubblicita", non vicino a controlli |

### Balanced monetization futura

Solo se traffico, performance e policy lo consentono:

- secondo slot sotto eventuale contenuto SEO, non tra card meteo;
- nessuno sticky mobile;
- nessuno slot nella hero;
- nessuno slot tra search e risultato.

### Vietato

- Ads sopra il meteo corrente.
- Ads tra daily card e hourly se interrompono il task meteo.
- Ads dentro caroselli/card.
- Ads accanto a bottoni molto cliccati.
- Annunci con stile simile alle card meteo.
- Click tracking custom.

## 10. Analytics measurement plan

Fonti ufficiali verificate: GA4 raccomanda eventi standard quando adatti e custom events solo quando servono; per siti in contesto europeo serve una scelta esplicita su consenso/tag. Riferimenti: [recommended events](https://support.google.com/analytics/answer/9267735), [custom events](https://support.google.com/analytics/answer/12229021), [consent mode](https://support.google.com/analytics/answer/14009635).

### MVP

Nessuna GA4 reale prima della decisione consenso. Non serve una astrazione eventi nel primo batch UX.

### Eventi minimi quando GA4 viene approvato

| Evento | Trigger | Parametri | Valore | Privacy |
|---|---|---|---|---|
| `weather_city_viewed` | Meteo caricato | `city_slug`, `country_code`, `source` | vista principale | no coordinate |
| `city_search_submitted` | Submit search | `query_length`, `result_count` | domanda utente | evitare query raw di default |
| `city_suggestion_selected` | Suggerimento scelto | `city_slug`, `rank` | qualita autocomplete | no coordinate |
| `geolocation_used` | Risultato geoloc | `result`: `allowed`, `denied`, `error` | adozione/fallimenti | no lat/lon/accuracy |
| `forecast_day_selected` | Click day card | `day_index` | engagement forecast | no dati sensibili |
| `weather_api_error` | Fetch fallito | `api_name`, `phase`, `status_code`, `has_stale_weather` | affidabilita | non inviare URL completo |

Rimandare:

- `forecast_section_viewed` e `hourly_section_viewed`: scroll tracking non necessario all'inizio.
- `web_vital_measured`: utile dopo deploy pubblico o GA4 approvato.
- `ad_slot_viewed`: solo quando esistono ads reali.

## 11. Performance and Core Web Vitals

Fonti ufficiali verificate: Web.dev indica target Core Web Vitals a p75: LCP entro 2.5s, INP 200ms o meno, CLS 0.1 o meno. Riferimento: [Web Vitals](https://web.dev/articles/vitals).

MVP:

- mantenere system font;
- non aggiungere dipendenze JS;
- evitare layout shift su hero, icone e card;
- dimensionare immagini/card;
- non introdurre ads o tag analytics pesanti prima della baseline;
- verificare Lighthouse/PageSpeed dopo deploy.

Target futuro:

- LCP p75 <= 2.5s;
- INP p75 <= 200ms;
- CLS p75 <= 0.1.

## 12. Deployment architecture

Fonti ufficiali verificate: Cloudflare Pages supporta siti statici senza framework, build command custom/assente, preview deployment e custom domain. Riferimenti: [Static HTML guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/), [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

### MVP frontend-only

- Deploy dei file attuali: `index.html`, `css/`, `script.js`, `icons/`.
- Nessun build command applicativo.
- Cloudflare Pages: no framework, root come output finche `index.html` resta in root; build command vuoto o `exit 0` secondo setup.
- Custom domain `chetempofa.it` dopo conferma.
- Preview deploy prima di produzione.

### Quando introdurre Worker/API proxy

Non per MVP. Valutarlo solo se:

- serve una chiave privata;
- serve caching server-side;
- serve normalizzare provider;
- serve SSR reale.

## 13. Decisions, open questions and non-goals

### Decisioni raccomandate

- Prima release: static MVP su Cloudflare Pages, canonical `https://chetempofa.it/`, senza route SEO, ads o GA4 reale.
- Primo batch: solo UX visibile e accessibilita base.
- SEO citta: fase successiva con static generation soft da 20-50 citta curate.
- Ads: non predisporre placeholder visibili ora.
- Analytics: progettare ma non attivare senza consenso.

### Decisioni chiuse

- GA4 rimandato a una release successiva.
- Hosting MVP: Cloudflare Pages.
- Dominio canonical: `https://chetempofa.it/`, con `www` da redirigere al dominio nudo.
- Prima release: nessun ads.
- SEO futura: static generation soft, non route client-side vendute come SEO.

### Decisioni ancora da approvare

- CMP/consenso, se si attiva GA4.
- Momento esatto in cui iniziare la fase SEO citta.
- Catalogo iniziale citta per SEO: quali 20-50 localita.
- Timing monetizzazione.

### Dubbi tecnici emersi

- Timezone formatter ignora timezone.
- GPS salva coordinate in localStorage per la posizione corrente.
- Hourly puo essere corto/vuoto.
- Daily mobile e compresso.

### Non-goals MVP

- Login/account.
- Backend proprietario.
- Migrazione framework.
- Route SEO pubbliche.
- Sitemap citta.
- GA4 senza consenso.
- Ads/AdSense.
- Radar, mappe, notifiche, app mobile.
- Fahrenheit, pressione, refresh manuale.
