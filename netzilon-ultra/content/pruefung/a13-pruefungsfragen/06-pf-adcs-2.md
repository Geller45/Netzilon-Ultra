---
id: pf-adcs-2
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD CS (Zertifikatdienste)
titel: AD CS – Zertifikatdienste – Teil 2/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD CS, 20 Fragen + 10 Szenarien]
verweise: [ap2-kryptografie]
---

## Quiz

? AD CS Frage 16: Wie wird der Status eines gesperrten Zertifikats üblicherweise veröffentlicht?
- Als DNS-Eintrag
* In einer Zertifikatsperrliste (CRL)
- In der Registry des Clients
- Im SYSVOL-Ordner als Skript
! Gesperrte Zertifikate stehen in der CRL; alternativ liefert der Online-Responder den Status per OCSP.

? AD CS Frage 17: Wie lauten die Standardintervalle für die Veröffentlichung von CRLs auf einer Windows-CA?
- Basis-CRL täglich, Delta-CRL stündlich
* Basis-CRL wöchentlich, Delta-CRL täglich
- Basis-CRL monatlich, keine Delta-CRL
- Beide alle 5 Minuten
! Standard: Basis-CRL 1 Woche, Delta-CRL 1 Tag.

? AD CS Frage 18: Was bedeuten die Erweiterungen AIA und CDP in einem Zertifikat?
- AIA nennt den Speicherort der CRL, CDP den Ort des Ausstellerzertifikats
- Beide bezeichnen Registrierungsserver
* AIA verweist auf das Zertifikat der ausstellenden CA, CDP auf die Sperrliste (CRL)
- Beide sind DNS-Einträge
! AIA (Authority Information Access) und CDP (CRL Distribution Point) ermöglichen Kettenbildung und Sperrprüfung.

? AD CS Frage 19: Welchen Vorteil bietet ein Online-Responder gegenüber einer CRL?
* Er beantwortet Statusabfragen für einzelne Zertifikate, ohne dass große Sperrlisten geladen werden müssen
- Er stellt selbst Zertifikate aus
- Er ersetzt die Root CA
- Er verschlüsselt die Datenbank
! OCSP reduziert Datenmengen und liefert aktuellere Statusinformationen.

? AD CS Frage 20: Was gehört zu einer vollständigen Sicherung einer Zertifizierungsstelle?
- Nur die Freigabe SYSVOL
- Nur die Vorlagen
- Nur die DNS-Zone
* Der private Schlüssel, das CA-Zertifikat und die CA-Datenbank (z. B. mit certutil -backup oder dem Sicherungs-Assistenten)
! Ohne den privaten Schlüssel ist eine Wiederherstellung der CA nicht möglich.

? AD CS Szenario 1: Ein Unternehmen baut eine neue PKI auf und legt Wert auf maximale Sicherheit des Stammzertifikats. Ausgestellt werden sollen Zertifikate für Server, Clients und Benutzer im Active Directory. Frage: Welche Konzeption ist am besten geeignet?
- Eine Enterprise-Root-CA auf einem Domänencontroller, die alle Zertifikate ausstellt
* Eine Offline-Standalone-Root-CA und eine untergeordnete Enterprise-CA, die im Alltag Zertifikate ausstellt
- Zwei Enterprise-Root-CAs ohne Hierarchie
- Eine Standalone-CA, die ständig online ist und alles ausstellt
! Ein zweistufiges Modell schützt den Root-Schlüssel offline; die untergeordnete Enterprise-CA nutzt AD und Vorlagen.

? AD CS Szenario 2: Die Offline-Root-CA ist eine Standalone-CA. Die untergeordnete Enterprise-CA hat ihr Zertifikat erhalten, aber Clients melden, dass die Zertifikatskette nicht vertrauenswürdig ist. Frage: Was ist zu tun?
* Das Root-CA-Zertifikat und die CRL in AD veröffentlichen (certutil -dspublish) bzw. per GPO in "Vertrauenswürdige Stammzertifizierungsstellen" verteilen
- Die Clients neu installieren
- Die untergeordnete CA umbenennen
- DNS neu starten
! Standalone-Root-Zertifikate werden nicht automatisch verteilt; Veröffentlichung in AD oder per GPO stellt das Vertrauen her.

? AD CS Szenario 3: Alle Domänencomputer sollen automatisch ein Computerzertifikat (z. B. für WLAN- oder VPN-Authentifizierung) erhalten, ohne dass Administratoren eingreifen müssen. Frage: Welche Schritte sind erforderlich?
- Manuelle Ausstellung über certsrv für jeden Computer
- Ein Skript im NETLOGON-Ordner
* Vorlage duplizieren, Gruppe "Domänencomputer" Lesen, Registrieren und Autoregistrierung erlauben, Vorlage auf der CA veröffentlichen und Autoenrollment per GPO aktivieren
- Ein DHCP-Bereich mit Zertifikatsoption
! Autoenrollment benötigt Vorlage mit passenden Rechten, Veröffentlichung auf der CA und die GPO-Einstellung.

? AD CS Szenario 4: Für einen Webserver soll ein Zertifikat mit mehreren DNS-Namen (Subject Alternative Names) ausgestellt werden. Der Antragsteller möchte die Namen selbst in der Anforderung angeben. Frage: Wie konfigurieren Sie die Vorlage?
- Die Vorlage muss den Namen aus AD beziehen
- Die Vorlage darf nur für Benutzer gelten
- Der Name lässt sich nachträglich nicht ändern
* Vorlage duplizieren, in den Antragstellernamen "Angabe in der Anforderung" aktivieren und nur berechtigten Gruppen das Registrieren erlauben
! Für Webserver-Zertifikate wird der Antragstellername häufig in der Anforderung angegeben; der Zugriff sollte eingeschränkt werden.

? AD CS Szenario 5: Ein Notebook mit einem Computerzertifikat für die VPN-Authentifizierung wurde gestohlen. Frage: Wie reagieren Sie?
- Das Notebook aus der Domäne entfernen und nichts weiter tun
* Das Zertifikat unter "Ausgestellte Zertifikate" sperren (z. B. Grund: Schlüsselkompromittierung) und eine neue CRL veröffentlichen
- Die Vorlage löschen
- Die Root CA neu installieren
! Gesperrte Zertifikate erscheinen in der nächsten CRL; die CRL sollte sofort neu veröffentlicht werden.

? AD CS Szenario 6: Clients melden beim Aufbau von HTTPS-Verbindungen: "Der Sperrstatus des Zertifikats konnte nicht überprüft werden." Die untergeordnete CA läuft; die Offline-Root-CA wurde zuletzt vor sieben Monaten eingeschaltet. Frage: Was ist die wahrscheinlichste Ursache?
- Die Vorlage ist veraltet
- Der DHCP-Server ist ausgefallen
* Die CRL der Offline-Root-CA ist abgelaufen; sie muss neu veröffentlicht und im CDP-Ort bereitgestellt werden
- Das Webserver-Zertifikat wurde nicht signiert
! Offline-CAs haben lange CRL-Laufzeiten; abgelaufene CRLs verhindern die Sperrprüfung.

? AD CS Szenario 7: Zertifikate für Benutzer laufen in 30 Tagen ab. Sie möchten, dass sie ohne Benutzereingriff erneuert werden. Frage: Was konfigurieren Sie?
* Autoenrollment für die Vorlage (Benutzerkonfiguration per GPO) und einen passenden Erneuerungszeitraum in der Vorlage
- Die Gültigkeitsdauer auf 1 Tag setzen
- Die CA-Datenbank zurücksetzen
- Alle Benutzer neu anlegen
! Bei aktivem Autoenrollment werden Zertifikate im Erneuerungszeitraum automatisch erneuert.

? AD CS Szenario 8: Der Server der Enterprise-CA ist ausgefallen. Eine Sicherung von CA-Datenbank, Zertifikat und privatem Schlüssel liegt vor. Ein neuer Server mit demselben Namen steht bereit. Frage: Wie stellen Sie die CA wieder her?
- Nur die Vorlagen neu erstellen
- Eine neue Root CA anlegen und alle Zertifikate neu ausstellen
- DNS-Zone der Domäne kopieren
* AD CS installieren und im Konfigurationsassistenten "Vorhandenen privaten Schlüssel verwenden"; danach Datenbank und Konfiguration aus der Sicherung wiederherstellen (z. B. certutil -restore)
! Für die Wiederherstellung sind Schlüssel, Zertifikat und Datenbank aus der Sicherung nötig.

? AD CS Szenario 9: Mitarbeiter sollen E-Mails digital signieren. Die Benutzerzertifikate sollen automatisch aus AD-Konten ausgestellt werden, ohne dass Benutzer eine Anforderung stellen. Frage: Welche Lösung passt?
- Manuelle Anforderung über die Webregistrierung
* Eine Benutzerzertifikatvorlage mit Autoregistrierung für Domänenbenutzer und eine GPO zur automatischen Registrierung in der Benutzerkonfiguration
- Zertifikate auf USB-Sticks verteilen
- Ein DHCP-Bereich mit Zertifikaten
! Benutzerzertifikate werden per Vorlage und GPO (Benutzerkonfiguration) automatisch registriert.

? AD CS Szenario 10: Ein Administrator fordert über certmgr.msc ein Zertifikat an, aber die gewünschte Vorlage erscheint nicht in der Liste. Frage: Was prüfen Sie?
- Die Bildschirmauflösung
- Die Größe der Auslagerungsdatei
* Ob die Vorlage auf der CA veröffentlicht ist (Zertifikatvorlagen – Neu – Auszustellende Zertifikatvorlage) und ob der Benutzer Lese- und Registrierungsrechte hat
- Ob der DNS-Server läuft
! Vorlagen müssen auf der CA veröffentlicht sein und dem Antragsteller Rechte gewähren.
