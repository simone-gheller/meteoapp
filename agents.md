# Agents

Guida rapida per agenti e collaboratori che lavorano su `chetempofa`.

## Progetto

`chetempofa` e una single-page weather app in HTML, CSS e JavaScript vanilla. Non usa build step, framework, pacchetti npm, backend o chiavi API.

La UI e in italiano, il tono e diretto e leggero, e l'app mostra solo Celsius.

## File principali

- `index.html`: struttura della pagina, header, ricerca, card meteo corrente, previsioni, ora per ora e footer.
- `css/style.css`: tutto il design responsive, stati meteo tramite `body[data-condition]`, card, suggerimenti e layout.
- `script.js`: stato app, chiamate API, ranking localita, render UI, geolocalizzazione e localStorage.
- `icons/animated/`: icone meteo usate dalla UI.
- `README.md`: descrizione utente del progetto.

## Dati e API

- Geocoding ricerca: `https://geocoding-api.open-meteo.com/v1/search`
- Previsioni: `https://api.open-meteo.com/v1/forecast`
- Reverse geocoding GPS: `https://api.bigdatacloud.net/data/reverse-geocode-client`

Queste API sono pubbliche e vengono chiamate direttamente dal browser. Non aggiungere secret nel frontend. Se in futuro si usa un provider con chiave privata, spostare la chiamata in un backend o in una funzione server-side con secret manager.

## Comportamento attuale

- Al load, l'app carica la localita salvata in `localStorage`; se non c'e, parte da Milano.
- La ricerca chiede piu risultati a Open-Meteo e poi li ordina con `rankPlaces()`.
- Il ranking privilegia match esatto sul nome, localita italiane pertinenti, popolazione e ordine originale del provider.
- I suggerimenti mostrano massimo 5 risultati con contesto `Regione, Provincia, Paese`.
- La posizione GPS viene tradotta in nome localita con BigDataCloud.
- Le chiavi `localStorage` sono `chetempofa-place` e `chetempofa-recent`.
- Le metriche correnti sono: percepita, umidita, vento, pioggia e nuvole.
- Non mostrare Fahrenheit, pressione o bottone manuale di refresh.
- I dati si aggiornano quando la pagina carica, quando si cerca una citta o quando si usa la posizione.
- Le previsioni a 7 giorni stanno in una riga; la sezione ora per ora mostra le prossime 12 ore del giorno selezionato.

## Convenzioni UI

- Testi visibili sempre in italiano: usare "Previsioni", non "Forecast".
- Brand: `chetempofa`.
- Mantenere layout pulito, denso ma leggibile, con bordi a 8px o meno.
- Usare le icone esistenti in `icons/animated/` quando possibile.
- Evitare nuove dipendenze se una soluzione vanilla e sufficiente.
- Non introdurre landing page: la prima schermata deve restare l'app meteo utilizzabile.

## Sviluppo e verifica

Per aprire l'app basta `index.html`. In alternativa si puo usare un server statico:

```sh
python3 -m http.server 8000
```

Prima di considerare finito un cambio JS:

```sh
node --check script.js
```

Per modifiche visuali, controllare almeno desktop e mobile. Per modifiche alla ricerca, provare query come `milano`, `milan`, `roma` e `tokyo`.

## Convenzione commit

Usare Conventional Commits:

```text
type(scope): summary
```

Regole:

- `type` in minuscolo.
- `scope` breve e opzionale, per esempio `ui`, `search`, `api`, `forecast`, `docs`, `style`, `icons`, `infra`.
- `summary` in inglese o italiano, ma coerente nel branch; preferire imperativo/presente.
- Tenere il titolo entro circa 72 caratteri.
- Un commit deve rappresentare un solo tema logico.
- Nel body indicare verifiche fatte, per esempio `Test: node --check script.js`.
- Non committare secret, token, file locali dell'IDE o modifiche non collegate.

Tipi consigliati:

- `feat`: nuova funzionalita utente.
- `fix`: bug fix.
- `refactor`: ristrutturazione senza cambio comportamento.
- `style`: CSS, layout, visual polish.
- `docs`: documentazione.
- `test`: test o verifiche automatizzate.
- `chore`: manutenzione, config, pulizia.

Esempi:

```text
feat(search): rank global places by relevance
fix(ui): remove stale pressure metric
style(footer): add compact app metadata
docs(project): add agent guide
```
