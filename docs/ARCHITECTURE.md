# VVDT — Architecture Reference
### CRDB Bank PLC · Coastal Zone

---

## 1. Application Type

**Vanilla HTML/CSS/JS Single-Page Application (SPA)**  
No framework. No build step. No npm install. Open `index.html` in any browser.

The entire UI is a string template rendered into `<div id="app">`.  
Every state change calls `render()` → which wipes `#app.innerHTML` → then calls `bindEvents()`.

---

## 2. File Map

```
VVDT COASTAL ZONE/
├── index.html                  # App shell — 4 script tags, 1 stylesheet
├── script.js                   # ~2 100 lines — ALL app logic
├── styles.css                  # ~1 300 lines — all styles
├── firebase.js                 # Firebase/Firestore module init
├── firebase-config.js          # GITIGNORED — real credentials
├── firebase-config.example.js  # Safe template, committed
├── CRDB logo.png               # Brand logo
├── Coastal Zone Dhow.jpg       # Login hero image
├── .gitignore                  # Ignores firebase-config.js, .DS_Store, node_modules
├── .github/workflows/deploy.yml # CI/CD — Pages deployment + secret injection
├── database-schema.sql         # PostgreSQL starter schema (future production)
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   ├── DECISIONS.md            # Key design decisions
│   └── PENDING.md              # Backlog and future work
```

---

## 3. Script Loading Order (`index.html`)

```html
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<script src="firebase-config.js"></script>       <!-- sets window.FIREBASE_CONFIG -->
<script type="module" src="firebase.js"></script> <!-- sets window.db, window.addDoc, etc. -->
<script src="script.js"></script>                 <!-- reads window.FIREBASE_CONFIG, calls render() -->
```

`firebase.js` is an ES module — it runs asynchronously. `script.js` is a classic script that reads `window.db` lazily (only in `saveState()`), so load order is safe.

---

## 4. State Architecture

### Single mutable object

```js
let state = loadState();   // populated from localStorage on page load
```

### Shape of `state`

```js
{
  activeUserId: null | Number,
  activeView: "dashboard" | "capture" | "validation" | "bmReview" | "reports" | "audit" | "admin",
  authMode: "login" | "signup",
  reportPeriod: "Daily" | "Weekly" | "Monthly" | "Quarterly",
  editingBranchId: null | String,
  adminSection: "users" | "roles" | "branches" | "kpi" | "system",
  roleCatalog: RoleEntry[],
  rolePermissions: { [roleKey]: moduleKey[] },
  branches: Branch[],
  kpis: KPI[],
  users: User[],
  entries: Entry[],
  branchReports: BranchReport[],
  reportFilters: { branches: String[], staffId: String, dateFrom: String, dateTo: String, status: String },
  bulkPreview: null | { rows: BulkRow[] },
  generatedPassword: null | { phone, password },
  auditLogs: AuditLog[]
}
```

### Persistence

| Layer | Key | Purpose |
|-------|-----|---------|
| localStorage | `vvdt-rollout-state-v4` | Primary storage — full state JSON |
| localStorage | `vvdt-backup-1/2/3` | Rolling 3-snapshot rotation |
| Firestore | `backups` collection | Cloud backup on every save (optional) |

**`saveState()`** is `async` — rotates localStorage snapshots, writes to `localStorage`, then writes to Firestore if `window.db` is available.  
**`loadState()`** is **synchronous** — reads from `localStorage` only (never waits for Firestore).

### State migrations in `loadState()`

Every schema change gets a migration block:
- `HR` → `HRBP` role rename
- Admin catalog entry gets `type: "Super"`
- Any missing role catalog entries are backfilled from `defaultRoleCatalog`
- Any missing role permissions are backfilled from `defaultRolePermissions`
- BQA and BM get `"reports"` module added if absent

---

## 5. Key Constants

```js
const STORAGE_KEY = "vvdt-rollout-state-v4";
const BACKUP_KEYS = ["vvdt-backup-1", "vvdt-backup-2", "vvdt-backup-3"];

const MODULES = [
  { key: "dashboard" }, { key: "capture" }, { key: "validation" },
  { key: "bmReview" }, { key: "reports" }, { key: "audit" },
  { key: "admin" }, { key: "demoAccess" }
];
```

---

## 6. Role System

### Role type hierarchy

```
Super   → Admin (full access, no branch restriction)
Zonal   → ZBM, ZM, ZQA, HRBP (zone-wide visibility, branchId = "zonal")
Branch  → Staff, BQA, BM (scoped to one branch, branchId = sort code)
```

### Key functions

| Function | Description |
|----------|-------------|
| `isSuperRole(role)` | Checks `roleCatalog` for `type === "Super"` |
| `isZonalRole(role)` | Checks `roleCatalog` for `type === "Zonal"` |
| `hasAccess(user, moduleKey)` | Checks `state.rolePermissions[user.role]` |
| `ensureAllowedView(user)` | Redirects to dashboard if current view not permitted |
| `roleModules(role)` | Returns array of permitted module keys for a role |

### branchId convention

- Branch staff: `branchId` = sort code string, e.g. `"3330"`
- Zonal/Super staff: `branchId` = `"zonal"` (sentinel — not a real branch)

---

## 7. Data Scoping

```js
function entriesVisibleTo(user) {
  if (isSuperRole || isZonalRole) → all entries
  if (BQA || BM)                  → entries where branchId === user.branchId
  default (Staff)                 → entries where userId === user.id
}

function filteredEntries(user) {
  // starts from entriesVisibleTo(), then applies state.reportFilters:
  // branches[], staffId, dateFrom, dateTo, status
  // if no date range → falls back to periodEntries() by reportPeriod
}
```

---

## 8. KPI System

### KPI shape

```js
{
  id: Number,
  name: String,
  frequency: "Daily" | "Weekly" | "Monthly",
  scope: "Individual" | "Branch",
  target: Number,
  unit: String,
  weight: Number,           // must sum ≤ 100 across active KPIs
  profiles: String[],       // for Individual KPIs — which profiles see this KPI
  roles: String[],          // for Branch KPIs — which roles can capture
  active: Boolean
}
```

### Special targets

- `freelancerTarget` — New Personal Accounts override for Freelancer profile
- `digitalChampionSmallTarget / BigTarget` — SimBanking Registration override by branch classification

### Scoring

```
achievement = min((actual / target) * 100, 150)   // capped at 150%
score = achievement * (kpi.weight / 100)
finalIndex = totalScore / (totalWeight / 100)      // normalised for active KPIs only
```

### Performance categories

| Score | Category |
|-------|----------|
| ≥ 90 | Exceptional Performer |
| ≥ 75 | Strong Performer |
| ≥ 60 | Meets Expectations |
| < 60 | Needs Improvement |

---

## 9. KPI Capture Rules

| Role | Staff selector | Branch selector | KPIs shown |
|------|---------------|-----------------|------------|
| Staff / BQA / BM | Locked to self (non-editable) | Locked to own branch | Individual KPIs matching own profile + Branch KPIs (for BQA/BM) |
| Admin / Super | Full dropdown — all users | All branches | All active KPIs |

---

## 10. Reporting Pipeline

```
filteredEntries(user)
  ↓
summarizeKpis(entries)      → per-KPI totals
averageScore(entries)       → weighted mean finalIndex
statusCounts(entries)       → { "Submitted": N, "BQA Approved": N, ... }
branchLeaderboard(entries)  → ranked by count + score
staffLeaderboard(entries)   → ranked by score + count
branchKpiSummary(entries, user) → progress bars for BQA/BM branch reports
```

### Period filtering

`periodEntries(entries, period)` uses `new Date()` as the reference point:
- Daily → last 1 day
- Weekly → last 7 days
- Monthly → last 31 days
- Quarterly → last 92 days

---

## 11. UI Patterns

### Render cycle

```
state mutates → saveState() → render() → bindEvents()
```

`render()` fully replaces `#app.innerHTML`. No virtual DOM, no diffing.  
Modals (`showSuccessModal`, `showCommentModal`, `changePasswordModal`) are appended to `document.body` and survive render cycles.

### CSS custom properties (key tokens)

```css
--deep-green     /* CRDB primary green */
--mist-green     /* Light green surface */
--danger         /* Red */
--warning        /* Amber */
--surface        /* Card/panel background */
--line           /* Border colour */
--muted          /* Secondary text */
```

### Component classes

| Class | Purpose |
|-------|---------|
| `.metric-card` | KPI tile on dashboard |
| `.leaderboard-row` | Progress bar row |
| `.bar-gold / bar-green / bar-orange / bar-red` | Progress bar colours (≥100 / ≥80 / ≥50 / <50%) |
| `.records-panel` | Full-width report table wrapper |
| `.vvdt-success-overlay` | Success modal |
| `.vvdt-comment-overlay` | Comment-required modal |
| `.pw-overlay` | Password change modal |
| `.submission-feed` | Status feed list |
| `.filter-bar` | Report filter controls |
| `.admin-layout` | Admin sidebar + content grid |

---

## 12. Security Model

| Layer | Measure |
|-------|---------|
| Credentials | `firebase-config.js` is git-ignored; injected at CI deploy time from GitHub secret `FIREBASE_CONFIG_JSON` |
| XSS | `escapeHtml(str)` applied to all user-supplied content rendered into HTML |
| Key exposure | `git-filter-repo` used to rewrite history after accidental commit |
| GCP API key | Restricted to Cloud Firestore API + Firebase Installations API only |
| Passwords | Stored as plain strings in localStorage (prototype — production must use hashed + server-side auth) |
| Data scope | `entriesVisibleTo()` enforces branch/user scoping server-less |

---

## 13. Firebase / Firestore

```
firebase.js (ES module)
  → reads window.FIREBASE_CONFIG (set by firebase-config.js)
  → exports: window.db, window.collection, window.addDoc, window.getDocs, window.query, window.orderBy, window.limit

saveState() uses:
  window.addDoc(window.collection(window.db, "backups"), { ... })

Collection: "backups"
Documents:  { savedAt, users, entries, branchReports, auditLogs }
```

Firestore is **write-only backup** — `loadState()` always reads from `localStorage`. Firestore data is not used for app state recovery in the current build.

---

## 14. Bulk User Upload

Admin/Super users can import staff via Excel (.xlsx) or CSV:

**Required columns (case-insensitive, order-flexible):**
`Staff Name` · `Phone Number` · `Role` · `Profile` · `Branch`

**Branch field** accepts: sort code (`3330`), branch name (`Kinondoni`), or branch ID.

**Validation per row:**
- Name not blank
- Phone ≥ 9 digits after normalisation
- Role exists in `roleCatalog`
- Phone not already registered
- Name not already registered
- Branch exists (skipped for Zonal/Super roles)

Invalid rows are flagged in the preview table and skipped on import. Valid rows are imported immediately with auto-generated temporary passwords.

**Parser:** SheetJS (`xlsx-0.20.3`) loaded from CDN.

---

## 15. Production Recommendation

| Layer | Recommended Technology |
|-------|------------------------|
| Frontend | Next.js / React |
| Backend API | Node.js (Express or Fastify) with REST or GraphQL |
| Database | PostgreSQL on Azure (schema starter in `database-schema.sql`) |
| Authentication | Microsoft Entra ID + JWT sessions |
| File storage | Azure Blob Storage (report exports, evidence attachments) |
| Hosting | Azure App Service or Azure Container Apps |
| Analytics | Power BI embedded for executive dashboards |
| CI/CD | GitHub Actions (already configured) |
