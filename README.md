# chetempofa

Applicazione meteo a pagina singola in HTML, CSS e JavaScript vanilla.

## Funzioni

- Ricerca città con suggerimenti.
- Meteo corrente, dettagli e previsioni a 7 giorni.
- Andamento ora per ora per il giorno selezionato.
- Atlas geografico con precipitazioni, temperatura, pressione e vento su una griglia reale di 63 punti.
- Base vettoriale OpenStreetMap via OpenFreeMap, centrata automaticamente sulla località, con strade principali, confini amministrativi, zoom e timeline fino a 12 ore.
- Toponimi locali selezionati per evitare sovrapposizioni e gerarchia stradale ottimizzata per la lettura meteo.
- Geolocalizzazione opzionale con nome località da coordinate GPS.
- Temperature in gradi Celsius e ricerche recenti.

I dati meteo arrivano da Open-Meteo direttamente dal browser, senza backend locale e senza chiave API.
La traduzione delle coordinate GPS in località usa la geocodifica inversa di BigDataCloud, anche questa senza chiave API.
La base geografica usa OpenFreeMap e MapLibre con attribuzione visibile a OpenFreeMap, OpenMapTiles e OpenStreetMap. Il livello di pioggia attuale è una previsione Open-Meteo interpolata, non un radar meteorologico osservato.

## Decisioni tecniche

- [Sorgente radar futura](docs/decisions/001-radar-source.md): decisione rimandata; Radar-DPC è il candidato primario per l'Italia, RainViewer resta un'opzione internazionale da rivalutare.
- Le risposte di ricerca, meteo, qualità dell'aria e reverse geocoding usano cache con TTL e fallback temporaneo ai dati scaduti in caso di errore. La griglia Atlas, più pesante, resta nella sola memoria della sessione.
- Le richieste meteo e Atlas obsolete vengono annullate quando cambia città o giornata. L'header distingue dati live, cache locale e modalità offline.

## Verifica

```sh
node --check script.js
node --test tests/smoke.mjs
```
