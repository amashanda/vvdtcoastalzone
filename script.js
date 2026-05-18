const STORAGE_KEY = "vvdt-rollout-state-v4";
const BACKUP_KEYS = ["vvdt-backup-1", "vvdt-backup-2", "vvdt-backup-3"];

const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "capture", label: "Daily Capture" },
  { key: "validation", label: "BQA Validation" },
  { key: "bmReview", label: "BM Review" },
  { key: "reports", label: "Reports" },
  { key: "audit", label: "Audit Trail" },
  { key: "admin", label: "Admin Setup" },
  { key: "demoAccess", label: "Demo Access" }
];

const NAV_MODULES = MODULES.filter((item) => item.key !== "demoAccess");

const demoCredentials = [
  { role: "Admin", phone: "255700000001", password: "Admin@2026", note: "Full setup and access control" },
  { role: "Staff", phone: "255700000002", password: "Staff@2026", note: "Personal KPI capture" },
  { role: "BQA", phone: "255700000003", password: "Bqa@2026", note: "Branch validation and consolidation" },
  { role: "BM", phone: "255700000004", password: "Bm@2026", note: "Branch report approval" },
  { role: "ZBM", phone: "255700000005", password: "Zbm@2026", note: "Dashboard only" },
  { role: "ZM", phone: "255700000006", password: "Zm@2026", note: "Dashboard only" }
];

const defaultRolePermissions = {
  Staff: ["dashboard", "capture"],
  BQA: ["dashboard", "capture", "validation"],
  BM: ["dashboard", "bmReview"],
  ZBM: ["dashboard", "reports"],
  ZM: ["dashboard", "reports"],
  HRBP: ["dashboard", "reports", "audit"],
  ZQA: ["dashboard", "validation", "reports"],
  Admin: MODULES.map((item) => item.key)
};

const defaultRoleCatalog = [
  { key: "Staff", label: "Staff", type: "Branch", locked: true },
  { key: "BQA", label: "BQA", type: "Branch", locked: true },
  { key: "BM", label: "BM", type: "Branch", locked: true },
  { key: "Admin", label: "Admin", type: "Super", locked: true },
  { key: "ZBM", label: "ZBM", type: "Zonal", locked: true },
  { key: "ZM", label: "ZM", type: "Zonal", locked: true },
  { key: "ZQA", label: "ZQA", type: "Zonal", locked: true },
  { key: "HRBP", label: "HRBP", type: "Zonal", locked: true }
];

const branches = [
  { id: "3396", code: "3396", name: "Bagamoyo", classification: "Medium", location: "Coastal Zone", targetStatus: 82 },
  { id: "3339", code: "3339", name: "Bunju", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "3340", code: "3340", name: "Buza", classification: "Small", location: "Coastal Zone", targetStatus: 70 },
  { id: "3608", code: "3608", name: "Chalinze", classification: "Small", location: "Coastal Zone", targetStatus: 68 },
  { id: "3385", code: "3385", name: "Dar Village", classification: "Big", location: "Coastal Zone", targetStatus: 86 },
  { id: "3603", code: "3603", name: "Ikwiriri", classification: "Small", location: "Coastal Zone", targetStatus: 64 },
  { id: "4222", code: "4222", name: "JN Hydropower", classification: "Small", location: "Coastal Zone", targetStatus: 66 },
  { id: "3364", code: "3364", name: "Kibaha", classification: "Big", location: "Coastal Zone", targetStatus: 84 },
  { id: "3330", code: "3330", name: "Kinondoni", classification: "Small", location: "Coastal Zone", targetStatus: 78 },
  { id: "3642", code: "3642", name: "Kisarawe", classification: "Small", location: "Coastal Zone", targetStatus: 66 },
  { id: "3601", code: "3601", name: "Mafia", classification: "Small", location: "Coastal Zone", targetStatus: 63 },
  { id: "4280", code: "4280", name: "Magomeni", classification: "Small", location: "Coastal Zone", targetStatus: 70 },
  { id: "3351", code: "3351", name: "Mbagala", classification: "Medium", location: "Coastal Zone", targetStatus: 81 },
  { id: "3358", code: "3358", name: "Mbande", classification: "Small", location: "Coastal Zone", targetStatus: 70 },
  { id: "3362", code: "3362", name: "Mbezi Beach", classification: "Medium", location: "Coastal Zone", targetStatus: 80 },
  { id: "3352", code: "3352", name: "Mbezi Chini", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "3472", code: "3472", name: "Michenzani Mall", classification: "Small", location: "Coastal Zone", targetStatus: 71 },
  { id: "3374", code: "3374", name: "Mikocheni", classification: "Medium", location: "Coastal Zone", targetStatus: 84 },
  { id: "4294", code: "4294", name: "Mkuranga", classification: "Small", location: "Coastal Zone", targetStatus: 69 },
  { id: "4286", code: "4286", name: "Mlandizi", classification: "Small", location: "Coastal Zone", targetStatus: 57 },
  { id: "3304", code: "3304", name: "Msasani", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "3356", code: "3356", name: "Mtoni Kijichi", classification: "Small", location: "Coastal Zone", targetStatus: 70 },
  { id: "4288", code: "4288", name: "Mwananyamala", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "4281", code: "4281", name: "Mwenge", classification: "Medium", location: "Coastal Zone", targetStatus: 82 },
  { id: "3397", code: "3397", name: "Oysterbay", classification: "Big", location: "Coastal Zone", targetStatus: 90 },
  { id: "4282", code: "4282", name: "Pemba", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "4216", code: "4216", name: "Tandika", classification: "Small", location: "Coastal Zone", targetStatus: 70 },
  { id: "3302", code: "3302", name: "Tegeta", classification: "Big", location: "Coastal Zone", targetStatus: 86 },
  { id: "3355", code: "3355", name: "Temeke", classification: "Medium", location: "Coastal Zone", targetStatus: 80 },
  { id: "3336", code: "3336", name: "Temeke Taifa", classification: "Small", location: "Coastal Zone", targetStatus: 72 },
  { id: "3191", code: "3191", name: "Wete", classification: "Medium", location: "Coastal Zone", targetStatus: 76 },
  { id: "3369", code: "3369", name: "Zanzibar", classification: "Big", location: "Coastal Zone", targetStatus: 88 }
];

const kpis = [
  { id: 1, name: "New Personal Accounts", frequency: "Daily", scope: "Individual", target: 2, freelancerTarget: 5, unit: "Count", weight: 14, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO", "Freelancer"], active: true },
  { id: 2, name: "Deposit from New Accounts", frequency: "Daily", scope: "Individual", target: 10000, unit: "TZS/account", weight: 16, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO", "Freelancer"], active: true },
  { id: 3, name: "Dormant Account Reactivation", frequency: "Daily", scope: "Individual", target: 1, unit: "Count", weight: 8, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO"], active: true },
  { id: 4, name: "SimBanking Registration", frequency: "Daily", scope: "Individual", target: 1, digitalChampionSmallTarget: 20, digitalChampionBigTarget: 25, unit: "Count", weight: 14, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO", "Digital Champion"], active: true },
  { id: 5, name: "Insurance Policies", frequency: "Weekly", scope: "Individual", target: 1, unit: "Policy", weight: 6, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO"], active: true },
  { id: 6, name: "LIPA Hapa", frequency: "Weekly", scope: "Individual", target: 1, unit: "Merchant", weight: 5, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO"], active: true },
  { id: 7, name: "CRDB Wakala Recruitment", frequency: "Weekly", scope: "Individual", target: 1, unit: "Agent", weight: 5, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO"], active: true },
  { id: 8, name: "Merchant POS", frequency: "Monthly", scope: "Individual", target: 1, unit: "Terminal", weight: 5, profiles: ["MBB", "RO", "MCE", "TL", "Premier RM", "SSO"], active: true },
  { id: 9, name: "Business Accounts", frequency: "Daily", scope: "Branch", target: 3, unit: "MSE/SME", weight: 6, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 10, name: "Salaried Loans", frequency: "Daily", scope: "Branch", target: 5, unit: "Loan", weight: 7, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 11, name: "Paperless Transactions", frequency: "Daily", scope: "Branch", target: 60, unit: "%", weight: 6, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 12, name: "MSE Loans", frequency: "Weekly", scope: "Branch", target: 5, unit: "Loan", weight: 5, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 13, name: "SME Loans", frequency: "Weekly", scope: "Branch", target: 1, unit: "Loan", weight: 4, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 14, name: "Personal Lending MOU", frequency: "Monthly", scope: "Branch", target: 1, unit: "MOU", weight: 2, roles: ["BM", "BQA", "Admin"], active: true },
  { id: 15, name: "Active Freelancers", frequency: "Monthly", scope: "Branch", target: 10, unit: "Freelancers", weight: 2, roles: ["BM", "BQA", "Admin"], active: true }
];

const baseState = {
  activeUserId: null,
  activeView: "dashboard",
  authMode: "login",
  reportPeriod: "Daily",
  editingBranchId: null,
  adminSection: "users",
  roleCatalog: structuredClone(defaultRoleCatalog),
  rolePermissions: structuredClone(defaultRolePermissions),
  branches,
  kpis,
  users: [
    { id: 1, staffNo: "ADM001", name: "System Administrator", phone: "255700000001", password: "Admin@2026", role: "Admin", profile: "TL", branchId: "3330", active: true, mustChangePassword: false },
    { id: 2, staffNo: "STF001", name: "Asha Omar", phone: "255700000002", password: "Staff@2026", role: "Staff", profile: "RO", branchId: "3369", active: true, mustChangePassword: false },
    { id: 3, staffNo: "BQA001", name: "Juma Hassan", phone: "255700000003", password: "Bqa@2026", role: "BQA", profile: "TL", branchId: "3330", active: true, mustChangePassword: false },
    { id: 4, staffNo: "BM001", name: "Neema Ali", phone: "255700000004", password: "Bm@2026", role: "BM", profile: "TL", branchId: "3330", active: true, mustChangePassword: false },
    { id: 5, staffNo: "ZBM001", name: "Hassan Said", phone: "255700000005", password: "Zbm@2026", role: "ZBM", profile: "ZBM", branchId: "zonal", active: true, mustChangePassword: false },
    { id: 6, staffNo: "ZM001", name: "Fatma Mwinyi", phone: "255700000006", password: "Zm@2026", role: "ZM", profile: "ZM", branchId: "zonal", active: true, mustChangePassword: false },
    { id: 7, staffNo: "DC001", name: "Rehema Kito", phone: "255700000007", password: "Dc@2026", role: "Staff", profile: "Digital Champion", branchId: "3330", active: true, mustChangePassword: false },
    { id: 8, staffNo: "STF002", name: "Baraka Saleh", phone: "255700000008", password: "Staff2@2026", role: "Staff", profile: "MBB", branchId: "3330", active: true, mustChangePassword: false }
  ],
  entries: [
    { id: 1, userId: 2, branchId: "3369", date: "2026-05-18", values: { 1: 3, 2: 160000, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 1 }, status: "BQA Approved", comment: "Evidence reviewed and accepted.", history: [], createdAt: "2026-05-18 09:22" },
    { id: 2, userId: 2, branchId: "3369", date: "2026-05-17", values: { 1: 2, 2: 90000, 3: 1, 4: 1, 5: 0, 6: 1, 7: 1, 8: 0 }, status: "Submitted", comment: "Awaiting BQA validation.", history: [], createdAt: "2026-05-17 17:44" },
    { id: 3, userId: 7, branchId: "3330", date: "2026-05-18", values: { 4: 26 }, status: "Submitted", comment: "Digital Champion daily registrations.", history: [], createdAt: "2026-05-18 16:10" },
    { id: 4, userId: 8, branchId: "3330", date: "2026-05-18", values: { 1: 4, 2: 220000, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 0 }, status: "BQA Approved", comment: "Ready for branch consolidation.", history: [], createdAt: "2026-05-18 15:40" }
  ],
  branchReports: [
    { id: 1, branchId: "3330", date: "2026-05-17", entryIds: [4], status: "BM Approved", bqaComment: "Opening branch report approved for seed data.", bmComment: "Approved.", submittedBy: 3, reviewedBy: 4, createdAt: "2026-05-17 18:10", updatedAt: "2026-05-17 18:30" }
  ],
  generatedPassword: null,
  auditLogs: [
    { id: 1, actor: "System", action: "Rollout initialized", entity: "Application", note: "Seeded phone login, permissions, BQA/BM workflow.", time: "2026-05-18 12:00" }
  ]
};

let state = loadState();

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!stored) return structuredClone(baseState);
    const merged = { ...structuredClone(baseState), ...stored };
    if (!merged.roleCatalog) merged.roleCatalog = structuredClone(defaultRoleCatalog);
    // Migrate HR → HRBP
    const hrEntry = merged.roleCatalog.find((r) => r.key === "HR");
    if (hrEntry) { hrEntry.key = "HRBP"; hrEntry.label = "HRBP"; }
    if (merged.rolePermissions["HR"]) { merged.rolePermissions["HRBP"] = merged.rolePermissions["HR"]; delete merged.rolePermissions["HR"]; }
    merged.users = (merged.users || []).map((u) => u.role === "HR" ? { ...u, role: "HRBP" } : u);
    // Migrate Admin to Super type
    const adminEntry = merged.roleCatalog.find((r) => r.key === "Admin");
    if (adminEntry) adminEntry.type = "Super";
    defaultRoleCatalog.forEach((def) => {
      if (!merged.roleCatalog.find((r) => r.key === def.key)) merged.roleCatalog.push({ ...def });
    });
    defaultRoleCatalog.forEach((def) => {
      if (!merged.rolePermissions[def.key]) merged.rolePermissions[def.key] = defaultRolePermissions[def.key] || [];
    });
    return merged;
  } catch {
    return structuredClone(baseState);
  }
}

function saveState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const b1 = localStorage.getItem(BACKUP_KEYS[0]);
      const b2 = localStorage.getItem(BACKUP_KEYS[1]);
      if (b2) localStorage.setItem(BACKUP_KEYS[2], b2);
      if (b1) localStorage.setItem(BACKUP_KEYS[1], b1);
      localStorage.setItem(BACKUP_KEYS[0], current);
    }
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function backupSnapshots() {
  return BACKUP_KEYS.map((key, i) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return { slot: i + 1, key, label: `Backup ${i + 1}`, users: parsed.users?.length || 0, entries: parsed.entries?.length || 0 };
    } catch { return null; }
  }).filter(Boolean);
}

function restoreBackup(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return alert("Backup not found.");
    state = JSON.parse(raw);
    addAudit("State restored from backup", key);
    saveState();
    render();
  } catch { alert("Failed to restore backup."); }
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function nowLabel() {
  return new Date().toLocaleString("en-GB", { hour12: false });
}

function createRandomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function isSimplePasswordValid(pw) {
  return String(pw || "").trim().length >= 6;
}

function activeUser() {
  return state.users.find((user) => user.id === state.activeUserId) || null;
}

function branchById(branchId) {
  return state.branches.find((branch) => branch.id === String(branchId));
}

function branchName(branchId) {
  if (!branchId || branchId === "zonal") return "Zonal Staff";
  const branch = branchById(branchId);
  return branch ? `${branch.code} · ${branch.name}` : "Unassigned";
}

function roleModules(role) {
  return state.rolePermissions?.[role] || [];
}

function hasAccess(user, moduleKey) {
  return Boolean(user && roleModules(user.role).includes(moduleKey));
}

function isZonalRole(role) {
  const catalog = state?.roleCatalog || defaultRoleCatalog;
  const entry = catalog.find((r) => r.key === role);
  return entry ? entry.type === "Zonal" : false;
}

function isSuperRole(role) {
  const catalog = state?.roleCatalog || defaultRoleCatalog;
  const entry = catalog.find((r) => r.key === role);
  return entry ? entry.type === "Super" : false;
}

function ensureAllowedView(user) {
  if (!user) return;
  if (hasAccess(user, state.activeView)) return;
  state.activeView = hasAccess(user, "dashboard") ? "dashboard" : roleModules(user.role)[0] || "dashboard";
}

function targetForKpi(kpi, user, branchId = user?.branchId) {
  const branch = branchById(branchId);
  if (kpi.name === "New Personal Accounts" && user?.profile === "Freelancer") return kpi.freelancerTarget;
  if (kpi.name === "SimBanking Registration" && user?.profile === "Digital Champion") {
    return branch?.classification === "Big" ? kpi.digitalChampionBigTarget : kpi.digitalChampionSmallTarget;
  }
  return kpi.target;
}

function kpisForUser(user) {
  return state.kpis.filter((kpi) => {
    if (!kpi.active) return false;
    if (kpi.scope === "Branch") return ["Admin", "BQA", "BM"].includes(user?.role);
    return kpi.profiles?.includes(user?.profile) || user?.role === "Admin";
  });
}

function scoreEntry(entry) {
  const entryUser = state.users.find((user) => user.id === entry.userId);
  const weighted = state.kpis.filter((kpi) => entry.values[kpi.id] !== undefined).map((kpi) => {
    const actual = Number(entry.values[kpi.id] || 0);
    const target = targetForKpi(kpi, entryUser, entry.branchId);
    const achievement = target > 0 ? Math.min((actual / target) * 100, 150) : 0;
    const score = achievement * (kpi.weight / 100);
    return { ...kpi, actual, target, achievement, score };
  });
  const rawScore = weighted.reduce((sum, item) => sum + item.score, 0);
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  const finalIndex = totalWeight > 0 ? rawScore / (totalWeight / 100) : 0;
  return { weighted, finalIndex, category: performanceCategory(finalIndex) };
}

function performanceCategory(score) {
  if (score >= 90) return "Exceptional Performer";
  if (score >= 75) return "Strong Performer";
  if (score >= 60) return "Meets Expectations";
  return "Needs Improvement";
}

function entriesVisibleTo(user) {
  if (!user) return [];
  if (isSuperRole(user.role) || isZonalRole(user.role)) return state.entries;
  if (user.role === "BQA" || user.role === "BM") return state.entries.filter((entry) => entry.branchId === user.branchId);
  return state.entries.filter((entry) => entry.userId === user.id);
}

function periodEntries(entries, period = state.reportPeriod) {
  const today = new Date("2026-05-18T12:00:00");
  const days = { Daily: 1, Weekly: 7, Monthly: 31, Quarterly: 92 }[period] || 1;
  const start = new Date(today);
  start.setDate(today.getDate() - days + 1);
  return entries.filter((entry) => {
    const date = new Date(`${entry.date}T12:00:00`);
    return date >= start && date <= today;
  });
}

function averageScore(entries) {
  if (!entries.length) return 0;
  return entries.reduce((sum, entry) => sum + scoreEntry(entry).finalIndex, 0) / entries.length;
}

function summarizeKpis(entries) {
  const totals = {};
  entries.forEach((entry) => {
    Object.entries(entry.values).forEach(([kpiId, value]) => {
      totals[kpiId] = (totals[kpiId] || 0) + Number(value || 0);
    });
  });
  const rows = Object.entries(totals).map(([kpiId, actual]) => {
    const kpi = state.kpis.find((item) => item.id === Number(kpiId));
    return { kpi, actual };
  }).filter((row) => row.kpi);
  rows.sort((a, b) => b.actual - a.actual);
  return rows;
}

function statusCounts(entries) {
  return entries.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] || 0) + 1;
    return acc;
  }, {});
}

function reportedEntryIds() {
  return new Set(state.branchReports.flatMap((report) => report.entryIds));
}

function consolidatableEntries(branchId) {
  const used = reportedEntryIds();
  return state.entries.filter((entry) => entry.branchId === branchId && entry.status === "BQA Approved" && !used.has(entry.id));
}

function addAudit(action, entity, note = "") {
  const user = activeUser();
  state.auditLogs.unshift({
    id: Date.now(),
    actor: user?.name || "Guest",
    action,
    entity,
    note,
    time: nowLabel()
  });
}

function statusClass(status) {
  return String(status).toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function render() {
  const user = activeUser();
  ensureAllowedView(user);
  document.querySelector("#app").innerHTML = user ? appShell(user) : authScreen();
  bindEvents();
}

function authScreen() {
  const loginActive = state.authMode === "login";
  return `
    <main class="auth-page">
      <section class="auth-hero image-hero">
        <img class="login-dhow" src="DHOW IMAGE.jpg" alt="Dhow sailing on the coast" />
        <div class="auth-overlay">
          <span class="eyebrow">CRDB Bank PLC · Coastal Zone</span>
          <h1>Volume & Value Daily Tracker</h1>
          <p>Dhow Family, We Achieve Together. Secure daily KPI capture, validation, performance scoring, and branch visibility.</p>
        </div>
        <img class="login-logo" src="CRDB logo.png" alt="CRDB Bank logo" />
      </section>

      <section class="auth-card minimal">
        <div class="auth-tabs">
          <button class="${loginActive ? "active" : ""}" data-auth-mode="login" type="button">Login</button>
          <button class="${!loginActive ? "active" : ""}" data-auth-mode="signup" type="button">Quick Signup</button>
        </div>
        ${loginActive ? loginForm() : signupForm()}
      </section>
    </main>
  `;
}

function loginForm() {
  return `
    <form class="auth-form" id="loginForm">
      <label>Phone Number <input name="phone" inputmode="tel" placeholder="255700XXXXXX" required autocomplete="username" /></label>
      <label>Password <input name="password" type="password" placeholder="Your password" required autocomplete="current-password" /></label>
      <p id="loginError" class="danger-note" style="display:none"></p>
      <button class="primary-action" type="submit">Login to VVDT</button>
      <p class="form-note">Use your registered staff phone number and password.</p>
    </form>
  `;
}

function signupForm() {
  return `
    <form class="auth-form" id="signupForm">
      <label>Full Name <input name="name" placeholder="Full name" required autocomplete="name" /></label>
      <label>Phone Number <input name="phone" inputmode="tel" placeholder="255700XXXXXX" required autocomplete="username" /></label>
      <label>Staff Profile
        <select name="profile">
          ${["MBB", "RO", "MCE", "TL", "Premier RM", "SSO", "Freelancer", "Digital Champion"].map((profile) => `<option>${profile}</option>`).join("")}
        </select>
      </label>
      <label>Branch
        <select name="branchId">
          ${state.branches.map((branch) => `<option value="${branch.id}">${branch.code} · ${branch.name}</option>`).join("")}
        </select>
      </label>
      <p id="signupError" class="danger-note" style="display:none"></p>
      <button class="primary-action" type="submit">Create Staff Account</button>
      ${state.generatedPassword ? `<p class="success-note">Account created — share this temporary password with the user: <strong>${state.generatedPassword.password}</strong>. They will be prompted to change it on first login.</p>` : ""}
      <p class="form-note">A temporary password is generated after signup. The user must change it on first login.</p>
    </form>
  `;
}

function passwordChangeOverlay(user) {
  return `
    <div class="pw-overlay" id="pwOverlay">
      <div class="pw-card">
        <img src="CRDB logo.png" alt="CRDB" class="pw-logo" />
        <h2>Welcome, ${user.name.split(" ")[0]}</h2>
        <p class="body-copy">Please set a new personal password before you continue. Minimum 6 characters — keep it something you remember easily.</p>
        <form class="auth-form" id="changePasswordForm">
          <label>New Password <input name="newPw" type="password" minlength="6" placeholder="At least 6 characters" required autocomplete="new-password" /></label>
          <label>Confirm Password <input name="confirmPw" type="password" minlength="6" placeholder="Repeat your password" required autocomplete="new-password" /></label>
          <button class="primary-action" type="submit">Set Password &amp; Continue</button>
          <p id="pwError" class="danger-note" style="display:none"></p>
        </form>
      </div>
    </div>
  `;
}

function appShell(user) {
  const roleEntry = (state.roleCatalog || defaultRoleCatalog).find((r) => r.key === user.role);
  const roleTypeBadge = roleEntry ? `<span class="role-type-badge ${roleEntry.type.toLowerCase()}" style="margin-left:0">${roleEntry.type}</span>` : "";
  return `
    ${user.mustChangePassword ? passwordChangeOverlay(user) : ""}
    <button class="sidebar-toggle" id="sidebarToggle" type="button" aria-label="Menu">&#9776;</button>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <div class="app-shell">
      <aside class="sidebar" id="appSidebar">
        <div class="brand-lockup"><img src="CRDB logo.png" alt="CRDB" class="brand-logo" /><div><strong>VVDT</strong><small>Coastal Zone</small></div></div>
        <nav>${NAV_MODULES.filter((item) => hasAccess(user, item.key)).map((item) => navButton(item.key, item.label)).join("")}</nav>
        <div class="sidebar-panel">
          <span>Logged in as</span>
          <strong>${user.role} ${roleTypeBadge}</strong>
          <small>${user.name} · ${branchName(user.branchId)}</small>
        </div>
      </aside>
      <main>
        <header class="topbar">
          <div><p>Dhow Family, We Achieve Together</p><h1>${viewTitle()}</h1></div>
          <div class="topbar-actions">
            <span class="profile-chip"><b>${user.role}</b><small>${user.phone}</small></span>
            <button class="secondary-action" data-action="logout" type="button">Logout</button>
          </div>
        </header>
        ${viewContent(user)}
      </main>
    </div>
  `;
}

function navButton(view, label) {
  return `<button class="${state.activeView === view ? "active" : ""}" data-view="${view}" type="button">${label}</button>`;
}

function viewTitle() {
  const titles = {
    dashboard: "Dashboard",
    capture: "Daily KPI Capture",
    validation: "BQA Validation",
    bmReview: "BM Review",
    reports: "Reports",
    audit: "Audit Trail",
    admin: "Admin Setup"
  };
  return titles[state.activeView] || "VVDT";
}

function viewContent(user) {
  if (!hasAccess(user, state.activeView)) return restrictedView();
  if (state.activeView === "capture") return captureView(user);
  if (state.activeView === "validation") return validationView(user);
  if (state.activeView === "bmReview") return bmReviewView(user);
  if (state.activeView === "reports") return reportsView(user);
  if (state.activeView === "audit") return auditView();
  if (state.activeView === "admin") return adminView(user);
  return dashboardView(user);
}

function restrictedView() {
  return `<section class="panel"><h3>Access restricted</h3><p class="body-copy">This module is not enabled for your current role.</p></section>`;
}

function dashboardView(user) {
  if (user.role === "Admin") return adminDashboard(user);
  if (user.role === "BQA") return bqaDashboard(user);
  if (user.role === "BM") return bmDashboard(user);
  return staffDashboard(user);
}

function staffDashboard(user) {
  const entries = entriesVisibleTo(user);
  const latest = entries[0];
  const entryKpis = kpisForUser(user);
  const progressRows = entryKpis.map((kpi) => {
    const actual = entries.reduce((sum, entry) => sum + Number(entry.values[kpi.id] || 0), 0);
    const target = targetForKpi(kpi, user) * Math.max(entries.length, 1);
    return { kpi, actual, target, pct: target ? Math.min((actual / target) * 100, 150) : 0 };
  });
  return `
    <section class="metric-grid">
      ${metricCard("Performance Index", `${averageScore(entries).toFixed(1)}%`, performanceCategory(averageScore(entries)), averageScore(entries))}
      ${metricCard("Entries Submitted", entries.length, "Your records only", Math.min(entries.length * 25, 100))}
      ${metricCard("BQA Approved", entries.filter((entry) => entry.status === "BQA Approved").length, "Approved by branch QA", 80)}
      ${metricCard("Pending Action", entries.filter((entry) => ["Submitted", "Returned with Comments"].includes(entry.status)).length, "Submitted or returned", 55)}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-heading"><div><span class="eyebrow">${user.profile}</span><h3>Filled So Far vs Targets</h3></div></div>
        <div class="leaderboard">${progressRows.map((row) => progressRow(row)).join("")}</div>
      </article>
      <article class="panel">
        <div class="panel-heading"><div><span class="eyebrow">My submissions</span><h3>Submission Status</h3></div></div>
        ${entries.length ? `<div class="submission-feed">${entries.slice(0, 8).map((entry) => `
          <div class="submission-feed-item">
            <div class="feed-row"><span class="badge ${statusClass(entry.status)}">${escapeHtml(entry.status)}</span><small>${entry.date}</small></div>
            <div class="feed-comment">${escapeHtml(entry.comment || "No comment")}</div>
          </div>`).join("")}</div>` : `<p class="empty-state">No entries submitted yet.</p>`}
      </article>
    </section>
  `;
}

function bqaDashboard(user) {
  const entries = entriesVisibleTo(user);
  const counts = statusCounts(entries);
  const ready = consolidatableEntries(user.branchId).length;
  return `
    <section class="metric-grid">
      ${metricCard("Received", entries.length, "Branch submissions", 100)}
      ${metricCard("Pending Review", counts.Submitted || 0, "Awaiting BQA action", 60)}
      ${metricCard("Approved", counts["BQA Approved"] || 0, "Ready for BM consolidation", 85)}
      ${metricCard("Ready for BM", ready, "Can be consolidated", 80)}
    </section>
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">${branchName(user.branchId)}</span><h3>Branch Submission Status</h3></div></div>
      <div class="status-grid">${Object.entries(counts).map(([status, count]) => `<div><b>${count}</b><span>${status}</span></div>`).join("") || `<p class="empty-state">No branch entries yet.</p>`}</div>
    </section>
  `;
}

function bmDashboard(user) {
  const reports = state.branchReports.filter((report) => report.branchId === user.branchId);
  const pending = reports.filter((report) => report.status === "Submitted to BM");
  return `
    <section class="metric-grid">
      ${metricCard("Pending Approval", pending.length, "Consolidated branch reports", Math.min(pending.length * 40, 100))}
      ${metricCard("Approved Reports", reports.filter((report) => report.status === "BM Approved").length, "Signed off by BM", 90)}
      ${metricCard("Returned Reports", reports.filter((report) => report.status === "BM Returned").length, "Needs BQA correction", 40)}
      ${metricCard("Branch Score", `${averageScore(entriesVisibleTo(user)).toFixed(1)}%`, branchName(user.branchId), averageScore(entriesVisibleTo(user)))}
    </section>
    <section class="panel"><div class="panel-heading"><div><span class="eyebrow">BM queue</span><h3>Reports Awaiting Review</h3></div></div>${branchReportsTable(reports, true)}</section>
  `;
}

function adminDashboard(user) {
  const entries = entriesVisibleTo(user);
  return `
    <section class="metric-grid">
      ${metricCard("Zone Score", `${averageScore(entries).toFixed(1)}%`, "All visible records", averageScore(entries))}
      ${metricCard("Users", state.users.length, "Active demo users", 100)}
      ${metricCard("Branches", state.branches.length, "Sort-code register", 100)}
      ${metricCard("BM Reports", state.branchReports.length, "Branch consolidations", 75)}
    </section>
    <section class="content-grid">
      <article class="panel wide"><div class="panel-heading"><div><span class="eyebrow">Administration</span><h3>Operational Summary</h3></div></div><div class="report-grid">
        <div class="report-tile"><b>Access Control</b><span>Assign modules per role in Admin Setup.</span></div>
        <div class="report-tile"><b>Reports</b><span>Daily, weekly, monthly, and quarterly reporting enabled.</span></div>
        <div class="report-tile"><b>Audit</b><span>${state.auditLogs.length} tracked actions.</span></div>
        <div class="report-tile"><b>Demo Access</b><span>Credentials available only in Admin Setup.</span></div>
      </div></article>
      <article class="panel"><div class="panel-heading"><div><span class="eyebrow">Status</span><h3>Entry Breakdown</h3></div></div><div class="attention-list">${Object.entries(statusCounts(entries)).map(([status, count]) => `<div><b>${count}</b><span>${status}</span></div>`).join("")}</div></article>
    </section>
  `;
}

function progressRow(row) {
  const pct = row.pct;
  const colorClass = pct >= 100 ? "bar-gold" : pct >= 80 ? "bar-green" : pct >= 50 ? "bar-orange" : "bar-red";
  return `
    <div class="leaderboard-row">
      <span class="rank pct-label ${colorClass}">${Math.round(pct)}%</span>
      <div>
        <b>${escapeHtml(row.kpi.name)}</b>
        <small><strong>${row.actual.toLocaleString()}</strong> / ${row.target.toLocaleString()} ${escapeHtml(row.kpi.unit)}</small>
      </div>
      <div class="meter"><i class="${colorClass}" style="width:${Math.min(pct, 100)}%"></i></div>
      <span class="score">${escapeHtml(row.kpi.frequency)}</span>
    </div>
  `;
}

function metricCard(label, value, note, percent) {
  return `<article class="metric-card"><span>${label}</span><strong>${value}</strong><div class="meter"><i style="width:${Math.min(Number(percent) || 0, 100)}%"></i></div><small>${note}</small></article>`;
}

function captureView(user) {
  const entryKpis = kpisForUser(user).filter((kpi) => kpi.scope === "Individual" || user.role !== "Staff");
  return `
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">Daily workflow</span><h3>Daily KPI Capture</h3></div><span class="status-pill">Auto date/time enabled</span></div>
      <form class="entry-form" id="entryForm">
        <label>Entry Date <input name="date" type="date" value="2026-05-18" required /></label>
        <label>Staff <select name="userId">${staffOptions(user)}</select></label>
        <label>Branch <select name="branchId">${branchOptions(user)}</select></label>
        ${entryKpis.map((kpi) => `<label>${kpi.name} <small>${kpi.scope} · ${kpi.frequency} · Target: ${targetForKpi(kpi, user)} ${kpi.unit}</small><input name="kpi-${kpi.id}" type="number" min="0" value="${targetForKpi(kpi, user)}" required /></label>`).join("")}
        <label class="span-2">Evidence / Comment <textarea name="comment">Daily sales evidence attached and ready for BQA review.</textarea></label>
        <button class="primary-action" type="submit">Submit for Validation</button>
      </form>
    </section>
    <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Recent records</span><h3>Submissions</h3></div></div><div class="table-wrap">${entriesTable(entriesVisibleTo(user).slice(0, 10), false)}</div></section>
  `;
}

function staffOptions(user) {
  const staff = ["Admin", "BQA", "BM"].includes(user.role) ? state.users.filter((item) => item.active && item.role === "Staff") : [user];
  return staff.map((item) => `<option value="${item.id}">${item.name} · ${item.profile}</option>`).join("");
}

function branchOptions(user) {
  const options = ["Admin"].includes(user.role) ? state.branches : state.branches.filter((branch) => branch.id === user.branchId);
  return options.map((branch) => `<option value="${branch.id}">${branch.code} · ${branch.name}</option>`).join("");
}

function validationView(user) {
  const entries = entriesVisibleTo(user);
  const approved = consolidatableEntries(user.branchId);
  return `
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">Validation workflow</span><h3>Staff/DC Entries</h3></div><span class="status-pill">${entries.filter((entry) => entry.status === "Submitted").length} pending</span></div>
      <div class="table-wrap">${entriesTable(entries, true)}</div>
    </section>
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">Consolidation</span><h3>Submit Approved Branch Report to BM</h3></div><span class="status-pill">${approved.length} approved entries</span></div>
      <p class="body-copy">BQA can consolidate approved Staff/DC entries for the branch and send the package to BM for review.</p>
      <button class="primary-action" data-action="submit-branch-report" type="button" ${approved.length ? "" : "disabled"}>Submit Consolidated Report to BM</button>
    </section>
  `;
}

function entriesTable(entries, showActions) {
  if (!entries.length) return `<p class="empty-state">No entries found yet.</p>`;
  return `
    <table>
      <thead><tr><th>Date</th><th>Staff</th><th>Branch</th><th>Status</th><th>Score</th>${showActions ? "<th>Action</th>" : ""}</tr></thead>
      <tbody>
        ${entries.map((entry) => {
          const entryUser = state.users.find((item) => item.id === entry.userId);
          const score = scoreEntry(entry);
          return `<tr>
            <td>${entry.date}</td>
            <td>${entryUser?.name || "Unknown"}<br><small>${entryUser?.profile || ""}</small></td>
            <td>${branchName(entry.branchId)}</td>
            <td><span class="badge ${statusClass(entry.status)}">${entry.status}</span><br><small>${entry.comment || ""}</small></td>
            <td>${score.finalIndex.toFixed(1)}%</td>
            ${showActions ? `<td>${entry.status === "Submitted" || entry.status === "Returned with Comments" ? entryActions(entry.id) : "Closed"}</td>` : ""}
          </tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
}

function entryActions(entryId) {
  return `
    <button class="mini-action" data-entry-status="${entryId}:BQA Approved" type="button">Approve</button>
    <button class="mini-action muted" data-entry-status="${entryId}:Returned with Comments" type="button">Return</button>
    <button class="mini-action danger" data-entry-status="${entryId}:Rejected" type="button">Reject</button>
  `;
}

function bmReviewView(user) {
  const reports = state.branchReports.filter((report) => report.branchId === user.branchId || user.role === "Admin");
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">BM approval</span><h3>Consolidated Branch Reports</h3></div></div>${branchReportsTable(reports, true)}</section>`;
}

function branchReportsTable(reports, showActions) {
  if (!reports.length) return `<p class="empty-state">No consolidated branch reports yet.</p>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Branch</th><th>Entries</th><th>Status</th><th>Score</th>${showActions ? "<th>Action</th>" : ""}</tr></thead>
        <tbody>${reports.map((report) => {
          const entries = state.entries.filter((entry) => report.entryIds.includes(entry.id));
          return `<tr>
            <td>${report.date}</td><td>${branchName(report.branchId)}</td><td>${report.entryIds.length}</td>
            <td><span class="badge ${statusClass(report.status)}">${report.status}</span><br><small>${report.bmComment || report.bqaComment || ""}</small></td>
            <td>${averageScore(entries).toFixed(1)}%</td>
            ${showActions ? `<td>${report.status === "Submitted to BM" ? `<button class="mini-action" data-report-status="${report.id}:BM Approved" type="button">Approve</button> <button class="mini-action muted" data-report-status="${report.id}:BM Returned" type="button">Return</button>` : "Closed"}</td>` : ""}
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
  `;
}

function branchLeaderboard(entries) {
  const groups = {};
  entries.forEach((e) => { if (!groups[e.branchId]) groups[e.branchId] = []; groups[e.branchId].push(e); });
  const ranked = Object.entries(groups)
    .map(([branchId, es]) => ({ branchId, count: es.length, score: averageScore(es) }))
    .sort((a, b) => b.count - a.count || b.score - a.score);
  if (!ranked.length) return `<p class="empty-state">No branch data for this period.</p>`;
  return `
    <div class="table-wrap">
      <table class="leaderboard-table">
        <thead><tr><th>#</th><th>Branch</th><th>Submissions</th><th>Avg Score</th><th></th></tr></thead>
        <tbody>
          ${ranked.map((r, i) => `<tr class="${i === 0 ? "row-best" : i === ranked.length - 1 && ranked.length > 1 ? "row-worst" : ""}">
            <td><span class="rank-badge ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}">${i + 1}</span></td>
            <td><b>${branchName(r.branchId)}</b></td>
            <td>${r.count}</td>
            <td>${r.score.toFixed(1)}%</td>
            <td>${i === 0 ? '<span class="badge bqa-approved">Leading</span>' : i === ranked.length - 1 && ranked.length > 1 ? '<span class="badge rejected">Low Activity</span>' : ''}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function staffLeaderboard(entries) {
  const groups = {};
  entries.forEach((e) => { if (!groups[e.userId]) groups[e.userId] = []; groups[e.userId].push(e); });
  const ranked = Object.entries(groups)
    .map(([userId, es]) => {
      const u = state.users.find((x) => x.id === Number(userId));
      return { user: u, count: es.length, score: averageScore(es) };
    })
    .filter((r) => r.user)
    .sort((a, b) => b.score - a.score || b.count - a.count);
  if (!ranked.length) return `<p class="empty-state">No staff data for this period.</p>`;
  return `
    <div class="table-wrap">
      <table class="leaderboard-table">
        <thead><tr><th>#</th><th>Staff</th><th>Profile</th><th>Branch</th><th>Entries</th><th>Score</th><th></th></tr></thead>
        <tbody>
          ${ranked.map((r, i) => `<tr class="${i === 0 ? "row-best" : i === ranked.length - 1 && ranked.length > 1 ? "row-worst" : ""}">
            <td><span class="rank-badge ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}">${i + 1}</span></td>
            <td><b>${r.user.name}</b></td>
            <td><small>${r.user.profile}</small></td>
            <td><small>${branchName(r.user.branchId)}</small></td>
            <td>${r.count}</td>
            <td>${r.score.toFixed(1)}%</td>
            <td>${i === 0 ? '<span class="badge bqa-approved">Top</span>' : i === ranked.length - 1 && ranked.length > 1 ? '<span class="badge rejected">Attention</span>' : ''}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function reportsView(user) {
  const entries = periodEntries(entriesVisibleTo(user));
  const kpiRows = summarizeKpis(entries);
  const top = kpiRows[0];
  const under = kpiRows.find((row) => row.actual < row.kpi.target);
  const showLeaderboards = isSuperRole(user.role) || isZonalRole(user.role);
  const periodLabel = `${state.reportPeriod} Report — ${new Date().toLocaleDateString("en-GB")}`;
  return `
    <section class="panel" id="reportsPrintArea">
      <div class="panel-heading">
        <div><span class="eyebrow">CRDB Bank · Coastal Zone</span><h3>${periodLabel}</h3></div>
        <div class="report-toolbar">
          <div class="segmented">${["Daily", "Weekly", "Monthly", "Quarterly"].map((p) => `<button class="${state.reportPeriod === p ? "active" : ""}" data-report-period="${p}" type="button">${p}</button>`).join("")}</div>
          <div class="export-btns">
            <button class="mini-action" data-export="csv" type="button">⬇ CSV</button>
            <button class="mini-action" data-export="xls" type="button">⬇ XLS</button>
            <button class="mini-action" data-export="pdf" type="button">🖨 PDF</button>
          </div>
        </div>
      </div>

      <section class="metric-grid">
        ${metricCard("Total Entries", entries.length, `${state.reportPeriod} period`, Math.min(entries.length * 25, 100))}
        ${metricCard("Zone Average Score", `${averageScore(entries).toFixed(1)}%`, performanceCategory(averageScore(entries)), averageScore(entries))}
        ${metricCard("Top KPI", top?.kpi.name || "—", top ? `${top.actual.toLocaleString()} captured` : "No data", 80)}
        ${metricCard("Below Target", under?.kpi.name || "—", under ? `${under.actual} captured` : "All on track", under ? 35 : 100)}
      </section>

      ${showLeaderboards ? `
        <div class="content-grid">
          <article class="panel flat">
            <div class="panel-heading"><div><span class="eyebrow">Branch Ranking</span><h3>Branch Leaderboard</h3></div></div>
            ${branchLeaderboard(entries)}
          </article>
          <article class="panel flat">
            <div class="panel-heading"><div><span class="eyebrow">Staff Ranking</span><h3>Top Staff</h3></div></div>
            ${staffLeaderboard(entries)}
          </article>
        </div>
      ` : ""}

      <article class="panel flat" style="margin-bottom:18px">
        <div class="panel-heading"><div><span class="eyebrow">Status Breakdown</span><h3>Validation Summary</h3></div></div>
        <div class="status-grid">${Object.entries(statusCounts(entries)).map(([status, count]) => `<div><b>${count}</b><span>${status}</span></div>`).join("") || `<p class="empty-state">No status data.</p>`}</div>
      </article>
      <article class="panel flat records-panel">
        <div class="panel-heading"><div><span class="eyebrow">All Records</span><h3>Entry Details</h3></div></div>
        ${exportReadyTable(entries)}
      </article>
    </section>
  `;
}

function exportReadyTable(entries) {
  if (!entries.length) return `<p class="empty-state">No entries for this period.</p>`;
  return `
    <div class="table-wrap">
      <table class="export-table">
        <thead>
          <tr>
            <th>Date</th><th>Staff Name</th><th>Profile</th><th>Branch</th>
            <th>Status</th><th>Score (%)</th><th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map((entry) => {
            const u = state.users.find((x) => x.id === entry.userId);
            const sc = scoreEntry(entry);
            const cat = sc.category;
            const rowClass = sc.finalIndex >= 90 ? "row-best" : sc.finalIndex < 60 ? "row-worst" : "";
            return `<tr class="${rowClass}">
              <td>${entry.date}</td>
              <td><b>${u?.name || "—"}</b></td>
              <td>${u?.profile || "—"}</td>
              <td>${branchName(entry.branchId)}</td>
              <td><span class="badge ${statusClass(entry.status)}">${entry.status}</span></td>
              <td><b>${sc.finalIndex.toFixed(1)}</b></td>
              <td>${cat}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>`;
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportCSV(entries) {
  const cols = ["Date", "Staff Name", "Staff No", "Profile", "Branch", "Status", "Score (%)", "Category"];
  const rows = entries.map((entry) => {
    const u = state.users.find((x) => x.id === entry.userId);
    const sc = scoreEntry(entry);
    return [entry.date, u?.name||"", u?.staffNo||"", u?.profile||"", branchName(entry.branchId), entry.status, sc.finalIndex.toFixed(1), sc.category];
  });
  const csv = [cols, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  downloadFile(`CRDB VVDT - Coastal Zone - ${state.reportPeriod} Report\r\nExported: ${new Date().toLocaleDateString("en-GB")}\r\n\r\n${csv}`, `VVDT-${state.reportPeriod}-${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8;");
}

function exportXLS(entries) {
  const cols = ["Date","Staff Name","Staff No","Profile","Branch","Status","Score (%)","Category"];
  const header = `<tr style="background:#0a7708;color:#fff">${cols.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  const rows = entries.map((entry) => {
    const u = state.users.find((x) => x.id === entry.userId);
    const sc = scoreEntry(entry);
    const bg = sc.finalIndex >= 90 ? "#e0fde0" : sc.finalIndex < 60 ? "#ffe1e1" : "";
    return `<tr style="background:${bg}">${[entry.date, u?.name||"", u?.staffNo||"", u?.profile||"", branchName(entry.branchId), entry.status, sc.finalIndex.toFixed(1), sc.category].map((c) => `<td>${c}</td>`).join("")}</tr>`;
  }).join("");
  const title = `<tr><td colspan="8" style="font-size:14pt;font-weight:bold;background:#0a7708;color:#fff">CRDB VVDT — Coastal Zone — ${state.reportPeriod} Report</td></tr><tr><td colspan="8">Exported: ${new Date().toLocaleDateString("en-GB")}</td></tr><tr></tr>`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table>${title}${header}${rows}</table></body></html>`;
  downloadFile(html, `VVDT-${state.reportPeriod}-${new Date().toISOString().slice(0,10)}.xls`, "application/vnd.ms-excel;charset=utf-8;");
}

function exportPDF() {
  window.print();
}

function auditView() {
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">Admin only</span><h3>Audit Trail</h3></div></div><div class="timeline">${state.auditLogs.map((log) => `<div><b>${log.action}</b><span>${log.actor} · ${log.entity} · ${log.time}${log.note ? ` · ${log.note}` : ""}</span></div>`).join("")}</div></section>`;
}

function adminUserCreateForm() {
  const catalog = state.roleCatalog;
  const firstRole = catalog[0];
  const firstIsZonal = firstRole?.type === "Zonal" || firstRole?.type === "Super";
  return `
    <div class="panel-heading"><div><span class="eyebrow">Create User</span><h3>Add New Staff Member</h3></div></div>
    <form class="entry-form" id="adminUserForm">
      <label>Full Name <input name="name" placeholder="e.g. Amina Juma" required /></label>
      <label>Phone Number <input name="phone" inputmode="tel" placeholder="255700XXXXXX" required /></label>
      <label>Role
        <select name="role" id="adminRoleSelect">
          ${catalog.map((r) => `<option value="${r.key}" data-type="${r.type}">${r.label} — ${r.type === "Super" ? "Super (All Access)" : r.type === "Zonal" ? "Zonal Staff" : "Branch Staff"}</option>`).join("")}
        </select>
      </label>
      <label>Profile
        <select name="profile" id="adminProfileSelect">
          <optgroup label="Branch Staff">
            ${["MBB", "RO", "MCE", "TL", "Premier RM", "SSO", "Freelancer", "Digital Champion"].map((p) => `<option value="${p}">${p}</option>`).join("")}
          </optgroup>
          <optgroup label="Zonal Staff">
            ${["ZM", "ZBM", "ZQA", "HRBP"].map((p) => `<option value="${p}">${p}</option>`).join("")}
          </optgroup>
        </select>
      </label>
      <div id="branchFieldWrap" ${firstIsZonal ? 'style="display:none"' : ""}>
        <label>Branch
          <select name="branchId">
            ${state.branches.map((b) => `<option value="${b.id}">${b.code} · ${b.name}</option>`).join("")}
          </select>
        </label>
      </div>
      <p id="zonalRoleNote" class="form-note" style="display:${firstIsZonal ? "block" : "none"}">Zonal / Super roles are not assigned to a branch — they have zone-wide visibility.</p>
      <p id="adminUserError" class="danger-note" style="display:none"></p>
      <button class="primary-action" type="submit">Create User</button>
    </form>
    ${state.generatedPassword ? `<p class="success-note">Account created — temporary password: <strong>${state.generatedPassword.password}</strong> for ${state.generatedPassword.phone}. User will be prompted to change it on first login.</p>` : ""}
  `;
}

function userManagementPanel() {
  const me = activeUser();
  return `
    <div class="panel-heading"><div><span class="eyebrow">All Staff</span><h3>User Directory</h3></div><span class="status-pill">${state.users.length} users</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Phone</th><th>Role · Profile</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${state.users.map((u) => `<tr class="${!u.active ? "row-disabled" : ""}">
            <td><b>${u.name}</b><br><small>${u.staffNo}</small></td>
            <td>${u.phone}</td>
            <td><span class="badge ${u.role === "Admin" ? "bm-approved" : "submitted"}">${u.role}</span> <small>${u.profile}</small></td>
            <td><small>${branchName(u.branchId)}</small></td>
            <td><span class="badge ${u.active ? "bqa-approved" : "rejected"}">${u.active ? "Active" : "Disabled"}</span>${u.mustChangePassword ? ' <span class="badge returned-with-comments" title="Must change password">PW</span>' : ""}</td>
            <td class="action-cell">
              ${u.id === me?.id ? '<small class="muted-text">You</small>' : `
                ${u.active
                  ? `<button class="mini-action muted" data-user-action="${u.id}:disable" type="button">Disable</button>`
                  : `<button class="mini-action" data-user-action="${u.id}:enable" type="button">Enable</button>`}
                <button class="mini-action muted" data-user-action="${u.id}:resetpw" type="button">Reset PW</button>
                <button class="mini-action danger" data-user-action="${u.id}:delete" type="button">Delete</button>
              `}
            </td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminView(user) {
  const sections = [
    { key: "users",    icon: "👤", label: "Users" },
    { key: "roles",    icon: "🔐", label: "Roles & Access" },
    { key: "branches", icon: "🏢", label: "Branches" },
    { key: "kpi",      icon: "📊", label: "KPI Weights" },
    { key: "system",   icon: "🔒", label: "System" }
  ];
  const open = state.adminSection || "users";

  const content = {
    users: `
      <div class="admin-panel-block">${adminUserCreateForm()}</div>
      <div class="admin-panel-block">${userManagementPanel()}</div>
    `,
    roles: `
      <div class="admin-panel-block">${accessControlPanel()}</div>
      <div class="admin-panel-block">${roleManagementPanel()}</div>
    `,
    branches: `
      <div class="admin-panel-block">
        <div class="panel-heading"><div><span class="eyebrow">Branches</span><h3>Branch Directory</h3></div><span class="status-pill">${state.branches.length} branches</span></div>
        ${branchManagementPanel()}
      </div>
    `,
    kpi: (() => {
      const totalNow = state.kpis.reduce((s, k) => s + k.weight, 0);
      const overClass = totalNow > 100 ? "weight-over" : totalNow === 100 ? "weight-perfect" : "weight-under";
      return `
      <div class="admin-panel-block">
        <div class="panel-heading"><div><span class="eyebrow">Scoring</span><h3>KPI Weights</h3></div><output id="weightTotal" class="weight-total-display ${overClass}">${totalNow}% total</output></div>
        <p id="weightOverError" class="danger-note" style="display:${totalNow > 100 ? "block" : "none"}">Total weight is ${totalNow}% — must not exceed 100%. Reduce some values before saving.</p>
        <form id="kpiWeightForm" class="weight-list">${state.kpis.map((kpi) => `<label class="weight-row"><b>${escapeHtml(kpi.name)}</b><input name="weight-${kpi.id}" type="number" min="0" max="100" value="${kpi.weight}" /><span>%</span></label>`).join("")}<button class="secondary-action" type="submit">Save Weights</button></form>
      </div>`;
    })(),
    system: `
      <div class="admin-panel-block">${backupPanel()}</div>
      <div class="admin-panel-block">${demoAccessPanel()}</div>
    `
  };

  return `
    <div class="admin-layout">
      <nav class="admin-nav">
        ${sections.map((s) => `<button class="admin-nav-btn ${open === s.key ? "active" : ""}" data-admin-section="${s.key}" type="button"><span class="admin-nav-icon">${s.icon}</span><span class="admin-nav-label">${s.label}</span></button>`).join("")}
      </nav>
      <div class="admin-content">
        ${content[open] || ""}
      </div>
    </div>
  `;
}

function accessControlPanel() {
  const catalog = state.roleCatalog;
  return `
    <div class="panel-heading"><div><span class="eyebrow">Access Control</span><h3>Assign Modules by Role</h3></div></div>
    <form id="permissionForm" class="permission-matrix">
      ${catalog.map((roleEntry) => {
        const role = roleEntry.key;
        return `<fieldset>
          <legend>${role} <span class="role-type-badge ${roleEntry.type === "Zonal" ? "zonal" : roleEntry.type === "Super" ? "super" : "branch"}">${roleEntry.type === "Super" ? "Super" : roleEntry.type === "Zonal" ? "Zonal Staff" : "Branch Staff"}</span></legend>
          ${MODULES.map((module) => `<label><input type="checkbox" name="${role}:${module.key}" ${roleModules(role).includes(module.key) ? "checked" : ""} ${role === "Admin" && ["dashboard", "admin", "demoAccess"].includes(module.key) ? "disabled" : ""} /> ${module.label}</label>`).join("")}
        </fieldset>`;
      }).join("")}
      <button class="secondary-action" type="submit">Save Access Control</button>
    </form>
  `;
}

function roleManagementPanel() {
  const catalog = state.roleCatalog;
  return `
    <div class="panel-heading"><div><span class="eyebrow">Role Management</span><h3>Roles & Profile Groups</h3></div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Role</th><th>Profile Group</th><th>Modules</th><th></th></tr></thead>
        <tbody>
          ${catalog.map((role) => `<tr>
            <td><strong>${role.label}</strong>${role.locked ? ` <span class="badge bqa-approved">System</span>` : ""}</td>
            <td><span class="role-type-badge ${role.type === "Zonal" ? "zonal" : role.type === "Super" ? "super" : "branch"}">${role.type === "Super" ? "Super" : role.type === "Zonal" ? "Zonal Staff" : "Branch Staff"}</span></td>
            <td><small>${(state.rolePermissions[role.key] || []).join(", ") || "None"}</small></td>
            <td>${role.locked ? "" : `<button class="mini-action danger" data-delete-role="${role.key}" type="button">Delete</button>`}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="panel-heading" style="margin-top:1.5rem"><div><span class="eyebrow">New Role</span><h3>Add Custom Role</h3></div></div>
    <form class="entry-form" id="createRoleForm">
      <label>Role Name <input name="roleName" placeholder="e.g. Compliance" required /></label>
      <label>Profile Group
        <select name="roleType">
          <option value="Branch">Branch Staff — assigned to a specific branch</option>
          <option value="Zonal">Zonal Staff — zone-wide, no branch assignment</option>
          <option value="Super">Super — full access, no branch restriction</option>
        </select>
      </label>
      <div class="span-2">
        <p class="form-note" style="margin-bottom:8px">Select modules for this role:</p>
        <div class="module-checkboxes">
          ${MODULES.filter((m) => m.key !== "demoAccess").map((m) => `<label class="module-check"><input type="checkbox" name="mod:${m.key}" /> ${m.label}</label>`).join("")}
        </div>
      </div>
      <button class="secondary-action" type="submit">Create Role</button>
    </form>
  `;
}

function demoAccessPanel() {
  if (!hasAccess(activeUser(), "demoAccess")) return "";
  return `
    <div class="panel-heading"><div><span class="eyebrow">Admin only</span><h3>Demo Access</h3></div><button class="link-action" data-action="reset-demo" type="button">Reset demo data</button></div>
    <div class="demo-grid">${demoCredentials.map((item) => `<div class="credential-card static"><b>${item.role}</b><span>${item.phone}</span><small>${item.password} · ${item.note}</small></div>`).join("")}</div>
  `;
}

function branchManagementPanel() {
  const editing = state.editingBranchId;
  const rows = state.branches.map((branch) => {
    if (editing === branch.id) {
      return `<tr class="edit-row">
        <td><input name="edit-code" value="${branch.code}" readonly style="width:72px;font-weight:900" /></td>
        <td><input name="edit-name" value="${branch.name}" style="width:100%" required /></td>
        <td><select name="edit-class">
          ${["Small", "Medium", "Big"].map((c) => `<option${c === branch.classification ? " selected" : ""}>${c}</option>`).join("")}
        </select></td>
        <td>${branch.location}</td>
        <td><span class="badge bqa-approved">Active</span></td>
        <td>
          <button class="mini-action" data-save-branch="${branch.id}" type="button">Save</button>
          <button class="mini-action muted" data-edit-branch="" type="button">Cancel</button>
        </td>
      </tr>`;
    }
    const assigned = state.users.filter((u) => u.branchId === branch.id).length;
    return `<tr>
      <td><strong>${branch.code}</strong></td>
      <td>${branch.name}</td>
      <td>${branch.classification}</td>
      <td>${branch.location}</td>
      <td><span class="badge bqa-approved">Active</span><small style="display:block;color:var(--muted)">${assigned} user${assigned !== 1 ? "s" : ""}</small></td>
      <td>
        <button class="mini-action muted" data-edit-branch="${branch.id}" type="button">Edit</button>
        <button class="mini-action danger" data-delete-branch="${branch.id}" type="button">Delete</button>
      </td>
    </tr>`;
  }).join("");
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Sort Code</th><th>Branch Name</th><th>Classification</th><th>Zone</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="branchTableBody">${rows}</tbody>
      </table>
    </div>
    <div class="panel-heading" style="margin-top:1.5rem"><div><span class="eyebrow">New Branch</span><h3>Add Branch</h3></div></div>
    <form class="entry-form" id="addBranchForm">
      <label>Sort Code <input name="code" placeholder="e.g. 3400" maxlength="6" required /></label>
      <label>Branch Name <input name="name" placeholder="e.g. Kilwa" required /></label>
      <label>Classification
        <select name="classification">
          <option>Small</option><option>Medium</option><option>Big</option>
        </select>
      </label>
      <button class="secondary-action" type="submit">Add Branch</button>
    </form>
  `;
}

function backupPanel() {
  const snaps = backupSnapshots();
  return `
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">Data Safety</span><h3>Backup & Restore</h3></div><span class="status-pill">${snaps.length} snapshot${snaps.length !== 1 ? "s" : ""} saved</span></div>
      <p class="body-copy">A snapshot is saved automatically before every state change. Restore from any of the last 3 checkpoints below.</p>
      ${snaps.length ? `<div class="backup-grid">${snaps.map((s) => `<div class="report-tile"><b>${s.label}</b><span>${s.users} users · ${s.entries} entries</span><button class="secondary-action" data-restore-backup="${s.key}" type="button" style="margin-top:8px">Restore</button></div>`).join("")}</div>` : `<p class="empty-state">No backups yet — they appear after the first data change.</p>`}
    </section>
  `;
}

function showSuccessModal(title, message) {
  const existing = document.querySelector(".vvdt-success-overlay");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "vvdt-success-overlay";
  el.innerHTML = `
    <div class="vvdt-success-card">
      <div class="vvdt-success-tick">&#10003;</div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
      <button class="primary-action" id="vvdtSuccessClose">OK</button>
    </div>
  `;
  document.body.appendChild(el);
  const close = () => el.remove();
  document.querySelector("#vvdtSuccessClose")?.addEventListener("click", close);
  setTimeout(close, 6000);
}

function showCommentModal(title, placeholder, required, onConfirm) {
  const existing = document.querySelector(".vvdt-comment-overlay");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "vvdt-comment-overlay";
  el.innerHTML = `
    <div class="vvdt-success-card">
      <h3>${escapeHtml(title)}</h3>
      <textarea id="vvdtCommentInput" placeholder="${escapeHtml(placeholder)}" rows="3" style="width:100%;margin:12px 0;padding:10px 12px;border:1px solid var(--line);border-radius:8px;font:inherit;resize:vertical"></textarea>
      <p id="vvdtCommentError" class="danger-note" style="display:none">A comment is required for this action.</p>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button class="secondary-action" id="vvdtCommentCancel">Cancel</button>
        <button class="primary-action" id="vvdtCommentConfirm">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(el);
  document.querySelector("#vvdtCommentCancel")?.addEventListener("click", () => el.remove());
  document.querySelector("#vvdtCommentConfirm")?.addEventListener("click", () => {
    const comment = (document.querySelector("#vvdtCommentInput")?.value || "").trim();
    if (required && !comment) {
      const errEl = document.querySelector("#vvdtCommentError");
      if (errEl) errEl.style.display = "block";
      return;
    }
    el.remove();
    onConfirm(comment);
  });
}

function bindEvents() {
  document.querySelector("#changePasswordForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPw = String(form.get("newPw")).trim();
    const confirmPw = String(form.get("confirmPw")).trim();
    const errEl = document.querySelector("#pwError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    if (!isSimplePasswordValid(newPw)) return showErr("Password must be at least 6 characters.");
    if (newPw !== confirmPw) return showErr("Passwords do not match.");
    state.users = state.users.map((u) => u.id === state.activeUserId ? { ...u, password: newPw, mustChangePassword: false } : u);
    addAudit("Password changed", activeUser()?.phone || "");
    saveState();
    render();
  });

  const sidebarToggle = document.querySelector("#sidebarToggle");
  const appSidebar = document.querySelector("#appSidebar");
  const sidebarOverlay = document.querySelector("#sidebarOverlay");
  if (sidebarToggle && appSidebar) {
    const openSidebar = () => { appSidebar.classList.add("open"); sidebarOverlay?.classList.add("visible"); };
    const closeSidebar = () => { appSidebar.classList.remove("open"); sidebarOverlay?.classList.remove("visible"); };
    sidebarToggle.addEventListener("click", openSidebar);
    sidebarOverlay?.addEventListener("click", closeSidebar);
    appSidebar.querySelectorAll("[data-view]").forEach((btn) => btn.addEventListener("click", closeSidebar));
  }

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.authMode;
      render();
    });
  });

  document.querySelector("#loginForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = normalizePhone(form.get("phone"));
    const user = state.users.find((item) => normalizePhone(item.phone) === phone && item.password === form.get("password") && item.active);
    if (!user) {
      const errEl = document.querySelector("#loginError");
      if (errEl) { errEl.textContent = "Incorrect phone number or password, or account is inactive."; errEl.style.display = "block"; }
      return;
    }
    state.activeUserId = user.id;
    state.activeView = "dashboard";
    state.generatedPassword = null;
    addAudit("User logged in", user.phone);
    saveState();
    render();
  });

  document.querySelector("#signupForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = normalizePhone(form.get("phone"));
    const name = String(form.get("name")).trim();
    const errEl = document.querySelector("#signupError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    if (errEl) errEl.style.display = "none";
    if (state.users.some((u) => normalizePhone(u.phone) === phone)) return showErr(`An account with phone number ${phone} already exists. Please log in instead.`);
    if (state.users.some((u) => u.name.toLowerCase() === name.toLowerCase())) return showErr(`The name "${name}" is already registered. Contact your Admin if you need access.`);
    const user = createUser(form, "Staff");
    state.generatedPassword = { phone: user.phone, password: user.password };
    state.authMode = "signup";
    addAudit("Quick signup created", user.phone);
    saveState();
    render();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = button.dataset.view;
      saveState();
      render();
    });
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    addAudit("User logged out", activeUser()?.phone || "Unknown");
    state.activeUserId = null;
    state.authMode = "login";
    saveState();
    render();
  });

  document.querySelector("[data-action='reset-demo']")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(baseState);
    render();
  });

  document.querySelector("#entryForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {};
    kpisForUser(activeUser()).forEach((kpi) => {
      if (form.has(`kpi-${kpi.id}`)) values[kpi.id] = Number(form.get(`kpi-${kpi.id}`) || 0);
    });
    const entry = {
      id: Date.now(),
      userId: Number(form.get("userId")),
      branchId: String(form.get("branchId")),
      date: form.get("date"),
      values,
      status: "Submitted",
      comment: form.get("comment"),
      history: [],
      createdAt: nowLabel()
    };
    state.entries.unshift(entry);
    addAudit("Performance submitted", `Entry ${entry.id}`, entry.comment);
    saveState();
    render();
    showSuccessModal("Entry submitted for validation", "Your KPI entry has been submitted and is now awaiting BQA review.");
  });

  document.querySelectorAll("[data-entry-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const [id, status] = button.dataset.entryStatus.split(":");
      updateEntryStatus(Number(id), status);
    });
  });

  document.querySelector("[data-action='submit-branch-report']")?.addEventListener("click", () => createBranchReport());

  document.querySelectorAll("[data-report-status]").forEach((button) => {
    button.addEventListener("click", () => {
      const [id, status] = button.dataset.reportStatus.split(":");
      updateReportStatus(Number(id), status);
    });
  });

  document.querySelectorAll("[data-report-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportPeriod = button.dataset.reportPeriod;
      saveState();
      render();
    });
  });

  document.querySelector("#adminUserForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = normalizePhone(form.get("phone"));
    const name = String(form.get("name")).trim();
    const errEl = document.querySelector("#adminUserError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    if (errEl) errEl.style.display = "none";
    if (state.users.some((u) => normalizePhone(u.phone) === phone)) return showErr(`Phone ${phone} is already registered to an existing account.`);
    if (state.users.some((u) => u.name.toLowerCase() === name.toLowerCase())) return showErr(`A user named "${name}" already exists. Use a different name or check the directory.`);
    const user = createUser(form);
    state.generatedPassword = { phone: user.phone, password: user.password };
    addAudit("Admin created user", user.phone);
    saveState();
    render();
    showSuccessModal("User created", `${user.name} has been added. Temporary password: ${user.password} — share this securely.`);
  });

  document.querySelectorAll("[data-admin-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.adminSection = btn.dataset.adminSection;
      render();
    });
  });

  document.querySelectorAll("[data-user-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [idStr, action] = btn.dataset.userAction.split(":");
      const id = Number(idStr);
      const target = state.users.find((u) => u.id === id);
      if (!target) return;
      if (action === "enable") {
        state.users = state.users.map((u) => u.id === id ? { ...u, active: true } : u);
        addAudit("User enabled", target.phone);
        saveState(); render();
        showSuccessModal("User enabled", `${target.name} can now log in.`);
      } else if (action === "disable") {
        if (!confirm(`Disable ${target.name}? They will not be able to log in.`)) return;
        state.users = state.users.map((u) => u.id === id ? { ...u, active: false } : u);
        addAudit("User disabled", target.phone);
        saveState(); render();
        showSuccessModal("User disabled", `${target.name} has been deactivated.`);
      } else if (action === "delete") {
        if (state.entries.some((e) => e.userId === id)) return alert(`Cannot delete ${target.name} — they have submitted entries. Disable instead.`);
        if (!confirm(`Permanently delete ${target.name}? This cannot be undone.`)) return;
        state.users = state.users.filter((u) => u.id !== id);
        addAudit("User deleted", target.phone);
        saveState(); render();
        showSuccessModal("User deleted", `${target.name} has been permanently removed.`);
      } else if (action === "resetpw") {
        const newPw = createRandomPassword();
        state.users = state.users.map((u) => u.id === id ? { ...u, password: newPw, mustChangePassword: true } : u);
        state.generatedPassword = { phone: target.phone, password: newPw };
        addAudit("Password reset by Admin", target.phone);
        saveState(); render();
        showSuccessModal("Password reset", `Temporary password for ${target.name}: ${newPw} — they will be prompted to change it on next login.`);
      }
    });
  });

  document.querySelector("#kpiWeightForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newWeights = state.kpis.map((kpi) => Number(form.get(`weight-${kpi.id}`) || kpi.weight));
    const total = newWeights.reduce((s, w) => s + w, 0);
    if (total > 100) {
      const errEl = document.querySelector("#weightOverError");
      if (errEl) { errEl.textContent = `Total weight is ${total}% — must not exceed 100%.`; errEl.style.display = "block"; }
      return;
    }
    state.kpis = state.kpis.map((kpi, i) => ({ ...kpi, weight: newWeights[i] }));
    addAudit("KPI weights updated", "Scoring engine");
    saveState();
    render();
    showSuccessModal("KPI weights saved", `Scoring weights updated. New total: ${total}%.`);
  });

  document.querySelectorAll("#kpiWeightForm input[type='number']").forEach((input) => {
    input.addEventListener("input", () => {
      const total = Array.from(document.querySelectorAll("#kpiWeightForm input[type='number']")).reduce((s, el) => s + Number(el.value || 0), 0);
      const output = document.querySelector("#weightTotal");
      const errEl = document.querySelector("#weightOverError");
      if (output) {
        output.textContent = `${total}% total`;
        output.className = `weight-total-display ${total > 100 ? "weight-over" : total === 100 ? "weight-perfect" : "weight-under"}`;
      }
      if (errEl) {
        errEl.style.display = total > 100 ? "block" : "none";
        if (total > 100) errEl.textContent = `Total weight is ${total}% — must not exceed 100%.`;
      }
    });
  });

  const roleSelect = document.querySelector("#adminRoleSelect");
  const branchWrap = document.querySelector("#branchFieldWrap");
  const zonalNote = document.querySelector("#zonalRoleNote");
  if (roleSelect && branchWrap) {
    const syncBranchField = () => {
      const selected = roleSelect.options[roleSelect.selectedIndex];
      const noBranch = selected?.dataset.type === "Zonal" || selected?.dataset.type === "Super";
      branchWrap.style.display = noBranch ? "none" : "";
      if (zonalNote) zonalNote.style.display = noBranch ? "block" : "none";
    };
    roleSelect.addEventListener("change", syncBranchField);
    syncBranchField();
  }

  document.querySelector("#createRoleForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("roleName")).trim();
    if (!label) return alert("Role name is required.");
    const key = label.toUpperCase().replace(/\s+/g, "_");
    if (state.roleCatalog.some((r) => r.key === key)) return alert(`Role "${label}" already exists.`);
    const type = form.get("roleType");
    const modules = MODULES.filter((m) => form.has(`mod:${m.key}`)).map((m) => m.key);
    state.roleCatalog.push({ key, label, type, locked: false });
    state.rolePermissions[key] = modules;
    addAudit("Role created", key, `Type: ${type}, Modules: ${modules.join(", ") || "none"}`);
    saveState();
    render();
    showSuccessModal("Role created", `"${label}" role (${type}) has been added with ${modules.length} module${modules.length !== 1 ? "s" : ""}.`);
  });

  document.querySelectorAll("[data-delete-role]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.deleteRole;
      const role = state.roleCatalog.find((r) => r.key === key);
      if (!role || role.locked) return;
      if (state.users.some((u) => u.role === key)) return alert(`Cannot delete "${role.label}" — it is assigned to existing users.`);
      if (!confirm(`Delete role "${role.label}"? This cannot be undone.`)) return;
      state.roleCatalog = state.roleCatalog.filter((r) => r.key !== key);
      delete state.rolePermissions[key];
      addAudit("Role deleted", key);
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-edit-branch]").forEach((button) => {
    button.addEventListener("click", () => {
      state.editingBranchId = button.dataset.editBranch || null;
      render();
    });
  });

  document.querySelectorAll("[data-save-branch]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.saveBranch;
      const row = button.closest("tr");
      const name = row.querySelector("[name='edit-name']")?.value.trim();
      const cls = row.querySelector("[name='edit-class']")?.value;
      if (!name) return alert("Branch name is required.");
      state.branches = state.branches.map((b) => b.id === id ? { ...b, name, classification: cls } : b);
      state.editingBranchId = null;
      addAudit("Branch updated", id, `${name} · ${cls}`);
      saveState();
      render();
      showSuccessModal("Branch updated", `${name} (${id}) saved as ${cls}.`);
    });
  });

  document.querySelectorAll("[data-delete-branch]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteBranch;
      const branch = state.branches.find((b) => b.id === id);
      if (!branch) return;
      if (state.users.some((u) => u.branchId === id)) return alert(`Cannot delete "${branch.name}" — users are assigned to it. Reassign them first.`);
      if (!confirm(`Delete branch "${branch.name}" (${branch.code})? This cannot be undone.`)) return;
      state.branches = state.branches.filter((b) => b.id !== id);
      addAudit("Branch deleted", branch.code);
      saveState();
      render();
    });
  });

  document.querySelector("#addBranchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code")).trim();
    const name = String(form.get("name")).trim();
    if (state.branches.some((b) => b.code === code)) return alert(`Sort code "${code}" already exists.`);
    const branch = { id: code, code, name, classification: form.get("classification"), location: "Coastal Zone", targetStatus: 70 };
    state.branches.push(branch);
    addAudit("Branch added", code, name);
    saveState();
    render();
    showSuccessModal("Branch added", `${name} (Sort code: ${code}) has been added to the register.`);
  });

  document.querySelectorAll("[data-restore-backup]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.restoreBackup;
      if (!confirm("Restore this backup? Your current session data will be replaced.")) return;
      restoreBackup(key);
    });
  });

  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => {
      const user = activeUser();
      const entries = periodEntries(entriesVisibleTo(user));
      if (button.dataset.export === "csv") exportCSV(entries);
      else if (button.dataset.export === "xls") exportXLS(entries);
      else if (button.dataset.export === "pdf") exportPDF();
    });
  });

  document.querySelector("#permissionForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = {};
    state.roleCatalog.forEach((roleEntry) => {
      const role = roleEntry.key;
      next[role] = MODULES.filter((module) => form.has(`${role}:${module.key}`)).map((module) => module.key);
      if (role === "Admin") {
        ["dashboard", "admin", "demoAccess"].forEach((moduleKey) => {
          if (!next[role].includes(moduleKey)) next[role].push(moduleKey);
        });
      }
    });
    state.rolePermissions = next;
    addAudit("Access control updated", "Role permissions");
    saveState();
    render();
    showSuccessModal("Access control saved", "Module permissions have been updated for all roles.");
  });
}

function createUser(form, forcedRole) {
  const role = forcedRole || form.get("role");
  const password = String(form.get("password") || createRandomPassword());
  const noBranch = isZonalRole(role) || isSuperRole(role);
  const user = {
    id: Date.now(),
    staffNo: `USR${String(state.users.length + 1).padStart(3, "0")}`,
    name: String(form.get("name")).trim(),
    phone: normalizePhone(form.get("phone")),
    password,
    role,
    profile: String(form.get("profile")),
    branchId: noBranch ? "zonal" : String(form.get("branchId")),
    active: true,
    mustChangePassword: true
  };
  state.users.push(user);
  return user;
}

function updateEntryStatus(id, status) {
  const requiresComment = ["Returned with Comments", "Rejected"].includes(status);
  const labels = { "BQA Approved": "Approve Entry", "Returned with Comments": "Return with Comments", "Rejected": "Reject Entry" };
  const successMessages = { "BQA Approved": "Entry approved and ready for branch consolidation.", "Returned with Comments": "Entry returned to staff with your comment.", "Rejected": "Entry has been rejected." };
  showCommentModal(
    labels[status] || status,
    requiresComment ? "Reason is required — staff will see this comment" : "Optional comment for this action",
    requiresComment,
    (comment) => {
      state.entries = state.entries.map((entry) => {
        if (entry.id !== id) return entry;
        const history = [...(entry.history || []), { actor: activeUser()?.name, status, comment: comment || "", time: nowLabel() }];
        return { ...entry, status, comment: comment || `${status} by ${activeUser()?.name}`, history };
      });
      addAudit(`Entry ${status}`, `Entry ${id}`, comment || "");
      saveState();
      render();
      showSuccessModal(labels[status] || status, successMessages[status] || `Entry marked as "${status}".`);
    }
  );
}

function createBranchReport() {
  const user = activeUser();
  const approved = consolidatableEntries(user.branchId);
  if (!approved.length) return showSuccessModal("Nothing to submit", "No BQA-approved entries are ready for BM submission. Approve entries first.");
  showCommentModal("Submit Branch Report to BM", "BQA summary comment for the consolidated report (required)", true, (comment) => {
    const report = {
      id: Date.now(),
      branchId: user.branchId,
      date: "2026-05-18",
      entryIds: approved.map((entry) => entry.id),
      status: "Submitted to BM",
      bqaComment: comment,
      bmComment: "",
      submittedBy: user.id,
      reviewedBy: null,
      createdAt: nowLabel(),
      updatedAt: nowLabel()
    };
    state.branchReports.unshift(report);
    state.entries = state.entries.map((entry) => approved.some((item) => item.id === entry.id) ? { ...entry, status: "Submitted to BM" } : entry);
    addAudit("Branch report submitted to BM", branchName(user.branchId), comment);
    saveState();
    render();
    showSuccessModal("Branch report submitted", `${approved.length} approved ${approved.length === 1 ? "entry" : "entries"} from ${branchName(user.branchId)} submitted to BM for review.`);
  });
}

function updateReportStatus(id, status) {
  const isReturn = status === "BM Returned";
  showCommentModal(
    isReturn ? "Return Branch Report" : "Approve Branch Report",
    isReturn ? "Reason for returning (required — BQA will see this)" : "Approval comment (optional)",
    isReturn,
    (comment) => {
      state.branchReports = state.branchReports.map((report) => report.id === id ? { ...report, status, bmComment: comment || status, reviewedBy: activeUser()?.id, updatedAt: nowLabel() } : report);
      const report = state.branchReports.find((item) => item.id === id);
      if (report) {
        state.entries = state.entries.map((entry) => report.entryIds.includes(entry.id) ? { ...entry, status } : entry);
        addAudit(`Branch report ${status}`, branchName(report.branchId), comment || "");
      }
      saveState();
      render();
      showSuccessModal(
        isReturn ? "Report returned to BQA" : "Branch report approved",
        isReturn ? "The branch report has been returned to BQA with your comment." : `Branch report for ${report ? branchName(report.branchId) : "branch"} has been approved.`
      );
    }
  );
}

render();
