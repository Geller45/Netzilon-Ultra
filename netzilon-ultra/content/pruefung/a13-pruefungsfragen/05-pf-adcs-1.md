---
id: pf-adcs-1
bereich: Prüfung
block: A13
kapitel: Prüfungsfragen AD CS (Zertifikatdienste)
titel: AD CS – Zertifikatdienste – Teil 1/2
stufe: Fortgeschritten
typ: fragen
quellen: [Windows Server 2022 – AD CS, 20 Fragen + 10 Szenarien]
verweise: [ap2-kryptografie]
---

## Quiz

? AD CS Frage 1: Was ist eine PKI (Public Key Infrastructure)?
* Eine Infrastruktur zur Ausstellung, Verwaltung, Verteilung und Sperrung digitaler Zertifikate
- Ein Protokoll zur Vergabe von IP-Adressen
- Ein Verzeichnis für Benutzerkonten
- Ein Verfahren zur Datensicherung
! Eine PKI besteht aus Zertifizierungsstellen, Richtlinien und Diensten zur Verwaltung von Zertifikaten.

? AD CS Frage 2: Welche Information ist NICHT Bestandteil eines X.509-Zertifikats?
- Der öffentliche Schlüssel
- Der Gültigkeitszeitraum
* Der private Schlüssel des Antragstellers
- Die digitale Signatur der ausstellenden CA
! Der private Schlüssel bleibt beim Antragsteller und wird niemals im Zertifikat gespeichert.

? AD CS Frage 3: Mit welchem PowerShell-Befehl installieren Sie den Rollendienst Zertifizierungsstelle?
- Install-Module ADCS
* Install-WindowsFeature ADCS-Cert-Authority -IncludeManagementTools
- Add-WindowsCapability -Name ADCS
- Enable-ADCSRole
! Die Rolle wird per Install-WindowsFeature ADCS-Cert-Authority installiert; anschließend wird sie konfiguriert.

? AD CS Frage 4: Welcher Rollendienst von AD CS liefert Zertifikatsperrinformationen per OCSP (Online Certificate Status Protocol)?
- Zertifizierungsstellen-Webregistrierung
- Registrierungsdienst für Netzwerkgeräte
- Zertifikatregistrierungs-Webdienst
* Online-Responder
! Der Online-Responder beantwortet Statusabfragen einzelner Zertifikate per OCSP.

? AD CS Frage 5: Was kennzeichnet eine Stammzertifizierungsstelle (Root CA)?
* Sie besitzt ein selbstsigniertes Zertifikat und ist der Vertrauensanker der Hierarchie
- Sie stellt nur Zertifikate für Endbenutzer aus
- Sie muss immer online sein
- Sie erhält ihr Zertifikat von einer untergeordneten CA
! Das Zertifikat der Root CA ist selbstsigniert; ihm wird vertraut, weil es in den Vertrauensspeichern verteilt ist.

? AD CS Frage 6: Was unterscheidet eine Enterprise-CA von einer eigenständigen (Standalone-)CA?
- Eine Enterprise-CA benötigt kein Active Directory
* Eine Enterprise-CA ist in AD integriert und nutzt Zertifikatvorlagen sowie automatische Registrierung
- Eine Standalone-CA stellt Vorlagenzertifikate automatisch aus
- Es gibt keinen Unterschied
! Enterprise-CAs benötigen AD DS und unterstützen Vorlagen, Autoenrollment und AD-Veröffentlichung.

? AD CS Frage 7: Welche Architektur gilt in Unternehmen als empfohlen?
- Eine einzelne Root CA, die alle Zertifikate ausstellt und immer online ist
- Nur eine Standalone-CA auf einem Domänencontroller
* Eine Offline-Stamm-CA und eine untergeordnete, ausstellende Enterprise-CA (zweistufig)
- Mehrere Root CAs ohne Hierarchie
! Die Root CA bleibt offline geschützt und signiert nur die untergeordnete CA, die im Alltag Zertifikate ausstellt.

? AD CS Frage 8: Mit welchem Cmdlet konfigurieren Sie nach der Rolleninstallation die Zertifizierungsstelle?
- Install-CertificateAuthority
- New-ADCSRole
- Add-CertificationAuthority
* Install-AdcsCertificationAuthority
! Install-AdcsCertificationAuthority führt die Konfiguration (Typ, Schlüssel, Name, Gültigkeit) aus.

? AD CS Frage 9: Wie wird die Datenbank einer Zertifizierungsstelle gespeichert?
- Als Textdatei im Ordner SYSVOL
* Als ESE-Datenbank (.edb) im Ordner CertLog
- In der Datei NTDS.dit
- In der Registry
! Die CA-Datenbank ist eine ESE-Datenbank (Standard: C:\Windows\System32\CertLog).

? AD CS Frage 10: Mit welchem Snap-In verwalten Sie die Zertifikate des lokalen Computers?
- certmgr.msc
- certsrv.msc
* certlm.msc
- certtmpl.msc
! certlm.msc zeigt den Computerspeicher, certmgr.msc den Benutzerspeicher.

? AD CS Frage 11: Mit welcher Konsole bearbeiten Sie Zertifikatvorlagen?
* certtmpl.msc (Zertifikatvorlagen)
- dsa.msc
- gpmc.msc
- dnsmgmt.msc
! certtmpl.msc dient zur Verwaltung von Zertifikatvorlagen.

? AD CS Frage 12: Wie gehen Sie vor, wenn Sie eine Standardzertifikatvorlage anpassen möchten?
- Die Standardvorlage direkt bearbeiten
- Die Vorlage löschen und neu erstellen
- Die CA neu installieren
* Die Vorlage duplizieren und die Kopie anpassen
! Standardvorlagen sollten nicht verändert werden; man arbeitet mit Duplikaten.

? AD CS Frage 13: Wie aktivieren Sie die automatische Zertifikatregistrierung (Autoenrollment) für Domänenmitglieder?
- Über die Registry der CA
* Über eine Gruppenrichtlinie "Zertifikatdienstclient – Automatische Registrierung" sowie passende Rechte auf der Vorlage
- Über einen DNS-Eintrag
- Über DHCP-Optionen
! Autoenrollment wird per GPO aktiviert; die Vorlage muss zudem Registrierungsrechte bieten.

? AD CS Frage 14: Welche Berechtigungen benötigt eine Gruppe auf einer Vorlage für die automatische Registrierung?
- Nur Lesen
- Vollzugriff
* Lesen, Registrieren und Automatisch registrieren
- Schreiben und Löschen
! Die Rechte Lesen, Registrieren und Automatisch registrieren sind notwendig.

? AD CS Frage 15: Ab welcher Schemaversion der Zertifikatvorlage ist Autoenrollment möglich?
* Ab Version 2
- Nur Version 1
- Nur Version 4
- Autoenrollment ist nicht von der Version abhängig
! Vorlagen der Version 1 unterstützen kein Autoenrollment; ab Version 2 ist es möglich.
