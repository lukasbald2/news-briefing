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

## Wie hier ergänzt wird

- Neue Idee: Abschnitt unten anhängen, fortlaufend nummeriert.
- **Nummern werden nie neu vergeben.** Wird eine Idee verworfen, bleibt ihre
  Nummer stehen und der Abschnitt wird als verworfen markiert — mit dem Grund.
  Sonst zeigt ein späterer Verweis auf „Backlog 3" ins Leere.
- Erledigtes ebenso: markieren statt löschen, mit Datum und Commit.
- Der Wortlaut wird nicht nachträglich geglättet. Er ist der Beleg dafür, was
  ursprünglich gemeint war.

Diese Datei wird von Hand gepflegt. Der Tageslauf fasst sie nicht an.
