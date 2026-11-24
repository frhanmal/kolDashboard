import { initPageLayout, showConfirm, showToast, showAlert } from "./auth.js";
import { db, isFirebaseConfigured } from "./firebase-config.js";
import { ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const currentUser = initPageLayout("settings", ["owner"]);

const DEFAULT_DEMO_USERS = {
  owner: { username: "owner", password: "123", name: "Owner Agency", role: "owner" },
  kol: { username: "kol", password: "123", name: "Staff KOL Specialist", role: "kol_specialist" },
  finance: { username: "finance", password: "123", name: "Admin Finance", role: "finance" }
};

let usersMap = {};

function loadUsers() {
  if (!isFirebaseConfigured) {
    const saved = localStorage.getItem("demo_users");
    usersMap = saved ? JSON.parse(saved) : { ...DEFAULT_DEMO_USERS };
    if (!saved) localStorage.setItem("demo_users", JSON.stringify(usersMap));
    renderUsers();
    return;
  }

  onValue(ref(db, "users"), (snap) => {
    usersMap = snap.val() || {};
    renderUsers();
  });
}

function renderUsers() {
  const tbody = document.getElementById("users-table-body");
  const list = Object.values(usersMap);

  const badgeColors = {
    owner: "bg-rose-100 text-rose-700",
    kol_specialist: "bg-pink-100 text-pink-700",
    finance: "bg-amber-100 text-amber-700"
  };

  tbody.innerHTML = list.map(u => `
    <tr class="hover:bg-rose-50/30">
      <td class="py-3 px-4">
        <div class="font-bold text-slate-800">${u.name}</div>
        ${u.createdBy ? `<div class="text-[10px] text-slate-400">Dibuat oleh: ${u.createdBy}</div>` : ""}
      </td>
      <td class="py-3 px-4 text-xs font-mono text-slate-600">${u.username}</td>
      <td class="py-3 px-4">
        <div class="inline-flex items-center gap-2">
          <span class="pw-text text-xs font-mono text-slate-500" data-pw="${u.password}" data-visible="0">••••••</span>
          <button type="button" class="btn-toggle-pw p-1 text-slate-400 hover:text-rose-600 rounded-md transition" title="Lihat/Sembunyikan Password">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${badgeColors[u.role] || "bg-slate-100 text-slate-600"}">
          ${u.role.replace("_", " ")}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        ${u.username !== currentUser?.username
          ? `<button data-uname="${u.username}" class="btn-del-user px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 text-xs font-semibold">Hapus</button>`
          : `<span class="text-[11px] text-slate-400 italic">Aktif</span>`
        }
      </td>
    </tr>
  `).join("");

  if (window.lucide) window.lucide.createIcons();

  // Toggle ikon mata per baris
  tbody.querySelectorAll(".btn-toggle-pw").forEach(btn => {
    btn.addEventListener("click", () => {
      const span = btn.previousElementSibling;
      const isVisible = span.dataset.visible === "1";
      if (isVisible) {
        span.textContent = "••••••";
        span.dataset.visible = "0";
        btn.innerHTML = `<i data-lucide="eye" class="w-3.5 h-3.5"></i>`;
      } else {
        span.textContent = span.dataset.pw;
        span.dataset.visible = "1";
        btn.innerHTML = `<i data-lucide="eye-off" class="w-3.5 h-3.5"></i>`;
      }
      if (window.lucide) window.lucide.createIcons();
    });
  });

  tbody.querySelectorAll(".btn-del-user").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uname = btn.dataset.uname;
      const ok = await showConfirm("Hapus Akun?", `Akun "${uname}" tidak akan bisa login lagi.`, "Ya, Hapus");
      if (!ok) return;

      if (!isFirebaseConfigured) {
        delete usersMap[uname];
        localStorage.setItem("demo_users", JSON.stringify(usersMap));
        renderUsers();
      } else {
        await remove(ref(db, `users/${uname}`));
      }
      showToast(`Akun ${uname} dihapus`);
    });
  });
}

document.getElementById("form-add-user").addEventListener("submit", async (e) => {
  e.preventDefault();
  const uname = document.getElementById("u-username").value.trim().toLowerCase().replace(/\s+/g, "");
  if (usersMap[uname]) {
    return showAlert("Username Sudah Dipakai", `Username "${uname}" sudah terdaftar.`, "warning");
  }

  const payload = {
    username: uname,
    name: document.getElementById("u-name").value.trim(),
    password: document.getElementById("u-password").value.trim(),
    role: document.getElementById("u-role").value,
    createdBy: currentUser?.name || "Owner",
    createdAt: new Date().toISOString()
  };

  if (!isFirebaseConfigured) {
    usersMap[uname] = payload;
    localStorage.setItem("demo_users", JSON.stringify(usersMap));
    renderUsers();
  } else {
    await set(ref(db, `users/${uname}`), payload);
  }
  e.target.reset();
  showToast(`Akun "${uname}" berhasil dibuat!`);
});

loadUsers();