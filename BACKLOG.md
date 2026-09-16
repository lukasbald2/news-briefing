# Backlog — Ideen für Bericht und Übersicht

Gesammelt, nicht bewertet. Ohne Reihenfolge, unpriorisiert. Was hier steht, ist
weder Zusage noch Plan — es ist der Ort, an dem eine Idee liegen darf, bis sie
reif ist oder verworfen wird.

**Aufbau:** Pro Idee der Wortlaut von Lukas, unverändert. Darunter eine Notiz
von Claude. Die Notiz ist Beiwerk: Sie hält fest, welche Daten es dafür schon
gibt, und deutet die Idee nicht um. Wo Wortlaut und Notiz sich widersprechen,
gilt der Wortlaut.

Angelegt am 2026-08-29.

---

## 1. Drilldown für „Wie viel der Bericht insgesamt gemeldet hat"

**Status: gebaut am 16.09.2026.** Ein Klick auf eine Fläche oder ihre
Beschriftung filtert die Strang-Ansicht auf diese Ebene. Beim Bauen kam heraus,
dass der Anstieg, nach dem hier gefragt wird, **die Erfassung misst und nicht
die Berichterstattung** — die Seite benennt das jetzt an Ort und Stelle.

**Lukas, 29.08.2026:**

> Ein Drilldown für die Grafik "Wie viel der Bericht insgesamt gemeldet hat" -
> analog zu den Grafiken darüber mit Aufmerksamkeits-Drilldown. Man soll quasi
> sehen können, welche Themen-Stränge zu welchen der bestehenden 4 Kategorien
> wie gewachsen sind - und vielleicht eine Begründung ableiten, warum es einen
> Anstieg von Meldungen gab - z.B. von 11.08 bis 25.08 aktuell

**Notiz (Claude):** Die Daten dafür liegen vollständig vor. `data/archiv.jsonl`
führt seit dem 03.07. für jede Meldung `date`, `category` und `strang_id` — der
Aufriss „welcher Strang trug wie viel zu welcher Ebene bei" ist rechenbar, ohne
dass etwas erhoben werden müsste.

Ein Vorbehalt gehört zur genannten Zeitspanne dazu: Der Bootstrap vom 11.08.2026
kappt `erstmals_am`. Ein Anstieg, der genau am 11.08. beginnt, kann daher ein
Artefakt der Umstellung sein statt einer Veränderung in der Welt. Wer die Frage
„warum stieg die Menge" beantworten will, muss diese Kante zuerst ausschließen —
sonst erklärt die Grafik die eigene Umstellung.

---

## 2. Grafiken zu „Wie andere darüber berichten" und den Blinden Flecken

**Lukas, 29.08.2026:**

> Ich glaube, man könnte in die Übersicht noch gut Grafiken mit einbauen, die
> die Bereiche "Wie andere darüber berichten" und "blinde Flecken" beleuchten.
> Das ist noch eher ungeformt in meinem Kopf, aber z.B. etwas wie eine
> aggregierte Sicht, wie unterschiedliche Medien je Region mit unterschiedlichen
> Schwerpunkten berichten oder welcher Logik (falls überhaupt) die blinden
> Flecken folgen.

**Notiz (Claude):** Hier ist die Datenlage der begrenzende Faktor, nicht die
Idee. Beide Quellen sind neu:

- `medien` in `archiv.jsonl` — welche Medien eine Meldung getragen haben —
  existiert seit dem 28.08.2026.
- `kontrast_medien` und `kontrast_unterschied` — die drei Quellen des
  Quellen-Kontrast-Blocks und worin sie sich unterscheiden — ebenfalls seit
  dem 28.08.2026, ein Block je Ausgabe.
- `data/blindeflecken.jsonl` entsteht erstmals mit der Wochenausgabe am
  30.08.2026 und wächst danach um einen Satz Einträge pro Woche.

Die Blinden Flecken sind damit die dünnste Reihe: ein Datenpunkt pro Woche.
Eine Aussage über „welcher Logik sie folgen" braucht entsprechend Geduld —
nach einem Quartal sind es rund dreizehn Wochen.

Für den Medien-Teil ist die Frage, was „Region" bedeuten soll, noch offen: die
Herkunft des Mediums, die Region, über die berichtet wird, oder die Ebene
(global/national/lokal), die der Bericht der Meldung ohnehin schon gibt.

---

## 3. Gegen die Ergebnisse chatten

**Status: Datengrundlage gebaut am 15.09.2026.** Der Chat selbst ist NICHT
gebaut und auch nicht entschieden. Schritt 7d des Routine-Prompts schreibt seit
dem Lauf vom 16.09.2026 die Begründungen nach `data/begruendungen.jsonl` —
Einzelheiten in CLAUDE.md. Rückwirkend gibt es diese Daten bewusst nicht.

**Lukas, 13.09.2026:**

> Nur mal als Idee bzw. erste Bewertung: Ich habe die Vorstellung, dass ich
> sowohl im Briefing selbst als auch in der späteren Visualisierung gegen
> die Ergebnisse chatten kann. Also: Fragen stellen kann zur Entstehung der
> Meldungen oder der Visualisierungen im Dashboard. Die Fragen sollten
> idealerweise gegen die Routine laufen bzw. bei der Beantwortung sollte der
> Kontext der Erstellung bekannnt sein, also warum z.B. bestimmte Stränge in
> einer Kategorie zusammengefasst wurden oder warum bestimmte Quellen in
> "Wie andere darüber schreiben" berücksichtigt wurden. Könnte man so etwas
> z.B. über die Claude API realisieren, könnte man dabei die bestehenden
> Routinen als Quelle bzw. bei der Beantwortung mit einbeziehen und wie
> würde man das aufbauen?

**Lukas, 13.09.2026, nach der ersten Bewertung:**

> Was Du sagst, finde ich gut - es wäre ja erstmal unabhängig davon, ob man
> den Chat dann wirklich implementiert, sondern würde erstmal nur die
> Datengrundlage bei den Läufen schaffen.

**Notiz (Claude):** Machbar — aber die Arbeit liegt nicht bei der API, sondern
in den Daten. Das Archiv hält **Ergebnisse** fest, keine **Begründungen**:
`themen.json` sagt `gamescom-2026-bilanz → wirtschaft`, nirgends steht, warum
nicht `kultur`. Beim Quellen-Kontrast steht der Einordnungssatz in
`kontrast_unterschied`, aber nicht, warum gerade diese drei Medien verglichen
wurden. Ein Chat darauf beantwortet „was" exakt und „warum" erfunden —
plausibel klingende Rekonstruktion ohne Beleg, der schlechteste Fall.

Präzedenz gibt es bereits: `data/blindeflecken.jsonl` führt ein Feld
`begruendung`. Genau das fehlt an den anderen Entscheidungsstellen.

**Aufbau, falls gebaut wird:** Die Regeln (Routine-Prompt, CLAUDE.md) und
`themen.json` in den System-Prompt, mit Prompt Caching — die ändern sich fast
nie. Das Archiv NICHT hineinkippen, sondern als Werkzeuge anbieten
(`frage_archiv`, `hole_strang`, `hole_regel`); die Daten sind klein und
strukturiert, Embeddings wären Overkill. Dazu ein kleiner Endpunkt, weil
GitHub Pages statisch ist und der API-Schlüssel nicht in die Seite gehört.

Gegen die Routine selbst lässt sich nicht chatten: Sie ist zustandslos, jeder
Lauf startet ohne Erinnerung. Das Repo IST ihr Gedächtnis — gefragt wird das
Repo, nicht der Lauf.

**Vorgezogener Teilschritt, unabhängig vom Chat:** Begründungen im Tageslauf
mitschreiben — ein `warum` bei jeder neuen Themenzuordnung, eines bei der
Quellenauswahl des Kontrast-Blocks. Kostet im Lauf fast nichts und ist
**rückwirkend nicht herstellbar**, dieselbe Lage wie damals bei den
Strang-Kennungen. Je später das anfängt, desto länger bleibt ein späterer Chat
für die Vergangenheit eine Rekonstruktionsmaschine.

---

## 4. Nachzählen: Wird „keine Abwägung nötig" ehrlich benutzt?

**Lukas, 16.09.2026:**

> passt, können wir uns das als TODO merken?

**Herkunft — anders als bei 1 bis 3:** Dieser Punkt ist keine Idee für den
Ausbau, sondern eine offene Prüfung. Er entstand beim Durchsehen des ERSTEN
Laufs mit Schritt 7d am 16.09.2026.

**Frühestens ab 23.09.2026**, dann liegt eine Woche `data/begruendungen.jsonl`
vor. Zu zählen ist:

1. Wie viele `thema`-Zeilen sagen „keine Abwägung nötig"?
2. Bei wie vielen davon wäre ein zweites Thema aus dem Elfer-Vokabular
   vertretbar gewesen? Beurteilung an `title` und `summary` derselben Meldung
   in `data/archiv.jsonl`.
3. Wie stark überschneidet sich die `kontrast`-Begründung mit dem Feld
   `kontrast_unterschied` im Archiv? Die Regel verlangt, dass sie erklärt,
   WARUM diese drei Medien — nicht, worin sie sich unterscheiden.

**Ausgangsbefund vom 16.09.2026** (9 Zeilen, erster Tag):

- 4 von 7 `thema`-Zeilen sagten „keine Abwägung nötig", 3 nannten eine echte
  Unterscheidung. Im Grundsatz also genau die gewollte Mischung.
- EINE davon ist fragwürdig: `anthropic-compute-deals-517-milliarden` bekam
  `ki` mit „Einziges passendes Thema". Bei Verträgen über 517 Milliarden Dollar
  mit Amazon, Google, Microsoft und SpaceX wäre `wirtschaft` vertretbar gewesen
  — und derselbe Lauf wog `ki` gegen `wirtschaft` bei
  `dax-einbruch-ki-sicherheitswarnung` ausdrücklich ab. Er konnte es also.
- Die `kontrast`-Begründung war zu rund vier Fünfteln deckungsgleich mit
  `kontrast_unterschied`. Die eigentliche Antwort stand nur im ersten Halbsatz.

**Warum nicht sofort nachgeschärft wurde:** Je ein Fall an einem Tag ist kein
Muster. Und die naheliegende Verschärfung ist gefährlich: Ein strengeres
Erfindungsverbot könnte dazu führen, dass der Lauf überall Abwägungen
konstruiert, wo keine waren — der schlechtere Fehler. Präzedenz ist der am
01.09.2026 verworfene Versuch, Jahreszahlen aus der Dublettenprüfung zu
nehmen: klang plausibel, machte die Prüfung gemessen schlechter.

**Erst messen, dann entscheiden.** Hält das Muster nicht, bleibt alles wie es
ist — und dieser Abschnitt wird als erledigt markiert.

---

## Wie hier ergänzt wird

- Neue Idee: Abschnitt unten anhängen, fortlaufend nummeriert.
- **Nummern werden nie neu vergeben.** Wird eine Idee verworfen, bleibt ihre
  Nummer stehen und der Abschnitt wird als verworfen markiert — mit dem Grund.
  Sonst zeigt ein späterer Verweis auf „Backlog 3" ins Leere.
- Erledigtes ebenso: markieren statt löschen, mit Datum und Commit.
- Der Wortlaut wird nicht nachträglich geglättet. Er ist der Beleg dafür, was
  ursprünglich gemeint war.

Diese Datei wird von Hand gepflegt. Der Tageslauf fasst sie nicht an.
