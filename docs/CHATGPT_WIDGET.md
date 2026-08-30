# ChatGPT widget

The widget renders only structured data returned by the MCP tool: title, range, freshness, completeness, baseline maturity, bounded metric rows, findings, actions, evidence references, and limitations. It contains no free-form browser/API fetch, token, database access, raw series, note, route, medication, or hidden write control.

Missing values render as unavailable, partial data is labelled, at most three actions appear, and deterministic findings are visually distinct from optional narrative text. CSS supports light/dark themes, narrow containers, keyboard focus, reduced motion, and contrast.

`apps/chatgpt-widget/src/visualization.ts` validates the result before conversion to the view model. Tests cover missing/partial semantics and deterministic rendering. A real ChatGPT container screenshot remains unverified until the private app connection.
