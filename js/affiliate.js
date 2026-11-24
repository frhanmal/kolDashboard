import {
  initPageLayout, showConfirm, showToast, showAlert, NICHE_MAP,
  subscribeDemoCollection, setDemoItem, removeDemoItem
} from "./auth.js";

const user = initPageLayout("affiliate", ["owner", "kol_specialist", "finance"]);
const isFinance = String(user?.role || "").toLowerCase() === "finance";

if (isFinance) {
  document.getElementById("btn-open-aff-modal")?.classList.add("hidden");
  document.getElementById("lbl-import-aff")?.classList.add("hidden");
  document.querySelector(".action-col")?.classList.add("hidden");
}

let affList = [];

function parseNum(val) {
  if (typeof val === "number") return Math.round(val);
  const str = String(val || "").trim().toLowerCase();
  if (!str) return 0;
  if (str.includes("jt") || str.includes("juta")) {
    const num = parseFloat(str.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    return Math.round(num * 1000000);
  }
  return Number(str.replace(/\D/g, "")) || 0;
}

function formatRibuan(num) {
  const n = parseNum(num);
  return n > 0 ? n.toLocaleString("id-ID") : "";
}

function formatRp(num) {
  return "Rp " + parseNum(num).toLocaleString("id-ID");
}

function normWA(val) {
  let s = String(val || "").replace(/\D/g, "");
  if (s.length < 8) return "";
  if (s.startsWith("0")) s = "62" + s.slice(1);
  else if (s.startsWith("8")) s = "62" + s;
  return s;
}

function normalizePackage(pkg = "") {
  const p = String(pkg || "").toLowerCase();
  if (p.includes("live")) return "Livestreaming";
  return "Vidio";
}

function populateNicheDropdowns() {
  const filterNiche = document.getElementById("filter-aff-niche");
  const modalNiche = document.getElementById("a-niche");
  const mainNiches = Object.keys(NICHE_MAP);

  mainNiches.forEach(n => {
    const opt1 = document.createElement("option");
    opt1.value = n;
    opt1.textContent = n;
    filterNiche.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = n;
    opt2.textContent = n;
    modalNiche.appendChild(opt2);
  });
  updateSubNicheOptions("Beauty");
}

function updateSubNicheOptions(mainNiche, selectedSub = "") {
  const subSel = document.getElementById("a-subniche");
  const subs = NICHE_MAP[mainNiche] || [];
  subSel.innerHTML = `<option value="">-- Pilih Sub-Niche --</option>` +
    subs.map(s => `<option value="${s}" ${s === selectedSub ? "selected" : ""}>${s}</option>`).join("");
}

document.getElementById("a-niche").addEventListener("change", (e) => {
  updateSubNicheOptions(e.target.value);
});

document.getElementById("a-gmv").addEventListener("input", (e) => {
  const raw = parseNum(e.target.value);
  e.target.value = raw > 0 ? raw.toLocaleString("id-ID") : "";
});

function renderTable() {
  const q = document.getElementById("search-aff").value.trim().toLowerCase();
  const fPlat = document.getElementById("filter-aff-platform").value;
  const fNiche = document.getElementById("filter-aff-niche").value;
  const fPkg = document.getElementById("filter-aff-package").value;

  const filtered = affList.filter(a => {
    const pkgNorm = normalizePackage(a.package);
    const matchQ = !q ||
      (a.username || "").toLowerCase().includes(q) ||
      (a.contact || "").toLowerCase().includes(q) ||
      (a.niche || "").toLowerCase().includes(q) ||
      (a.subNiche || "").toLowerCase().includes(q) ||
      pkgNorm.toLowerCase().includes(q) ||
      (a.notes || "").toLowerCase().includes(q);
    const matchPlat = !fPlat || (a.platform || "").toLowerCase() === fPlat.toLowerCase();
    const matchNiche = !fNiche || a.niche === fNiche;
    const matchPkg = !fPkg || pkgNorm === fPkg;
    return matchQ && matchPlat && matchNiche && matchPkg;
  });

  document.getElementById("stat-aff-total").textContent = affList.length;
  document.getElementById("stat-aff-tiktok").textContent = affList.filter(a => (a.platform || "Tiktok").toLowerCase() === "tiktok").length;
  document.getElementById("stat-aff-shopee").textContent = affList.filter(a => (a.platform || "").toLowerCase() === "shopee").length;
  const totalGmv = affList.reduce((sum, a) => sum + parseNum(a.gmv), 0);
  document.getElementById("stat-aff-gmv").textContent = formatRp(totalGmv);

  const tbody = document.getElementById("aff-table-body");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-10 text-center text-slate-400">Belum ada data Database Affiliate yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const waNum = normWA(a.contact);
    const platBadge = (a.platform || "Tiktok").toLowerCase() === "shopee"
      ? "bg-orange-500 text-white"
      : "bg-slate-800 text-white";
    const pkgNorm = normalizePackage(a.package);
    const pkgBadge = pkgNorm === "Livestreaming"
      ? "bg-purple-100 text-purple-700"
      : "bg-rose-100 text-rose-700";

    return `
      <tr class="hover:bg-rose-50/30 transition align-middle">
        <td class="py-3 px-3">
          <div class="font-bold text-slate-800">${a.username}</div>
          <div class="text-[10px] text-slate-400">${a.id}</div>
        </td>
        <td class="py-3 px-3 text-center">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${platBadge}">${a.platform || "Tiktok"}</span>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-700">${a.niche || "-"}</div>
          ${a.subNiche ? `<div class="text-[10px] text-rose-500">${a.subNiche}</div>` : ""}
        </td>
        <td class="py-3 px-3">
          ${a.accountLink
            ? `<a href="${a.accountLink}" target="_blank" class="text-sky-600 hover:underline truncate block max-w-[165px]">${a.accountLink.replace(/^https?:\/\/(www\.)?/, "")}</a>`
            : `<span class="text-slate-400">-</span>`}
        </td>
        <td class="py-3 px-3">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pkgBadge}">${pkgNorm}</span>
        </td>
        <td class="py-3 px-3 text-right font-bold text-slate-800">
          ${parseNum(a.gmv) > 0 ? parseNum(a.gmv).toLocaleString("id-ID") : "-"}
        </td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-1.5">
            <span class="font-mono text-slate-700">${a.contact || "-"}</span>
            ${waNum ? `<a href="https://wa.me/${waNum}" target="_blank" title="Chat WA" class="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100"><i data-lucide="message-circle" class="w-3.5 h-3.5"></i></a>` : ""}
          </div>
        </td>
        <td class="py-3 px-3 text-[11px] text-slate-500 max-w-[200px] truncate" title="${(a.notes || "").replace(/"/g, "&quot;")}">
          ${a.notes || "-"}
        </td>
        ${!isFinance ? `
          <td class="py-3 px-3 text-right space-x-1">
            <button type="button" data-edit="${a.id}" class="btn-edit-aff px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold">Edit</button>
            <button type="button" data-del="${a.id}" class="btn-del-aff px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 text-[11px] font-semibold">Hapus</button>
          </td>
        ` : ""}
      </tr>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();

  tbody.querySelectorAll(".btn-edit-aff").forEach(btn => {
    btn.addEventListener("click", () => openModal(affList.find(x => x.id === btn.dataset.edit)));
  });

  tbody.querySelectorAll(".btn-del-aff").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await showConfirm("Hapus Data Affiliate?", "Data afiliator ini akan dihapus dari Database Affiliate.", "Ya, Hapus");
      if (!ok) return;
      removeDemoItem("affiliates", btn.dataset.del);
      showToast("Data affiliate dihapus");
    });
  });
}

const modal = document.getElementById("aff-modal");
const form = document.getElementById("aff-form");

function openModal(item = null) {
  form.reset();
  if (item) {
    document.getElementById("aff-modal-title").textContent = `Edit Affiliate — ${item.username}`;
    document.getElementById("aff-id").value = item.id;
    document.getElementById("a-username").value = item.username || "";
    document.getElementById("a-platform").value = item.platform || "Tiktok";
    document.getElementById("a-niche").value = item.niche || "Beauty";
    updateSubNicheOptions(item.niche || "Beauty", item.subNiche || "");
    document.getElementById("a-link").value = item.accountLink || "";
    document.getElementById("a-package").value = normalizePackage(item.package);
    document.getElementById("a-gmv").value = formatRibuan(item.gmv);
    document.getElementById("a-contact").value = item.contact || "";
    document.getElementById("a-notes").value = item.notes || "";
  } else {
    document.getElementById("aff-modal-title").textContent = "Tambah Database Affiliate";
    document.getElementById("aff-id").value = "";
    document.getElementById("a-niche").value = "Beauty";
    document.getElementById("a-package").value = "Vidio";
    updateSubNicheOptions("Beauty");
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("aff-id").value || ("AFF-" + Date.now().toString().slice(-6));

  const payload = {
    id,
    username: document.getElementById("a-username").value.trim(),
    platform: document.getElementById("a-platform").value,
    niche: document.getElementById("a-niche").value,
    subNiche: document.getElementById("a-subniche").value,
    accountLink: document.getElementById("a-link").value.trim(),
    package: document.getElementById("a-package").value,
    gmv: parseNum(document.getElementById("a-gmv").value),
    contact: document.getElementById("a-contact").value.trim(),
    notes: document.getElementById("a-notes").value.trim(),
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  };

  setDemoItem("affiliates", id, payload);
  closeModal();
  showToast("Data Database Affiliate disimpan!");
});

document.getElementById("btn-download-aff-tpl").addEventListener("click", () => {
  const rows = [
    ["DATABASE AFFILIATE"],
    [],
    ["Username", "Platform", "Niche", "Link Akun", "Package", "GMV", "Kontak", "Catatan"],
    ["Deviallutfy", "Tiktok", "Beauty", "https://www.tiktok.com/@deviallutfy", "Vidio", 6600000, "085959597441", "Barter sampel skincare"],
    ["Syifa Nafi'ah", "Shopee", "Beauty", "https://shopee.co.id/syifanafiah", "Livestreaming", 21000000, "087817971329", "Spesialis Shopee Live"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 32 }, { wch: 16 }, { wch: 15 }, { wch: 16 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATABASE AFFILIATE");
  XLSX.writeFile(wb, "Template_Database_Affiliate.xlsx");
  showToast("Template Excel Database Affiliate diunduh!");
});

document.getElementById("btn-export-aff").addEventListener("click", () => {
  const rows = [
    ["DATABASE AFFILIATE"],
    [],
    ["Username", "Platform", "Niche", "Link Akun", "Package", "GMV", "Kontak", "Catatan"]
  ];
  affList.forEach(a => {
    rows.push([
      a.username || "",
      a.platform || "Tiktok",
      a.niche || "",
      a.accountLink || "",
      normalizePackage(a.package),
      parseNum(a.gmv),
      a.contact || "",
      a.notes || ""
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 32 }, { wch: 16 }, { wch: 15 }, { wch: 16 }, { wch: 30 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DATABASE AFFILIATE");
  XLSX.writeFile(wb, "Export_Database_Affiliate.xlsx");
  showToast("Data Database Affiliate berhasil di-export!");
});

document.getElementById("import-aff-file")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      const headerIdx = rawRows.findIndex(r => r.some(c => String(c).trim().toLowerCase() === "username"));
      if (headerIdx === -1) {
        showAlert("Format Kolom Tidak Cocok", "Pastikan file memiliki kolom header: Username, Platform, Niche, Link Akun, Package, GMV, Kontak, Catatan.", "error");
        return;
      }

      const headers = rawRows[headerIdx].map(h => String(h).trim().toLowerCase());
      const findCol = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

      const cUser = findCol(["username", "nama"]);
      const cPlat = findCol(["platform"]);
      const cNiche = findCol(["niche"]);
      const cLink = findCol(["link tiktok", "link shopee", "link akun"]);
      const cPkg = findCol(["package"]);
      const cGmv = findCol(["gmv"]);
      const cContact = findCol(["kontak", "wa", "contact"]);
      const cNotes = findCol(["catatan", "notes", "alamat"]);

      let imported = 0;
      for (let i = headerIdx + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const uname = String(row[cUser] || "").trim();
        if (!uname) continue;

        const existing = affList.find(x => x.username.toLowerCase() === uname.toLowerCase());
        const id = existing?.id || ("AFF-" + (Date.now() + i).toString().slice(-6));
        const rawPkg = cPkg >= 0 && row[cPkg] ? String(row[cPkg]).trim() : "Vidio";

        setDemoItem("affiliates", id, {
          id,
          username: uname,
          platform: cPlat >= 0 && row[cPlat] ? String(row[cPlat]).trim() : "Tiktok",
          niche: cNiche >= 0 && row[cNiche] ? String(row[cNiche]).trim() : "Beauty",
          subNiche: existing?.subNiche || "",
          accountLink: cLink >= 0 ? String(row[cLink] || "").trim() : "",
          package: normalizePackage(rawPkg),
          gmv: cGmv >= 0 ? parseNum(row[cGmv]) : 0,
          contact: cContact >= 0 ? String(row[cContact] || "").trim() : "",
          notes: cNotes >= 0 && row[cNotes] ? String(row[cNotes]).trim() : (existing?.notes || ""),
          updatedBy: user?.name || "Import Excel",
          updatedAt: new Date().toISOString()
        });
        imported++;
      }
      showToast(`${imported} data Affiliate berhasil di-import!`);
    } catch (err) {
      showAlert("Gagal Membaca File", err.message, "error");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsBinaryString(file);
});

document.getElementById("btn-open-aff-modal")?.addEventListener("click", () => openModal());
document.getElementById("btn-close-aff-modal").addEventListener("click", closeModal);
document.getElementById("btn-cancel-aff-modal").addEventListener("click", closeModal);
["search-aff", "filter-aff-platform", "filter-aff-niche", "filter-aff-package"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
  document.getElementById(id).addEventListener("change", renderTable);
});

populateNicheDropdowns();
subscribeDemoCollection("affiliates", (data) => {
  affList = Object.values(data || {});
  renderTable();
});
