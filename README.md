# News-Briefing

Automatisch generiertes tägliches News-Briefing für Lukas Bald, erzeugt durch eine Claude-Code-Routine (Cloud, läuft unabhängig vom eigenen Rechner).

## Struktur

- `index.html` – immer der aktuellste Bericht (feste URL, wird bei jedem Lauf überschrieben)
- `reports/briefing-JJJJ-MM-TT.html` – tägliches Archiv
- `reports/wochenausgabe-JJJJ-MM-TT.html` – sonntägliche Wochenausgabe
- `reports/index.html` – Archiv-Übersicht mit Links zu allen bisherigen Berichten
- `memory.json` – Gedächtnis der Routine (letzte ~30 Tage an Themensträngen, Basis für Kontinuität und Dopplungsvermeidung)

## Live-Link (nach Aktivierung von GitHub Pages)

`https://lukasbald2.github.io/news-briefing/`

Diese URL zeigt immer den aktuellsten Bericht. Als Lesezeichen/Homescreen-Icon auf dem Handy speichern.
