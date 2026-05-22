# Deploy-Fehler (Netlify)

## Fehlermeldung
Der Build ist fehlgeschlagen, weil Netlify im Repository-Root (`/opt/build/repo`) den Befehl `npm run build` ausgeführt hat, dort aber keine `package.json` vorhanden war.

Konkrete Meldung:

- `npm ERR! enoent Could not read package.json`
- `ENOENT: no such file or directory, open '/opt/build/repo/package.json'`
- Build-Skript mit Exit-Code `2` bzw. `254` beendet

## Kurzursache
Die Build-Konfiguration zeigte auf das falsche Verzeichnis (Root statt `frontend`).
