# Retention

Defaults are intentionally short and configurable.

| Data                               | Default                                        | Deletion path                             |
| ---------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| Raw normalized samples             | 30 days in server configuration                | Scheduled owner-scoped deletion           |
| Raw FIT object                     | Delete after successful parse                  | Storage deletion plus tombstoned metadata |
| FIT parse metadata                 | Retained for provenance until account deletion | Account/scoped deletion job               |
| Daily aggregates/baselines/reports | Until user deletes account or scope            | Export then deletion workflow             |
| Wellbeing notes                    | Until user edits/deletes or account deletion   | Direct owner action/deletion job          |
| Export artefact                    | Short-lived signed object; expiry required     | Scheduled object deletion                 |
| Safe audit events                  | Operational period defined by owner            | Scheduled redacted retention job          |
| Revoked credential hash            | Limited revocation/audit window                | Scheduled cleanup                         |

Retention configuration must be confirmed on the hosted project. Backups can preserve deleted data until the provider’s backup window expires; the production privacy notice must state that lag. No release archive contains operational data.
