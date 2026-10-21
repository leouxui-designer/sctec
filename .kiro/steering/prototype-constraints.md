---
inclusion: always
---

# SCTEC prototype boundaries

This repository owns only the SCTEC prototype. Design Hub is an external platform; do not edit Design Hub, CTM, the original SCTEC source, or sibling repositories.

Preserve manifest screen/journey/step IDs, protocol v1 compatibility, trusted-origin checks, bidirectional navigation, and standalone execution. Announce only capabilities implemented and tested. Do not add remote services, credentials, or real personal data. Keep the existing HTML/CSS/JavaScript application lightweight. Validate with npm test, npm run check, npm run build, and the documented browser integration tests when relevant.

Separate Git repositories and steering instructions are organizational safeguards, not filesystem security boundaries. Work in this repository alone and rely on OS/tool permissions to enforce write access.
