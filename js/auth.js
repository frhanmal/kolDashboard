import { DEMO_MODE } from "./firebase-config.js";

const DEFAULT_USERS = {
  owner: { username: "owner", password: "123", name: "Owner Agency", role: "owner" },
  kol: { username: "kol", password: "123", name: "Staff KOL Specialist", role: "kol_specialist" },
  finance: { username: "finance", password: "123", name: "Admin Finance", role: "finance" }
};

export const NICHE_MAP = {
  "Beauty": ["Skincare", "Makeup", "Haircare"],
  "Fashion": ["Hijab", "Outfit", "Luxury"],
  "Lifestyle": ["Daily Life", "Couple", "Aesthetic"],
  "Mom & Baby": ["Parenting", "Baby Care", "Family"],
  "Food": ["Food Review", "Cooking", "Baking"],
  "Health": ["Fitness", "Wellness", "Nutrition"],
  "Home & Living": ["Cleaning", "Decor", "Organization"],
  "Tech": ["Gadget", "Gaming", "Software"],
  "Travel": ["Hotel", "Adventure", "Local Travel"],
  "Entertainment": ["Comedy", "Storytelling", "Music"],
  "Education": ["Finance", "Business", "Career"],
  "Automotive": ["Cars", "Motorcycle", "Automotive Review"]
};

const MENU_ITEMS = [
  { id: "dashboard", label: "Overview", href: "dashboard.html", icon: "layout-dashboard", roles: ["owner", "kol_specialist", "finance"] },
  { id: "leads", label: "Lead Masuk (KOL)", href: "leads.html", icon: "inbox", roles: ["owner", "kol_specialist"] },
  { id: "master-kol", label: "Database KOL", href: "master-kol.html", icon: "users", roles: ["owner", "kol_specialist", "finance"] },
  { id: "affiliate", label: "Database Affiliate", href: "affiliate.html", icon: "shopping-bag", roles: ["owner", "kol_specialist", "finance"] },
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
      platform: "Tiktok",
      username: "cgksis",
      tiktok: "cgksis",
      tiktokLink: "https://www.tiktok.com/@cgksis",
      wa: "082398894015",
      gmv: "6.300.000",
      address: "Jl. Melati No. 12, Kemang, Jakarta Selatan",
      makeVt: "Ya",
      niche: "Beauty",
      status: "Pending",
      approvedBy: ""
    },
    "LD-100002": {
      id: "LD-100002",
      name: "Nadia Putri Larasati",
      platform: "Shopee",
      username: "nadiaputri.daily",
      tiktok: "nadiaputri.daily",
      tiktokLink: "https://shopee.co.id/nadiaputri.daily",
      wa: "081288990011",
      gmv: "2.450.000",
      address: "Jl. Dago Asri No. 45, Bandung",
      makeVt: "Ya",
      niche: "Fashion",
      status: "Pending",
      approvedBy: ""
    },
    "LD-100003": {
      id: "LD-100003",
      name: "Alya Rahmadhani",
      platform: "Tiktok",
      username: "alyarahma_",
      tiktok: "alyarahma_",
      tiktokLink: "https://www.tiktok.com/@alyarahma_",
      wa: "085712349876",
      gmv: "12.800.000",
      address: "Cluster Harmoni Blok B4, Tangerang Selatan",
      makeVt: "Ya",
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
      niche: "Food", subNiche: "Food Review",
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
      type: "kol",
      name: "Glow Serum Launch Q4",
      brand: "GlowSkin Indonesia",
      niche: "Beauty",
      status: "Active",
      clientPaymentStatus: "DP",
      items: {
        "KOL-100001": {
          kolId: "KOL-100001",
          kolName: "Alya Rahmadhani",
          ig: "alyarahma.id",
          tiktok: "alyarahma_",
          wa: "6285712349876",
          sow: ["tiktok", "boost"],
          publishTotal: 4875000,
          nettTotal: 3750000,
          dealType: "paid",
          status: "7 - Butuh Payment",
          paymentStatus: "Unpaid"
        }
      }
    },
    "CMP-1002": {
      id: "CMP-1002",
      type: "affiliate",
      name: "GlowSkin Affiliate Shopee & TikTok Batch 1",
      brand: "GlowSkin Indonesia",
      niche: "Beauty",
      status: "Active",
      clientPaymentStatus: "Belum",
      items: {
        "AFF-100001": {
          kolId: "AFF-100001",
          kolName: "Deviallutfy",
          platform: "Tiktok",
          tiktok: "deviallutfy",
          wa: "085959597441",
          sow: ["Vidio"],
          publishTotal: 0,
          nettTotal: 0,
          dealType: "barter",
          status: "4 - Posting",
          postLink: "https://vt.tiktok.com/ZSQJCU1/",
          paymentStatus: "Barter"
        }
      }
    }
  },
  affiliates: {
    "AFF-100001": {
      id: "AFF-100001",
      username: "Deviallutfy",
      platform: "Tiktok",
      niche: "Beauty",
      subNiche: "Skincare",
      accountLink: "https://www.tiktok.com/@deviallutfy",
      package: "Vidio",
      gmv: 6600000,
      contact: "085959597441",
      notes: "Barter sampel serum, fast response",
      updatedBy: "Staff KOL Specialist",
      updatedAt: new Date().toISOString()
    },
    "AFF-100002": {
      id: "AFF-100002",
      username: "Syifa Nafi'ah",
      platform: "Shopee",
      niche: "Beauty",
      subNiche: "Makeup",
      accountLink: "https://shopee.co.id/syifanafiah",
      package: "Livestreaming",
      gmv: 21000000,
      contact: "087817971329",
      notes: "GMV tinggi di kategori lip tint",
      updatedBy: "Staff KOL Specialist",
      updatedAt: new Date().toISOString()
    },
    "AFF-100003": {
      id: "AFF-100003",
      username: "Nabila samuri",
      platform: "Tiktok",
      niche: "Beauty",
      subNiche: "Skincare",
      accountLink: "https://www.tiktok.com/@nabilasamuri",
      package: "Vidio",
      gmv: 65400000,
      contact: "08563645405",
      notes: "Siap kirim sampel produk",
      updatedBy: "Staff KOL Specialist",
      updatedAt: new Date().toISOString()
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

export async function loginUser(identifier, password) {
  const query = identifier.trim().toLowerCase();
  if (!query) {
    return { success: false, message: "Masukkan username atau nama lengkap terlebih dahulu." };
  }

  const storedUsers = getDemoCollection("users");
  const mergedUsers = { ...DEFAULT_USERS, ...storedUsers };
  const allUsersList = Object.values(mergedUsers);

  // 1. Cek kecocokan exact berdasarkan username (prioritas utama)
  let matchedUsers = allUsersList.filter(
    u => String(u.username || "").trim().toLowerCase() === query
  );

  // 2. Jika tidak ketemu di username, cari berdasarkan Nama Lengkap (case-insensitive)
  if (matchedUsers.length === 0) {
    matchedUsers = allUsersList.filter(
      u => String(u.name || "").trim().toLowerCase() === query
    );
  }

  // Filter akun yang password-nya cocok
  const validMatches = matchedUsers.filter(
    u => String(u.password) === String(password)
  );

  if (validMatches.length === 1) {
    const userData = validMatches[0];
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LOGGED_OUT_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    return { success: true, user: userData };
  }

  if (validMatches.length > 1) {
    return {
      success: false,
      message: "Terdapat lebih dari satu akun dengan nama yang sama. Silakan login menggunakan username."
    };
  }

  return {
    success: false,
    message: "Username / Nama atau password tidak sesuai. (Demo: owner / 123)"
  };
}

export function getCurrentUser() {
  // Hapus sisa sesi lama di localStorage agar tidak auto-login tanpa izin
  if (localStorage.getItem(SESSION_KEY)) {
    localStorage.removeItem(SESSION_KEY);
  }

  const raw = sessionStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }
  return null;
}

export async function logoutUser() {
  const ok = await showConfirm("Keluar dari Dashboard?", "Sesi akan diakhiri.", "Ya, Logout");
  if (!ok) return;

  localStorage.removeItem(SESSION_KEY);
  sessionStorage.clear();
  window.location.replace("index.html");
}

(function ensureFavicon() {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#f472b6"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="34" fill="#ffffff">K</text></svg>`;
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
  link.href = "data:image/svg+xml," + encodeURIComponent(svgIcon);
})();

function setupResponsiveSidebar() {
  const aside = document.querySelector("aside");
  const main = document.querySelector("main");
  if (!aside || !main) return;

  // Hapus class responsif statis yang bentrok saat toggle manual di desktop
  aside.classList.remove("lg:translate-x-0", "translate-x-0", "-translate-x-full");
  aside.classList.add("transition-transform", "duration-300", "z-40");

  main.classList.remove("lg:ml-64", "ml-64", "ml-0", "lg:pt-8", "lg:pt-7", "pt-16");
  main.classList.add("transition-all", "duration-300", "min-w-0", "flex-1");

  // Backdrop gelap saat sidebar dibuka di layar HP (< 1024px)
  let backdrop = document.getElementById("sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "sidebar-backdrop";
    backdrop.className = "fixed inset-0 bg-slate-900/45 backdrop-blur-xs z-30 hidden transition-opacity";
    document.body.appendChild(backdrop);
  }
  backdrop.onclick = () => setSidebarOpen(false);

  // Tombol tutup / collapse di header sidebar (berfungsi di HP maupun Laptop)
  const sidebarHeader = aside.querySelector(".border-b");
  let closeBtn = document.getElementById("btn-collapse-sidebar");
  if (sidebarHeader && !closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "btn-collapse-sidebar";
    closeBtn.title = "Sembunyikan Menu";
    closeBtn.className = "ml-auto p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer";
    closeBtn.innerHTML = `<i data-lucide="panel-left-close" class="w-4 h-4"></i>`;
    sidebarHeader.appendChild(closeBtn);
  }
  if (closeBtn) closeBtn.onclick = () => setSidebarOpen(false);

  // Mobile top bar (< 1024px)
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

  // Tombol buka Menu di laptop/desktop (muncul saat sidebar di-collapse)
  let desktopOpenBtn = document.getElementById("btn-expand-sidebar");
  if (!desktopOpenBtn) {
    desktopOpenBtn = document.createElement("button");
    desktopOpenBtn.type = "button";
    desktopOpenBtn.id = "btn-expand-sidebar";
    desktopOpenBtn.title = "Tampilkan Menu";
    desktopOpenBtn.className = "hidden fixed top-4 left-4 z-30 items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl shadow-md shadow-rose-100 text-xs font-bold transition cursor-pointer";
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
      aside.classList.add("translate-x-0");
      desktopOpenBtn.classList.add("hidden");
      desktopOpenBtn.classList.remove("flex");

      if (mobile) {
        backdrop.classList.remove("hidden");
        main.style.marginLeft = "0px";
        main.style.paddingTop = "4rem";
      } else {
        backdrop.classList.add("hidden");
        main.style.marginLeft = "16rem";
        main.style.paddingTop = "";
      }
    } else {
      aside.classList.remove("translate-x-0");
      aside.classList.add("-translate-x-full");
      backdrop.classList.add("hidden");
      main.style.marginLeft = "0px";

      if (mobile) {
        main.style.paddingTop = "4rem";
        desktopOpenBtn.classList.add("hidden");
        desktopOpenBtn.classList.remove("flex");
      } else {
        main.style.paddingTop = "4rem";
        desktopOpenBtn.classList.remove("hidden");
        desktopOpenBtn.classList.add("flex");
      }
    }
  }

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
  const user = getCurrentUser();
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
