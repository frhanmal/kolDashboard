import {
  initPageLayout, showConfirm, showToast, showAlert, NICHE_MAP,
  subscribeDemoCollection, setDemoItem, updateDemoItem, removeDemoItem, getDemoCollection
} from "./auth.js";

const user = initPageLayout("master-kol", ["owner", "kol_specialist", "finance"]);
const roleLower = String(user?.role || "").toLowerCase();
const isOwner = roleLower === "owner";
const isFinance = roleLower === "finance";

if (isFinance) {
  document.getElementById("btn-open-modal")?.classList.add("hidden");
  document.getElementById("lbl-import-kol")?.classList.add("hidden");
  document.querySelector(".action-col")?.classList.add("hidden");
}
if (isOwner) {
  document.querySelector(".owner-col")?.classList.remove("hidden");
}

let kolList = [];
let matchedDuplicate = null;

function normWA(val) {
  let s = String(val || "").replace(/\D/g, "");
  if (s.length < 8) return "";
  if (s.startsWith("0")) s = "62" + s.slice(1);
  else if (s.startsWith("8")) s = "62" + s;
  return s;
}

function normUser(val) {
  return String(val || "").trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
}

function formatER(val, isExcelPercentFormat = false) {
  if (val === null || val === undefined) return "";
  let s = String(val).trim();
  if (!s) return "";
  // Jika sudah ada tanda %, rapikan spasi saja
  if (s.includes("%")) {
    return s.replace(/\s+/g, "");
  }
  // Cek jika berupa angka (misal 0.0351 atau 3.51 atau 3,51)
  const num = parseFloat(s.replace(",", "."));
  if (!isNaN(num)) {
    // Jika dari sel Excel berformat persen (0.0351 -> 3,51%, atau 3.619 -> 361,90%)
    // atau angka desimal kecil < 1 tanpa format eksplisit (0.0351 -> 3,51%)
    const pct = (isExcelPercentFormat || (num > 0 && num < 1)) ? (num * 100) : num;
    const formatted = Number.isInteger(pct)
      ? String(pct)
      : pct.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
    return formatted + "%";
  }
  return s;
}

function extractUsernameFromUrl(url, fallback = "") {
  const s = String(url || "").trim();
  if (!s) return normUser(fallback);
  const m = s.match(/(?:tiktok\.com\/@|instagram\.com\/|twitter\.com\/|x\.com\/)([a-zA-Z0-9._]+)/i);
  if (m && m[1]) return normUser(m[1]);
  return normUser(fallback);
}

// Mendukung nominal Rupiah maupun status teks seperti "free", "include", "not avail", "1x rate"
function parseRateValue(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return Math.round(val);
  const str = String(val).trim();
  if (!str) return 0;
  const lower = str.toLowerCase();
  if (["free", "include", "incl", "not avail", "na", "1x rate"].some(k => lower.includes(k))) {
    return str;
  }
  if (/^rp\s*0$/i.test(str) || str === "0") return 0;
  if (lower.endsWith("k") && /^\d+(\.\d+)?k$/.test(lower)) {
    return Math.round(parseFloat(lower) * 1000);
  }
  const digits = str.replace(/\D/g, "");
  return digits ? Number(digits) : str;
}

function formatRateInputDisplay(val) {
  if (val === null || val === undefined || val === "" || val === 0) return "";
  if (typeof val === "string" && isNaN(Number(val.replace(/\./g, "")))) return val;
  const num = typeof val === "number" ? val : Number(String(val).replace(/\D/g, ""));
  return num > 0 ? num.toLocaleString("id-ID") : "";
}

function formatPublishRate(val, markup) {
  if (typeof val === "string" && val.trim() !== "") {
    return `<span class="uppercase text-[11px] font-bold text-emerald-600">${val}</span>`;
  }
  const n = Number(val || 0);
  if (n <= 0) return "Rp 0";
  const pub = Math.round(n + (n * Number(markup || 0)) / 100);
  return "Rp " + pub.toLocaleString("id-ID");
}

function formatRp(num) {
  if (typeof num === "string" && num.trim() !== "") return num;
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function calcPublishNum(nett, markup) {
  if (typeof nett === "string") return 0;
  const n = Number(nett || 0);
  const m = Number(markup || 0);
  return Math.round(n + (n * m) / 100);
}

function daysSince(isoDate) {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function populateNicheSelects() {
  const fNiche = document.getElementById("filter-niche");
  const mNiche = document.getElementById("f-niche");
  Object.keys(NICHE_MAP).forEach(n => {
    const o1 = document.createElement("option");
    o1.value = n;
    o1.textContent = n;
    fNiche.appendChild(o1);

    const o2 = document.createElement("option");
    o2.value = n;
    o2.textContent = n;
    mNiche.appendChild(o2);
  });
  updateSubNicheSelect("Beauty");
}

function updateSubNicheSelect(mainNiche, selectedSub = "") {
  const subSel = document.getElementById("f-subniche");
  const subs = NICHE_MAP[mainNiche] || [];
  subSel.innerHTML = `<option value="">-- Pilih Sub-Niche --</option>` +
    subs.map(s => `<option value="${s}" ${s === selectedSub ? "selected" : ""}>${s}</option>`).join("");
}

document.getElementById("f-niche").addEventListener("change", (e) => {
  updateSubNicheSelect(e.target.value);
});

function loadData() {
  subscribeDemoCollection("master_kol", (data) => {
    kolList = Object.values(data || {});
    renderTable();
  });
}

function renderTable() {
  const q = document.getElementById("search-input").value.trim().toLowerCase();
  const fNiche = document.getElementById("filter-niche").value;
  const fTier = document.getElementById("filter-tier").value;
  const fGender = document.getElementById("filter-gender").value;

  const filtered = kolList.filter(k => {
    const aliasStr = (k.aliases || []).join(" ").toLowerCase();
    const matchQ = !q ||
      (k.name || "").toLowerCase().includes(q) ||
      (k.wa || "").includes(normWA(q) || q) ||
      (k.contact || "").toLowerCase().includes(q) ||
      (k.ig || "").toLowerCase().includes(q) ||
      (k.tiktok || "").toLowerCase().includes(q) ||
      (k.address || "").toLowerCase().includes(q) ||
      (k.nicheTiktok || "").toLowerCase().includes(q) ||
      (k.nicheIg || "").toLowerCase().includes(q) ||
      aliasStr.includes(q);
    const matchNiche = !fNiche || k.niche === fNiche;
    const matchTier = !fTier || k.tier === fTier;
    const matchGender = !fGender || (k.gender || "").toUpperCase() === fGender;
    return matchQ && matchNiche && matchTier && matchGender;
  });

  document.getElementById("total-count").textContent = filtered.length;
  const tbody = document.getElementById("kol-table-body");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-slate-400">Belum ada data KOL yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(k => {
    const days = daysSince(k.rateUpdatedAt);
    const isExpired = days > 90;
    const contactDisplay = k.contact || k.wa || "-";
    const waDigits = normWA(contactDisplay);

    const nettReels = typeof k.rates?.reels === "number" ? k.rates.reels : 0;
    const pubReelsNum = calcPublishNum(nettReels, k.markup);
    const marginReels = pubReelsNum - nettReels;

    const aliasBadge = (k.aliases && k.aliases.length > 0)
      ? `<div class="text-[10px] text-rose-500 mt-0.5">Alias: ${k.aliases.join(", ")}</div>`
      : "";

    const genderBadge = k.gender
      ? `<span class="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">${k.gender}</span>`
      : "";

    return `
      <tr class="hover:bg-rose-50/30 transition">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800">${k.name}${genderBadge}</div>
          <div class="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>${k.id} • ${contactDisplay}</span>
            ${waDigits ? `<a href="https://wa.me/${waDigits}" target="_blank" title="Chat WA" class="text-emerald-600 hover:underline font-bold">[WA]</a>` : ""}
          </div>
          ${k.address ? `<div class="text-[10px] text-slate-400 truncate max-w-[200px]" title="${k.address}">📍 ${k.address}</div>` : ""}
        </td>
        <td class="py-3.5 px-4 text-xs">
          <div>IG: <span class="font-semibold text-slate-700">@${k.ig || "-"}</span> ${k.followersIg ? `<span class="text-[10px] text-slate-400">(${Number(k.followersIg).toLocaleString("id-ID")})</span>` : ""}</div>
          <div>TT: <span class="font-semibold text-slate-700">@${k.tiktok || "-"}</span> ${k.followersTt ? `<span class="text-[10px] text-slate-400">(${Number(k.followersTt).toLocaleString("id-ID")})</span>` : ""}</div>
          ${aliasBadge}
        </td>
        <td class="py-3.5 px-4">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">${k.niche || "-"}</span>
          ${k.subNiche ? `<span class="text-[10px] text-slate-500 ml-1">${k.subNiche}</span>` : ""}
          <div class="text-[11px] text-slate-500 mt-1">${k.tier || "-"} ${k.er ? `• ER: ${k.er}` : ""}</div>
        </td>
        <td class="py-3.5 px-4 text-xs space-y-0.5">
          <div>IG Reels: <strong class="text-slate-800">${formatPublishRate(k.rates?.reels, k.markup)}</strong></div>
          <div>TikTok: <strong class="text-slate-800">${formatPublishRate(k.rates?.tiktok, k.markup)}</strong></div>
          <div class="text-[11px] text-slate-500">Story: ${formatPublishRate(k.rates?.story, k.markup)} • Visit: ${formatPublishRate(k.rates?.visit, k.markup)}</div>
        </td>
        ${isOwner ? `
          <td class="py-3.5 px-4 text-xs">
            <div class="text-slate-500">Nett Reels: ${formatRp(k.rates?.reels)}</div>
            <div class="text-emerald-600 font-bold">Margin (+${k.markup || 0}%): ${formatRp(marginReels)}</div>
          </td>
        ` : ""}
        <td class="py-3.5 px-4">
          ${isExpired
            ? `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">⚠️ Re-confirm (${days} hr)</span>`
            : `<span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">✓ Valid (${days} hr lalu)</span>`
          }
        </td>
        ${!isFinance ? `
          <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
            <button type="button" data-edit="${k.id}" class="btn-edit px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition">Edit</button>
            <button type="button" data-del="${k.id}" class="btn-del px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 text-xs font-semibold transition">Hapus</button>
          </td>
        ` : ""}
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => openModal(kolList.find(x => x.id === btn.dataset.edit)));
  });
  tbody.querySelectorAll(".btn-del").forEach(btn => {
    btn.addEventListener("click", () => deleteKOL(btn.dataset.del));
  });
}

function checkDuplicate() {
  const currentId = document.getElementById("kol-id").value;
  const wa = normWA(document.getElementById("f-contact").value);
  const ig = normUser(document.getElementById("f-ig").value);
  const tt = normUser(document.getElementById("f-tiktok").value);

  matchedDuplicate = kolList.find(k => {
    if (k.id === currentId) return false;
    const aliases = (k.aliases || []).map(normUser);
    const hitWA = wa.length >= 9 && (k.wa === wa || normWA(k.contact) === wa);
    const hitIG = ig.length >= 2 && (k.ig === ig || aliases.includes(ig));
    const hitTT = tt.length >= 2 && (k.tiktok === tt || aliases.includes(tt));
    return hitWA || hitIG || hitTT;
  });

  const alertBox = document.getElementById("duplicate-alert");
  const saveBtn = document.getElementById("btn-save-kol");

  if (matchedDuplicate) {
    document.getElementById("duplicate-detail").textContent =
      `Ditemukan "${matchedDuplicate.name}" (${matchedDuplicate.id}) dengan kontak ${matchedDuplicate.contact || matchedDuplicate.wa} / IG @${matchedDuplicate.ig}. Klik tombol di samping untuk update data tanpa membuat duplikat.`;
    alertBox.classList.remove("hidden");
    saveBtn.disabled = true;
    saveBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    alertBox.classList.add("hidden");
    saveBtn.disabled = false;
    saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

const modal = document.getElementById("kol-modal");
const form = document.getElementById("kol-form");

function openModal(kol = null) {
  form.reset();
  matchedDuplicate = null;
  document.getElementById("duplicate-alert").classList.add("hidden");
  document.getElementById("btn-save-kol").disabled = false;
  document.getElementById("btn-save-kol").classList.remove("opacity-50", "cursor-not-allowed");

  if (kol) {
    document.getElementById("modal-title").textContent = `Edit KOL — ${kol.name}`;
    document.getElementById("kol-id").value = kol.id;
    document.getElementById("f-name").value = kol.name || "";
    document.getElementById("f-contact").value = kol.contact || kol.wa || "";
    document.getElementById("f-gender").value = kol.gender || "";
    document.getElementById("f-tiktok").value = kol.tiktok || "";
    document.getElementById("f-followers-tt").value = kol.followersTt ? Number(kol.followersTt).toLocaleString("id-ID") : "";
    document.getElementById("f-link-tt").value = kol.tiktokLink || "";
    document.getElementById("f-niche-tt").value = kol.nicheTiktok || "";
    document.getElementById("f-ig").value = kol.ig || "";
    document.getElementById("f-followers-ig").value = kol.followersIg ? Number(kol.followersIg).toLocaleString("id-ID") : "";
    document.getElementById("f-link-ig").value = kol.igLink || "";
    document.getElementById("f-niche-ig").value = kol.nicheIg || "";

    const mainNiche = NICHE_MAP[kol.niche] ? kol.niche : "Beauty";
    document.getElementById("f-niche").value = mainNiche;
    updateSubNicheSelect(mainNiche, kol.subNiche || "");

    document.getElementById("f-tier").value = kol.tier || "Micro";
    document.getElementById("f-er").value = formatER(kol.er || "");
    document.getElementById("f-address").value = kol.address || "";
    document.getElementById("f-markup").value = kol.markup ?? 30;

    document.getElementById("f-rate-visit").value = formatRateInputDisplay(kol.rates?.visit);
    document.getElementById("f-rate-story").value = formatRateInputDisplay(kol.rates?.story);
    document.getElementById("f-rate-feed").value = formatRateInputDisplay(kol.rates?.feed);
    document.getElementById("f-rate-reels").value = formatRateInputDisplay(kol.rates?.reels);
    document.getElementById("f-rate-tiktok").value = formatRateInputDisplay(kol.rates?.tiktok);
    document.getElementById("f-rate-mirroring").value = formatRateInputDisplay(kol.rates?.mirroring);
    document.getElementById("f-rate-owning").value = formatRateInputDisplay(kol.rates?.owning);
    document.getElementById("f-rate-tweet-img").value = formatRateInputDisplay(kol.rates?.tweetImage);
    document.getElementById("f-rate-tweet-thread").value = formatRateInputDisplay(kol.rates?.tweetThread);
    document.getElementById("f-rate-collab").value = formatRateInputDisplay(kol.rates?.collab);
    document.getElementById("f-rate-boost").value = formatRateInputDisplay(kol.rates?.boost);
    document.getElementById("f-rate-kuning").value = formatRateInputDisplay(kol.rates?.kuning);

    document.getElementById("alias-box").classList.remove("hidden");
    document.getElementById("alias-list").textContent = (kol.aliases && kol.aliases.length) ? kol.aliases.join(", ") : "Belum ada";
  } else {
    document.getElementById("modal-title").textContent = "Tambah KOL Baru";
    document.getElementById("kol-id").value = "";
    document.getElementById("f-niche").value = "Beauty";
    updateSubNicheSelect("Beauty");
    document.getElementById("alias-box").classList.add("hidden");
  }

  updatePreview();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal() {
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function updatePreview() {
  const m = document.getElementById("f-markup").value;
  const r = parseRateValue(document.getElementById("f-rate-reels").value);
  const t = parseRateValue(document.getElementById("f-rate-tiktok").value);
  const mir = parseRateValue(document.getElementById("f-rate-mirroring").value);
  document.getElementById("preview-publish-reels").innerHTML = formatPublishRate(r, m);
  document.getElementById("preview-publish-tiktok").innerHTML = formatPublishRate(t, m);
  document.getElementById("preview-publish-mirroring").innerHTML = formatPublishRate(mir, m);
}

document.querySelectorAll(".rate-input").forEach((inp) => {
  inp.addEventListener("input", (e) => {
    const val = e.target.value;
    // Jika hanya angka & titik/koma, format ribuan otomatis; jika ada huruf (seperti "free", "include"), biarkan teksnya
    if (/^[\d.,\s]+$/.test(val)) {
      const digits = val.replace(/\D/g, "");
      e.target.value = digits ? Number(digits).toLocaleString("id-ID") : "";
    }
    updatePreview();
  });
});

["f-followers-tt", "f-followers-ig"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    e.target.value = digits ? Number(digits).toLocaleString("id-ID") : "";
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (matchedDuplicate) return;

  const existingId = document.getElementById("kol-id").value;
  const existingData = kolList.find(x => x.id === existingId);

  const newIg = normUser(document.getElementById("f-ig").value);
  const newTt = normUser(document.getElementById("f-tiktok").value);
  const contactRaw = document.getElementById("f-contact").value.trim();

  const aliases = new Set(existingData?.aliases || []);
  if (existingData?.ig && existingData.ig !== newIg) aliases.add(existingData.ig);
  if (existingData?.tiktok && existingData.tiktok !== newTt) aliases.add(existingData.tiktok);

  const now = new Date().toISOString();
  const payload = {
    ...(existingData?.sourceLeadId ? { sourceLeadId: existingData.sourceLeadId } : {}),
    id: existingId || ("KOL-" + Date.now().toString().slice(-6)),
    name: document.getElementById("f-name").value.trim(),
    contact: contactRaw,
    wa: normWA(contactRaw) || contactRaw,
    gender: document.getElementById("f-gender").value,
    ig: newIg,
    igLink: document.getElementById("f-link-ig").value.trim(),
    followersIg: Number(String(document.getElementById("f-followers-ig").value || "").replace(/\D/g, "")) || 0,
    nicheIg: document.getElementById("f-niche-ig").value.trim(),
    tiktok: newTt,
    tiktokLink: document.getElementById("f-link-tt").value.trim(),
    followersTt: Number(String(document.getElementById("f-followers-tt").value || "").replace(/\D/g, "")) || 0,
    nicheTiktok: document.getElementById("f-niche-tt").value.trim(),
    aliases: Array.from(aliases),
    niche: document.getElementById("f-niche").value,
    subNiche: document.getElementById("f-subniche").value,
    tier: document.getElementById("f-tier").value,
    er: formatER(document.getElementById("f-er").value),
    address: document.getElementById("f-address").value.trim(),
    markup: Number(document.getElementById("f-markup").value || 30),
    rates: {
      visit: parseRateValue(document.getElementById("f-rate-visit").value),
      story: parseRateValue(document.getElementById("f-rate-story").value),
      feed: parseRateValue(document.getElementById("f-rate-feed").value),
      reels: parseRateValue(document.getElementById("f-rate-reels").value),
      tiktok: parseRateValue(document.getElementById("f-rate-tiktok").value),
      mirroring: parseRateValue(document.getElementById("f-rate-mirroring").value),
      owning: parseRateValue(document.getElementById("f-rate-owning").value),
      tweetImage: parseRateValue(document.getElementById("f-rate-tweet-img").value),
      tweetThread: parseRateValue(document.getElementById("f-rate-tweet-thread").value),
      collab: parseRateValue(document.getElementById("f-rate-collab").value),
      boost: parseRateValue(document.getElementById("f-rate-boost").value),
      kuning: parseRateValue(document.getElementById("f-rate-kuning").value)
    },
    rateUpdatedAt: now,
    updatedBy: user?.name || "Unknown",
    updatedAt: now
  };

  setDemoItem("master_kol", payload.id, payload);
  showToast("Data KOL disimpan!");
  closeModal();
});

async function deleteKOL(id) {
  const targetKol = kolList.find(x => x.id === id);
  const isFromLead = Boolean(targetKol?.sourceLeadId);

  const ok = await showConfirm(
    "Hapus dari Database KOL?",
    isFromLead
      ? `"${targetKol.name}" berasal dari Lead Masuk. Jika dihapus dari sini, statusnya akan otomatis dikembalikan ke menu Lead Masuk (Pending).`
      : "Data KOL ini akan dihapus permanen dari Database KOL.",
    "Ya, Hapus"
  );
  if (!ok) return;

  removeDemoItem("master_kol", id);

  if (targetKol?.sourceLeadId) {
    updateDemoItem("leads", targetKol.sourceLeadId, {
      status: "Pending",
      approvedKolId: "",
      approvedBy: ""
    });
    showToast("Dihapus & dikembalikan ke Lead Masuk!");
  } else if (targetKol?.tiktok) {
    const allLeads = Object.values(getDemoCollection("leads"));
    const matchedLead = allLeads.find(l => l.approvedKolId === id || (l.tiktok && normUser(l.tiktok) === normUser(targetKol.tiktok)));
    if (matchedLead) {
      updateDemoItem("leads", matchedLead.id, {
        status: "Pending",
        approvedKolId: "",
        approvedBy: ""
      });
      showToast("Dihapus & dikembalikan ke Lead Masuk!");
      return;
    }
    showToast("Data KOL dihapus");
  } else {
    showToast("Data KOL dihapus");
  }
}

// Download Template Excel sesuai Sheet 2 user
const KOL_SHEET_HEADERS = [
  "No", "Name", "Link TT/TW", "Followers TT/TW", "LINK IG", "Followers IG",
  "Gender", "Niche Tiktok", "Niche IG", "ER", "Location or Shipment Address",
  "Contact / Under Management", "Visit", "1x Single Story (Video)", "1x Single Feed",
  "IG Reels >60s", "TikTok Video >60s", "Miroring >60s (Totalan)", "Owning (Add on)",
  "Single Tweet + Image", "Tweet Thread", "Collab Post", "Boost Code 1 mo. (Addon)", "Yellow Cart"
];

document.getElementById("btn-download-kol-tpl").addEventListener("click", () => {
  const rows = [
    KOL_SHEET_HEADERS,
    [
      1, "Nic Putra", "https://www.tiktok.com/@nicputra", 881800, "https://www.instagram.com/nicputra", 242000,
      "M", "Foodies, Reviewer Place", "Foodies, Reviewer Place", "11.32%", "Jakarta & Tangerang",
      "cp 6282280809080", 500000, 0, 0, 7000000, 9000000, 12000000, 3500000,
      269000, 188900, 2000000, "free", 0
    ]
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master KOL");
  XLSX.writeFile(wb, "Template_Master_KOL.xlsx");
  showToast("Template Excel Master KOL diunduh!");
});

document.getElementById("btn-export-kol").addEventListener("click", () => {
  const rows = [KOL_SHEET_HEADERS];
  kolList.forEach((k, idx) => {
    rows.push([
      idx + 1,
      k.name || "",
      k.tiktokLink || (k.tiktok ? `https://www.tiktok.com/@${k.tiktok}` : ""),
      Number(k.followersTt || 0),
      k.igLink || (k.ig ? `https://www.instagram.com/${k.ig}` : ""),
      Number(k.followersIg || 0),
      k.gender || "",
      k.nicheTiktok || k.niche || "",
      k.nicheIg || k.niche || "",
      k.er || "",
      k.address || "",
      k.contact || k.wa || "",
      k.rates?.visit ?? 0,
      k.rates?.story ?? 0,
      k.rates?.feed ?? 0,
      k.rates?.reels ?? 0,
      k.rates?.tiktok ?? 0,
      k.rates?.mirroring ?? 0,
      k.rates?.owning ?? 0,
      k.rates?.tweetImage ?? 0,
      k.rates?.tweetThread ?? 0,
      k.rates?.collab ?? 0,
      k.rates?.boost ?? 0,
      k.rates?.kuning ?? 0
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master KOL");
  XLSX.writeFile(wb, "Export_Master_KOL.xlsx");
  showToast("Data Master KOL berhasil di-export!");
});

function inferMainNiche(rawNiche = "") {
  const s = String(rawNiche || "").toLowerCase();
  if (s.includes("food") || s.includes("kuliner") || s.includes("ngopi")) return "Food";
  if (s.includes("beauty") || s.includes("skin") || s.includes("makeup")) return "Beauty";
  if (s.includes("fashion") || s.includes("hijab") || s.includes("outfit")) return "Fashion";
  if (s.includes("mom") || s.includes("baby") || s.includes("family") || s.includes("parent")) return "Mom & Baby";
  if (s.includes("health") || s.includes("fit")) return "Health";
  if (s.includes("home") || s.includes("living") || s.includes("decor")) return "Home & Living";
  if (s.includes("tech") || s.includes("gadget") || s.includes("game")) return "Tech";
  if (s.includes("travel") || s.includes("hotel")) return "Travel";
  if (s.includes("entertain") || s.includes("comedy") || s.includes("music")) return "Entertainment";
  if (s.includes("edu") || s.includes("finance") || s.includes("career")) return "Education";
  if (s.includes("auto") || s.includes("car") || s.includes("motor")) return "Automotive";
  return "Lifestyle";
}

function inferTier(followersMax = 0) {
  if (followersMax >= 1000000) return "Mega";
  if (followersMax >= 100000) return "Macro";
  if (followersMax >= 10000) return "Micro";
  return "Nano";
}

document.getElementById("import-kol-file")?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      const headerIdx = rawRows.findIndex(r => r.some(c => String(c).trim().toLowerCase() === "name"));
      if (headerIdx === -1) {
        showAlert("Format Kolom Tidak Cocok", "Pastikan file Excel/CSV memiliki baris header dengan kolom 'Name' sesuai template Master KOL.", "error");
        return;
      }

      const headers = rawRows[headerIdx].map(h => String(h).trim().toLowerCase());
      const findCol = (keys) => headers.findIndex(h => keys.some(k => h.includes(k)));

      const cName = findCol(["name"]);
      const cLinkTt = findCol(["link tt"]);
      const cFolTt = findCol(["followers tt"]);
      const cLinkIg = findCol(["link ig"]);
      const cFolIg = findCol(["followers ig"]);
      const cGender = findCol(["gender"]);
      const cNicheTt = findCol(["niche tiktok"]);
      const cNicheIg = findCol(["niche ig"]);
      const cEr = headers.findIndex(h => h === "er" || h === "engagement rate" || /\ber\b/.test(h));
      const cAddr = findCol(["location", "shipment", "address"]);
      const cContact = findCol(["contact", "management"]);

      const cVisit = findCol(["visit"]);
      const cStory = findCol(["story"]);
      const cFeed = findCol(["feed"]);
      const cReels = findCol(["reels"]);
      const cTiktok = findCol(["tiktok video"]);
      const cMirror = findCol(["miroring", "mirroring"]);
      const cOwning = findCol(["owning"]);
      const cTweetImg = findCol(["single tweet"]);
      const cTweetThread = findCol(["tweet thread"]);
      const cCollab = findCol(["collab"]);
      const cBoost = findCol(["boost"]);
      const cYellow = findCol(["yellow cart", "keranjang"]);

      let imported = 0;
      const now = new Date().toISOString();

      for (let i = headerIdx + 1; i < rawRows.length; i++) {
        const r = rawRows[i];
        const name = String(r[cName] || "").trim();
        if (!name) continue;

        const ttLink = cLinkTt >= 0 ? String(r[cLinkTt] || "").trim() : "";
        const igLink = cLinkIg >= 0 ? String(r[cLinkIg] || "").trim() : "";
        const ttUser = extractUsernameFromUrl(ttLink);
        const igUser = extractUsernameFromUrl(igLink);
        const contactRaw = cContact >= 0 ? String(r[cContact] || "").trim() : "";
        const waDigits = normWA(contactRaw);

        const folTt = cFolTt >= 0 ? Number(String(r[cFolTt]).replace(/\D/g, "")) || 0 : 0;
        const folIg = cFolIg >= 0 ? Number(String(r[cFolIg]).replace(/\D/g, "")) || 0 : 0;
        const nicheTt = cNicheTt >= 0 ? String(r[cNicheTt] || "").trim() : "";
        const nicheIg = cNicheIg >= 0 ? String(r[cNicheIg] || "").trim() : "";

        const existing = kolList.find(k =>
          (waDigits.length >= 9 && (k.wa === waDigits || normWA(k.contact) === waDigits)) ||
          (igUser && k.ig === igUser) ||
          (ttUser && k.tiktok === ttUser) ||
          k.name.toLowerCase() === name.toLowerCase()
        );

        const id = existing?.id || ("KOL-" + (Date.now() + i).toString().slice(-6));
        const mainNiche = existing?.niche || inferMainNiche(nicheTt || nicheIg);

        setDemoItem("master_kol", id, {
          ...(existing || {}),
          id,
          name,
          contact: contactRaw || existing?.contact || "",
          wa: waDigits || contactRaw || existing?.wa || "",
          gender: cGender >= 0 && r[cGender] ? String(r[cGender]).trim().toUpperCase() : (existing?.gender || ""),
          tiktok: ttUser || existing?.tiktok || "",
          tiktokLink: ttLink || existing?.tiktokLink || "",
          followersTt: folTt || existing?.followersTt || 0,
          nicheTiktok: nicheTt || existing?.nicheTiktok || "",
          ig: igUser || existing?.ig || "",
          igLink: igLink || existing?.igLink || "",
          followersIg: folIg || existing?.followersIg || 0,
          nicheIg: nicheIg || existing?.nicheIg || "",
          niche: mainNiche,
          subNiche: existing?.subNiche || "",
          tier: existing?.tier || inferTier(Math.max(folTt, folIg)),
          er: (() => {
            if (cEr < 0) return existing?.er || "";
            const cellAddr = XLSX.utils.encode_cell({ r: i, c: cEr });
            const cellObj = ws[cellAddr];
            if (cellObj && cellObj.w && String(cellObj.w).includes("%")) {
              return formatER(cellObj.w);
            }
            const isPctFmt = Boolean(cellObj && cellObj.z && String(cellObj.z).includes("%"));
            const rawVal = r[cEr];
            return (rawVal !== "" && rawVal !== null && rawVal !== undefined)
              ? formatER(rawVal, isPctFmt)
              : (existing?.er || "");
          })(),
          address: cAddr >= 0 && r[cAddr] ? String(r[cAddr]).trim() : (existing?.address || ""),
          markup: existing?.markup ?? 30,
          rates: {
            visit: cVisit >= 0 ? parseRateValue(r[cVisit]) : (existing?.rates?.visit ?? 0),
            story: cStory >= 0 ? parseRateValue(r[cStory]) : (existing?.rates?.story ?? 0),
            feed: cFeed >= 0 ? parseRateValue(r[cFeed]) : (existing?.rates?.feed ?? 0),
            reels: cReels >= 0 ? parseRateValue(r[cReels]) : (existing?.rates?.reels ?? 0),
            tiktok: cTiktok >= 0 ? parseRateValue(r[cTiktok]) : (existing?.rates?.tiktok ?? 0),
            mirroring: cMirror >= 0 ? parseRateValue(r[cMirror]) : (existing?.rates?.mirroring ?? 0),
            owning: cOwning >= 0 ? parseRateValue(r[cOwning]) : (existing?.rates?.owning ?? 0),
            tweetImage: cTweetImg >= 0 ? parseRateValue(r[cTweetImg]) : (existing?.rates?.tweetImage ?? 0),
            tweetThread: cTweetThread >= 0 ? parseRateValue(r[cTweetThread]) : (existing?.rates?.tweetThread ?? 0),
            collab: cCollab >= 0 ? parseRateValue(r[cCollab]) : (existing?.rates?.collab ?? 0),
            boost: cBoost >= 0 ? parseRateValue(r[cBoost]) : (existing?.rates?.boost ?? 0),
            kuning: cYellow >= 0 ? parseRateValue(r[cYellow]) : (existing?.rates?.kuning ?? 0)
          },
          rateUpdatedAt: now,
          updatedBy: user?.name || "Import Excel",
          updatedAt: now
        });
        imported++;
      }
      showToast(`${imported} data Master KOL berhasil di-import!`);
    } catch (err) {
      showAlert("Gagal Membaca File", err.message, "error");
    } finally {
      e.target.value = "";
    }
  };
  reader.readAsBinaryString(file);
});

document.getElementById("btn-open-modal")?.addEventListener("click", () => openModal());
document.getElementById("btn-close-modal").addEventListener("click", closeModal);
document.getElementById("btn-cancel-modal").addEventListener("click", closeModal);
document.getElementById("btn-load-existing").addEventListener("click", () => {
  if (matchedDuplicate) openModal(matchedDuplicate);
});

["f-contact", "f-ig", "f-tiktok"].forEach(id => {
  document.getElementById(id).addEventListener("input", checkDuplicate);
});
document.getElementById("f-markup").addEventListener("input", updatePreview);
document.getElementById("f-er")?.addEventListener("blur", (e) => {
  e.target.value = formatER(e.target.value);
});
["search-input", "filter-niche", "filter-tier", "filter-gender"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
  document.getElementById(id).addEventListener("change", renderTable);
});

populateNicheSelects();
loadData();
