# Plan: News-Briefing-Routine ohne Claude-Pro-Abo betreiben

*Erarbeitet am 24.07.2026 im Dialog mit Claude Code. Status: **nicht umgesetzt** — Entscheidung
war, beim Pro-Abo zu bleiben (siehe Fazit unten). Dieses Dokument dient als Blaupause, falls
sich die Rahmenbedingungen ändern.*

## Ausgangslage

Die tägliche Briefing-Routine läuft heute als Cloud-Routine über Claude Code (Pro-Abo).
Fällt das Abo weg, muss die Routine auf die Claude API (Abrechnung nach Token-Verbrauch)
umgestellt werden. Kernidee: **deterministische Logik als normalen Code** ausführen und
**nur die echten „Denk"-Schritte als API-Aufrufe** bezahlen.

## Was heute passiert — und was davon „Algorithmus" ist

**Deterministisch (braucht kein LLM):**
- Wochentag prüfen, `memory.json` lesen/schreiben/aufräumen (30-Tage-Regel)
- Spotify-Token-Refresh und die drei API-Abfragen (Top-Artists/-Tracks/Recently-Played)
- HTML-Templating (Layout ist stabil), Footer-Anpassung für die Root-Kopie,
  `reports/index.html` ergänzen
- Git commit & push

**Echte LLM-Arbeit:**
- Web-Recherche bewerten (neu vs. Fortschreibung, Zwei-Quellen-Regel)
- Sättigungsregel/Themenmix-Quote anwenden (Abgleich mit Gedächtnis)
- Artikel und Überblick schreiben
- Song-Auswahl mit thematischer Begründung

## Die drei Umbau-Optionen

### Option A — „Algorithmus + API" (Empfehlung bei Umsetzung)

Python-Skript per GitHub-Actions-Cron im Repo. Das Skript erledigt alles Deterministische
selbst und ruft die Claude API nur für die vier LLM-Schritte auf:

- Serverseitiges `web_search`-Tool von Anthropic für die Recherche (kein eigener Scraper)
- Structured Outputs (JSON-Schema), damit Artikel maschinell ins HTML-Template
  (Jinja2) gegossen werden
- Regeln aus CLAUDE.md (Sättigungsregel, Themenmix-Quote, Quellenregeln) wandern in den
  System-Prompt der jeweiligen API-Aufrufe
- GitHub Actions ist für öffentliche Repos kostenlos; Secrets (API-Key, Spotify) in
  GitHub Secrets

**Vorteile:** günstigster Betrieb, robusteste Variante (Layout/Footer/Gedächtnispflege sind
Code statt Prompt-Befolgung), Recherche-Fanout als Code kontrollierbar.
**Nachteil:** größter Umbauaufwand.

### Option B — Claude Agent SDK auf GitHub Actions

Claude Code als Bibliothek (`claude-agent-sdk`, Python/TypeScript): der heutige
Routine-Prompt bleibt fast unverändert, der Agent arbeitet mit denselben eingebauten Tools
(Dateien, Bash, WebSearch). Minimaler Umbauaufwand, aber Token-Verbrauch bleibt hoch, weil
der Agent alles selbst orchestriert. Guter Zwischenschritt.

### Option C — Anthropic Managed Agents mit Scheduled Deployments

Anthropic hostet den kompletten Agenten. Einmalige Agent-Konfiguration (Modell,
System-Prompt = Routine-Prompt, Tools), ein Deployment mit Cron-Schedule
(z.B. `0 6 * * *`, Europe/Berlin) feuert täglich eine Session — ohne eigenen Scheduler.
GitHub-Repo per `github_repository`-Ressource gemountet (Push über PAT), Spotify-Secrets
in einem Vault (werden erst beim Netzwerk-Egress eingesetzt, die Sandbox sieht sie nie).
**Nachteile:** Beta-Status, tokenintensiver als Option A.

## Modellwahl und Preise (Stand 07/2026)

| Modell | Input $/1M Tokens | Output $/1M Tokens | Eignung |
|---|---|---|---|
| Claude Opus 5 (`claude-opus-5`) | 5,00 | 25,00 | Beste Qualität für Synthese/Artikel |
| Claude Sonnet 5 (`claude-sonnet-5`) | 3,00 (Intro 2,00 bis 31.08.2026) | 15,00 (Intro 10,00) | Guter Kompromiss, reicht für dieses Format |
| Claude Haiku 4.5 (`claude-haiku-4-5`) | 1,00 | 5,00 | Billige Teilschritte (Quellen verdichten, Dedup) |

**Verbrauchs-Anhaltspunkt:** Ein heutiger Lauf verbraucht allein in den vier
Recherche-Schritten ~250.000 Tokens, gesamt realistisch 350.000–500.000 Tokens/Tag,
stark Input-lastig.

**Grobe Monatskosten (30 Läufe):**
- Option A mit Sonnet 5: ca. 15–40 €/Monat
- Option A gestuft (Haiku für Vorverdichtung, Sonnet/Opus nur für finale Synthese): ca. 10–25 €/Monat
- Option B/C mit Opus (Agent orchestriert alles selbst): ca. 40–90 €/Monat

Dazu geringe Gebühren für das Web-Search-Tool (pro Suche berechnet; bei 40–80 Suchen/Tag
einstelliger Euro-Betrag/Monat). Prompt-Caching hilft kaum: Cache-TTL 5 Min.–1 Std.,
verfällt zwischen täglichen Läufen. Erster Schritt bei Umsetzung: einen Lauf
instrumentieren und tatsächliche Token-Zahlen messen.

## Migrationsschritte (Option A)

1. **Template extrahieren:** Berichts-HTML in ein Jinja2-Template überführen (Sektionen,
   Artikel-Karten, Hinweisblöcke, Song-Embed als Platzhalter). Footer-Logik Root vs.
   `reports/` wird Template-Variable.
2. **Skript `run_briefing.py`:** liest `memory.json`; ruft pro Ebene die API mit
   `web_search`-Tool + JSON-Schema auf; macht die Spotify-Calls selbst und lässt nur
   Song-Auswahl + Begründung vom Modell treffen; rendert das Template; aktualisiert
   `memory.json` und `reports/index.html`; committet und pusht.
3. **GitHub Action:** Cron-Workflow (z.B. täglich 6:00 Uhr), `ANTHROPIC_API_KEY` +
   Spotify-Credentials als Repository-Secrets. **Wichtig:** Push per `GITHUB_TOKEN` löst
   wegen GitHubs Loop-Schutz kein Pages-Deployment aus (bekanntes Problem dieses Repos) —
   deshalb expliziten Pages-Deploy-Step (`actions/deploy-pages`) in denselben Workflow
   einbauen statt Pages-from-branch. Das ist robuster als der heutige Stand.
4. **API-Konto:** Auf platform.claude.com anlegen, Prepaid-Credits mit Budgetlimit gegen
   Kostenüberraschungen, API-Key erzeugen.
5. **Parallelbetrieb:** Einige Tage beide Varianten laufen lassen, Qualität/Kosten
   vergleichen, dann die Cloud-Routine abschalten.

Sonntags-Wochenausgabe und Feedback-Einträge funktionieren im selben Schema (andere
Prompts/Templates im selben Skript).

## Fazit (Entscheidung vom 24.07.2026)

**Vorerst kein Umbau — das Pro-Abo bleibt der beste Deal.** Begründung: Die API-Kosten
von 10–25 €/Monat gelten nur für das Briefing. Da daneben Claude Code für Hobby-Projekte
und Claude als Denkpartner genutzt werden sollen, deckt das Abo (22 €/Monat) alle drei
Anwendungsfälle pauschal ab, während der API-Weg jede Nutzung zusätzlich bepreist und
für den Chat-Anwendungsfall keine komfortable Oberfläche bietet.

**Wiedervorlage-Trigger — Plan hervorholen, wenn:**
1. **Nutzungslimits spürbar werden** (Routine frisst Pro-Kontingent, Bastelprojekte stoßen
   an Grenzen) → dann zuerst das Briefing auf die API auslagern und das Abo für die
   interaktive Nutzung freihalten.
2. **Das Abo gekündigt werden soll.**
3. **Robustheit wichtiger wird als Komfort** (Unabhängigkeit von Cloud-Routinen-Features
   und Prompt-Befolgung).
