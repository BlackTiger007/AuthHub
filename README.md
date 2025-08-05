# AuthHub

## ✨ Features

- E-Mail- und Passwort-Authentifizierung
- Passwortprüfung mit HaveIBeenPwned
- Anmeldung mit Passkeys
- E-Mail-Verifizierung
- Zwei-Faktor-Authentifizierung (TOTP)
- Backup-Codes für 2FA
- 2FA mit Passkeys und Sicherheitsschlüsseln
- Passwort-Reset mit 2FA
- Login-Drosselung und Rate Limiting

---

## 🚀 Start

1. Erstelle eine `.env`-Datei.
2. Generiere einen 128-Bit-Schlüssel (16 Byte), base64-kodiert.
3. Setze diesen als Umgebungsvariable `ENCRYPTION_KEY`.

```env
ENCRYPTION_KEY="L9pmqRJnO1ZJSQ2svbHuBA=="
```

> Du kannst dazu z. B. `openssl` verwenden:
>
> ```bash
> openssl rand --base64 16
> ```
