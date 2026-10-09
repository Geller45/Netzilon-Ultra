---
id: linux-102-110-3-verschluesselung
bereich: Linux
fach: Linux II
pruefungen: [LPIC-1]
block: LPIC-102
kapitel: LPIC-1 Prüfung 102 – Sicherheit
titel: 110.3 Daten durch Verschlüsselung schützen
stufe: Fortgeschritten
quellen: [LPI-Learning-Material-102-500-de.pdf, 1.19_Linux_-_SSH_und_Verschluesselung.pdf]
verweise: [linux-l2-19-ssh, linux-102-110-2-absichern]
---

## Profi

### Lernziel (Gewicht 3)
SSH-Schlüsselpaare, Agent und Tunnel, GnuPG, Grundlagen von Verschlüsselung und Zertifikaten.

### Kryptografie-Grundlagen
- **Symmetrisch** (ein Schlüssel; AES, ChaCha20): schnell. **Asymmetrisch** (öffentlich/privat; RSA, ECDSA, Ed25519): Schlüsselaustausch, Signaturen. **Hashes** (SHA-256, SHA-512; MD5/SHA-1 unsicher): Integrität. TLS kombiniert alles. Zertifikate (X.509) binden Schlüssel an Identitäten, signiert von einer CA.

### SSH
- Dienst `sshd`, Konfiguration `/etc/ssh/sshd_config` (Port 22, `PermitRootLogin`, `PasswordAuthentication`, `PubkeyAuthentication`, `AllowUsers`), Client `/etc/ssh/ssh_config`, `~/.ssh/config`.
- Schlüsselpaar: `ssh-keygen -t ed25519` → `~/.ssh/id_ed25519` (privat, 0600) und `.pub`. Verteilen: `ssh-copy-id user@host` → `~/.ssh/authorized_keys`. Host-Schlüssel in `/etc/ssh/ssh_host_*`; Fingerprint-Vergleich bei erster Verbindung, danach `~/.ssh/known_hosts`.
- **ssh-agent**: `eval $(ssh-agent)`, `ssh-add` hält entsperrte Schlüssel im Speicher.
- Tunnel: lokal `ssh -L 8080:intern:80 user@jump`, remote `-R`, dynamisch (SOCKS) `-D 1080`. Datei: `scp`, `sftp`, `rsync -e ssh`.

### GnuPG
- `gpg --full-generate-key`, `--list-keys`, `--armor --export`, `--import`, `-e -r empfänger datei` (verschlüsseln), `-d` (entschlüsseln), `--sign`, `--verify`, `-c` (symmetrisch). Widerrufszertifikat: `--gen-revoke`. Dateien `~/.gnupg/`.

### Datenträger
`cryptsetup` (LUKS/dm-crypt) für Festplattenverschlüsselung (Überblick).

## Einfach

Verschlüsseln heißt: Eine Nachricht so **durcheinanderbringen**, dass nur der Richtige sie wieder lesbar machen kann.

Es gibt zwei Arten. Beim **symmetrischen** Verfahren benutzen beide denselben Schlüssel, wie bei einem Hausschlüssel für alle. Beim **asymmetrischen** Verfahren hat jeder zwei Schlüssel: einen **öffentlichen** (den darf jeder haben, wie ein Briefkasten-Einwurf) und einen **privaten** (den behältst du geheim, wie den Briefkastenschlüssel). Jeder kann dir etwas einwerfen, nur du kannst es öffnen.

**SSH** nutzt das, um sicher auf anderen Rechnern zu arbeiten. Mit `ssh-keygen` erzeugst du dein Schlüsselpaar. Den öffentlichen Schlüssel kopierst du mit `ssh-copy-id` auf den Server. Danach kommst du ohne Passwort rein, weil der Server sich dein „Schloss“ gemerkt hat. Den privaten Schlüssel gibst du **nie** weiter.

Mit **GnuPG** (`gpg`) verschlüsselst du einzelne Dateien oder E-Mails für eine bestimmte Person oder unterschreibst sie digital, damit jeder prüfen kann, dass sie von dir stammen.

Und ein **SSH-Tunnel** ist wie ein geheimer Gang: Du leitest einen Port durch die verschlüsselte SSH-Verbindung und erreichst so auch Dienste, die sonst nicht von außen sichtbar sind.

## Merksatz
- **Öffentlich verteilen, privat behalten.**
- **Privater Schlüssel: Rechte 600.**
- **Verschlüsseln mit dem öffentlichen Schlüssel des Empfängers, signieren mit dem eigenen privaten.**
- **-L lokal, -R remote, -D SOCKS.**

## Prüfungsfalle
- Verschlüsselt wird mit dem **öffentlichen** Schlüssel des Empfängers, signiert mit dem eigenen **privaten**.
- Zu offene Rechte auf dem privaten Schlüssel → SSH lehnt ihn ab.
- Ändert sich der Host-Key, warnt SSH (known_hosts) – nicht blind ignorieren.
- `authorized_keys` liegt auf dem **Server**, `known_hosts` auf dem **Client**.

## Grafik

### SSH-Schlüssel-Login
1. Client: ssh-keygen erzeugt Schlüsselpaar
2. Client -> Server: ssh-copy-id kopiert öffentlichen Schlüssel
3. Server: Schlüssel in authorized_keys gespeichert
4. Client -> Server: Verbindung mit Schlüssel
5. Server -> Client: Challenge, mit privatem Schlüssel signiert
6. Server: Zugriff gewährt

## Lab
**Maschine**: debian01 (Client) und debian02 (Server).
```bash
# auf debian01
ssh-keygen -t ed25519
ssh-copy-id philipp@debian02
ssh philipp@debian02
ssh -L 8080:localhost:80 philipp@debian02
gpg --full-generate-key
echo test > t.txt && gpg -c t.txt
```

## Befehle
- `ssh-keygen -t ed25519` – Schlüsselpaar
- `ssh-copy-id user@host` – Schlüssel verteilen
- `ssh-add` – Schlüssel in den Agent
- `ssh -L lport:ziel:zport host` – lokaler Tunnel
- `gpg -e -r name datei` – verschlüsseln
- `gpg -d datei.gpg` – entschlüsseln
- `cryptsetup luksFormat /dev/sdb1` – LUKS einrichten

## Übungen
- A: In welche Datei kommt der öffentliche Schlüssel auf dem Server? | L: ~/.ssh/authorized_keys
- A: Welche Rechte hat der private Schlüssel? | L: 600
- A: Wie leitest du lokalen Port 8080 auf Port 80 von srv? | L: `ssh -L 8080:localhost:80 user@srv`

## Karteikarten
- F: Was ist asymmetrische Verschlüsselung? | A: Schlüsselpaar aus öffentlichem und privatem Schlüssel.
- F: Wo liegt authorized_keys? | A: ~/.ssh/authorized_keys auf dem Server.
- F: Wofür dient known_hosts? | A: Speichert Host-Schlüssel bekannter Server (Client).
- F: Was macht ssh-agent? | A: Hält entsperrte private Schlüssel im Speicher.
- F: Welche Option macht einen SOCKS-Proxy? | A: ssh -D
- F: Wie verschlüsselt man mit gpg für Anna? | A: gpg -e -r anna datei
- F: Was bedeutet LUKS? | A: Standard für Festplattenverschlüsselung (dm-crypt/cryptsetup).
- F: Welcher Algorithmus ist symmetrisch? | A: AES
- F: Welche Rechte für ~/.ssh? | A: 700 (Verzeichnis), 600 (Schlüssel/authorized_keys).
- F: Wofür steht Ed25519? | A: Moderner Signatur-/Schlüsseltyp (elliptische Kurven).

## Quiz
? Mit welchem Schlüssel verschlüsselt man für einen Empfänger?
* Seinem öffentlichen Schlüssel
- Seinem privaten Schlüssel
- Dem eigenen privaten Schlüssel
- Dem eigenen öffentlichen Schlüssel

? Wo liegt der öffentliche Schlüssel des Clients auf dem Server?
* ~/.ssh/authorized_keys
- ~/.ssh/known_hosts
- /etc/ssh/ssh_config
- ~/.ssh/id_rsa

? Welcher Befehl verteilt den Schlüssel?
* ssh-copy-id
- ssh-add
- ssh-agent
- scp -k

? Welche Option erzeugt einen lokalen Tunnel?
* -L
- -R
- -D
- -X

? Welcher Befehl erzeugt ein GPG-Schlüsselpaar?
* gpg --full-generate-key
- gpg --new
- gpg -c
- gpg --sign

? Welche Rechte soll der private SSH-Schlüssel haben?
* 600
- 644
- 666
- 755

? Welcher Algorithmus ist symmetrisch?
* AES
- RSA
- ECDSA
- Ed25519

? Welche Datei konfiguriert den SSH-Server?
* /etc/ssh/sshd_config
- /etc/ssh/ssh_config
- ~/.ssh/config
- /etc/sshd.conf

## Lücken
- {authorized_keys} liegt auf dem Server.
- Der private Schlüssel braucht die Rechte {600}.
- Ein SOCKS-Proxy entsteht mit ssh {-D}.

## Spickzettel
- ssh-keygen → ssh-copy-id → ssh
- authorized_keys (Server), known_hosts (Client)
- sshd_config: PermitRootLogin, PasswordAuthentication
- gpg -e -r / -d / --sign
- LUKS = cryptsetup
