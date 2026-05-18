# VVDT — Volume & Value Daily Tracker

Executive-grade mobile-first prototype for Coastal Zone, CRDB Bank PLC, built from `MVP-VVDT.docx`.

## What Was Built

- Responsive web portal prototype: `index.html`
- CRDB green executive theme using Montserrat-first typography
- Login page using `DHOW IMAGE.jpg` and `CRDB logo.png`
- Role-specific dashboards for Staff/DC, BQA, BM, ZBM/ZM, and Admin
- BQA entry approval, rejection, return-with-comments, and consolidated branch report submission to BM
- BM consolidated report approval and return-with-comments workflow
- Admin-only reports, audit trail, demo access, and role-module access control
- Phone-number login, quick signup with random default password generation, admin user creation, BQA validation, role-aware navigation, and browser-local demo storage
- Full Coastal Zone branch register using sort code as the unique branch identifier
- PostgreSQL starter schema: `database-schema.sql`

## How To Open

Open this file in a browser:

`/Users/ortega/Desktop/Images/VVDT COASTAL ZONE/index.html`

No installation is required. The prototype is plain HTML, CSS, and JavaScript.

## Demo Login

Demo credentials are shown inside the app only after Admin login.

- Admin: `255700000001` / `Admin@2026`
- Staff: `255700000002` / `Staff@2026`
- BQA: `255700000003` / `Bqa@2026`
- BM: `255700000004` / `Bm@2026`
- ZBM: `255700000005` / `Zbm@2026`
- ZM: `255700000006` / `Zm@2026`

## Workflow States

- Staff/DC submits KPI entries as `Submitted`.
- BQA can mark entries as `BQA Approved`, `Rejected`, or `Returned with Comments`.
- BQA can submit all approved branch entries as a consolidated branch report with status `Submitted to BM`.
- BM can mark consolidated reports as `BM Approved` or `BM Returned`.
- Comments, actors, and timestamps are written to the in-browser audit trail.

## Role Access Defaults

- Staff/DC: Dashboard, Daily Capture.
- BQA: Dashboard, Daily Capture, BQA Validation.
- BM: Dashboard, BM Review.
- ZBM/ZM: Dashboard.
- Admin: Dashboard, Daily Capture, BQA Validation, BM Review, Reports, Audit Trail, Admin Setup, Demo Access.

## GitHub Pages

This repository is ready for a static GitHub Pages deployment. Push the folder contents to GitHub and set Pages to serve from the repository root.

## Recommended Architecture

Recommended production path: standalone enterprise web app.

- Frontend: Next.js / React
- Backend: Node.js REST or GraphQL API
- Database: PostgreSQL on Azure
- Authentication: Microsoft Entra ID integration with JWT session handling
- Storage: Azure Blob Storage for report exports and backup artifacts
- Reporting: application dashboards first, Power BI integration for executive analytics
- Hosting: Azure App Service or Azure Container Apps, with managed PostgreSQL

Power Apps, SharePoint, Azure SQL, Power BI, and Entra ID can accelerate internal workflow delivery, but a standalone build is better for VVDT’s custom weighted scoring, audit logs, advanced branch hierarchy, high-volume reporting, and long-term scalability.

## Core API Modules

- Auth and role permissions
- User, branch, and hierarchy management
- KPI and target configuration
- Weight configuration by role and branch classification
- Daily performance entry
- BQA validation workflow
- BM consolidated report approval workflow
- Score calculation service
- Dashboards and leaderboards
- PDF and Excel report export
- Audit log and backup monitoring

## Data Integrity

- Auto-stamped date and time for all submissions
- One staff/KPI/date unique entry control
- Draft, submitted, validated, and rejected workflow states
- Historical targets and weights preserved with effective dates
- Audit logs for configuration, performance, and user changes
- Daily backups and tested restore process

## MVP Roadmap

1. Authentication, users, branches, roles, KPI setup, targets, daily entries
2. BQA validation, returns, rejections, weighted scoring, staff dashboard, branch dashboard
3. BM consolidated report approval, admin reports, audit trail, and role access control
4. Future production hardening: Power BI integration, automated backups, disaster recovery drills, performance tuning

## Local Checks

Run:

`node --check script.js`

Optional local server:

`python3 -m http.server 4173`
