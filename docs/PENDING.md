# VVDT — Pending Tasks & Future Work
### CRDB Bank PLC · Coastal Zone

Items are grouped by priority. P1 = must-have for live rollout. P2 = important but not blocking. P3 = future/production-phase.

---

## P1 — Pre-Rollout Blockers

### P1-01 · One entry per staff per day enforcement
**What:** Prevent a staff member from submitting more than one entry for the same date.  
**Why:** The scoring and reporting assume one entry per person per day. Duplicates distort averages.  
**Where:** `#entryForm` submit handler in `bindEvents()` (~line 1670).  
**How:**
```js
const isDuplicate = state.entries.some(
  (e) => e.userId === Number(form.get("userId")) && e.date === form.get("date")
);
if (isDuplicate) return showSuccessModal("Duplicate entry", "An entry already exists for this staff member on this date.");
```

---

### P1-02 · Passwords must be hashed
**What:** Currently passwords are stored as plain strings in `state.users` and `localStorage`.  
**Why:** Any user who opens DevTools → Application → localStorage can read every password.  
**Fix for prototype:** Use `bcryptjs` (browser-compatible) or at minimum store a salted SHA-256 hash.  
**Fix for production:** Move auth entirely server-side. localStorage should never hold credentials.

---

### P1-03 · Admin capture for a specific staff member should reflect that staff member's KPI targets
**What:** When Admin selects a different user in Daily Capture, the KPI fields still show the Admin's own profile targets and KPIs.  
**Why:** `captureView()` calls `kpisForUser(user)` where `user` is always the logged-in user. The selected `userId` from the dropdown is only used in the submitted entry, not in building the form.  
**Fix:** Make `captureView()` react to the currently selected `userId` (requires a live re-render on `<select>` change, or a two-step form: pick user → show their KPIs).

---

### P1-04 · Duplicate phone/name check for Quick Signup is case-sensitive on phone
**What:** `normalizePhone()` strips non-digits, so `+255 700 000 001` and `255700000001` match. But name comparison uses `.toLowerCase()` only, not normalisation for extra whitespace or accented characters.  
**Fix:** Minor — trim and collapse whitespace in name comparisons.

---

## P2 — Important Improvements

### P2-01 · Export bulk user template
**What:** Provide a downloadable Excel template for bulk user upload so staff know the exact column names.  
**Where:** `bulkUserUploadPanel()` — add a "Download Template" button that generates and downloads a minimal `.xlsx` via SheetJS.

---

### P2-02 · Confirmation before bulk import
**What:** Currently clicking "Import N Valid Users" acts immediately.  
**Fix:** Wrap in `showCommentModal()` or a confirm dialog with a summary before committing.

---

### P2-03 · Entry edit / retract by the submitting staff member
**What:** Once submitted, a staff member cannot correct a mistake.  
**Fix:** Allow "Retract" action on entries with status `"Submitted"` (only by the original submitter, before BQA acts).

---

### P2-04 · Branch KPI capture linked to the branch, not to a person
**What:** Branch-scope KPIs (Business Accounts, Loans, Paperless Transactions) are captured by BQA/BM but stored with their personal `userId`. Branch-level KPIs should arguably belong to the branch itself.  
**Why this matters:** If a BQA is reassigned, historical branch KPI entries still carry their `userId`, which can skew the staff leaderboard.  
**Fix:** For Branch-scope KPIs, consider storing `userId: null` and relying on `branchId` only for aggregation.

---

### P2-05 · Zonal staff entry in Daily Capture
**What:** Zonal roles (ZBM, ZM, ZQA, HRBP) currently have no capture access. They only view dashboards.  
**If needed:** Add `"capture"` to their permissions. Their entries would need a different KPI set (no branch-scope KPIs, possibly a Zonal-specific KPI group).

---

### P2-06 · Report period for BQA/BM defaults to Daily — often wrong
**What:** `state.reportPeriod` is shared globally. When BQA opens Reports it starts on "Daily" and may see no entries if none were submitted today.  
**Fix:** Default period to "Monthly" for BQA/BM (more useful for validation work), or remember the last period the user selected per role.

---

### P2-07 · No pagination on the Entry Details table
**What:** The Entry Details table in Reports loads all matching entries at once.  
**Impact:** Slow render and long scroll on large datasets.  
**Fix:** Add client-side pagination (e.g. 50 rows per page) with prev/next controls.

---

### P2-08 · Audit trail lacks filter/search
**What:** `auditView()` renders all audit logs as a flat chronological list. No search, no filter by actor/date.  
**Fix:** Apply the same filter pattern used in reports (date range, actor name).

---

### P2-09 · `branchId` validation on user creation / signup
**What:** Quick Signup allows any branch selection with no validation that the branch is valid.  
**Fix:** Already handled in `createUser()` via `form.get("branchId")` from the rendered `<select>`. No code change needed — but the signup form should show branch options sorted alphabetically.

---

### P2-10 · "Change PW" button visible to all roles including Staff
**What:** The Change PW button is in the topbar for all users. This is correct and intended.  
**Status:** Working. No action needed.

---

## P3 — Production Phase

### P3-01 · Replace localStorage with real database
- PostgreSQL schema is already in `database-schema.sql`.
- All `state.entries`, `state.users`, etc. move to server-side REST/GraphQL endpoints.
- `loadState()` becomes an async API call; `saveState()` becomes a POST/PUT.

---

### P3-02 · Microsoft Entra ID authentication
- Replace phone/password login with Entra ID SSO.
- Map Entra user claims to VVDT roles via a mapping table.
- Remove `mustChangePassword` and the manual password change flow.

---

### P3-03 · File evidence attachments
- Staff currently submit text evidence/comments only.
- Production: allow file uploads (JPG/PDF) stored in Azure Blob Storage, linked to entries by `entry.id`.

---

### P3-04 · Push notifications
- Notify BQA when a new entry is submitted.
- Notify Staff when their entry is returned or rejected.
- Notify BM when a branch report is submitted.
- Technology: Web Push API or Azure Notification Hubs.

---

### P3-05 · Power BI embedded dashboards
- Replace the in-app leaderboards and charts with Power BI Embedded for executive/zonal reporting.
- Keep the VVDT SPA for data entry and workflow; use Power BI for analytics.

---

### P3-06 · Firestore as full state store (remove localStorage dependency)
- Currently Firestore is write-only backup.
- Full migration: `loadState()` reads the latest backup document from Firestore (async).
- Requires a loading spinner while the initial Firestore read completes.
- Multiple tab/device sync comes "for free" with Firestore real-time listeners (`onSnapshot`).

---

### P3-07 · KPI target configuration per branch classification
- Currently all branches use the same KPI targets regardless of size (Small / Medium / Big).
- Enhancement: define different targets for Small, Medium, and Big branches.
- `targetForKpi(kpi, user, branchId)` already accepts a branch ID — extend the KPI schema with `targetByClassification: { Small, Medium, Big }`.

---

### P3-08 · Quarterly / period-over-period reporting
- Add comparison: this period vs. last period (delta % and trend arrows).
- Add year-to-date aggregation for executive view.

---

### P3-09 · Scheduled branch reminders
- Auto-alert BQA if a branch has no entries by e.g. 15:00 on a working day.
- Alert BM if no consolidated report has been submitted by end of week.

---

### P3-10 · Role-based password policy
- Admin/Super: enforce strong password (uppercase, digit, special character, minimum 8).
- Currently `isSimplePasswordValid()` only checks length ≥ 6.

---

## Known Technical Debt

| Item | File | Line (approx) | Notes |
|------|------|----------------|-------|
| `~$P-VVDT.docx` temp file in repo root | — | — | Excel lock file, should be in `.gitignore` |
| Seed data has hardcoded 2026-05-18 dates | `script.js` | ~122–135 | Seed entries — won't affect new data |
| `database-schema.sql` not in sync with current state schema | `database-schema.sql` | — | Schema was written before several features were added |
| `package.json` references dependencies but no `node_modules` | `package.json` | — | Placeholder — nothing uses npm currently |
| Admin `branchId` is `"3330"` (Kinondoni) in seed data | `script.js` | ~113 | Admin is Super — `branchId` is irrelevant but could confuse |
