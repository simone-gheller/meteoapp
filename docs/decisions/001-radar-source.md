# ADR 001 — Sorgente radar

Stato: rimandata, decisione registrata il 21 ottobre 2026.

## Contesto

L'Atlas usa oggi una previsione Open-Meteo interpolata su una griglia locale. Non è un'osservazione radar. Per la futura modalità "Radar adesso" servono tasselli raster nativi, una timeline coerente e condizioni d'uso adatte alla produzione.

## Decisione

Non integrare RainViewer nella milestone corrente. Quando verrà affrontato il radar osservato, valutare Radar-DPC come sorgente primaria per l'Italia.

Motivi:

- Radar-DPC pubblica prodotti SRI e VMI aggiornati ogni cinque minuti ed è focalizzato sul territorio italiano.
- I prodotti sono disponibili con licenza CC-BY-SA, anche per usi commerciali, rispettando attribuzione e condivisione allo stesso modo delle opere derivate.
- Dal 2026 l'API pubblica RainViewer è rivolta principalmente a progetti personali o educativi, offre solo radar passato, limita lo zoom e non garantisce uno SLA.

RainViewer rimane una possibile opzione futura per copertura internazionale o fallback, previa verifica dei termini commerciali allora vigenti.

## Vincoli per l'implementazione futura

- Tenere separati e nominati chiaramente "Radar adesso" e "Previsione prossime ore".
- Usare una legenda stabile per ciascun prodotto, senza ricalcolarla a ogni fotogramma.
- Mantenere attribuzione e licenza visibili.
- Verificare CORS, disponibilità dei tasselli, caching e comportamento in assenza di dati prima del rilascio.

## Fonti

- https://mappe.protezionecivile.gov.it/it/mappe-e-dashboard-rischi/piattaforma-radar/
- https://dpc-radar.readthedocs.io/it/latest/clientwss.html
- https://www.rainviewer.com/api.html
- https://www.rainviewer.com/br/api/transition-faq.html
