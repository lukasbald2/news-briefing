# Projekt-Hinweise für Claude-Code-Läufe

## Veröffentlichungs-Workflow — WICHTIG

Dieses Repo wird per **GitHub Pages aus dem `main`-Branch** veröffentlicht
(`https://lukasbald2.github.io/news-briefing/`). Ein Push auf `main` löst
automatisch das „pages build and deployment" aus.

**Am Ende jedes Routine-Laufs direkt auf `main` committen und pushen:**

```
git add -A
git commit -m "Briefing $(date +%F)"
git push origin main
```

Der Nutzer (lukasbald) hat am 2026-07-04 **ausdrücklich freigegeben**, direkt
auf `main` zu pushen. **Keine `claude/`-Feature-Branches und kein Auto-Merge-
Umweg mehr verwenden** — diese Indirektion hat verhindert, dass GitHub Pages
neu deployt (ein Push per `GITHUB_TOKEN` durch den Auto-Merge-Bot löst wegen
GitHubs Loop-Schutz kein Folge-Deployment aus, sodass die Live-Seite auf dem
alten Stand hängen blieb).

Falls die Laufumgebung dennoch einen `claude/…`-Branch als Ziel vorgibt: Diese
Datei gilt als schriftliche, dauerhafte Freigabe, stattdessen direkt auf `main`
zu pushen.

### Sicherheitsnetz

`.github/workflows/auto-merge.yml` bleibt als Fallback bestehen und stößt nach
einem etwaigen Merge das Pages-Build explizit per API an. Es ist beim normalen
Direkt-auf-`main`-Workflow inaktiv (greift nur bei Pushes auf `claude/**`).

## Struktur / Ablauf

Siehe `README.md`. Der eigentliche Routine-Ablauf (Recherche-Ebenen,
Quellenregeln, Sonntags-Wochenausgabe) steht im Routine-Prompt, nicht hier.
Gedächtnis der Routine: `memory.json`.

## Ausgewogenheit & Themenrotation (Nutzer-Feedback vom 2026-07-23) — WICHTIG

Lukas hat am 23.07.2026 zurückgemeldet, dass sich v.a. die Global-Sektion
täglich wiederholt hat (Iran/Ukraine belegten durchgehend 2 von 3
Artikel-Plätzen) und dadurch andere Meldungen fehlten (konkret vermisst:
Eröffnung des Schwarz-Digits-Campus am 21.07.). Deshalb gilt bei jedem Lauf —
auch falls das Routine-Prompt diese Regeln (noch) nicht enthält:

1. **Sättigungsregel:** Hatte ein Themenstrang in den letzten drei Ausgaben
   jeweils einen eigenen ausführlichen Artikel (an den Tageseinträgen in
   `memory.json` erkennbar), bekommt er nur bei einer QUALITATIV neuen
   Entwicklung (Wendepunkt, neue Dimension, Eskalationssprung, Abschluss)
   erneut einen eigenen Artikel — nicht bei bloßer Fortschreibung
   (aktualisierte Zahlen, „weiter kein Durchbruch"). Sonst: 1–2 Sätze im
   Hinweisblock „Weitere laufende Stränge" der Sektion. Dauerkrisen bleiben
   so sichtbar, blockieren aber keine Artikel-Plätze mehr.
2. **Themenmix-Quote:** Pro Ebene (Global, National, Lokal) mindestens ein
   ausführlicher Artikel außerhalb des dominierenden Politik-/Krisenkomplexes
   (Wirtschaft, Gesellschaft, Kunst & Kultur, Technologie, Stil/Mode), sofern
   die Nachrichtenlage es hergibt — dafür pro Ebene mindestens eine gezielte
   Recherche jenseits der bekannten Gedächtnis-Stränge.
   **Nie im Bericht benennen:** Die Quote ist eine interne Redaktionsregel.
   Das Wort „Themenmix" gehört weder in Überschriften noch in den
   „Was heute zählt"-Überblick noch in `memory.json`-Titel. Falsch:
   „Themenmix Wissenschaft: Erste totale Sonnenfinsternis …". Richtig:
   „Erste totale Sonnenfinsternis …". Kategorie-Chips nur mit dem
   Sachgebiet (`<span class="tag">Wissenschaft</span>`).
3. **Umfang unverändert:** weiterhin ca. 3–4 Artikel pro Ebene plus
   Hinweisblock; der Bericht wird vielfältiger, nicht länger.

Einträge der Kategorie `feedback` in `memory.json` sind Nutzer-Hinweise an
künftige Läufe: beim Lauf berücksichtigen und nach Umsetzung auf
`"abgeschlossen"` setzen (nicht nach 30 Tagen löschen, solange offen).

## Strang-Identität in `memory.json` (eingeführt 2026-08-11) — WICHTIG

`memory.json` besteht aus zwei Teilen: `straenge` (Index aller aktiven
Themenstränge) und `entries` (Tageseinträge). Jeder Strang hat eine stabile
ID, damit Fortsetzungen nicht bei jedem Lauf über Freitext-Titel neu erraten
werden müssen.

```json
{
  "straenge": [
    {"id": "gaza-waffenruhe", "titel": "…", "kategorie": "global",
     "erstmals_am": "2026-07-14", "letzter_eintrag": "2026-08-11",
     "status": "laufend"}
  ],
  "entries": [
    {"strang_id": "gaza-waffenruhe", "form": "artikel", "kontrast": false,
     "category": "global", "title": "…", "date": "2026-08-11",
     "summary": "…", "status": "laufend"}
  ]
}
```

- `straenge` ist das **kontrollierte Vokabular**: Jede Meldung wird zuerst
  gegen den Index zugeordnet; eine neue ID entsteht nur, wenn inhaltlich kein
  Strang passt — nicht, weil sich die Formulierung geändert hat. Eine `id`
  wird nie nachträglich geändert.
- `form`: `"artikel"` oder `"hinweis"`. Damit ist die Sättigungsregel
  abzählbar statt geschätzt.
- `kontrast`: `true`, wenn der Strang in der Ausgabe den Quellen-Kontrast
  bekommen hat (siehe nächsten Abschnitt).
- **Keine Sammeleinträge.** Auch Hinweisblock-Stränge bekommen je einen
  eigenen Eintrag. Ein Eintrag wie „Weitere Social-Fortschreibungen" mit
  mehreren Themen im `summary` macht genau die Stränge unauffindbar, die die
  Sättigungsregel am Folgetag bewerten müsste.
- **Auto-Abschluss:** Stränge mit `status: "laufend"`, deren
  `letzter_eintrag` über 14 Tage zurückliegt, werden auf
  `"abgeschlossen (ausgelaufen)"` gesetzt. Ohne das bleiben Stränge
  unbegrenzt offen und die Datei wächst monoton (Stand vor der Umstellung:
  391 von 626 Einträgen auf `laufend`).
- Einträge **ohne** `strang_id` sind Alt-Bestand von vor der Umstellung: bei
  Strang-Regeln ignorieren, nicht vorzeitig löschen — sie laufen über die
  normale 30-Tage-Regel aus.

**Reichweite des Index:** Der Index wurde am 2026-08-11 aus den sieben
vorangegangenen Tagen aufgebaut. `erstmals_am` ist damit der Beginn der
NACHVERFOLGUNG, nicht zwingend der Beginn der Geschichte — Dauerstränge wie
Ukraine oder Nahost tragen dort ein Datum aus dem August 2026, obwohl sie
längst laufen. `erstmals_am` wird nie nachträglich geändert.

Im Bericht bekommt jeder Artikel zu einem fortlaufenden Strang einen
Verlaufssatz als `<p class="verlauf">`, formuliert als ganzer Satz — er wird
mitvorgelesen, eine Datenzeile klänge im Audio wie ein Formularfeld. Der Satz
muss sich dabei IMMER auf die Nachverfolgung beziehen und darf nie einen
Beginn behaupten, den die Daten nicht hergeben:

- richtig: „In dieser Nachverfolgung ist es die sechste Meldung zum Thema,
  die erste seit dem 6. August."
- richtig: „Der Bericht verfolgt den Strang seit mindestens dem 5. August."
- falsch: „Der Strang läuft seit dem 5. August."

Ist offenkundig, dass ein Strang deutlich länger läuft, als der Index hergibt,
entfällt das Anfangsdatum ganz und es wird nur die Zahl der nachverfolgten
Meldungen genannt.

Die Verlaufssätze einer Ausgabe müssen sich in der Formulierung
unterscheiden — viermal „In dieser Nachverfolgung ist es die …te Meldung"
liest sich noch erträglich, vorgelesen wird daraus ein Trommeln. Mal die
Zahl der Meldungen voran, mal der Abstand zur letzten, mal der Bezug zur
vorigen Entwicklung.

## Quellen-Kontrast (eingeführt 2026-08-11) — WICHTIG

Pro Ausgabe bekommt **genau eine** Meldung einen Block „Wie andere darüber
schreiben": drei seriöse Medien mit ihrer tatsächlichen Überschrift und je
einem Satz zu Schwerpunkt und Auslassung, danach ein Satz Einordnung, worin
sich die Darstellungen unterscheiden (Wortwahl, unterstellte Ursache,
Auslassung, Gewichtung). Der Block steht in der Sektion der Meldung, direkt
unter dem zugehörigen Artikel, und ersetzt keinen Artikel-Platz.

Hintergrund: Die Routine recherchiert für jede Meldung ohnehin ≥2 unabhängige
Quellen, verwirft den Darstellungsunterschied aber bei der Synthese. Der Block
macht diese bereits erhobene Information sichtbar.

**Grenzen:** Keine Bias-Scores, keine politischen Etiketten („regierungsnah",
„linksliberal"), keine Spekulation über Redaktionsmotive — nur am Text
Beobachtbares. Decken sich die Darstellungen weitgehend, wird genau das in
einem Satz festgehalten; **Unterschiede werden nicht konstruiert**. Nur
Überschriften und kurze Kernaussagen zitieren, keine längeren Passagen.
**Länge über Satzanzahl, nicht über Wörter:** genau sieben Sätze — je
Quelle ein Überschriften-Zitat mit einem Kommentarsatz (drei Quellen,
sechs Sätze) plus ein Einordnungssatz. Wortgrenzen wurden in der Praxis
zweimal deutlich überschritten (163 Wörter bei Limit 120, 179 bei Limit
160); die Satzanzahl ist deshalb die verbindliche Vorgabe.

**Markup-Kontrakt (wichtig für `readaloud.js`):** Der Medienname steht im
Absatz selbst, der Link separat in `<p class="quelle">` — `.quelle`-Elemente
werden bewusst nicht vorgelesen, ein Medienname im Link wäre also stumm und
die vorgelesenen Überschriften ließen sich nicht zuordnen.

```html
<div class="kontrast">
  <h3>Wie andere darüber schreiben</h3>
  <p><em>Reuters</em> titelt: „ÜBERSCHRIFT". Der Bericht rückt X in den
     Vordergrund und lässt Y aus.</p>
  <p class="quelle"><a href="URL">Reuters, TT.MM.JJJJ</a></p>
  <!-- zwei weitere Quellen analog -->
  <p>Unterschied: EIN SATZ EINORDNUNG.</p>
</div>
```

Da `<h3>` und `<p>` verwendet werden, greift die Vorlesefunktion ohne
Änderung an `readaloud.js`.

**Auswahl:** bevorzugt die Top-Meldung des Tages; sind die Darstellungen dort
deckungsgleich, die Meldung mit den deutlichsten Unterschieden. An drei
aufeinanderfolgenden Tagen möglichst drei verschiedene Stränge — dafür wird im
`memory.json`-Eintrag des Strangs der Zusatz „mit Quellen-Kontrast" vermerkt.

## Blinde Flecken (Wochenausgabe, eingeführt 2026-08-13) — WICHTIG

Nur in der Sonntags-Wochenausgabe: ein eigener Abschnitt
`<section class="ebene" id="blindeflecken">` zwischen „Social" und „Song der
Woche", der zeigt, was der Bericht selbst übersehen oder liegengelassen hat.
Sektionsreihenfolge: `global, national, lokal, social, blindeflecken, song`.

**Komponente A — fallengelassene Stränge.** Aus dem `straenge`-Index: Status
`laufend`, `letzter_eintrag` mindestens 7 Tage her. Das sind Geschichten, die
angefangen und dann stillschweigend nicht mehr fortgeschrieben wurden.

**Cutoff-Guard (zwingend):** nur Stränge mit `letzter_eintrag` **am oder nach
dem 2026-08-12**. Davor steckten Hinweisblock-Stränge in Sammeleinträgen; ein
älteres Datum heißt also nicht „fallengelassen", sondern nur „nicht einzeln
erfasst". Ohne den Guard würden z.B. `darknet-anklage-minden-luebbecke` und
`usa-brasilien-visastreit` sofort falsch gemeldet. Vor dem 2026-08-19 ist
diese Komponente regelhaft leer — das ist korrekt und wird ausdrücklich als
„keine Befunde" ausgewiesen, nicht mit Ersatzinhalten gefüllt.

Gemeldete Stränge werden anschließend auf
`status: "abgeschlossen (fallengelassen, gemeldet am JJJJ-MM-TT)"` gesetzt,
sonst tauchen sie Woche für Woche erneut auf.

**Komponente B — außerhalb der eingestellten Quellen.** Die Quellenliste des
Routine-Prompts ist überwiegend westlich geprägt. 3–5 gezielte Suchen bei
seriösen Medien außerhalb dieser Liste (Africanews, The Africa Report, The
Hindu, Dawn, Folha de S.Paulo, El País América, Rest of World), dann
Mengendifferenz gegen die Strang-Titel der Woche. 2–3 Themen, je 2–3 Sätze,
mit Quelle und einem Satz dazu, warum es hier fehlte.

**Ton:** nüchtern und selbstbezogen — eine Auskunft über die Reichweite der
eingestellten Quellen, keine Enthüllung. Keine Verschwörungs-Rahmung. Das
Quellenqualitäts-Prinzip gilt weiter: mindestens zwei unabhängige Belege.

**Vorlesefunktion:** `assets/readaloud.js` kennt die Sektions-ID
`blindeflecken` (Eintrag in `LABELS` und in `defs`, zwischen `social` und
`song`). An Werktagen fehlt die Sektion — unkritisch, `buildSections()`
überspringt fehlende Elemente. Im Abschnitt nur `<h3>` und `<p>` verwenden.

**Quellennennung — wie beim Quellen-Kontrast:** Der **Medienname gehört in
den Fließtext** des Absatzes; nur der Link kommt in ein separates
`<p class="quelle">`. `.quelle`-Elemente werden nicht vorgelesen — steht die
Quelle ausschließlich dort, hört ein Zuhörer die Befunde ohne jede
Herkunftsangabe. Genau das ist in der Ausgabe vom 16.08.2026 passiert.

- falsch: `<p>Kenias Stromversorger warnte …</p>` +
  `<p class="quelle">Quellen: CNBC Africa, The Africa Report</p>`
- richtig: `<p>Wie <em>CNBC Africa</em> und <em>The Africa Report</em>
  berichten, warnte Kenias Stromversorger …</p>` +
  `<p class="quelle"><a href="URL">CNBC Africa, TT.MM.JJJJ</a></p>`

Gilt für beide Komponenten des Abschnitts.

## Dauerarchiv `data/archiv.jsonl` (eingefuehrt 2026-08-19) - WICHTIG

`memory.json` ist ein **rollierender Arbeitsspeicher**: Eintraege aelter als
30 Tage werden entfernt. Fuer Langzeitauswertungen gibt es daneben
`data/archiv.jsonl` im JSON-Lines-Format - **aus dieser Datei wird niemals
geloescht**. Der taegliche Lauf schreibt sie in Schritt 7b fort.

Eine Zeile je Meldung:
`{"date","category","strang_id","form","kontrast","status","title","summary","quelle"}`

- `quelle` unterscheidet die Herkunft: `lauf` (regulaerer Lauf),
  `memory-seed` (Erstbefuellung aus memory.json am 2026-08-22),
  `html-rekonstruiert` (nachtraeglich aus alten Berichten geparst, ohne
  Strang-Daten). Bei Auswertungen nicht als gleichwertig behandeln.
- Kategorien `song` und `feedback` kommen nicht ins Archiv.
- Idempotenz im Tageslauf: vorhandene Zeilen mit heutigem `date` und
  `quelle: "lauf"` werden ersetzt, alle anderen bleiben unberuehrt.
- Die 30-Tage-Regel gilt ausschliesslich fuer memory.json, nie hier.

Grundlage fuer eine spaetere Uebersichtsdarstellung. Beachten: die Daten
zeigen die Aufmerksamkeit DIESES Berichts, nicht die der Medien allgemein.

## Uebersichtsseite `uebersicht.html` (eingefuehrt 2026-08-22) - WICHTIG

Eine Auswertung ueber alle bisherigen Berichte: Kategorie-Verlauf und eine
Heatmap der Themenstraenge. Datenquelle ist `data/archiv.jsonl`.

**Die Seite wird NIE von Hand geschrieben.** Sie entsteht ausschliesslich aus
`tools/uebersicht.py`, das die Vorlage `tools/uebersicht_vorlage.html` mit
fuenf Platzhaltern fuellt (`__DATEN__`, `__EYEBROW__`, `__REIFE__`,
`__LUECKE__`, `__FOOTER__`). Der taegliche Lauf ruft das Skript in Schritt 7c
aus dem Repo-Root auf:

```
python3 tools/uebersicht.py
```

Soll sich das Aussehen aendern, wird die **Vorlage** geaendert, nicht die
erzeugte Seite - sonst ist die Aenderung beim naechsten Lauf weg.

- Nur Standardbibliothek, keine Abhaengigkeiten.
- In die Heatmap kommen Straenge ab 4 Meldungen (`MIN_MELDUNGEN` im Skript).
- Der Vorbehalt zur duennen Strang-Datenbasis blendet sich selbst aus, sobald
  42 Tage Strang-Daten vorliegen (`REIF_AB_TAGEN`).
- Die Seite bindet `readaloud.js` bewusst NICHT ein - sie ist kein Bericht.
- Sie zeigt die Aufmerksamkeit DIESES Berichts, nicht die der Medien allgemein.
- Der Neubau laeuft TAEGLICH, nicht nur sonntags: Das Skript braucht eine
  Sekunde, und bei woechentlichem Neubau waere die Seite nach einem einzigen
  fehlgeschlagenen Lauf zwei Wochen alt.

## Footer-Links beim Kopieren nach `index.html` — WICHTIG

Der jeweils neueste Bericht wird unter `reports/briefing-JJJJ-MM-TT.html`
UND als 1:1-Kopie unter `index.html` im Root gespeichert. Der Footer jedes
Berichts enthält relative Links, die für den Speicherort `reports/` gedacht
sind:

```html
<p>Archiv: <a href="index.html">reports/index.html</a> · Aktuellster Bericht: <a href="../index.html">Startseite</a></p>
```

Wird diese Zeile unverändert nach `index.html` im Root kopiert, zeigt der
„Archiv"-Link auf sich selbst (`index.html` relativ zum Root = die aktuelle
Seite) statt auf `reports/index.html` — der Nutzer landet dann beim Klick
auf „Archiv" wieder auf dem bereits offenen Tagesbericht statt auf der
Archivliste.

**Deshalb beim Erzeugen von `index.html` im Root den Footer anpassen auf:**

```html
<p>Archiv: <a href="reports/index.html">reports/index.html</a></p>
```

(Der „Aktuellster Bericht"-Link entfällt im Root, da man dort ja bereits
ist.) Die Datei unter `reports/briefing-JJJJ-MM-TT.html` behält den
ursprünglichen Footer mit beiden Links unverändert.

## Vorlese-/„Podcast"-Funktion (`assets/readaloud.js`) — WICHTIG

Jeder Bericht kann sich per Web-Speech-API (Browser-Sprachausgabe) vorlesen
lassen: ein „Bericht vorlesen"-Button oben, ein kleiner Play-Button je Sektion
und eine Playback-Leiste am unteren Bildschirmrand (Play/Pause, Skip/Back
zwischen Sektionen, X zum Schließen). Bei der Song-des-Tages-Sektion wird die
Begründung vorgelesen und anschließend der 30-Sekunden-Spotify-Clip gestartet.

Die gesamte Logik liegt in **`assets/readaloud.js`** (self-contained: injiziert
eigenes CSS, alle Buttons und die Leiste; scannt die vorhandene Sektionsstruktur).
Damit die Funktion in einem Bericht aktiv ist, MUSS direkt vor `</body>` diese
Zeile stehen — sowohl in `reports/briefing-JJJJ-MM-TT.html` als auch in der
Root-Kopie `index.html` (bzw. `reports/wochenausgabe-…` sonntags):

```html
<script src="/news-briefing/assets/readaloud.js" defer></script>
```

Der **absolute** Pfad `/news-briefing/…` ist bewusst gewählt: Er funktioniert
identisch aus dem Root (`index.html`) wie aus `reports/…`, weil GitHub Pages das
Repo unter `/news-briefing/` ausliefert. Kein relativer Pfad verwenden.

Voraussetzung im generierten HTML (ist im Standard-Layout bereits gegeben):
Zusammenfassung als `header .ueberblick`, Sektionen als
`<section class="ebene" id="global|national|lokal|social|song">`, Song-Embed als
`#song .spotify-embed iframe`. Quellen (`.quelle`), Chips (`.tag`), Navigation
(`nav.toc`), Bildunterschriften und Footer werden bewusst NICHT vorgelesen.
Solange diese Struktur erhalten bleibt, funktioniert das Vorlesen automatisch —
`readaloud.js` muss beim normalen Lauf nicht angefasst werden.
