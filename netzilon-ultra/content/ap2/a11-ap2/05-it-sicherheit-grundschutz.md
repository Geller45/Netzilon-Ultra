---
id: ap2-it-sicherheit
bereich: AP2
block: A11
kapitel: IT-Sicherheit
titel: Schutzziele, BSI IT-Grundschutz, Schutzbedarf, Risikoanalyse
stufe: Fortgeschritten
quellen: [BSI IT-Grundschutz-Kompendium, BSI-Standards 200-1 bis 200-4, IHK-Prüfungskatalog]
verweise: [ap2-datenschutz, ap2-kryptografie, ap2-angriffe-schutz, ap2-backup-speicher]
---

## Profi

### Schutzziele
| Ziel | Bedeutung | Maßnahme |
|---|---|---|
| **Vertraulichkeit** | **Nur Befugte lesen** | **Verschlüsselung, Zugriffsrechte** |
| **Integrität** | **Daten unverändert/korrekt** | **Hash, Signatur, Versionierung** |
| **Verfügbarkeit** | **Nutzbar, wenn benötigt** | **Redundanz, Backup, USV** |
| Erweitert: **Authentizität** | **Echtheit des Absenders** | **Zertifikate, Signatur** |
| **Verbindlichkeit/Nichtabstreitbarkeit** | **Handlung nachweisbar** | **Digitale Signatur, Logging** |
| **Zurechenbarkeit** | **Wer hat was getan** | **Protokollierung** |

### BSI-Standards
| Standard | Inhalt |
|---|---|
| **200-1** | **ISMS** (Managementsystem für Informationssicherheit) |
| **200-2** | **IT-Grundschutz-Methodik** (**Basis-, Standard-, Kern-Absicherung**) |
| **200-3** | **Risikoanalyse** auf Basis IT-Grundschutz |
| **200-4** | **Business Continuity Management** (Notfallmanagement, löst 100-4 ab) |

**IT-Grundschutz-Kompendium**: **Bausteine** (z. B. **SYS.1.1 Allgemeiner Server**, **NET.3.2 Firewall**, **CON.3 Datensicherungskonzept**, **ORP**) mit **Anforderungen** (**Basis/Standard/erhöht**).
**Zertifizierung**: **ISO/IEC 27001 auf Basis von IT-Grundschutz**. International: **ISO 27001/27002**.

### Vorgehen Standard-Absicherung
**Strukturanalyse** (Geschäftsprozesse, Anwendungen, IT-Systeme, Räume, Netz) → **Schutzbedarfsfeststellung** → **Modellierung** (Bausteine zuordnen) → **IT-Grundschutz-Check** (Soll-Ist) → **Risikoanalyse** (bei hohem Schutzbedarf) → **Umsetzung** → **Aufrechterhaltung/Verbesserung (PDCA)**.

### Schutzbedarfsfeststellung
**Kategorien**: **normal** (begrenzt, überschaubar), **hoch** (beträchtlich), **sehr hoch** (existenzbedrohend).
**Je Schutzziel** (C, I, A) bewerten. **Schadensszenarien**: Gesetzesverstoß, Beeinträchtigung informationelles Selbstbestimmungsrecht, körperliche Unversehrtheit, Aufgabenerfüllung, Außenwirkung, finanzielle Auswirkungen.

| Prinzip | Regel |
|---|---|
| **Maximumprinzip** | **System erbt den höchsten Schutzbedarf** seiner Anwendungen |
| **Kumulationseffekt** | **Viele „normale“** zusammen → **höher** |
| **Verteilungseffekt** | **Redundanz** → **niedriger** (z. B. Verfügbarkeit) |

### Risiko
**Risiko = Eintrittswahrscheinlichkeit × Schadensausmaß**. **Umgang**: **vermeiden**, **reduzieren**, **übertragen** (Versicherung, Outsourcing), **akzeptieren**. **Restrisiko** dokumentieren.

### Maßnahmenarten (TOM)
**Technisch** (Firewall, Verschlüsselung, Virenschutz), **organisatorisch** (Richtlinien, Schulung, Vier-Augen-Prinzip), **personell**, **infrastrukturell** (Zutritt, Brandschutz, Klima, USV).

### Wichtige Prinzipien
**Least Privilege** (minimale Rechte), **Need to know**, **Defense in Depth**, **Zero Trust** („never trust, always verify“), **Security by Design/Default**, **Trennung von Aufgaben**.

### Gesetze/Rahmen
**DSGVO/BDSG** (Datenschutz), **NIS-2** (EU-Richtlinie, in DE **NIS2UmsuCG**, 2025: erweitert Pflichten für viele Unternehmen: Risikomanagement, **Meldepflichten 24 h/72 h/1 Monat**), **KRITIS** (BSI-Gesetz), **Cyber Resilience Act** (Produkte mit digitalen Elementen).

### Notfallmanagement (BCM)
**BIA** (Business Impact Analysis) → **RTO** (max. Ausfallzeit), **RPO** (max. Datenverlust), **MTPD** (max. tolerierbare Ausfallzeit) → **Notfallhandbuch**, **Übungen**.

## Einfach
**Vertraulichkeit** = **Tagebuch mit Schloss**. **Integrität** = **keiner hat heimlich was reingekritzelt**. **Verfügbarkeit** = **du findest es, wenn du es brauchst**. **Schutzbedarf** heißt: **Wie schlimm wäre es, wenn’s passiert?** Das **wichtigste Blatt** bestimmt, **wie gut der ganze Ordner** geschützt wird (**Maximumprinzip**).

## Merksatz
- **CIA = Confidentiality, Integrity, Availability**.
- **200-1 ISMS, 200-2 Methodik, 200-3 Risiko, 200-4 BCM**.
- **normal – hoch – sehr hoch**.
- **Maximum, Kumulation, Verteilung**.
- **Risiko = Wahrscheinlichkeit × Schaden**.
- **Vermeiden, reduzieren, übertragen, akzeptieren**.

## Prüfungsfalle
- **Backup schützt Verfügbarkeit**, **nicht Vertraulichkeit**.
- **Hash schützt Integrität**, **nicht Vertraulichkeit**.
- **Verteilungseffekt** gilt meist **nur für Verfügbarkeit**.
- **Kern-Absicherung** ≠ **Basis-Absicherung** (Kern = nur Kronjuwelen).
- **Standard 100-x** ist **veraltet** → **200-x**.

## Grafik
### CIA-Dreieck
Dreieck mit Schloss (C), Siegel (I), Uhr (A).

### Schutzbedarfs-Ampel
Grün normal, gelb hoch, rot sehr hoch; Anwendungen erben nach oben.

### PDCA-Kreis
Plan, Do, Check, Act.

## Karteikarten
- F: Drei klassische Schutzziele? | A: Vertraulichkeit, Integrität, Verfügbarkeit.
- F: Was regelt BSI 200-2? | A: Die IT-Grundschutz-Methodik.
- F: Schutzbedarfskategorien? | A: Normal, hoch, sehr hoch.
- F: Was besagt das Maximumprinzip? | A: Der höchste Schutzbedarf der Anwendungen gilt für das System.
- F: Was ist der Kumulationseffekt? | A: Viele kleine Schäden ergeben zusammen einen höheren Schutzbedarf.
- F: Formel Risiko? | A: Eintrittswahrscheinlichkeit × Schadensausmaß.
- F: Vier Arten mit Risiko umzugehen? | A: Vermeiden, reduzieren, übertragen, akzeptieren.
- F: Was ist Least Privilege? | A: Nur minimal nötige Rechte vergeben.
- F: Welcher BSI-Standard behandelt BCM? | A: 200-4.

## Quiz
? Welches Schutzziel verletzt ein Ransomware-Angriff vor allem?
* Verfügbarkeit
- Nur Authentizität
- Keines
- Nur Zurechenbarkeit

? Ein Server betreibt Anwendungen mit Schutzbedarf normal und sehr hoch. Schutzbedarf des Servers?
* Sehr hoch
- Normal
- Hoch
- Durchschnitt

? Welche Maßnahme schützt die Integrität?
* Hashwert prüfen
- USV
- RAID 1
- Klimaanlage

? Welcher BSI-Standard beschreibt die Grundschutz-Methodik?
* 200-2
- 200-1
- 200-3
- 200-4

? Eine Versicherung gegen Cyberschäden ist welche Risikostrategie?
* Übertragen
- Vermeiden
- Akzeptieren
- Reduzieren
