# VVDT — Volume & Value Daily Tracker
### CRDB Bank PLC · Coastal Zone

A mobile-first, single-page web application for daily KPI capture, BQA validation, BM approval, and consolidated performance reporting across all Coastal Zone branches.

---

## Quick Start

```bash
# Open locally — no install required
open index.html

# Or serve via Python for correct module loading
python3 -m http.server 4173
# then visit http://localhost:4173

# Check JS syntax
node --check script.js
```

**Firebase credentials** — copy the template and fill in your project values:
```bash
cp firebase-config.example.js firebase-config.js
# edit firebase-config.js with real values (never commit it)
```

---

## Demo Logins

| Role | Phone | Password | Access |
|------|-------|----------|--------|
| Admin | 255700000001 | Admin@2026 | Full — all modules |
| Staff | 255700000002 | Staff@2026 | Dashboard, Capture |
| BQA | 255700000003 | Bqa@2026 | Dashboard, Capture, Validation, Reports |
| BM | 255700000004 | Bm@2026 | Dashboard, BM Review, Reports |
| ZBM | 255700000005 | Zbm@2026 | Dashboard, Reports |
| ZM | 255700000006 | Zm@2026 | Dashboard, Reports |

---

## Workflow Summary

```
Staff / DC
  └─ Submits KPI entry (Daily Capture)
       └─ status: "Submitted"

BQA
  ├─ Approves    → "BQA Approved"
  ├─ Returns     → "Returned with Comments"  (comment required)
  ├─ Rejects     → "Rejected"               (comment required)
  └─ Consolidates approved entries → Branch Report → "Submitted to BM"

BM
  ├─ Approves    → "BM Approved"
  └─ Returns     → "BM Returned"            (comment required)

Zonal / Admin
  └─ Read-only consolidated view of all entries and branch reports
```

---

## Role Access Defaults

| Role | Dashboard | Capture | Validation | BM Review | Reports | Audit | Admin |
|------|-----------|---------|------------|-----------|---------|-------|-------|
| Staff | ✓ | ✓ | | | | | |
| BQA | ✓ | ✓ | ✓ | | ✓ | | |
| BM | ✓ | | | ✓ | ✓ | | |
| ZBM | ✓ | | | | ✓ | | |
| ZM | ✓ | | | | ✓ | | |
| ZQA | ✓ | | ✓ | | ✓ | | |
| HRBP | ✓ | | | | ✓ | ✓ | |
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Access is fully configurable per role in **Admin → Roles & Access**.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | App shell — loads CSS, SheetJS, Firebase, main script |
| `script.js` | Entire SPA — ~2 100 lines, single source of truth |
| `styles.css` | All styles — CRDB green theme, responsive grid, components |
| `firebase.js` | Firebase / Firestore init — exports `db`, `addDoc`, etc. to `window` |
| `firebase-config.js` | **Git-ignored** — holds real `window.FIREBASE_CONFIG` credentials |
| `firebase-config.example.js` | Safe placeholder template — safe to commit |
| `CRDB logo.png` | CRDB Bank logo |
| `Coastal Zone Dhow.jpg` | Login page hero background image |
| `.github/workflows/deploy.yml` | GitHub Actions — injects Firebase secret, deploys to Pages |
| `database-schema.sql` | PostgreSQL starter schema for future production migration |
| `docs/ARCHITECTURE.md` | Technical architecture reference |
| `docs/DECISIONS.md` | Key decisions log |
| `docs/PENDING.md` | Known gaps and future work |

---

## Deployment — GitHub Pages

1. Push to `main` branch.
2. GitHub Actions (`deploy.yml`) runs automatically.
3. It injects `FIREBASE_CONFIG_JSON` (repo secret) into `firebase-config.js` at build time.
4. The entire repo root is deployed as a static site.

**Set the secret:** GitHub → Settings → Secrets and variables → Actions → New secret  
Name: `FIREBASE_CONFIG_JSON`  
Value: `{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}`

Live URL: `https://amashanda.github.io/vvdtcoastalzone/`

---

## Local Firebase Setup

```
firebase-config.js is NEVER committed (it's in .gitignore).
Copy firebase-config.example.js → firebase-config.js and fill in your project values.
If the file is absent the app still runs fully on localStorage — Firebase is optional backup.
```

GCP API restrictions for the Firebase API key:
- Cloud Firestore API
- Firebase Installations API

---

## Production Path

See `docs/ARCHITECTURE.md` for a full production architecture diagram.  
Recommended stack: **Next.js → Node.js API → PostgreSQL on Azure**, with Entra ID auth.

---

## Further Reading

- [Architecture](docs/ARCHITECTURE.md)
- [Design Decisions](docs/DECISIONS.md)
- [Pending Tasks & Future Work](docs/PENDING.md)
