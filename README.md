# TODOs

## 1. Grundlegende Infrastruktur & Sicherheit (Basis schaffen)

- [ ] Rechteverwaltung differenzierter umsetzen, z. B. „Readonly“ mit deaktivierten Bedienelementen  
- [ ] Möglichkeit zur Anpassung der Berechtigungen schaffen  
- [ ] Backup-Codes: 10 einmalig nutzbare Codes nach MFA-Einrichtung generieren  
- [ ] Recovery Codes nach der Generierung nicht mehr anzeigen, sondern nur neue generieren lassen – nur mit aktiver 2FA, alte Codes ungültig machen  
- [x] Authenticator-App (TOTP): z. B. Google Authenticator zur Generierung von Einmalpasswörtern  
- [ ] WebAuthn-Login: Biometrie, Sicherheitsschlüssel oder Smartphone-Authentifizierung per Browser  
- [ ] E-Mail-Verifizierung implementieren  
- [ ] Automatische E-Mail-Verifizierung nach Registrierung  
- [ ] SMTP verschlüsselt speichern  
- [ ] Wenn SMTP nicht gesetzt ist, immer eine Warnung anzeigen  

## 2. API, Logging & Sicherheitserweiterungen

- [ ] API-Schlüsselverwaltung  
- [ ] Logging-System einführen  
- [ ] Anpassbare Rate-Limiting-Funktionalität implementieren  
- [ ] tRPC einsetzen für typsichere API-Kommunikation ohne manuelles SDK  

## 3. UI/UX, Templates & Formulare

- [ ] E-Mail HTML code zentral als Vorlage speichern  
- [ ] E-Mail HTML code verbessern  
- [ ] E-Mail-Template-Builder entwickeln  
- [ ] Bessere Fehlermeldungen und Zuordnung  
- [ ] ARIA-Label verbessern  

## 4. OAuth & Externe Integrationen

- [ ] GitHub OAuth-App per Button erstellen ermöglichen  
- [ ] Externe Login-Provider integrieren  
  - [ ] Redirect-Optionen konfigurieren (zu spezifischer URL oder Startseite)  
- [ ] Verwaltung von Anwendungen implementieren  

## 5. Sonstiges & Optimierungen

- [ ] package "@pilcrowjs/object-parser" entfernen  
- [ ] Statistiken-Schema entwerfen  
- [ ] Chart Placeholder ersetzen durch ein richtiges Diagramm  

---

## Abgeschlossen

- [x] Logout-Button hinzufügen  
- [x] "Passwort vergessen"-Funktion implementieren  
- [x] Rechteverwaltung mit numerischen Rollen (z. B. 0 = keine, 10 = nur lesen, 100 = Admin, 1000 = Owner)  

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
