# Backup and recovery

Use provider-managed encrypted database backups plus a separately tested export strategy suitable for the selected plan. Private Storage/FIT objects may require a separate inventory/backup; database backups do not prove object recovery.

Quarterly or before major migrations:

1. Record project/database version, migration list, object inventory, and backup timestamp without values.
2. Restore to an isolated private project or local environment.
3. Validate row counts/checksums at aggregate metadata level, foreign keys, owner RLS, private Storage paths, RPC grants, and application smoke tests.
4. Confirm deleted/expired records are not unintentionally resurrected beyond documented backup retention.
5. Destroy the isolated restore safely after evidence capture.

Recovery order: secrets/roles → schema/migrations → database → Storage → app configuration → synthetic security tests → owner verification. Never test restore in the live project.
