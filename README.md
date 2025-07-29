# TODOs

- [ ] Logout-Button hinzufügen
- [ ] Statistiken-Schema entwerfen
- [ ] E-Mail-Verifizierung implementieren
- [ ] Automatische E-Mail-Verifizierung nach Registrierung
- [x] "Passwort vergessen"-Funktion implementieren
- [x] Rechteverwaltung mit numerischen Rollen (z. B. 0 = keine, 10 = nur lesen, 100 = Admin, 1000 = Owner)
- [ ] E-Mail-Template-Builder entwickeln
- [x] Authenticator-App (TOTP): z. B. Google Authenticator zur Generierung von Einmalpasswörtern
- [ ] WebAuthn-Login: Biometrie, Sicherheitsschlüssel oder Smartphone-Authentifizierung per Browser
- [ ] Backup-Codes: 10 einmalig nutzbare Codes nach MFA-Einrichtung generieren
- [ ] API-Schlüsselverwaltung
- [ ] package "@pilcrowjs/object-parser" entfernen

---

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
