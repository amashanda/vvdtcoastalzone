import { auth, db } from './src/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = "vvdt-rollout-state-v4";
const BACKUP_KEYS = ["vvdt-backup-1", "vvdt-backup-2", "vvdt-backup-3"];

// Rate limiting: max 5 login attempts per 10 minutes per phone number
const _loginAttempts = new Map();
function checkRateLimit(phone) {
  const now = Date.now();
  const rec = _loginAttempts.get(phone) || { count: 0, firstAt: now };
  if (now - rec.firstAt > 600000) {
    _loginAttempts.set(phone, { count: 1, firstAt: now });
    return { ok: true };
  }
  if (rec.count >= 5) {
    const wait = Math.ceil((rec.firstAt + 600000 - now) / 60000);
    return { ok: false, wait };
  }
  _loginAttempts.set(phone, { count: rec.count + 1, firstAt: rec.firstAt });
  return { ok: true };
}
function resetRateLimit(phone) { _loginAttempts.delete(phone); }

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
  BQA: ["dashboard", "capture", "validation", "reports"],
  BM: ["dashboard", "bmReview", "reports"],
  ZBM: ["dashboard", "capture", "validation", "bmReview", "reports", "audit"],
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
  reportFilters: { branches: [], staffId: "", dateFrom: "", dateTo: "", status: "" },
  bulkPreview: null,
  generatedPassword: null,
  auditLogs: [
    { id: 1, actor: "System", action: "Rollout initialized", entity: "Application", note: "Seeded phone login, permissions, BQA/BM workflow.", time: "2026-05-18 12:00" }
  ]
};

// Passwords are held in memory only — never written to localStorage or Firestore
const _runtimePasswords = new Map(); // userId → password

// Always pre-seed built-in account passwords from baseState so they survive page reloads
baseState.users.forEach((u) => { if (u.password) _runtimePasswords.set(u.id, u.password); });

let state = extractPasswords(loadState());

// Session inactivity timeout — 15 minutes
let _lastActivity = Date.now();
const SESSION_MS = 15 * 60 * 1000;
['click', 'keydown', 'scroll', 'touchstart'].forEach((evt) =>
  document.addEventListener(evt, () => { _lastActivity = Date.now(); }, { passive: true })
);
setInterval(() => {
  if (state.activeUserId && Date.now() - _lastActivity > SESSION_MS) {
    if (auth) signOut(auth).catch(() => {});
    state.activeUserId = null;
    state.authMode = 'login';
    saveState();
    render();
    showSuccessModal('Session expired', 'You were logged out after 15 minutes of inactivity.');
  }
}, 60000);

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
    // Migrate BQA and BM to include "reports" module
    ["BQA", "BM"].forEach((role) => {
      if (merged.rolePermissions[role] && !merged.rolePermissions[role].includes("reports")) {
        merged.rolePermissions[role] = [...merged.rolePermissions[role], "reports"];
      }
    });
    return merged;
  } catch (err) {
    console.error("Load failed:", err);
    return structuredClone(baseState);
  }
}

function extractPasswords(s) {
  s.users = s.users.map((u) => {
    if (u.password) {
      _runtimePasswords.set(u.id, u.password);
      const { password, ...rest } = u;
      return rest;
    }
    return u;
  });
  return s;
}

async function saveState() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      const b1 = localStorage.getItem(BACKUP_KEYS[0]);
      const b2 = localStorage.getItem(BACKUP_KEYS[1]);
      if (b2) localStorage.setItem(BACKUP_KEYS[2], b2);
      if (b1) localStorage.setItem(BACKUP_KEYS[1], b1);
      localStorage.setItem(BACKUP_KEYS[0], current);
    }
    // Strip passwords and temp credentials before persisting
    const stateToSave = {
      ...state,
      users: state.users.map(({ password, ...rest }) => rest),
      generatedPassword: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

    // Sync role permissions to Firestore so all devices stay in sync
    if (db) {
      setDoc(doc(db, 'config', 'rolePermissions'), {
        permissions: state.rolePermissions,
        catalog: state.roleCatalog,
        updatedAt: new Date().toISOString(),
      }).catch((err) => console.error('Firestore role sync failed:', err));
    }
  } catch (err) {
    console.error('Save failed:', err);
  }
}

async function loadRolePermissionsFromFirestore() {
  if (!db) return;
  try {
    const snap = await getDoc(doc(db, 'config', 'rolePermissions'));
    if (snap.exists()) {
      const data = snap.data();
      if (data.permissions) state.rolePermissions = data.permissions;
      if (data.catalog) state.roleCatalog = data.catalog;
    }
  } catch (err) {
    console.error('Firestore role load failed:', err);
  }
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
  const today = new Date();
  const days = { Daily: 1, Weekly: 7, Monthly: 31, Quarterly: 92 }[period] || 1;
  const start = new Date(today);
  start.setDate(today.getDate() - days + 1);
  return entries.filter((entry) => {
    const date = new Date(`${entry.date}T12:00:00`);
    return date >= start && date <= today;
  });
}

function filteredEntries(user) {
  const f = state.reportFilters || {};
  let entries = entriesVisibleTo(user);

  // Use custom date range if set, else fall back to period preset
  if (f.dateFrom || f.dateTo) {
    if (f.dateFrom) entries = entries.filter((e) => e.date >= f.dateFrom);
    if (f.dateTo)   entries = entries.filter((e) => e.date <= f.dateTo);
  } else {
    entries = periodEntries(entries);
  }

  if (f.branches?.length) entries = entries.filter((e) => f.branches.includes(e.branchId));
  if (f.staffId)           entries = entries.filter((e) => String(e.userId) === String(f.staffId));
  if (f.status)            entries = entries.filter((e) => e.status === f.status);
  return entries;
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

function parseCSV(text) {
  return text.split(/\r?\n/).filter((l) => l.trim()).map((line) => {
    const cells = [];
    let cell = "", inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === "," && !inQuote) { cells.push(cell.trim()); cell = ""; }
      else { cell += ch; }
    }
    cells.push(cell.trim());
    return cells;
  });
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
  return `
    <main class="auth-page">
      <section class="auth-hero image-hero">
        <img class="login-dhow" src="Coastal Zone Dhow.jpg" alt="Dhow sailing on the coast" />
        <div class="auth-overlay">
          <span class="eyebrow">CRDB Bank PLC · Coastal Zone</span>
          <h1>Volume & Value Daily Tracker</h1>
          <p>One Dhow. One Direction. One Results. Secure daily KPI capture, validation, performance scoring, and branch visibility.</p>
        </div>
        <img class="login-logo" src="CRDB logo.png" alt="CRDB Bank logo" />
      </section>

      <section class="auth-card minimal">
        ${loginForm()}
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
          <small>${escapeHtml(user.name)} · ${escapeHtml(branchName(user.branchId))}</small>
        </div>
      </aside>
      <main>
        <header class="topbar">
          <div><p>One Dhow. One Direction. One Results.</p><h1>${viewTitle()}</h1></div>
          <div class="topbar-actions">
            <span class="profile-chip"><b>${user.role}</b><small>${user.phone}</small></span>
            <button class="secondary-action" data-action="changepw" type="button">Change PW</button>
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
  if (isSuperRole(user.role) || isZonalRole(user.role)) return zonalDashboard(user);
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
  const branchStaff = state.users.filter((u) => u.active && u.branchId === user.branchId);
  const staffRows = branchStaff.map((u) => {
    const uEntries = entries.filter((e) => e.userId === u.id);
    const score = averageScore(uEntries);
    const latest = uEntries[0];
    return { user: u, count: uEntries.length, score, latest };
  }).sort((a, b) => b.score - a.score || b.count - a.count);

  return `
    <section class="metric-grid">
      ${metricCard("Received", entries.length, "Branch submissions", 100)}
      ${metricCard("Pending Review", counts.Submitted || 0, "Awaiting BQA action", 60)}
      ${metricCard("Approved", counts["BQA Approved"] || 0, "Ready for BM consolidation", 85)}
      ${metricCard("Ready for BM", ready, "Can be consolidated", 80)}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-heading"><div><span class="eyebrow">${branchName(user.branchId)} · All staff</span><h3>Branch Staff Performance</h3></div></div>
        ${staffRows.length ? `
          <div class="table-wrap">
            <table class="leaderboard-table">
              <thead><tr><th>#</th><th>Staff</th><th>Profile</th><th>Entries</th><th>Avg Score</th><th>Latest Status</th></tr></thead>
              <tbody>
                ${staffRows.map((r, i) => `<tr class="${r.score >= 90 && r.count ? "row-best" : r.score > 0 && r.score < 60 ? "row-worst" : ""}">
                  <td><span class="rank-badge ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}">${i + 1}</span></td>
                  <td><b>${escapeHtml(r.user.name)}</b></td>
                  <td><small>${escapeHtml(r.user.profile)}</small></td>
                  <td>${r.count}</td>
                  <td>${r.count ? r.score.toFixed(1) + "%" : "—"}</td>
                  <td>${r.latest ? `<span class="badge ${statusClass(r.latest.status)}">${escapeHtml(r.latest.status)}</span>` : `<span class="muted-text">No entries</span>`}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="empty-state">No staff assigned to this branch yet.</p>`}
      </article>
      <article class="panel">
        <div class="panel-heading"><div><span class="eyebrow">Branch status</span><h3>Submission Breakdown</h3></div></div>
        <div class="status-grid">${Object.entries(counts).map(([status, count]) => `<div><b>${count}</b><span>${status}</span></div>`).join("") || `<p class="empty-state">No branch entries yet.</p>`}</div>
      </article>
    </section>
  `;
}

function bmDashboard(user) {
  const reports = state.branchReports.filter((report) => report.branchId === user.branchId);
  const pending = reports.filter((report) => report.status === "Submitted to BM");
  const allEntries = entriesVisibleTo(user);
  const branchStaff = state.users.filter((u) => u.active && u.branchId === user.branchId);
  const staffRows = branchStaff.map((u) => {
    const uEntries = allEntries.filter((e) => e.userId === u.id);
    const score = averageScore(uEntries);
    return { user: u, count: uEntries.length, score };
  }).sort((a, b) => b.score - a.score || b.count - a.count);

  return `
    <section class="metric-grid">
      ${metricCard("Pending Approval", pending.length, "Consolidated branch reports", Math.min(pending.length * 40, 100))}
      ${metricCard("Approved Reports", reports.filter((report) => report.status === "BM Approved").length, "Signed off by BM", 90)}
      ${metricCard("Returned Reports", reports.filter((report) => report.status === "BM Returned").length, "Needs BQA correction", 40)}
      ${metricCard("Branch Score", `${averageScore(allEntries).toFixed(1)}%`, branchName(user.branchId), averageScore(allEntries))}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-heading"><div><span class="eyebrow">${branchName(user.branchId)} · Team overview</span><h3>Branch Staff Performance</h3></div></div>
        ${staffRows.length ? `
          <div class="table-wrap">
            <table class="leaderboard-table">
              <thead><tr><th>#</th><th>Staff</th><th>Profile</th><th>Entries</th><th>Avg Score</th></tr></thead>
              <tbody>
                ${staffRows.map((r, i) => `<tr class="${r.score >= 90 && r.count ? "row-best" : r.score > 0 && r.score < 60 ? "row-worst" : ""}">
                  <td><span class="rank-badge ${i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : ""}">${i + 1}</span></td>
                  <td><b>${escapeHtml(r.user.name)}</b></td>
                  <td><small>${escapeHtml(r.user.profile)}</small></td>
                  <td>${r.count}</td>
                  <td>${r.count ? r.score.toFixed(1) + "%" : "—"}</td>
                </tr>`).join("")}
              </tbody>
            </table>
          </div>
        ` : `<p class="empty-state">No staff assigned to this branch yet.</p>`}
      </article>
      <article class="panel">
        <div class="panel-heading"><div><span class="eyebrow">BM queue</span><h3>Reports Awaiting Review</h3></div></div>
        ${branchReportsTable(reports, true)}
      </article>
    </section>
  `;
}

function zonalDashboard(user) {
  const allEntries = entriesVisibleTo(user);
  const allStaff = state.users.filter((u) => u.active && (u.role === "Staff" || u.role === "BQA" || u.role === "BM"));
  const activeStaff = allStaff.length || 1;

  // Build per-KPI consolidated rows: total target = sum of per-user targets, total actual = sum of all entry values
  const kpiRows = state.kpis.filter((k) => k.active && k.scope === "Individual").map((kpi) => {
    const totalTarget = allStaff.reduce((sum, u) => sum + targetForKpi(kpi, u), 0);
    const totalActual = allEntries.reduce((sum, e) => sum + Number(e.values[kpi.id] || 0), 0);
    const pct = totalTarget > 0 ? Math.min((totalActual / totalTarget) * 100, 150) : 0;
    return { kpi, actual: totalActual, target: totalTarget, pct };
  }).filter((r) => r.target > 0 || r.actual > 0);

  const branchCount = new Set(allEntries.map((e) => e.branchId)).size;
  const approvedCount = allEntries.filter((e) => e.status === "BQA Approved").length;

  return `
    <section class="metric-grid">
      ${metricCard("Zone Score", `${averageScore(allEntries).toFixed(1)}%`, performanceCategory(averageScore(allEntries)), averageScore(allEntries))}
      ${metricCard("Total Entries", allEntries.length, `${branchCount} branch${branchCount !== 1 ? "es" : ""} reporting`, Math.min(allEntries.length * 8, 100))}
      ${metricCard("Active Staff", activeStaff, "Users across all branches", 100)}
      ${metricCard("BQA Approved", approvedCount, "Validated zone-wide", Math.min(approvedCount * 15, 100))}
    </section>
    <section class="content-grid">
      <article class="panel wide">
        <div class="panel-heading">
          <div><span class="eyebrow">Zone consolidated · All teams</span><h3>Total Targets vs Actuals</h3></div>
        </div>
        <div class="leaderboard">${kpiRows.map((row) => progressRow(row)).join("") || `<p class="empty-state">No entries recorded yet.</p>`}</div>
      </article>
      <article class="panel">
        <div class="panel-heading"><div><span class="eyebrow">Submission status</span><h3>Zone Overview</h3></div></div>
        <div class="submission-feed">${Object.entries(statusCounts(allEntries)).map(([status, count]) => `
          <div class="submission-feed-item">
            <div class="feed-row"><span class="badge ${statusClass(status)}">${escapeHtml(status)}</span><small>${count}</small></div>
          </div>`).join("") || `<p class="empty-state">No data yet.</p>`}
        </div>
      </article>
    </section>
    ${isSuperRole(user.role) || isZonalRole(user.role) ? `
    <div class="content-grid">
      <article class="panel flat">
        <div class="panel-heading"><div><span class="eyebrow">Branch Ranking</span><h3>Branch Leaderboard</h3></div></div>
        ${branchLeaderboard(allEntries)}
      </article>
      <article class="panel flat">
        <div class="panel-heading"><div><span class="eyebrow">Staff Ranking</span><h3>Top Performers</h3></div></div>
        ${staffLeaderboard(allEntries)}
      </article>
    </div>` : ""}
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
  const today = new Date().toISOString().slice(0, 10);
  const entryKpis = kpisForUser(user).filter((kpi) => kpi.scope === "Individual" || user.role !== "Staff");
  const lockedToSelf = !isSuperRole(user.role);
  return `
    <section class="panel">
      <div class="panel-heading"><div><span class="eyebrow">Daily workflow</span><h3>Daily KPI Capture</h3></div></div>
      <form class="entry-form" id="entryForm">
        <label>Entry Date <input name="date" type="date" value="${today}" required /></label>
        <label>Staff
          ${lockedToSelf
            ? `<input type="text" value="${escapeHtml(user.name)} · ${escapeHtml(user.profile)}" disabled style="background:var(--surface);color:var(--muted)" /><input type="hidden" name="userId" value="${user.id}" />`
            : `<select name="userId">${staffOptions(user)}</select>`}
        </label>
        <label>Branch <select name="branchId">${branchOptions(user)}</select></label>
        ${entryKpis.map((kpi) => `<label>${escapeHtml(kpi.name)} <small>${escapeHtml(kpi.scope)} · ${escapeHtml(kpi.frequency)} · Target: ${targetForKpi(kpi, user)} ${escapeHtml(kpi.unit)}</small><input name="kpi-${kpi.id}" type="number" min="0" max="99999" step="1" value="" placeholder="0" required /></label>`).join("")}
        <label class="span-2">Evidence / Comment <textarea name="comment" placeholder="Describe your daily activities and attach evidence for BQA review."></textarea></label>
        <button class="primary-action" type="submit">Submit for Validation</button>
      </form>
    </section>
    <section class="panel"><div class="panel-heading"><div><span class="eyebrow">Recent records</span><h3>Submissions</h3></div></div><div class="table-wrap">${entriesTable(entriesVisibleTo(user).slice(0, 10), false)}</div></section>
  `;
}

function staffOptions(user) {
  // Super/Admin can pick any active user; everyone else is locked to their own entry
  if (isSuperRole(user.role)) {
    return state.users.filter((u) => u.active).map((u) => `<option value="${u.id}">${u.name} · ${u.profile} · ${branchName(u.branchId)}</option>`).join("");
  }
  return `<option value="${user.id}" selected>${user.name} · ${user.profile}</option>`;
}

function branchOptions(user) {
  // Super sees all branches; everyone else sees only their own branch
  const options = isSuperRole(user.role) ? state.branches : state.branches.filter((branch) => branch.id === user.branchId);
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
            <td>${escapeHtml(entryUser?.name || "Unknown")}<br><small>${escapeHtml(entryUser?.profile || "")}</small></td>
            <td>${escapeHtml(branchName(entry.branchId))}</td>
            <td><span class="badge ${statusClass(entry.status)}">${escapeHtml(entry.status)}</span><br><small>${escapeHtml(entry.comment || "")}</small></td>
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
            <td><span class="badge ${statusClass(report.status)}">${escapeHtml(report.status)}</span><br><small>${escapeHtml(report.bmComment || report.bqaComment || "")}</small></td>
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

function reportFiltersPanel(user) {
  const f = state.reportFilters || {};
  const isBigView = isSuperRole(user.role) || isZonalRole(user.role);
  const isBranchRole = user.role === "BQA" || user.role === "BM";
  const active = [f.branches?.length, f.staffId, f.dateFrom, f.dateTo, f.status].filter(Boolean).length;
  return `
    <div class="filter-bar">
      <div class="filter-bar-head">
        <span class="filter-bar-title">&#x1F50D; Filters ${active ? `<span class="filter-active-badge">${active} active</span>` : ""}</span>
        ${active ? `<button class="link-action" data-action="clear-filters" type="button">Clear all</button>` : ""}
      </div>
      <div class="filter-controls">
        ${isBigView ? `
        <label class="filter-label">Branch
          <select id="filterBranch" name="filterBranch">
            <option value="">All branches</option>
            ${state.branches.map((b) => `<option value="${b.id}" ${f.branches?.includes(b.id) ? "selected" : ""}>${b.code} · ${b.name}</option>`).join("")}
          </select>
        </label>
        <label class="filter-label">Staff
          <select id="filterStaff" name="filterStaff">
            <option value="">All staff</option>
            ${state.users.filter((u) => u.active).map((u) => `<option value="${u.id}" ${f.staffId === String(u.id) ? "selected" : ""}>${u.name} · ${u.profile}</option>`).join("")}
          </select>
        </label>` : ""}
        ${isBranchRole ? `
        <label class="filter-label">Staff
          <select id="filterStaff" name="filterStaff">
            <option value="">All branch staff</option>
            ${state.users.filter((u) => u.active && u.branchId === user.branchId).map((u) => `<option value="${u.id}" ${f.staffId === String(u.id) ? "selected" : ""}>${u.name} · ${u.profile}</option>`).join("")}
          </select>
        </label>` : ""}
        <label class="filter-label">From
          <input type="date" id="filterDateFrom" value="${f.dateFrom || ""}" />
        </label>
        <label class="filter-label">To
          <input type="date" id="filterDateTo" value="${f.dateTo || ""}" />
        </label>
        <label class="filter-label">Status
          <select id="filterStatus" name="filterStatus">
            <option value="">All statuses</option>
            ${["Submitted","BQA Approved","Rejected","Returned with Comments","Submitted to BM","BM Approved","BM Returned"].map((s) => `<option value="${s}" ${f.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <button class="primary-action" data-action="apply-filters" style="align-self:flex-end" type="button">Apply</button>
      </div>
    </div>
  `;
}

function branchKpiSummary(entries, user) {
  const branchStaff = state.users.filter((u) => u.active && u.branchId === user.branchId);
  const kpiRows = state.kpis.filter((k) => k.active && k.scope === "Individual").map((kpi) => {
    const totalTarget = branchStaff.reduce((sum, u) => sum + targetForKpi(kpi, u), 0);
    const totalActual = entries.reduce((sum, e) => sum + Number(e.values[kpi.id] || 0), 0);
    const pct = totalTarget > 0 ? Math.min((totalActual / totalTarget) * 100, 150) : 0;
    return { kpi, actual: totalActual, target: totalTarget, pct };
  }).filter((r) => r.target > 0 || r.actual > 0);
  if (!kpiRows.length) return `<p class="empty-state">No KPI data for this period.</p>`;
  return `<div class="leaderboard">${kpiRows.map((row) => progressRow(row)).join("")}</div>`;
}

function reportsView(user) {
  const entries = filteredEntries(user);
  const kpiRows = summarizeKpis(entries);
  const top = kpiRows[0];
  const under = kpiRows.find((row) => row.actual < row.kpi.target);
  const showLeaderboards = isSuperRole(user.role) || isZonalRole(user.role);
  const isBranchRole = user.role === "BQA" || user.role === "BM";
  const scoreLabel = isBranchRole ? "Branch Avg Score" : "Zone Average Score";
  const periodLabel = `${state.reportPeriod} Report — ${new Date().toLocaleDateString("en-GB")}`;
  return `
    ${reportFiltersPanel(user)}
    <section class="panel" id="reportsPrintArea">
      <div class="panel-heading">
        <div><span class="eyebrow">CRDB Bank · Coastal Zone${isBranchRole ? ` · ${branchName(user.branchId)}` : ""}</span><h3>${periodLabel}</h3></div>
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
        ${metricCard(scoreLabel, `${averageScore(entries).toFixed(1)}%`, performanceCategory(averageScore(entries)), averageScore(entries))}
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

      ${isBranchRole ? `
        <div class="content-grid">
          <article class="panel flat">
            <div class="panel-heading"><div><span class="eyebrow">Staff Performance · ${branchName(user.branchId)}</span><h3>Staff Leaderboard</h3></div></div>
            ${staffLeaderboard(entries)}
          </article>
          <article class="panel flat">
            <div class="panel-heading"><div><span class="eyebrow">KPI Targets vs Actuals · ${branchName(user.branchId)}</span><h3>Branch KPI Summary</h3></div></div>
            ${branchKpiSummary(entries, user)}
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
  return `<section class="panel"><div class="panel-heading"><div><span class="eyebrow">Admin only</span><h3>Audit Trail</h3></div></div><div class="timeline">${state.auditLogs.map((log) => `<div><b>${escapeHtml(log.action)}</b><span>${escapeHtml(log.actor)} · ${escapeHtml(log.entity)} · ${escapeHtml(log.time)}${log.note ? ` · ${escapeHtml(log.note)}` : ""}</span></div>`).join("")}</div></section>`;
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
          <optgroup label="General (Admin / Super)">
            <option value="System Admin">System Admin</option>
            <option value="Manager">Manager</option>
            <option value="Superuser">Superuser</option>
            <option value="Analyst">Analyst</option>
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
            <td><b>${escapeHtml(u.name)}</b><br><small>${escapeHtml(u.staffNo)}</small></td>
            <td>${escapeHtml(u.phone)}</td>
            <td><span class="badge ${u.role === "Admin" ? "bm-approved" : "submitted"}">${escapeHtml(u.role)}</span> <small>${escapeHtml(u.profile)}</small></td>
            <td><small>${escapeHtml(branchName(u.branchId))}</small></td>
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
      <div class="admin-panel-block">${bulkUserUploadPanel()}</div>
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
            <td><strong>${escapeHtml(role.label)}</strong>${role.locked ? ` <span class="badge bqa-approved">System</span>` : ""}</td>
            <td><span class="role-type-badge ${role.type === "Zonal" ? "zonal" : role.type === "Super" ? "super" : "branch"}">${role.type === "Super" ? "Super" : role.type === "Zonal" ? "Zonal Staff" : "Branch Staff"}</span></td>
            <td><small>${(state.rolePermissions[role.key] || []).map(escapeHtml).join(", ") || "None"}</small></td>
            <td>${role.locked ? "" : `<button class="mini-action danger" data-delete-role="${escapeHtml(role.key)}" type="button">Delete</button>`}</td>
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
  if (!import.meta.env.VITE_SHOW_DEMO) return ""; // hidden in production
  return `
    <div class="panel-heading"><div><span class="eyebrow">Admin only</span><h3>Demo Access</h3></div><button class="link-action" data-action="reset-demo" type="button">Reset demo data</button></div>
    <div class="demo-grid">${demoCredentials.map((item) => `<div class="credential-card static"><b>${escapeHtml(item.role)}</b><span>${escapeHtml(item.phone)}</span><small>${escapeHtml(item.note)}</small></div>`).join("")}</div>
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
      <td><strong>${escapeHtml(branch.code)}</strong></td>
      <td>${escapeHtml(branch.name)}</td>
      <td>${escapeHtml(branch.classification)}</td>
      <td>${escapeHtml(branch.location)}</td>
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

function bulkUserUploadPanel() {
  const preview = state.bulkPreview;
  const validCount = preview ? preview.rows.filter((r) => !r.error).length : 0;
  return `
    <div class="panel-heading"><div><span class="eyebrow">Import Users</span><h3>Bulk User Upload (CSV)</h3></div></div>
    <p class="body-copy">Upload a CSV file. Required columns: <b>Staff Name</b>, <b>Phone Number</b>, <b>Role</b>, <b>Profile</b>, <b>Branch</b> (sort code or branch name). After import, a CSV of temporary passwords will be downloaded automatically — store and distribute it securely, then delete.</p>
    <div class="entry-form" style="max-width:520px">
      <label>Select CSV File
        <input type="file" id="bulkUploadFile" accept=".csv" />
      </label>
      <button class="secondary-action" id="bulkParseBtn" type="button">Preview Import</button>
    </div>
    ${preview ? `
      <div style="margin-top:1.5rem">
        <div class="panel-heading"><div><span class="eyebrow">${preview.rows.length} row${preview.rows.length !== 1 ? "s" : ""} parsed</span><h3>Import Preview</h3></div></div>
        ${(preview.rows.filter((r) => r.error).length) ? `<p class="danger-note" style="display:block;margin-bottom:12px">⚠ ${preview.rows.filter((r) => r.error).length} row(s) have issues (shown in red) — they will be skipped during import.</p>` : `<p class="success-note">All rows look good — ready to import.</p>`}
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Role</th><th>Profile</th><th>Branch</th><th>Status</th></tr></thead>
            <tbody>
              ${preview.rows.map((row, i) => `<tr class="${row.error ? "row-worst" : ""}">
                <td>${i + 1}</td>
                <td>${escapeHtml(row.name || "—")}</td>
                <td>${escapeHtml(row.phone || "—")}</td>
                <td>${escapeHtml(row.role || "—")}</td>
                <td>${escapeHtml(row.profile || "—")}</td>
                <td>${escapeHtml(row.branchDisplay || "—")}</td>
                <td>${row.error
                  ? `<span class="badge rejected" title="${escapeHtml(row.error)}">⚠ ${escapeHtml(row.error)}</span>`
                  : `<span class="badge bqa-approved">Ready</span>`}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div style="display:flex;gap:12px;margin-top:14px;flex-wrap:wrap">
          <button class="primary-action" id="bulkImportBtn" type="button" ${validCount ? "" : "disabled"}>
            Import ${validCount} Valid User${validCount !== 1 ? "s" : ""}
          </button>
          <button class="secondary-action" id="bulkClearBtn" type="button">Clear Preview</button>
        </div>
      </div>
    ` : ""}
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

function changePasswordModal() {
  const existing = document.querySelector(".vvdt-changepw-overlay");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "vvdt-changepw-overlay pw-overlay";
  el.innerHTML = `
    <div class="pw-card">
      <img src="CRDB logo.png" alt="CRDB" class="pw-logo" />
      <h2>Change Password</h2>
      <p class="body-copy">Enter your current password, then choose a new one (minimum 6 characters).</p>
      <form class="auth-form" id="voluntaryPwForm">
        <label>Current Password <input name="currentPw" type="password" placeholder="Your current password" required autocomplete="current-password" /></label>
        <label>New Password <input name="newPw" type="password" minlength="6" placeholder="At least 6 characters" required autocomplete="new-password" /></label>
        <label>Confirm New Password <input name="confirmPw" type="password" minlength="6" placeholder="Repeat new password" required autocomplete="new-password" /></label>
        <button class="primary-action" type="submit">Update Password</button>
        <button class="secondary-action" id="voluntaryPwCancel" type="button">Cancel</button>
        <p id="voluntaryPwError" class="danger-note" style="display:none"></p>
      </form>
    </div>
  `;
  document.body.appendChild(el);
  document.querySelector("#voluntaryPwCancel")?.addEventListener("click", () => el.remove());
  document.querySelector("#voluntaryPwForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const user = activeUser();
    const errEl = document.querySelector("#voluntaryPwError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    const currentStored = _runtimePasswords.get(user.id);
    if (!currentStored || currentStored !== form.get("currentPw")) return showErr("Current password is incorrect.");
    if (!isSimplePasswordValid(form.get("newPw"))) return showErr("New password must be at least 6 characters.");
    if (form.get("newPw") !== form.get("confirmPw")) return showErr("New passwords do not match.");
    const newPw = String(form.get("newPw"));
    if (auth?.currentUser) {
      try {
        const cred = EmailAuthProvider.credential(normalizePhone(user.phone) + "@vvdt.app", form.get("currentPw"));
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, newPw);
      } catch (_) {}
    }
    _runtimePasswords.set(user.id, newPw);
    addAudit("Password changed voluntarily", user.phone);
    saveState();
    el.remove();
    showSuccessModal("Password updated", "Your password has been changed successfully.");
  });
}

function bindEvents() {
  document.querySelector("#changePasswordForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPw = String(form.get("newPw")).trim();
    const confirmPw = String(form.get("confirmPw")).trim();
    const errEl = document.querySelector("#pwError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    if (!isSimplePasswordValid(newPw)) return showErr("Password must be at least 6 characters.");
    if (newPw !== confirmPw) return showErr("Passwords do not match.");
    if (auth?.currentUser) {
      try { await updatePassword(auth.currentUser, newPw); } catch (_) {}
    }
    _runtimePasswords.set(state.activeUserId, newPw);
    state.users = state.users.map((u) => u.id === state.activeUserId ? { ...u, mustChangePassword: false } : u);
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

  document.querySelector("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = normalizePhone(form.get("phone"));
    const password = String(form.get("password"));
    const errEl = document.querySelector("#loginError");
    const showErr = (msg) => { if (errEl) { errEl.textContent = msg; errEl.style.display = "block"; } };
    if (errEl) errEl.style.display = "none";

    const rate = checkRateLimit(phone);
    if (!rate.ok) {
      showErr(`Too many failed attempts. Try again in ${rate.wait} minute${rate.wait !== 1 ? "s" : ""}.`);
      return;
    }

    const localUser = state.users.find((u) => normalizePhone(u.phone) === phone && u.active);

    // Always validate against local password first
    const storedPw = _runtimePasswords.get(localUser?.id);
    if (!localUser || storedPw !== password) {
      showErr("Incorrect phone number or password.");
      return;
    }

    if (auth) {
      const email = phone + "@vvdt.app";
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        // User not in Firebase yet — create account transparently on first login
        const isNewUser = fbErr.code === "auth/user-not-found" || fbErr.code === "auth/invalid-credential";
        if (isNewUser) {
          try { await createUserWithEmailAndPassword(auth, email, password); } catch (_) {}
        }
        // Any other Firebase error (operation-not-allowed, network, etc.) — allow local login
      }
    }

    if (!localUser) {
      showErr("Incorrect phone number or password.");
      if (auth) signOut(auth).catch(() => {});
      return;
    }

    resetRateLimit(phone);
    _lastActivity = Date.now();
    state.activeUserId = localUser.id;
    state.activeView = "dashboard";
    state.generatedPassword = null;
    addAudit("User logged in", localUser.phone);
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

  document.querySelector("[data-action='changepw']")?.addEventListener("click", () => changePasswordModal());

  document.querySelector("[data-action='logout']")?.addEventListener("click", async () => {
    addAudit("User logged out", activeUser()?.phone || "Unknown");
    state.activeUserId = null;
    state.authMode = "login";
    if (auth) try { await signOut(auth); } catch (_) {}
    saveState();
    render();
  });

  document.querySelector("[data-action='reset-demo']")?.addEventListener("click", () => {
    if (!confirm("Reset all demo data? Audit logs will be preserved. This cannot be undone.")) return;
    const preservedAudit = [...state.auditLogs];
    _runtimePasswords.clear();
    localStorage.removeItem(STORAGE_KEY);
    state = { ...structuredClone(baseState), auditLogs: preservedAudit };
    // Re-seed runtime passwords from baseState
    baseState.users.forEach((u) => { if (u.password) _runtimePasswords.set(u.id, u.password); });
    addAudit("Demo data reset", "System");
    render();
  });

  document.querySelector("#entryForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    // P1-01: one entry per staff per day
    const submittingUserId = Number(form.get("userId"));
    const submittingDate   = form.get("date");
    const isDuplicate = state.entries.some(
      (e) => e.userId === submittingUserId && e.date === submittingDate
    );
    if (isDuplicate) {
      return showSuccessModal(
        "Duplicate entry",
        "An entry already exists for this staff member on this date. Each person may submit once per day."
      );
    }

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
        state.users = state.users.map((u) => u.id === id ? { ...u, mustChangePassword: true } : u);
        _runtimePasswords.set(id, newPw);
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
      const entries = filteredEntries(user);
      if (button.dataset.export === "csv") exportCSV(entries);
      else if (button.dataset.export === "xls") exportXLS(entries);
      else if (button.dataset.export === "pdf") exportPDF();
    });
  });

  document.querySelector("[data-action='apply-filters']")?.addEventListener("click", () => {
    const user = activeUser();
    const isBigView = isSuperRole(user?.role) || isZonalRole(user?.role);
    const isBranchRole = user?.role === "BQA" || user?.role === "BM";
    const branch = isBigView ? document.querySelector("#filterBranch")?.value : "";
    const staff  = (isBigView || isBranchRole) ? document.querySelector("#filterStaff")?.value : "";
    const from   = document.querySelector("#filterDateFrom")?.value || "";
    const to     = document.querySelector("#filterDateTo")?.value   || "";
    const status = document.querySelector("#filterStatus")?.value   || "";
    state.reportFilters = {
      branches: branch ? [branch] : [],
      staffId: staff,
      dateFrom: from,
      dateTo: to,
      status
    };
    saveState();
    render();
  });

  document.querySelector("[data-action='clear-filters']")?.addEventListener("click", () => {
    state.reportFilters = { branches: [], staffId: "", dateFrom: "", dateTo: "", status: "" };
    saveState();
    render();
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

  // Bulk user upload — parse CSV file into preview
  document.querySelector("#bulkParseBtn")?.addEventListener("click", () => {
    const fileInput = document.querySelector("#bulkUploadFile");
    const file = fileInput?.files?.[0];
    if (!file) return alert("Please select a CSV file first.");
    if (!file.name.toLowerCase().endsWith(".csv")) return alert("Only CSV files are accepted. Please export your spreadsheet as CSV.");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = parseCSV(e.target.result);
        if (raw.length < 2) {
          state.bulkPreview = { rows: [{ name: "", phone: "", role: "", profile: "", branchDisplay: "", error: "File is empty or has no data rows" }] };
          render(); return;
        }

        const header = raw[0].map((h) => String(h).toLowerCase().trim());
        const col = (keywords) => header.findIndex((h) => keywords.some((k) => h.includes(k)));
        const nameIdx    = col(["staff name", "name"]);
        const phoneIdx   = col(["phone"]);
        const roleIdx    = col(["role"]);
        const profileIdx = col(["profile"]);
        const branchIdx  = col(["branch"]);

        const rows = raw.slice(1).filter((r) => r.some((c) => String(c).trim())).map((row) => {
          const name      = String(row[nameIdx]    ?? "").trim();
          const phone     = normalizePhone(String(row[phoneIdx]   ?? "").trim());
          const role      = String(row[roleIdx]    ?? "").trim();
          const profile   = String(row[profileIdx] ?? "").trim();
          const branchRaw = String(row[branchIdx]  ?? "").trim();

          let error = null;
          if (!name)                                                             error = "Name missing";
          else if (!phone || phone.length < 9)                                  error = "Invalid phone";
          else if (!state.roleCatalog.find((r) => r.key === role))              error = `Unknown role: ${role || "(blank)"}`;
          else if (state.users.some((u) => normalizePhone(u.phone) === phone))  error = "Phone already registered";
          else if (state.users.some((u) => u.name.toLowerCase() === name.toLowerCase())) error = "Name already registered";

          let branchId = "zonal";
          let branchDisplay = "Zonal";
          if (!isZonalRole(role) && !isSuperRole(role)) {
            const found = state.branches.find((b) =>
              b.code === branchRaw || b.id === branchRaw ||
              b.name.toLowerCase() === branchRaw.toLowerCase()
            );
            if (found) { branchId = found.id; branchDisplay = `${found.code} · ${found.name}`; }
            else if (!error) { error = `Branch not found: ${branchRaw || "(blank)"}`; branchDisplay = branchRaw || "—"; }
            else              { branchDisplay = branchRaw || "—"; }
          }

          return { name, phone, role, profile, branchId, branchDisplay, error };
        });

        state.bulkPreview = { rows };
        saveState();
        render();
      } catch (err) {
        alert("Failed to parse CSV: " + (err.message || String(err)));
      }
    };
    reader.readAsText(file, "UTF-8");
  });

  // Bulk user upload — import valid rows
  document.querySelector("#bulkImportBtn")?.addEventListener("click", () => {
    const preview = state.bulkPreview;
    if (!preview) return;
    const valid = preview.rows.filter((r) => !r.error);
    if (!valid.length) return;

    let nextId = Math.max(0, ...state.users.map((u) => u.id)) + 1;
    const createdCredentials = [];
    valid.forEach((row) => {
      const password = createRandomPassword();
      const id = nextId++;
      state.users.push({
        id,
        staffNo: `USR${String(state.users.length + 1).padStart(3, "0")}`,
        name: row.name,
        phone: row.phone,
        role: row.role,
        profile: row.profile,
        branchId: row.branchId,
        active: true,
        mustChangePassword: true,
      });
      _runtimePasswords.set(id, password);
      createdCredentials.push({ name: row.name, phone: row.phone, password });
    });

    // Download a credentials sheet for the admin to distribute
    const csvLines = [
      "Name,Phone,Temporary Password",
      ...createdCredentials.map((c) => `"${c.name}","${c.phone}","${c.password}"`),
    ].join("\r\n");
    downloadFile(csvLines, `vvdt-bulk-temp-passwords-${new Date().toISOString().slice(0,10)}.csv`, "text/csv;charset=utf-8;");

    const count = valid.length;
    state.bulkPreview = null;
    addAudit("Bulk user import", `${count} users`, "Imported via CSV upload");
    saveState();
    render();
    showSuccessModal("Import complete", `${count} user${count !== 1 ? "s" : ""} created. A CSV with temporary passwords has been downloaded — distribute securely and delete after use.`);
  });

  // Bulk user upload — clear preview
  document.querySelector("#bulkClearBtn")?.addEventListener("click", () => {
    state.bulkPreview = null;
    saveState();
    render();
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
    role,
    profile: String(form.get("profile")),
    branchId: noBranch ? "zonal" : String(form.get("branchId")),
    active: true,
    mustChangePassword: true,
  };
  state.users.push(user);
  _runtimePasswords.set(user.id, password);
  return { ...user, password }; // password returned for admin display only, never stored in state
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
      date: new Date().toISOString().slice(0, 10),
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
// Load role permissions from Firestore so cross-device changes take effect immediately
loadRolePermissionsFromFirestore().then(render);
