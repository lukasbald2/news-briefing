#!/usr/bin/env python3
"""Erzeugt uebersicht.html aus data/archiv.jsonl.

Aufruf aus dem Repo-Root:  python3 tools/uebersicht.py

Das Skript ist die einzige Stelle, an der die Uebersichtsseite entsteht.
Der taegliche Lauf ruft es in Schritt 7c auf und committet das Ergebnis -- die
Seite wird
NICHT von Hand geschrieben, sonst driftet das Layout mit jeder Ausgabe.
Nur Standardbibliothek, keine Abhaengigkeiten.
"""

import collections
import datetime
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ARCHIV = ROOT / "data" / "archiv.jsonl"
VORLAGE = ROOT / "tools" / "uebersicht_vorlage.html"
ZIEL = ROOT / "uebersicht.html"

KAT = ["global", "national", "lokal", "social"]
MIN_MELDUNGEN = 4      # ab wie vielen Meldungen ein Strang in die Heatmap kommt
REIF_AB_TAGEN = 42     # ab wann der Vorbehalt zur Strang-Tiefe entfaellt

MONAT = ["", "Januar", "Februar", "Maerz", "April", "Mai", "Juni", "Juli",
         "August", "September", "Oktober", "November", "Dezember"]


def tag(iso):
    j, m, t = iso.split("-")
    return "%d. %s %s" % (int(t), MONAT[int(m)], j)


def kurz(iso):
    j, m, t = iso.split("-")
    return "%d.%d." % (int(t), int(m))


def main():
    if not ARCHIV.exists():
        sys.exit("Abbruch: %s fehlt." % ARCHIV)
    if not VORLAGE.exists():
        sys.exit("Abbruch: %s fehlt." % VORLAGE)

    rows = []
    for nr, zeile in enumerate(ARCHIV.read_text(encoding="utf-8").splitlines(), 1):
        zeile = zeile.strip()
        if not zeile:
            continue
        try:
            rows.append(json.loads(zeile))
        except json.JSONDecodeError as e:
            sys.exit("Abbruch: Zeile %d in archiv.jsonl ist kein gueltiges JSON (%s)." % (nr, e))
    if not rows:
        sys.exit("Abbruch: archiv.jsonl ist leer.")

    # --- Kategorie-Verlauf ueber den gesamten Zeitraum --------------------
    hat = sorted({r["date"] for r in rows})
    d0 = datetime.date.fromisoformat(hat[0])
    d1 = datetime.date.fromisoformat(hat[-1])
    tage = [(d0 + datetime.timedelta(i)).isoformat() for i in range((d1 - d0).days + 1)]
    luecken = [t for t in tage if t not in set(hat)]

    zahl = collections.Counter((r["date"], r["category"]) for r in rows)
    verlauf = [{"d": t, "v": [zahl.get((t, k), 0) for k in KAT]} for t in tage]

    # --- Heatmap: nur Zeilen mit Strang-Kennung ---------------------------
    sr = [r for r in rows if r.get("strang_id")]
    if not sr:
        sys.exit("Abbruch: keine Zeile mit strang_id -- Heatmap waere leer.")
    htage_vorhanden = sorted({r["date"] for r in sr})
    h0 = datetime.date.fromisoformat(htage_vorhanden[0])
    htage = [(h0 + datetime.timedelta(i)).isoformat() for i in range((d1 - h0).days + 1)]

    anzahl = collections.Counter(r["strang_id"] for r in sr)
    kategorie = {r["strang_id"]: r["category"] for r in sr}
    titel = {}
    for r in sr:
        titel.setdefault(r["strang_id"], r.get("title") or r["strang_id"])

    rang = {"artikel": 2, "hinweis": 1}
    zelle = collections.defaultdict(int)
    for r in sr:
        s = (r["strang_id"], r["date"])
        zelle[s] = max(zelle[s], rang.get(r.get("form"), 1))

    gewaehlt = [s for s, n in anzahl.items() if n >= MIN_MELDUNGEN]
    gewaehlt.sort(key=lambda s: (KAT.index(kategorie[s]) if kategorie[s] in KAT else 9, -anzahl[s]))
    heat = [{"id": s, "k": kategorie[s], "t": titel[s][:78], "n": anzahl[s],
             "c": [zelle.get((s, t), 0) for t in htage]} for s in gewaehlt]

    stat = {
        "tage": len(hat), "meldungen": len(rows), "straenge": len(anzahl),
        "mit_strang": len(sr), "ab": htage[0], "bis": hat[-1], "gezeigt": len(heat),
        "artikel": sum(1 for r in sr if r.get("form") == "artikel"),
        "hinweis": sum(1 for r in sr if r.get("form") == "hinweis"),
        "von": hat[0], "luecke": luecken,
    }

    daten = {"tage": tage, "kat": KAT, "verlauf": verlauf,
             "htage": htage, "heat": heat, "stat": stat}

    # --- Texte, die sich mit den Daten mitbewegen -------------------------
    eyebrow = "T&auml;glich aktualisiert &middot; Datenstand %s" % tag(hat[-1])

    strangtage = len(htage)
    if strangtage < REIF_AB_TAGEN:
        reife = (
            '    <p>Der Kategorie-Verlauf reicht &uuml;ber <strong>%d Tage</strong> und tr&auml;gt. '
            'Die Strang-Heatmap beginnt erst am <strong>%s</strong>, weil Themenstr&auml;nge davor keine '
            'feste Kennung hatten &mdash; <strong>%d Tage sind noch zu wenig f&uuml;r Aussagen &uuml;ber '
            'Verschiebungen</strong>. Sie zeigt bis auf Weiteres die Form, nicht den Befund.</p>'
            % (len(hat), tag(htage[0]), strangtage)
        )
    else:
        reife = (
            '    <p>Der Kategorie-Verlauf reicht &uuml;ber <strong>%d Tage</strong>, die Strang-Heatmap '
            '&uuml;ber <strong>%d Tage</strong> seit dem %s. Beide Zeitr&auml;ume sind lang genug, um '
            'Verschiebungen zu zeigen &mdash; einzelne Ausschl&auml;ge bleiben trotzdem Einzelf&auml;lle.</p>'
            % (len(hat), strangtage, tag(htage[0]))
        )

    if not luecken:
        luecke_txt = ("An keinem Tag des Zeitraums fehlt ein Bericht. Ein Tag ohne Meldungen "
                      "w&auml;re hier als Null zu sehen und kein Ausfall der Erfassung.")
    elif len(luecken) == 1:
        luecke_txt = ("Am %s gibt es keinen Bericht. Der Tag steht als Null im Verlauf und ist "
                      "kein Ausfall der Erfassung." % tag(luecken[0]))
    else:
        luecke_txt = ("An %d Tagen gibt es keinen Bericht (%s). Diese Tage stehen als Null im "
                      "Verlauf und sind kein Ausfall der Erfassung."
                      % (len(luecken), ", ".join(kurz(x) for x in luecken)))

    footer = ("Erzeugt am %s aus <code>data/archiv.jsonl</code> &middot; %d Meldungen, %s bis %s "
              "&middot; Diese Seite wird bei jedem Lauf neu gebaut; von Hand ge&auml;nderte "
              "Fassungen werden dabei &uuml;berschrieben."
              % (tag(datetime.date.today().isoformat()), len(rows), tag(hat[0]), tag(hat[-1])))

    html = VORLAGE.read_text(encoding="utf-8")
    for marke, wert in (("__DATEN__", json.dumps(daten, ensure_ascii=False, separators=(",", ":"))),
                        ("__EYEBROW__", eyebrow),
                        ("__REIFE__", reife),
                        ("__LUECKE__", luecke_txt),
                        ("__FOOTER__", footer)):
        if marke not in html:
            sys.exit("Abbruch: Platzhalter %s fehlt in der Vorlage." % marke)
        html = html.replace(marke, wert)

    ZIEL.write_text(html, encoding="utf-8")
    print("uebersicht.html geschrieben: %d Bytes" % len(html))
    print("  %d Meldungen, %s bis %s, %d Tage%s"
          % (len(rows), hat[0], hat[-1], len(hat),
             ", %d Luecke(n)" % len(luecken) if luecken else ""))
    print("  Heatmap: %d von %d Straengen (ab %d Meldungen), %d Tage ab %s"
          % (len(heat), len(anzahl), MIN_MELDUNGEN, strangtage, htage[0]))


if __name__ == "__main__":
    main()
