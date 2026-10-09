# P4 – Domänen-Simulator „Meine Domäne“ (2.4.0) – fertig

**Neu:** `netzilon-ultra/app/domaene.js` (`window.Domaene`, Route `domaene`, CSS `#dom-style`, Präfix `dom-`).
- AD netzilon.example/NETZILON, DC01 (Server 2025, 10.0.0.10, DNS+DHCP); OUs `Netzilon/<Stadt>/<Abteilung>` + Gruppen/Ausgeschieden/Server/Computer, Users, Domain Controllers.
- 100 Benutzer aus `FirmaDB.mitarbeiter()` (sAM, UPN, Abteilung, Titel, Manager, deaktiviert bei `aktiv=false`).
- Gruppen GG_<Kürzel>, GG_Azubis, Domänen-Admins, DL_<Freigabe>_R/RW (AGDLP; Fehler eingebaut: GG_VT in DL_Personal_R).
- GPOs (Default Domain Policy, Laufwerke, Bildschirmsperre, USB-Sperre unverknüpft), LSDOU-Richtlinienergebnis.
- DNS (A/CNAME/PTR/SRV), DHCP 10.0.0.0/24 (Leases, Reservierungen, DORA), Freigaben + NTFS mit Rechner „effektive Rechte“ (Freigabe ∩ NTFS, kumulativ, Verweigern gewinnt, deaktiviertes Konto), Trust partner.example.
- PowerShell: alle geforderten Cmdlets + Get-ADGroup, Get-ADPrincipalGroupMembership, Get-ADOrganizationalUnit, Remove-GPLink, (Get-/Set-)ADDefaultDomainPasswordPolicy, CNAME, DHCP-Scope/Reservation, Revoke/Block/Get-SmbShareAccess, Get-SmbShare, icacls, Pipeline (`| Move-ADObject`, `| Measure-Object`, `| Format-List`), Tab, Verlauf (`S.p.domaene.verlauf`), deutsche Fehler.
- 11 Aufgaben (leicht→schwer): titel, dns, dhcp, azubi, marketing, kennwort, usb, wechsel, austritt, rechte, agdlp – alle PS-Musterlösungen per Node-Lauf verifiziert.
- Zustand komplett in `S.p.domaene.zustand` (~34 KB), `normal()` säubert/fällt auf Start zurück, Reset-Knopf.

**Eingebunden:** index.html, app.js (VERSION 2.4.0, neuerFortschritt/migrieren, Tab-Mapping, Startseite + hubWerkzeuge), motivation.js (XP 15, Quest, Abzeichen dom1/domall), package.json/-lock, CHANGELOG.
**Tests:** check-content, build-html, test-ui, test-paket (neuer Abschnitt, 22 Prüfungen, Screenshots p4-domaene.png / p4-domaene-390.png), test-sqldb, test-sqlaufgaben → alle grün. Nicht committet.
