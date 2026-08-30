# Performance report

The production build compiled in under one second on the local machine, completed TypeScript in about 3.7 seconds, and generated 26 static pages in about 1.2 seconds. The full 10-case two-viewport browser suite completed in 25.7 seconds. These are reproducibility observations, not service-level guarantees.

Database `EXPLAIN` evidence for the primary 90-day paths shows index scans on daily metrics, raw samples by user/metric/time with result cap, and coach reports by user/period. Query service ranges and points are bounded; it does not fetch all raw activity records for summaries.

No hosted Lighthouse, Web Vitals, network throttling, concurrent load, large-real-dataset, cold-start, Edge Function, Storage, or FIT decoder benchmark was run. Performance promotion therefore remains pending. The PWA caches only shell assets and never documents, API/auth responses, or authorized requests.
