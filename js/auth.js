import { DEMO_MODE } from "./firebase-config.js";

const DEFAULT_USERS = {
  owner: { username: "owner", password: "123", name: "Owner Agency", role: "owner" },
  kol: { username: "kol", password: "123", name: "Staff KOL Specialist", role: "kol_specialist" },
  finance: { username: "finance", password: "123", name: "Admin Finance", role: "finance" }
};

const MENU_ITEMS = [
  { id: "dashboard", label: "Overview", href: "dashboard.html", icon: "layout-dashboard", roles: ["owner", "kol_specialist", "finance"] },
  { id: "leads", label: "Lead Masuk", href: "leads.html", icon: "inbox", roles: ["owner", "kol_specialist"] },
  { id: "master-kol", label: "Talent Database", href: "master-kol.html", icon: "users", roles: ["owner", "kol_specialist", "finance"] },
  { id: "campaign", label: "Campaigns", href: "campaign.html", icon: "megaphone", roles: ["owner", "kol_specialist"] },
  { id: "clients", label: "Client Management", href: "clients.html", icon: "building-2", roles: ["owner", "kol_specialist"] },
  { id: "finance", label: "Finance & Tagihan", href: "finance.html", icon: "wallet", roles: ["owner", "finance"] },
  { id: "assistant", label: "Asisten AI", href: "assistant.html", icon: "sparkles", roles: ["owner", "kol_specialist"] },
  { id: "settings", label: "User & Markup", href: "settings.html", icon: "settings", roles: ["owner"] }
];

const DEMO_SEED = {
  leads: {
    "LD-100001": {
      id: "LD-100001",
      name: "Chicilia Greace",
      tiktok: "cgksis",
      tiktokLink: "https://www.tiktok.com/@cgksis",
      wa: "082398894015",
      gmv: "6.300.000",
      address: "Jl. Melati No. 12, Kemang, Jakarta Selatan",
      sowTimeline: "Ya",
      makeVt: "Ya",
      boostCode180: "Ya",
      niche: "Beauty",
      status: "Pending",
      approvedBy: ""
    },
    "LD-100002": {
      id: "LD-100002",
      name: "Nadia Putri Larasati",
      tiktok: "nadiaputri.daily",
      tiktokLink: "https://www.tiktok.com/@nadiaputri.daily",
      wa: "081288990011",
      gmv: "2.450.000",
      address: "Jl. Dago Asri No. 45, Bandung",
      sowTimeline: "Ya",
      makeVt: "Ya",
      boostCode180: "Tidak",
      niche: "Fashion",
      status: "Pending",
      approvedBy: ""
    },
    "LD-100003": {
      id: "LD-100003",
      name: "Alya Rahmadhani",
      tiktok: "alyarahma_",
      tiktokLink: "https://www.tiktok.com/@alyarahma_",
      wa: "085712349876",
      gmv: "12.800.000",
      address: "Cluster Harmoni Blok B4, Tangerang Selatan",
      sowTimeline: "Ya",
      makeVt: "Ya",
      boostCode180: "Ya",
      niche: "Beauty",
      status: "Approved",
      approvedKolId: "KOL-100001",
      approvedBy: "Owner Agency",
      approvedAt: new Date(Date.now() - 86400000 * 3).toISOString()
    }
  },
  master_kol: {
    "KOL-100001": {
      id: "KOL-100001",
      sourceLeadId: "LD-100003",
      name: "Alya Rahmadhani",
      wa: "6285712349876",
      ig: "alyarahma.id",
      tiktok: "alyarahma_",
      tiktokLink: "https://www.tiktok.com/@alyarahma_",
      address: "Cluster Harmoni Blok B4, Tangerang Selatan",
      aliases: ["alyarahma_old"],
      niche: "Beauty",
      tier: "Micro",
      er: "4.8% • GMV: 12.8jt",
      markup: 30,
      rates: { story: 1500000, reels: 3500000, tiktok: 3000000, kuning: 500000, boost: 750000, visit: 2500000 },
      rateUpdatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedBy: "Owner Agency",
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    "KOL-100002": {
      id: "KOL-100002",
      name: "Megawati",
      wa: "6289637469566",
      ig: "megawati.style",
      tiktok: "smiling7eooo",
      aliases: [],
      niche: "Beauty",
      tier: "Nano",
      er: "GMV: 1.500.000",
      markup: 30,
      rates: { story: 5000000, reels: 7000000, tiktok: 6000000, kuning: 1000000, boost: 1500000, visit: 4000000 },
      rateUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedBy: "Owner Agency",
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    "KOL-100003": {
      id: "KOL-100003",
      name: "Raka Pratama",
      wa: "6281398765432",
      ig: "rakamakanenak",
      tiktok: "rakakuliner",
      aliases: ["raka_jajan"],
      niche: "Food & Beverage",
      tier: "Macro",
      er: "5.2% • JKT",
      markup: 25,
      rates: { story: 3000000, reels: 8500000, tiktok: 9000000, kuning: 1500000, boost: 2000000, visit: 6000000 },
      rateUpdatedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      updatedBy: "Staff KOL Specialist",
      updatedAt: new Date(Date.now() - 86400000 * 14).toISOString()
    }
  },
  campaigns: {
    "CMP-1001": {
      id: "CMP-1001",
      name: "Glow Serum Launch Q4",
      brand: "GlowSkin Indonesia",
      niche: "Beauty",
      status: "4 - Approved, Campaign Onprocess",
      items: {
        "KOL-100001": {
          kolId: "KOL-100001",
          kolName: "Alya Rahmadhani",
          ig: "alyarahma.id",
          tiktok: "alyarahma_",
          wa: "6285712349876",
          sowList: ["1x TikTok Video", "Add-on Boost/Ads Code"],
          publishTotal: 4875000,
          nettTotal: 3750000,
          status: "7 - Butuh Payment",
          paymentStatus: "Unpaid"
        }
      }
    }
  },
  clients: {
    "CL-101": { id: "CL-101", name: "GlowSkin Indonesia", pic: "Ibu Sinta", phone: "628111222333", industry: "Skincare & Beauty" }
  },
  finance: {},
  users: DEFAULT_USERS
};

const STORAGE_KEY = "kol_demo_db_v1";
const SESSION_KEY = "kol_session";
const LOGGED_OUT_KEY = "kol_logged_out";
const listeners = {};

function readStore() {
  let raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
    raw = JSON.stringify(DEMO_SEED);
  }
  return JSON.parse(raw);
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function notifyCollection(col) {
  const store = readStore();
  const val = store[col] || {};
  (listeners[col] || []).forEach(cb => cb(val));
}

export function getDemoCollection(col) {
  const store = readStore();
  return store[col] || {};
}

export function subscribeDemoCollection(col, callback) {
  if (!listeners[col]) listeners[col] = [];
  listeners[col].push(callback);
  callback(getDemoCollection(col));
}

export function setDemoItem(col, id, item) {
  const store = readStore();
  if (!store[col]) store[col] = {};
  store[col][id] = item;
  writeStore(store);
  notifyCollection(col);
}

export function updateDemoItem(col, id, patch) {
  const store = readStore();
  if (!store[col]) store[col] = {};
  store[col][id] = { ...(store[col][id] || {}), ...patch };
  writeStore(store);
  notifyCollection(col);
}

export function removeDemoItem(col, id) {
  const store = readStore();
  if (store[col]) {
    delete store[col][id];
    writeStore(store);
    notifyCollection(col);
  }
}

export function resetDemoData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_SEED));
  Object.keys(listeners).forEach(notifyCollection);
}

let swalReadyPromise = null;
function ensureSwal() {
  if (window.Swal) return Promise.resolve(window.Swal);
  if (!swalReadyPromise) {
    swalReadyPromise = new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      s.onload = () => resolve(window.Swal);
      document.head.appendChild(s);
    });
  }
  return swalReadyPromise;
}
ensureSwal();

export async function showAlert(title, text = "", icon = "info") {
  const Swal = await ensureSwal();
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: "#f43f5e",
    customClass: { popup: "rounded-3xl" }
  });
}

export async function showConfirm(title, text = "", confirmText = "Ya, Lanjutkan") {
  const Swal = await ensureSwal();
  const res = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#f43f5e",
    cancelButtonColor: "#94a3b8",
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    customClass: { popup: "rounded-3xl" }
  });
  return res.isConfirmed;
}

export async function showToast(title, icon = "success") {
  const Swal = await ensureSwal();
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true
  });
}

export async function loginUser(username, password) {
  const uname = username.trim().toLowerCase();
  const users = getDemoCollection("users");
  const userData = users[uname] || DEFAULT_USERS[uname];
  if (userData && String(userData.password) === String(password)) {
    localStorage.removeItem(LOGGED_OUT_KEY);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true, user: userData };
  }
  return { success: false, message: "Username atau password tidak sesuai. (Demo: owner / 123)" };
}

export function getCurrentUser({ allowAutoDemo = true } = {}) {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  const explicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === "1";
  if (DEMO_MODE && allowAutoDemo && !explicitlyLoggedOut) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEFAULT_USERS.owner));
    return DEFAULT_USERS.owner;
  }
  return null;
}

export async function logoutUser() {
  const ok = await showConfirm("Keluar dari Dashboard?", "Sesi akan diakhiri.", "Ya, Logout");
  if (!ok) return;

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
  localStorage.setItem(LOGGED_OUT_KEY, "1");
  window.location.replace("index.html");
}

function setupResponsiveSidebar() {
  const aside = document.querySelector("aside");
  const main = document.querySelector("main");
  if (!aside || !main) return;

  aside.classList.add("transition-transform", "duration-300", "z-40");
  main.classList.add("transition-all", "duration-300", "min-w-0", "w-full");

  // Backdrop gelap saat sidebar dibuka di layar HP (< 1024px)
  let backdrop = document.getElementById("sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    backdrop.className = "fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-30 hidden lg:hidden transition-opacity";
    document.body.appendChild(backdrop);
  }
  backdrop.onclick = () => setSidebarOpen(false);

  // Tombol tutup di header sidebar
  const sidebarHeader = aside.querySelector(".border-b");
  let closeBtn = document.getElementById("btn-collapse-sidebar");
  if (sidebarHeader && !closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "btn-collapse-sidebar";
    closeBtn.title = "Sembunyikan Menu";
    closeBtn.className = "ml-auto p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition";
    closeBtn.innerHTML = `<i data-lucide="panel-left-close" class="w-4 h-4"></i>`;
    sidebarHeader.appendChild(closeBtn);
  }
  if (closeBtn) closeBtn.onclick = () => setSidebarOpen(false);

  // Mobile top bar (otomatis dibuat jika belum ada di HTML)
  let mobileHeader = document.getElementById("mobile-top-header");
  if (!mobileHeader) {
    mobileHeader = document.createElement("header");
    mobileHeader.id = "mobile-top-header";
    mobileHeader.className = "lg:hidden fixed top-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-b border-rose-100 px-3.5 flex items-center justify-between z-30 shadow-xs";
    mobileHeader.innerHTML = `
      <button type="button" id="btn-mobile-menu" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200/70 transition">
        <i data-lucide="menu" class="w-4 h-4"></i>
        <span>Menu</span>
      </button>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-gradient-to-tr from-rose-500 to-pink-400 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs">K</div>
        <span class="font-bold text-xs text-slate-800">KOL Agency</span>
      </div>
    `;
    document.body.prepend(mobileHeader);
  }

  // Tombol buka Menu di desktop (saat sidebar di-collapse)
  let desktopOpenBtn = document.getElementById("btn-expand-sidebar");
  if (!desktopOpenBtn) {
    desktopOpenBtn = document.createElement("button");
    desktopOpenBtn.type = "button";
    desktopOpenBtn.id = "btn-expand-sidebar";
    desktopOpenBtn.title = "Tampilkan Menu";
    desktopOpenBtn.className = "hidden fixed top-3.5 left-3.5 z-30 items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl shadow-md shadow-rose-100 text-xs font-bold transition";
    desktopOpenBtn.innerHTML = `<i data-lucide="menu" class="w-4 h-4"></i><span>Menu</span>`;
    document.body.appendChild(desktopOpenBtn);
  }

  const mobileMenuBtn = document.getElementById("btn-mobile-menu");
  if (mobileMenuBtn) mobileMenuBtn.onclick = () => setSidebarOpen(true);
  if (desktopOpenBtn) desktopOpenBtn.onclick = () => setSidebarOpen(true);

  const isMobileViewport = () => window.innerWidth < 1024;

  function setSidebarOpen(open) {
    const mobile = isMobileViewport();
    if (!mobile) {
      localStorage.setItem("kol_sidebar_collapsed", open ? "0" : "1");
    }

    if (open) {
      aside.classList.remove("-translate-x-full");
      if (mobile) {
        backdrop.classList.remove("hidden");
        main.classList.remove("lg:ml-64", "ml-64");
        main.classList.add("ml-0", "pt-16");
        desktopOpenBtn.classList.add("hidden");
        desktopOpenBtn.classList.remove("lg:flex");
      } else {
        backdrop.classList.add("hidden");
        main.classList.add("lg:ml-64", "ml-64");
        main.classList.remove("ml-0", "pt-16");
        desktopOpenBtn.classList.add("hidden");
        desktopOpenBtn.classList.remove("lg:flex");
      }
    } else {
      aside.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
      main.classList.remove("lg:ml-64", "ml-64");
      main.classList.add("ml-0", "pt-16");
      if (mobile) {
        desktopOpenBtn.classList.add("hidden");
        desktopOpenBtn.classList.remove("lg:flex");
      } else {
        desktopOpenBtn.classList.remove("hidden");
        desktopOpenBtn.classList.add("lg:flex");
      }
    }
  }

  // Tutup sidebar otomatis saat link menu diklik di HP
  aside.querySelectorAll("#sidebar-nav a").forEach(link => {
    link.addEventListener("click", () => {
      if (isMobileViewport()) setSidebarOpen(false);
    });
  });

  if (isMobileViewport()) {
    setSidebarOpen(false);
  } else {
    const desktopCollapsed = localStorage.getItem("kol_sidebar_collapsed") === "1";
    setSidebarOpen(!desktopCollapsed);
  }

  let lastMobile = isMobileViewport();
  window.addEventListener("resize", () => {
    const nowMobile = isMobileViewport();
    if (nowMobile !== lastMobile) {
      lastMobile = nowMobile;
      if (nowMobile) {
        setSidebarOpen(false);
      } else {
        const desktopCollapsed = localStorage.getItem("kol_sidebar_collapsed") === "1";
        setSidebarOpen(!desktopCollapsed);
      }
    }
  });
}

export function initPageLayout(activeMenuId, allowedRoles = ["owner", "kol_specialist", "finance"]) {
  const user = getCurrentUser({ allowAutoDemo: true });
  if (!user) {
    window.location.replace("index.html");
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    showAlert("Akses Ditolak", "Role kamu tidak memiliki izin membuka halaman ini.", "error")
      .then(() => { window.location.href = "dashboard.html"; });
    return null;
  }

  const navContainer = document.getElementById("sidebar-nav");
  if (navContainer) {
    const filteredMenus = MENU_ITEMS.filter(m => m.roles.includes(user.role));
    navContainer.innerHTML = filteredMenus.map(m => {
      const isActive = m.id === activeMenuId;
      return `
        <a href="${m.href}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          isActive
            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200/80"
            : "text-slate-600 hover:bg-rose-50/70 hover:text-rose-600"
        }">
          <i data-lucide="${m.icon}" class="w-4 h-4"></i>
          <span>${m.label}</span>
        </a>
      `;
    }).join("");
  }

  const roleLabels = {
    owner: { text: "OWNER", color: "bg-rose-100 text-rose-700" },
    kol_specialist: { text: "KOL SPECIALIST", color: "bg-pink-100 text-pink-700" },
    finance: { text: "FINANCE", color: "bg-amber-100 text-amber-700" }
  };

  const userNameEl = document.getElementById("user-name");
  const userRoleEl = document.getElementById("user-role-badge");
  const syncStatusEl = document.getElementById("db-status");

  if (userNameEl) userNameEl.textContent = user.name;
  if (userRoleEl) {
    const badge = roleLabels[user.role] || { text: user.role, color: "bg-slate-100 text-slate-700" };
    userRoleEl.textContent = badge.text;
    userRoleEl.className = `text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${badge.color}`;
  }
  if (syncStatusEl) {
    syncStatusEl.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-500"></span>
      <span>Demo Mode (Local)</span>
      <button type="button" id="btn-reset-demo" class="ml-auto text-[10px] font-bold text-rose-600 hover:underline">Reset</button>
    `;
    document.getElementById("btn-reset-demo")?.addEventListener("click", async () => {
      const ok = await showConfirm("Reset Data Demo?", "Kembalikan seluruh data contoh ke kondisi awal?", "Ya, Reset");
      if (!ok) return;
      resetDemoData();
      showToast("Data demo dikembalikan ke awal!");
    });
  }

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.setAttribute("type", "button");
    logoutBtn.addEventListener("click", logoutUser);
  }

  setupResponsiveSidebar();
  if (window.lucide) window.lucide.createIcons();
  return user;
}
