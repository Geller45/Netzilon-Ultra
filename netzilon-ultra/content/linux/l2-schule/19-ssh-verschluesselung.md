---
id: linux-l2-19-ssh
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1, Schule]
block: L2
kapitel: Linux II – Administration
titel: 1.19 SSH und Verschlüsselung
stufe: Fortgeschritten
quellen: [1.19_Linux_-_SSH_und_Verschluesselung.pdf, LPI-Learning-Material-102-500-de.pdf]
verweise: [linux-102-110-3-verschluesselung, linux-l2-18-sicherheit, linux-l1-04-root-sudo, linux-l2-15-netzwerke]
---

## Profi

### Einordnung
**110.3 Daten durch Verschlüsselung schützen – Gewicht 3.** Themen: SSH-Client/Server, Schlüsselauthentifizierung, Agent, Tunnel, GnuPG, Grundlagen der Kryptografie.

### Kryptografie-Grundlagen
- **Symmetrisch**: ein Schlüssel zum Ver- und Entschlüsseln (AES, ChaCha20) – schnell, Problem Schlüsselaustausch.
- **Asymmetrisch**: Schlüsselpaar **öffentlich/privat** (RSA, ECDSA, **Ed25519**). Was mit dem öffentlichen Schlüssel verschlüsselt wurde, entschlüsselt nur der private; **Signatur** mit dem privaten Schlüssel, Prüfung mit dem öffentlichen.
- **Hashes** (SHA-256, nicht reversibel) sichern Integrität. **Hybrid**: asymmetrisch tauscht einen symmetrischen Sitzungsschlüssel aus. **Kodierung (Base64) ist keine Verschlüsselung.**

### SSH
- **SSH** (Secure Shell), TCP **22**, ersetzt Telnet/rsh. Server `sshd`, Konfiguration **`/etc/ssh/sshd_config`**, Client `/etc/ssh/ssh_config` und `~/.ssh/config`.
- Verbindung: `ssh benutzer@host`, `ssh -p 2222`, `ssh host befehl`, `scp datei host:/pfad`, `sftp`, `rsync -e ssh`.
- **Host-Schlüssel** `/etc/ssh/ssh_host_*_key`; der Client speichert Fingerabdrücke in **`~/.ssh/known_hosts`**. Warnung „REMOTE HOST IDENTIFICATION HAS CHANGED“ = Schlüssel geändert (Neuinstallation oder Man-in-the-Middle); alten Eintrag mit `ssh-keygen -R host` entfernen.
- **Schlüssel-Authentifizierung**: `ssh-keygen -t ed25519` erzeugt `~/.ssh/id_ed25519` (privat, Rechte **600**) und `.pub`; `ssh-copy-id benutzer@host` trägt den öffentlichen Schlüssel in **`~/.ssh/authorized_keys`** des Servers ein (`~/.ssh` 700, Datei 600).
- **ssh-agent** hält entschlüsselte Schlüssel im Speicher: `eval $(ssh-agent)`, `ssh-add`.
- Härtung in `sshd_config`: `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes`, `AllowUsers anna`, `Port`; danach `systemctl reload sshd`. **Vorher mit zweiter Sitzung testen!**
- **Tunnel**: `-L 8080:intern:80` (lokal), `-R` (remote), `-D 1080` (SOCKS), `-X` X11-Forwarding, `-J` Jumphost.

### GnuPG
- `gpg --gen-key`, `--list-keys`, `--export -a`, `--import`, `-e -r empfänger datei` (verschlüsseln), `-s` (signieren), `-c` (symmetrisch), `-d` (entschlüsseln). Schlüsselring `~/.gnupg/`. Widerrufszertifikat anlegen!
- Verschlüsselte Datenträger: **LUKS/dm-crypt** (`cryptsetup luksFormat`, `luksOpen`).

## Einfach

Stell dir vor, du willst einem Freund ein **Geheimnis** per Post schicken, aber die Post liest mit. Bei **SSH** läuft das so: Dein Computer und der Server bauen einen **verschlüsselten Tunnel**. Von außen sieht ein Lauscher nur Kauderwelsch.

Beim ersten Besuch zeigt dir der Server seinen **Fingerabdruck**, wie einen Personalausweis. Du sagst „ja, das ist er“, und dein Computer merkt ihn sich (`known_hosts`). Taucht später ein anderer Ausweis auf, schlägt dein Computer Alarm.

Statt Passwort kannst du ein **Schlüsselpaar** benutzen: Du hast ein **Schloss** (öffentlicher Schlüssel) und einen **Schlüssel** (privater Schlüssel). Das Schloss darfst du an jeden Server hängen. Den Schlüssel behältst du streng für dich. Wer den Schlüssel hat, kommt hinein – deshalb darf die Datei nur du lesen (Rechte 600).

Das Schloss hängst du mit `ssh-copy-id` an den Server. Danach brauchst du kein Passwort mehr. Für Server ist das sicherer, weil niemand Passwörter erraten kann.

Eine Verschlüsselung mit **zwei Schlüsseln** nennt man **asymmetrisch**. Mit einem **gemeinsamen** Schlüssel (wie ein Haustürschlüssel für alle) heißt sie **symmetrisch**. In der Praxis kombiniert man beides: Das Schloss schützt den Austausch des gemeinsamen Schlüssels, der dann die Daten schnell verschlüsselt.

**Wichtig:** Nur kodieren (z. B. Base64) ist keine Verschlüsselung – das ist wie eine Geheimschrift, die jeder lesen kann.

## Merksatz
- **Öffentlich = Schloss, privat = Schlüssel.**
- **Der private Schlüssel verlässt nie den Rechner (Rechte 600).**
- **known_hosts = Server kennen, authorized_keys = Clients zulassen.**
- **Port 22, ssh-keygen → ssh-copy-id → PasswordAuthentication no.**
- **Base64 ist kein Schutz.**
- **Root-Login per SSH aus.**

## Prüfungsfalle
- `authorized_keys` liegt auf dem **Server**, `known_hosts` auf dem **Client**.
- `ssh-copy-id` kopiert den **öffentlichen** Schlüssel, nie den privaten.
- Rechte: `~/.ssh` **700**, privater Schlüssel **600**; zu offene Rechte → SSH lehnt den Schlüssel ab.
- Konfigurationsdatei des Servers: `sshd_config` (mit **d**), des Clients `ssh_config`.
- Nach Änderung der sshd_config: `reload`/`restart`, und **vor dem Schließen** eine zweite Sitzung testen.
- `scp -P` (großes P) für den Port, `ssh -p` (kleines p).
- Signieren mit **privatem**, Prüfen mit **öffentlichem** Schlüssel; Verschlüsseln an Empfänger mit dessen **öffentlichem** Schlüssel.
- Hash ≠ Verschlüsselung (nicht umkehrbar).

## Grafik

### SSH-Anmeldung per Schlüssel
1. Client -> Server: Verbindungsaufbau auf Port 22
2. Server -> Client: sendet Host-Schlüssel (Fingerabdruck)
3. Client: prüft known_hosts
4. Client -> Server: öffentlicher Schlüssel, Aufforderung zur Anmeldung
5. Server -> Client: Challenge verschlüsselt mit Public Key aus authorized_keys
6. Client -> Server: Antwort mit privatem Schlüssel signiert
7. Server: Anmeldung erfolgreich, Shell startet

### Hybride Verschlüsselung
1. Sender: erzeugt zufälligen Sitzungsschlüssel
2. Sender -> Empfänger: Sitzungsschlüssel, mit öffentlichem Schlüssel verschlüsselt
3. Sender -> Empfänger: Daten, symmetrisch verschlüsselt
4. Empfänger: entschlüsselt Sitzungsschlüssel mit privatem Schlüssel, dann die Daten

## Lab
**Maschinen**: client01 (Debian) und srv-web01 (Debian, sshd läuft).
```bash
# auf client01 – Schlüsselpaar erzeugen und verteilen
ssh-keygen -t ed25519 -C "anna@client01"
ssh-copy-id anna@srv-web01
ssh anna@srv-web01 hostname

# auf client01 – Agent
eval $(ssh-agent); ssh-add

# auf client01 – Tunnel und Dateien
ssh -L 8080:localhost:80 anna@srv-web01
scp datei.txt anna@srv-web01:/tmp/
ssh-keygen -R srv-web01

# auf srv-web01 – Härtung
sudo nano /etc/ssh/sshd_config      # PermitRootLogin no ; PasswordAuthentication no
sudo sshd -t && sudo systemctl reload ssh

# auf client01 – GnuPG
gpg --gen-key
echo "geheim" > n.txt; gpg -c n.txt; gpg -d n.txt.gpg
```

## Befehle
- `ssh user@host` – Verbindung
- `ssh-keygen -t ed25519` – Schlüsselpaar erzeugen
- `ssh-copy-id user@host` – öffentlichen Schlüssel installieren
- `ssh-add` – Schlüssel in den Agent laden
- `ssh -L lport:ziel:zport host` – lokaler Tunnel
- `scp quelle ziel` – kopieren über SSH
- `ssh-keygen -R host` – Eintrag aus known_hosts entfernen
- `sshd -t` – Konfiguration testen
- `gpg --gen-key` – GnuPG-Schlüssel erzeugen
- `gpg -e -r empfaenger datei` – verschlüsseln
- `cryptsetup luksFormat /dev/sdb1` – LUKS einrichten

## Übungen
- A: Auf welchem Port läuft SSH standardmäßig? | L: TCP 22
- A: Wie legst du Schlüssel an und bringst ihn zum Server? | L: ssh-keygen -t ed25519, dann ssh-copy-id user@server
- A: In welcher Datei stehen auf dem Server die erlaubten öffentlichen Schlüssel? | L: ~/.ssh/authorized_keys
- A: Welche Rechte braucht der private Schlüssel? | L: 600
- A: Wie verbietest du Passwort-Login? | L: PasswordAuthentication no in /etc/ssh/sshd_config, dann reload
- A: Welcher Schlüssel signiert, welcher prüft? | L: Privat signiert, öffentlich prüft.
- A: Wie entfernst du einen veralteten Hosteintrag? | L: ssh-keygen -R host

## Karteikarten
- F: Was ist der Unterschied symmetrisch/asymmetrisch? | A: Symmetrisch: ein gemeinsamer Schlüssel; asymmetrisch: Schlüsselpaar (öffentlich/privat).
- F: Welche Datei enthält die bekannten Server-Fingerabdrücke? | A: ~/.ssh/known_hosts
- F: Welche Datei listet die zugelassenen Client-Schlüssel? | A: ~/.ssh/authorized_keys
- F: Welcher Befehl kopiert den Public Key auf den Server? | A: ssh-copy-id
- F: Welchen Port hat SSH? | A: 22/TCP
- F: Wofür dient ssh-agent? | A: Hält entschlüsselte private Schlüssel im Speicher, damit die Passphrase nur einmal nötig ist.
- F: Was bedeutet -L 8080:localhost:80 bei ssh? | A: Lokaler Port 8080 wird durch den Tunnel zu Port 80 am Ziel weitergeleitet.
- F: Was ist GnuPG? | A: Freie Implementierung von OpenPGP zum Verschlüsseln und Signieren.
- F: Was ist LUKS? | A: Standard für Festplattenverschlüsselung unter Linux (dm-crypt).
- F: Ist Base64 eine Verschlüsselung? | A: Nein, nur eine Kodierung.
- F: Wie heißt die Serverkonfigurationsdatei von SSH? | A: /etc/ssh/sshd_config

## Quiz
? Auf welchem Port läuft SSH standardmäßig?
* 22
- 23
- 21
- 443

? In welcher Datei stehen auf dem Server die erlaubten öffentlichen Schlüssel?
* ~/.ssh/authorized_keys
- ~/.ssh/known_hosts
- /etc/ssh/ssh_config
- ~/.ssh/id_ed25519

? Welche Rechte soll ein privater SSH-Schlüssel haben?
* 600
- 644
- 666
- 777

? Welcher Befehl installiert den öffentlichen Schlüssel auf dem Zielsystem?
* ssh-copy-id
- ssh-add
- scp-key
- ssh-agent

? Womit verschlüsselt man eine Nachricht an einen Empfänger?
* Mit dessen öffentlichem Schlüssel
- Mit dessen privatem Schlüssel
- Mit dem eigenen privaten Schlüssel
- Mit einem Hash

? Was bewirkt PermitRootLogin no?
* Der direkte root-Login per SSH wird verboten
- Alle Logins werden verboten
- root darf kein sudo benutzen
- root-Passwort wird gesperrt

? Welche Option setzt bei scp den Port?
* -P
- -p
- -o
- -a

? Welche Aussage über Base64 ist richtig?
* Es ist eine Kodierung ohne Schutzwirkung
- Es ist ein starkes Verschlüsselungsverfahren
- Es ist ein Hash
- Es ist ein Signaturverfahren

? Wie heißt der Server-Dienst von SSH?
* sshd
- sshs
- sshd-agent
- openvpnd

? Welcher Befehl entfernt einen veralteten Server-Eintrag aus known_hosts?
* ssh-keygen -R host
- ssh-add -d host
- ssh -r host
- rm ~/.ssh/id_rsa

## Lücken
- Der private Schlüssel braucht die Rechte {600}.
- Auf dem Client liegt die Datei {known_hosts}, auf dem Server {authorized_keys}.
- Zum Signieren verwendet man den {privaten} Schlüssel.

## Spickzettel
- SSH 22/TCP · sshd_config (Server) · ssh_config (Client)
- ssh-keygen → ssh-copy-id → authorized_keys
- known_hosts (Client) · ssh-keygen -R
- ~/.ssh 700 · private Key 600
- Tunnel: -L -R -D · scp -P · ssh -p
- Härtung: PermitRootLogin no · PasswordAuthentication no
- gpg -e -s -c -d · LUKS = cryptsetup
- Base64 ≠ Verschlüsselung
