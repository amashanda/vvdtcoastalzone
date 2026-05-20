# VVDT — Design Decisions Log
### CRDB Bank PLC · Coastal Zone

Decisions recorded in chronological order. Each entry captures the choice, the reason it was made, and any important consequences.

---

## D-01 · Vanilla HTML/CSS/JS — no framework

**Decision:** Build the entire SPA in plain HTML, CSS, and JavaScript. No React, Vue, or Angular. No build step.

**Reason:** Zero friction for local use — open `index.html` in any browser with no install. Prototype velocity over scalability. Easier for the bank's IT team to inspect, copy, and hand off.

**Consequence:** The render cycle is a full `innerHTML` wipe on every state change. This is fast enough for the dataset sizes in scope (~hundreds of entries). A production rebuild would use React/Next.js.

---

## D-02 · Single `script.js` — all logic in one file

**Decision:** Keep all application logic in a single file (~2 100 lines).

**Reason:** No module bundler means no easy code splitting. One file is easier to read, grep, hand to a new developer, or paste into an AI tool for edits.

**Consequence:** The file grows with every feature. When it exceeds ~3 000 lines the cognitive overhead justifies splitting into logical modules (auth, kpis, reports, admin, etc.) even without a bundler.

---

## D-03 · localStorage as primary storage, Firestore as cloud backup

**Decision:** `localStorage` is the source of truth. Firestore is a write-only backup layer.

**Reason:** The prototype must work offline and without any backend. Firestore was added later as an optional safety net to prevent accidental data loss.

**Consequence:** `loadState()` is synchronous (reads `localStorage` only). `saveState()` is `async` (writes `localStorage` first, then Firestore). The app never waits for Firestore to continue. Firestore data is not currently used for app state recovery — it is a raw backup only.

**Critical failure avoided:** An earlier version made `loadState()` async. This caused `let state = loadState()` to store a Promise instead of the state object, blanking the entire app. Rolled back to synchronous immediately.

---

## D-04 · Storage key `vvdt-rollout-state-v4`

**Decision:** Use a versioned key for localStorage. Current version is `v4`.

**Reason:** Breaking state schema changes (e.g. adding a new required field) must not crash the app for existing users. Bumping the key forces a fresh state. Migrations in `loadState()` handle backward compatibility without a key bump when non-breaking.

**Migration pattern:**
```js
// Add feature to existing users without wiping their data:
["BQA", "BM"].forEach((role) => {
  if (merged.rolePermissions[role] && !merged.rolePermissions[role].includes("reports")) {
    merged.rolePermissions[role] = [...merged.rolePermissions[role], "reports"];
  }
});
```

---

## D-05 · Rolling 3-snapshot backup

**Decision:** Before every `saveState()`, rotate the current state into `vvdt-backup-1/2/3`.

**Reason:** `localStorage` is mutable — a bad save could corrupt weeks of data. Three rolling snapshots give a 3-step undo without external tooling.

**Consequence:** Admin can restore from any snapshot via Admin → System → Backup & Restore.

---

## D-06 · Role type hierarchy (`Super` / `Zonal` / `Branch`)

**Decision:** Every role has a `type` field in `roleCatalog`, not just a flat role name.

**Reason:** Feature logic needed to treat all "admin-like" roles uniformly (`isSuperRole()`), all "zone-wide" roles uniformly (`isZonalRole()`), and all "branch-scoped" roles uniformly. Hard-coding `["Admin", "ZBM", "ZM"]` everywhere would break when new roles are added.

**Rules:**
- `Super` roles → can see all entries, all branches, select any user in capture
- `Zonal` roles → can see all entries; no branch assignment (`branchId = "zonal"`)
- `Branch` roles → scoped to their `branchId`; capture locked to self (except Super)

---

## D-07 · Sort code as branch ID

**Decision:** The branch sort code (e.g. `"3330"`) doubles as the unique branch identifier.

**Reason:** Sort codes are already the canonical identifier used by CRDB operations. Using them avoids a surrogate key layer and makes exported data immediately recognisable.

**Consequence:** Branch IDs are strings, not integers. All comparisons use `String(branchId)`.

---

## D-08 · KPI weight guard (≤ 100%)

**Decision:** Prevent saving KPI weights if the total exceeds 100%.

**Reason:** The scoring formula normalises by total weight. Weights above 100% are not inherently broken mathematically, but they signal a configuration error and mislead users on the percentage shown.

**Implementation:** The form submit handler rejects, and a live counter on the weight inputs turns red while the user types.

---

## D-09 · Firebase credentials never committed

**Decision:** `firebase-config.js` is in `.gitignore`. Credentials are injected at deploy time via a GitHub Actions secret.

**Reason:** A real `apiKey` was accidentally committed in an early commit (`commit 45032ab8`). GitHub's secret scanning flagged it. The key was rotated, the history was rewritten with `git-filter-repo`, and a hardened injection pattern was adopted.

**Workflow:**
1. Developer creates `firebase-config.js` locally (never committed).
2. GitHub Actions reads `FIREBASE_CONFIG_JSON` secret and writes `firebase-config.js` during CI.
3. `firebase-config.example.js` is the safe template committed to the repo.

**GCP API key restrictions:** Cloud Firestore API + Firebase Installations API only.

---

## D-10 · BQA and BM capture under own name only

**Decision:** BQA and BM are locked to their own name in Daily Capture. Only Admin/Super can select a different user.

**Reason:** BQA/BM each have their own Individual KPI targets (based on their staff profile, e.g. TL). Their entries form part of their branch's consolidated performance. Allowing them to submit under another name would corrupt the branch performance data and create accountability gaps.

**Implementation:** `captureView()` renders a disabled text field + hidden input for locked roles instead of a `<select>`. `staffOptions()` only builds a dropdown for `isSuperRole()` users.

---

## D-11 · BQA/BM see Reports module

**Decision:** Added `"reports"` to BQA and BM default permissions.

**Reason:** BQA and BM need to see branch-consolidated performance — staff leaderboard, KPI progress bars, entry detail table scoped to their branch. Previously they had no reports access.

**Data scoping guarantee:** `entriesVisibleTo()` already scopes BQA/BM to their own branch. Reports simply reads `filteredEntries(user)`, which calls `entriesVisibleTo()` at its base. No data leakage between branches.

---

## D-12 · Login page hero image

**Decision:** Use `Coastal Zone Dhow.jpg` as the full-height login background.

**Reason:** The bank's Coastal Zone identity centres on the dhow. The image was converted from `Coastal Zone Dhow.pdf` using `sips -Z 1920` (614 KB JPEG, 1920 px wide). The original `DHOW IMAGE.jpg` is retained in the folder but no longer used.

---

## D-13 · Tagline

**Decision:** Replace "Dhow Family, We Achieve Together" with "One Dhow. One Direction. One Results."

**Reason:** Direct request from the zone. The new tagline appears in the app header topbar on every screen.

---

## D-14 · General profile group for Admin/Super users

**Decision:** Added a "General" optgroup in the profile selector for Admin and Super users.

**Profiles in General group:** System Admin, Manager, Superuser, Analyst.

**Reason:** Admin and Super users do not fit the branch staff profile taxonomy (MBB, RO, TL, etc.). A distinct group prevents them from being miscategorised and avoids polluting KPI filtering logic that matches KPIs to profiles.

---

## D-15 · SheetJS for bulk Excel import

**Decision:** Load SheetJS (`xlsx-0.20.3`) from the official CDN for Excel/CSV parsing.

**Reason:** No server-side processing. SheetJS runs entirely in the browser, parses `.xlsx`, `.xls`, and `.csv`, and returns a plain array-of-arrays. No upload endpoint needed.

**CDN:** `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`

**Fallback:** If the CDN is unavailable (no internet), the parse button shows an alert and the feature is unavailable — the rest of the app is unaffected.
