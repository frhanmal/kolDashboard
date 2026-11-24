import {
  initPageLayout, showConfirm, showToast, showAlert, NICHE_MAP,
  subscribeDemoCollection, setDemoItem, updateDemoItem, removeDemoItem
} from "./auth.js";

const user = initPageLayout("affiliate", ["owner", "kol_specialist"]);

let affList = [];

const PLATFORM_PACKAGE_MAP = {
  "Instagram": ["IG Story", "IG Feeds", "IG Carousel", "IG Reels", "+ Cart"],
  "Tiktok": ["Tiktok Video", "Tiktok Story", "Tiktok Photos", "+ Cart"],
  "Youtube": ["YT Shorts", "YT Video", "+ Cart"]
};

const PLATFORM_LINK_META = {
  "Instagram": { label: "Link Instagram", placeholder: "https://www.instagram.com/username" },
  "Tiktok": { label: "Link Tiktok", placeholder: "https://www.tiktok.com/@username" },
  "Youtube": { label: "Link Youtube", placeholder: "https://www.youtube.com/@username" }
};

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

function normalizePlatform(rawPlatform = "", rawPackage = "", rawLink = "") {
  const p = String(rawPlatform || "").trim().toLowerCase();
  if (p.includes("ig") || p.includes("insta")) return "Instagram";
  if (p.includes("yt") || p.includes("youtube")) return "Youtube";
  if (p.includes("tiktok") || p.includes("tik tok")) return "Tiktok";

  const pkg = String(rawPackage || "").trim().toLowerCase();
  if (pkg.startsWith("ig ")) return "Instagram";
  if (pkg.startsWith("yt ")) return "Youtube";
  if (pkg.startsWith("tiktok ")) return "Tiktok";

  const lnk = String(rawLink || "").trim().toLowerCase();
  if (lnk.includes("instagram.com")) return "Instagram";
  if (lnk.includes("youtube.com") || lnk.includes("youtu.be")) return "Youtube";

  return "Tiktok";
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

function updatePackageOptions(platform, selectedPackage = "") {
  const normPlat = normalizePlatform(platform);
  const pkgSel = document.getElementById("a-package");
  const linkLabel = document.getElementById("a-link-label");
  const linkInput = document.getElementById("a-link");

  const meta = PLATFORM_LINK_META[normPlat] || PLATFORM_LINK_META["Tiktok"];
  if (linkLabel) linkLabel.textContent = meta.label;
  if (linkInput) linkInput.placeholder = meta.placeholder;

  const list = [...(PLATFORM_PACKAGE_MAP[normPlat] || PLATFORM_PACKAGE_MAP["Tiktok"])];
  if (selectedPackage && !list.includes(selectedPackage)) {
    list.unshift(selectedPackage);
  }

  const targetPkg = selectedPackage || list[0] || "Tiktok Video";
  pkgSel.innerHTML = list
    .map(pkg => `<option value="${pkg}" ${pkg === targetPkg ? "selected" : ""}>${pkg}</option>`)
    .join("");
}

document.getElementById("a-platform").addEventListener("change", (e) => {
  updatePackageOptions(e.target.value);
});

document.getElementById("a-niche").addEventListener("change", (e) => {
  updateSubNicheOptions(e.target.value);
});

document.getElementById("a-gmv").addEventListener("input", (e) => {
  const raw = parseNum(e.target.value);
  e.target.value = raw > 0 ? raw.toLocaleString("id-ID") : "";
});

function getPlatformBadgeClass(platform = "") {
  const norm = normalizePlatform(platform);
  if (norm === "Instagram") return "bg-purple-700 text-white";
  if (norm === "Youtube") return "bg-red-700 text-white";
  return "bg-slate-800 text-white";
}

function getPackageBadgeClass(pkg = "") {
  const p = String(pkg || "").trim();
  if (p === "IG Story") return "bg-purple-300 text-purple-950";
  if (p === "IG Feeds") return "bg-purple-600 text-white";
  if (p === "IG Carousel") return "bg-violet-600 text-white";
  if (p === "IG Reels") return "bg-purple-950 text-white";
  if (p === "Tiktok Video") return "bg-slate-950 text-white";
  if (p === "Tiktok Story") return "bg-slate-700 text-white";
  if (p === "Tiktok Photos") return "bg-stone-500 text-white";
  if (p === "YT Shorts") return "bg-red-700 text-white";
  if (p === "YT Video") return "bg-rose-700 text-white";
  if (p === "+ Cart") return "bg-amber-500 text-white";
  return "bg-slate-900 text-white";
}

function getApprovalBadgeClass(status = "") {
  if (status === "Posting Video" || status === "Posting Vidio") return "bg-rose-100 text-rose-700 border-rose-200";
  if (status === "Pengajuan Sampel") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "Kirim Sampel") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "Selesai") return "bg-sky-100 text-sky-700 border-sky-200";
  if (status === "Ditolak") return "bg-slate-200 text-slate-600 border-slate-300";
  return "bg-rose-50 text-rose-600 border-rose-200";
}

function renderTable() {
  const q = document.getElementById("search-aff").value.trim().toLowerCase();
  const fPlat = document.getElementById("filter-aff-platform").value;
  const fPkg = document.getElementById("filter-aff-package").value;
  const fNiche = document.getElementById("filter-aff-niche").value;
  const fApp = document.getElementById("filter-aff-approval").value;

  const filtered = affList.filter(a => {
    const plat = normalizePlatform(a.platform, a.package, a.accountLink);
    const pkg = a.package || (PLATFORM_PACKAGE_MAP[plat]?.[0] || "Tiktok Video");

    const matchQ = !q ||
      (a.username || "").toLowerCase().includes(q) ||
      (a.contact || "").toLowerCase().includes(q) ||
      (a.niche || "").toLowerCase().includes(q) ||
      (a.subNiche || "").toLowerCase().includes(q) ||
      plat.toLowerCase().includes(q) ||
      pkg.toLowerCase().includes(q) ||
      (a.notes || "").toLowerCase().includes(q);
    const matchPlat = !fPlat || plat.toLowerCase() === fPlat.toLowerCase();
    const matchPkg = !fPkg || pkg.toLowerCase() === fPkg.toLowerCase();
    const matchNiche = !fNiche || a.niche === fNiche;
    const matchApp = !fApp || a.approval === fApp;
    return matchQ && matchPlat && matchPkg && matchNiche && matchApp;
  });

  document.getElementById("stat-aff-total").textContent = affList.length;
  document.getElementById("stat-aff-sample").textContent = affList.filter(a => a.approval === "Pengajuan Sampel" || a.approval === "Kirim Sampel").length;
  document.getElementById("stat-aff-posted").textContent = affList.filter(a => a.approval === "Posting Video" || a.approval === "Posting Vidio" || a.approval === "Selesai").length;
  const totalGmv = affList.reduce((sum, a) => sum + parseNum(a.gmv), 0);
  document.getElementById("stat-aff-gmv").textContent = formatRp(totalGmv);

  const tbody = document.getElementById("aff-table-body");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="py-10 text-center text-slate-400">Belum ada data Listing Affiliate yang cocok.</td></tr>`;
    return;
  }

  const APPROVAL_OPTS = ["Pengajuan Sampel", "Kirim Sampel", "Posting Video", "Selesai", "Ditolak"];

  tbody.innerHTML = filtered.map(a => {
    const links = Array.isArray(a.postLinks) ? a.postLinks.filter(Boolean) : [];
    const linksHtml = links.length > 0
      ? links.map((lnk, idx) => `<a href="${lnk}" target="_blank" class="block text-sky-600 hover:underline truncate max-w-[170px]" title="${lnk}">Video ${idx + 1}: ${lnk.replace(/^https?:\/\//, "")}</a>`).join("")
      : `<span class="text-slate-400 italic">Belum ada link</span>`;

    const waNum = normWA(a.contact);
    const normPlat = normalizePlatform(a.platform, a.package, a.accountLink);
    const platBadge = getPlatformBadgeClass(normPlat);
    const pkgVal = a.package || (PLATFORM_PACKAGE_MAP[normPlat]?.[0] || "Tiktok Video");
    const pkgBadge = getPackageBadgeClass(pkgVal);
    const normalizedStatus = a.approval === "Posting Vidio" ? "Posting Video" : (a.approval || "Pengajuan Sampel");

    return `
      <tr class="hover:bg-rose-50/30 transition align-middle">
        <td class="py-3 px-3">
          <div class="font-bold text-slate-800">${a.username}</div>
          ${a.notes ? `<div class="text-[10px] text-slate-400 truncate max-w-[160px]" title="${a.notes}">${a.notes}</div>` : ""}
        </td>
        <td class="py-3 px-3 text-center">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${platBadge}">${normPlat}</span>
        </td>
        <td class="py-3 px-3">
          <div class="font-semibold text-slate-700">${a.niche || "-"}</div>
          ${a.subNiche ? `<div class="text-[10px] text-rose-500">${a.subNiche}</div>` : ""}
        </td>
        <td class="py-3 px-3">
          ${a.accountLink
            ? `<a href="${a.accountLink}" target="_blank" class="text-sky-600 hover:underline truncate block max-w-[155px]">${a.accountLink.replace(/^https?:\/\/(www\.)?/, "")}</a>`
            : `<span class="text-slate-400">-</span>`}
        </td>
        <td class="py-3 px-3">
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${pkgBadge}">${pkgVal}</span>
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
        <td class="py-3 px-3 text-[11px]">${linksHtml}</td>
        <td class="py-3 px-3 text-center">
          <select data-id="${a.id}" class="aff-status-sel px-2.5 py-1 rounded-full border text-[11px] font-bold outline-none cursor-pointer ${getApprovalBadgeClass(normalizedStatus)}">
            ${APPROVAL_OPTS.map(st => `<option value="${st}" ${normalizedStatus === st ? "selected" : ""}>${st}</option>`).join("")}
          </select>
        </td>
        <td class="py-3 px-3 text-right space-x-1">
          <button type="button" data-edit="${a.id}" class="btn-edit-aff px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold">Edit</button>
          <button type="button" data-del="${a.id}" class="btn-del-aff px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 text-[11px] font-semibold">Hapus</button>
        </td>
      </tr>
    `;
  }).join("");

  if (window.lucide) window.lucide.createIcons();

  tbody.querySelectorAll(".aff-status-sel").forEach(sel => {
    sel.addEventListener("change", (e) => {
      updateDemoItem("affiliates", e.target.dataset.id, {
        approval: e.target.value,
        updatedBy: user?.name || "Unknown",
        updatedAt: new Date().toISOString()
      });
      showToast(`Status diubah ke "${e.target.value}"`);
    });
  });

  tbody.querySelectorAll(".btn-edit-aff").forEach(btn => {
    btn.addEventListener("click", () => openModal(affList.find(x => x.id === btn.dataset.edit)));
  });

  tbody.querySelectorAll(".btn-del-aff").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await showConfirm("Hapus Data Affiliate?", "Data afiliator ini akan dihapus dari Listing Affiliate.", "Ya, Hapus");
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
    const normPlat = normalizePlatform(item.platform, item.package, item.accountLink);
    document.getElementById("aff-modal-title").textContent = `Edit Affiliate — ${item.username}`;
    document.getElementById("aff-id").value = item.id;
    document.getElementById("a-username").value = item.username || "";
    document.getElementById("a-platform").value = normPlat;
    document.getElementById("a-niche").value = item.niche || "Beauty";
    updateSubNicheOptions(item.niche || "Beauty", item.subNiche || "");
    document.getElementById("a-link").value = item.accountLink || "";
    updatePackageOptions(normPlat, item.package || "");
    document.getElementById("a-gmv").value = formatRibuan(item.gmv);
    document.getElementById("a-contact").value = item.contact || "";
    document.getElementById("a-approval").value = item.approval === "Posting Vidio" ? "Posting Video" : (item.approval || "Pengajuan Sampel");
    document.getElementById("a-notes").value = item.notes || "";
    document.getElementById("a-post-links").value = (item.postLinks || []).join("\n");
  } else {
    document.getElementById("aff-modal-title").textContent = "Tambah Listing Affiliate";
    document.getElementById("aff-id").value = "";
    document.getElementById("a-platform").value = "Tiktok";
    document.getElementById("a-niche").value = "Beauty";
    updateSubNicheOptions("Beauty");
    updatePackageOptions("Tiktok", "Tiktok Video");
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
  const rawLinks = document.getElementById("a-post-links").value
    .split(/\r?\n|,/)
    .map(s => s.trim())
    .filter(Boolean);

  const selectedPlat = document.getElementById("a-platform").value;
  const selectedPkg = document.getElementById("a-package").value;

  const payload = {
    id,
    username: document.getElementById("a-username").value.trim(),
    platform: selectedPlat,
    niche: document.getElementById("a-niche").value,
    subNiche: document.getElementById("a-subniche").value,
    accountLink: document.getElementById("a-link").value.trim(),
    package: selectedPkg,
    gmv: parseNum(document.getElementById("a-gmv").value),
    contact: document.getElementById("a-contact").value.trim(),
    approval: document.getElementById("a-approval").value,
    notes: document.getElementById("a-notes").value.trim(),
    postLinks: rawLinks,
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  };

  setDemoItem("affiliates", id, payload);
  closeModal();
  showToast("Data Listing Affiliate disimpan!");
});

document.getElementById("btn-download-aff-tpl").addEventListener("click", () => {
  const rows = [
    ["LISTING AFFILIATE"],
    [],
    ["Username", "Platform", "Niche", "Link Tiktok", "Package", "GMV TT", "Kontak", "Link Posting", "Approval"],
    ["Deviallutfy", "Tiktok", "Beauty", "https://www.tiktok.com/@deviallutfy", "Tiktok Video", 6600000, "085959597441", "https://vt.tiktok.com/ZSQJCU1/", "Posting Video"],
    ["Syifa Nafi'ah", "Instagram", "Beauty", "https://www.instagram.com/syifanafiah", "IG Reels", 21000000, "087817971329", "", "Pengajuan Sampel"],
    ["Nabila samuri", "Youtube", "Beauty", "https://www.youtube.com/@nabilasamuri", "YT Shorts", 65400000, "08563645405", "", "Kirim Sampel"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 34 }, { wch: 16 }, { wch: 15 }, { wch: 16 }, { wch: 32 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "LISTING AFFILIATE");
  XLSX.writeFile(wb, "Template_Listing_Affiliate.xlsx");
  showToast("Template Excel Listing Affiliate diunduh!");
});

document.getElementById("btn-export-aff").addEventListener("click", () => {
  const rows = [
    ["LISTING AFFILIATE"],
    [],
    ["Username", "Platform", "Niche", "Link Tiktok", "Package", "GMV TT", "Kontak", "Link Posting", "Approval"]
  ];
  affList.forEach(a => {
    const normPlat = normalizePlatform(a.platform, a.package, a.accountLink);
    rows.push([
      a.username || "",
      normPlat,
      a.niche || "",
      a.accountLink || "",
      a.package || (PLATFORM_PACKAGE_MAP[normPlat]?.[0] || "Tiktok Video"),
      parseNum(a.gmv),
      a.contact || "",
      (a.postLinks || []).join("\n"),
      a.approval || "Pengajuan Sampel"
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 20 }, { wch: 12 }, { wch: 16 }, { wch: 34 }, { wch: 16 }, { wch: 15 }, { wch: 16 }, { wch: 35 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "LISTING AFFILIATE");
  XLSX.writeFile(wb, "Export_Listing_Affiliate.xlsx");
  showToast("Data Listing Affiliate berhasil di-export!");
});

document.getElementById("import-aff-file").addEventListener("change", (e) => {
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
        showAlert("Format Kolom Tidak Cocok", "Pastikan file memiliki kolom header: Username, Platform, Niche, Link Tiktok, Package, GMV TT, Kontak, Link Posting, Approval.", "error");
        return;
      }

      const headers = rawRows[headerIdx].map(h => String(h).trim().toLowerCase());
      const findCol = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

      const cUser = findCol(["username", "nama"]);
      const cPlat = findCol(["platform"]);
      const cNiche = findCol(["niche"]);
      const cLink = findCol(["link tiktok", "link ig", "link instagram", "link youtube", "link shopee", "link akun"]);
      const cPkg = findCol(["package"]);
      const cGmv = findCol(["gmv"]);
      const cContact = findCol(["kontak", "wa", "contact"]);
      const cPost = findCol(["link posting", "posting"]);
      const cApp = findCol(["approval", "status"]);

      let imported = 0;
      for (let i = headerIdx + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const uname = String(row[cUser] || "").trim();
        if (!uname) continue;

        const existing = affList.find(x => x.username.toLowerCase() === uname.toLowerCase());
        const id = existing?.id || ("AFF-" + (Date.now() + i).toString().slice(-6));
        const rawPosts = cPost >= 0 ? String(row[cPost] || "").split(/\r?\n|,/).map(s => s.trim()).filter(Boolean) : [];
        let appStatus = cApp >= 0 && row[cApp] ? String(row[cApp]).trim() : "Pengajuan Sampel";
        if (appStatus === "Posting Vidio") appStatus = "Posting Video";

        const rawPlat = cPlat >= 0 ? String(row[cPlat] || "").trim() : "";
        const rawPkg = cPkg >= 0 ? String(row[cPkg] || "").trim() : "";
        const rawAccLink = cLink >= 0 ? String(row[cLink] || "").trim() : "";
        const normPlat = normalizePlatform(rawPlat, rawPkg, rawAccLink);
        const finalPkg = rawPkg || (PLATFORM_PACKAGE_MAP[normPlat]?.[0] || "Tiktok Video");

        setDemoItem("affiliates", id, {
          id,
          username: uname,
          platform: normPlat,
          niche: cNiche >= 0 && row[cNiche] ? String(row[cNiche]).trim() : "Beauty",
          subNiche: existing?.subNiche || "",
          accountLink: rawAccLink,
          package: finalPkg,
          gmv: cGmv >= 0 ? parseNum(row[cGmv]) : 0,
          contact: cContact >= 0 ? String(row[cContact] || "").trim() : "",
          postLinks: rawPosts.length > 0 ? rawPosts : (existing?.postLinks || []),
          approval: appStatus,
          notes: existing?.notes || "",
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

document.getElementById("btn-open-aff-modal").addEventListener("click", () => openModal());
document.getElementById("btn-close-aff-modal").addEventListener("click", closeModal);
document.getElementById("btn-cancel-aff-modal").addEventListener("click", closeModal);
["search-aff", "filter-aff-platform", "filter-aff-package", "filter-aff-niche", "filter-aff-approval"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
  document.getElementById(id).addEventListener("change", renderTable);
});

populateNicheDropdowns();
updatePackageOptions("Tiktok", "Tiktok Video");
subscribeDemoCollection("affiliates", (data) => {
  affList = Object.values(data || {});
  renderTable();
});