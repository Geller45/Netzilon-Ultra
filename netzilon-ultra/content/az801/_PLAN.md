# AZ-801 – Seitenplan (jede Zeile des Inhaltsverzeichnisses = eine Seite; A9 = D1+D2, A10 = D3–D5)

## D1 Sicherheit (d1-sicherheit) – A9
- [x] 01 Exploit Protection / WDAC / SmartScreen
- [x] 02 Defender for Endpoint / Credential Guard
- [x] 03 Sicherheits-Baselines per GPO
- [x] 04 Kennwortrichtlinien / Password Block Lists
- [x] 05 Protected Users
- [x] 06 RODC-Kontosicherheit
- [x] 07 DC-Härtung / Zugriff beschränken
- [x] 08 Authentication Policy Silos
- [x] 09 Admingruppen / AD-Delegierung
- [x] 10 Defender for Identity / Sentinel / Defender for Cloud
- [x] 11 Windows Defender Firewall (lokal)
- [x] 12 Domänenisolierung
- [x] 13 Verbindungssicherheitsregeln (IPsec)
- [x] 14 BitLocker inkl. Recovery
- [x] 15 Azure Disk Encryption
## D2 Hochverfügbarkeit (d2-hochverfuegbarkeit) – A9 (komplett)
- [x] 01 Failover-Cluster · [x] 02 Stretch-Cluster · [x] 03 Cluster-Storage/Quorum/Cloud Witness · [x] 04 Cluster-Netzwerk/Floating IP/Load Balancing · [x] 05 Cluster Sets/SOFS · [x] 06 Cluster-Aware Updating/Rolling Upgrade · [x] 07 Knoten-Recovery/Failover · [x] 08 Storage Spaces Direct
## D3 Disaster Recovery (d3-disaster-recovery) – A10
- [x] 01 Azure Backup (MARS/MABS/Recovery Services Vault) · [ ] 02 Backup-Richtlinien/VM-Restore · [ ] 03 Azure Site Recovery · [ ] 04 Hyper-V Replica
## D4 Migration (d4-migration) – A10
- [x] 01 Storage Migration Service · [ ] 02 Azure Files · [ ] 03 Azure Migrate · [ ] 04 Migration IIS/Hyper-V/RDS/DHCP/Druckserver · [ ] 05 IIS → Web Apps/Container · [ ] 06 ADMT/neue Gesamtstruktur/Forest-Upgrade
## D5 Monitoring & Troubleshooting (d5-monitoring) – A10
- [x] 01 Leistungsüberwachung/Datensammlersätze · [ ] 02 WAC-Warnungen/System Insights · [ ] 03 Ereignisprotokolle · [ ] 04 Log Analytics/Azure Monitor/VM Insights · [ ] 05 Netzwerk-Troubleshooting · [ ] 06 Azure-VM-Troubleshooting · [ ] 07 AD-Papierkorb · [ ] 08 DSRM/SYSVOL-Recovery · [ ] 09 AD-Replikation · [ ] 10 Hybrid-Authentifizierung

## Vorab vergebene IDs (Querverweise)
az801-exploit-wdac, az801-credential-guard, az801-baselines, az801-kennwortrichtlinien; fertig: az801-protected-users, az801-rodc-sicherheit, az801-dc-haertung, az801-auth-silos, az801-admin-delegierung, az801-defender-identity, az801-firewall-lokal, az801-domaenenisolierung, az801-ipsec-verbindungssicherheit, az801-bitlocker, az801-azure-disk-encryption (D1 komplett)
D2 fertig: az801-failover-cluster, az801-stretch-cluster, az801-cluster-storage-quorum, az801-cluster-netzwerk, az801-cluster-sets-sofs, az801-cau-rolling-upgrade, az801-knoten-recovery, az801-s2d
Noch zu vergeben (D3–D5): az801-hyperv-replica (D3-04, bereits von D2-02 verlinkt), az801-azure-backup, az801-asr, az801-sms, az801-azure-migrate, az801-admt, az801-ad-papierkorb, az801-dsrm-sysvol, az801-ad-replikation
