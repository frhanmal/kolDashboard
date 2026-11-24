import {
  initPageLayout, showConfirm, showToast,
  subscribeDemoCollection, setDemoItem, updateDemoItem, removeDemoItem, getDemoCollection
} from "./auth.js";

const user = initPageLayout("master-kol", ["owner", "kol_specialist", "finance"]);
const roleLower = String(user?.role || "").toLowerCase();
const isOwner = roleLower === "owner";
const isFinance = roleLower === "finance";

if (isFinance) {
  document.getElementById("btn-open-modal")?.classList.add("hidden");
  document.querySelector(".action-col")?.classList.add("hidden");
}
if (isOwner) {
  document.querySelector(".owner-col")?.classList.remove("hidden");
}

let kolList = [];
let matchedDuplicate = null;

function normWA(val) {
  let s = String(val || "").replace(/\D/g, "");
  if (s.startsWith("0")) s = "62" + s.slice(1);
  else if (s.startsWith("8")) s = "62" + s;
  return s;
}

function normUser(val) {
  return String(val || "").trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
}

function parseRupiahInput(val) {
  return Number(String(val || "").replace(/\D/g, "")) || 0;
}

function formatRibuan(num) {
  const n = Number(num || 0);
  return n > 0 ? n.toLocaleString("id-ID") : "";
}

function formatRp(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function calcPublish(nett, markup) {
  const n = Number(nett || 0);
  const m = Number(markup || 0);
  return Math.round(n + (n * m) / 100);
}

function daysSince(isoDate) {
  if (!isoDate) return 999;
  const diff = Date.now() - new Date(isoDate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

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

  const filtered = kolList.filter(k => {
    const aliasStr = (k.aliases || []).join(" ").toLowerCase();
    const matchQ = !q ||
      (k.name || "").toLowerCase().includes(q) ||
      (k.wa || "").includes(normWA(q) || q) ||
      (k.ig || "").toLowerCase().includes(q) ||
      (k.tiktok || "").toLowerCase().includes(q) ||
      aliasStr.includes(q);
    const matchNiche = !fNiche || k.niche === fNiche;
    const matchTier = !fTier || k.tier === fTier;
    return matchQ && matchNiche && matchTier;
  });

  document.getElementById("total-count").textContent = filtered.length;
  const tbody = document.getElementById("kol-table-body");

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-slate-400">Belum ada data KOL.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(k => {
    const days = daysSince(k.rateUpdatedAt);
    const isExpired = days > 90;
    const pubStory = calcPublish(k.rates?.story, k.markup);
    const pubTiktok = calcPublish(k.rates?.tiktok, k.markup);
    const marginStory = pubStory - Number(k.rates?.story || 0);

    const aliasBadge = (k.aliases && k.aliases.length > 0)
      ? `<div class="text-[10px] text-rose-500 mt-0.5">Alias: ${k.aliases.join(", ")}</div>`
      : "";

    return `
      <tr class="hover:bg-rose-50/30 transition">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800">${k.name}</div>
          <div class="text-[11px] text-slate-400">${k.id} • WA: ${k.wa}</div>
          <div class="text-[10px] text-slate-400">Update: ${k.updatedBy || "-"}</div>
        </td>
        <td class="py-3.5 px-4 text-xs">
          <div>IG: <span class="font-semibold text-slate-700">@${k.ig || "-"}</span></div>
          <div>TT: <span class="font-semibold text-slate-700">@${k.tiktok || "-"}</span></div>
          ${aliasBadge}
        </td>
        <td class="py-3.5 px-4">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">${k.niche || "-"}</span>
          <div class="text-[11px] text-slate-500 mt-1">${k.tier || "-"} • ${k.er || "-"}</div>
        </td>
        <td class="py-3.5 px-4 text-xs">
          <div>Story: <strong class="text-slate-800">${formatRp(pubStory)}</strong></div>
          <div>TikTok: <strong class="text-slate-800">${formatRp(pubTiktok)}</strong></div>
        </td>
        ${isOwner ? `
          <td class="py-3.5 px-4 text-xs">
            <div class="text-slate-500">Nett Story: ${formatRp(k.rates?.story)}</div>
            <div class="text-emerald-600 font-bold">Margin (+${k.markup || 0}%): ${formatRp(marginStory)}</div>
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
  const wa = normWA(document.getElementById("f-wa").value);
  const ig = normUser(document.getElementById("f-ig").value);
  const tt = normUser(document.getElementById("f-tiktok").value);

  matchedDuplicate = kolList.find(k => {
    if (k.id === currentId) return false;
    const aliases = (k.aliases || []).map(normUser);
    const hitWA = wa.length >= 9 && k.wa === wa;
    const hitIG = ig.length >= 2 && (k.ig === ig || aliases.includes(ig));
    const hitTT = tt.length >= 2 && (k.tiktok === tt || aliases.includes(tt));
    return hitWA || hitIG || hitTT;
  });

  const alertBox = document.getElementById("duplicate-alert");
  const saveBtn = document.getElementById("btn-save-kol");

  if (matchedDuplicate) {
    document.getElementById("duplicate-detail").textContent =
      `Ditemukan "${matchedDuplicate.name}" (${matchedDuplicate.id}) dengan WA ${matchedDuplicate.wa} / IG @${matchedDuplicate.ig}. Klik tombol di samping untuk update data tanpa membuat duplikat.`;
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
    document.getElementById("f-wa").value = kol.wa || "";
    document.getElementById("f-ig").value = kol.ig || "";
    document.getElementById("f-tiktok").value = kol.tiktok || "";
    document.getElementById("f-niche").value = kol.niche || "Beauty";
    document.getElementById("f-tier").value = kol.tier || "Micro";
    document.getElementById("f-er").value = kol.er || "";
    document.getElementById("f-markup").value = kol.markup ?? 30;
    document.getElementById("f-rate-story").value = formatRibuan(kol.rates?.story);
    document.getElementById("f-rate-reels").value = formatRibuan(kol.rates?.reels);
    document.getElementById("f-rate-tiktok").value = formatRibuan(kol.rates?.tiktok);
    document.getElementById("f-rate-kuning").value = formatRibuan(kol.rates?.kuning);
    document.getElementById("f-rate-boost").value = formatRibuan(kol.rates?.boost);
    document.getElementById("f-rate-visit").value = formatRibuan(kol.rates?.visit);

    document.getElementById("alias-box").classList.remove("hidden");
    document.getElementById("alias-list").textContent = (kol.aliases && kol.aliases.length) ? kol.aliases.join(", ") : "Belum ada";
  } else {
    document.getElementById("modal-title").textContent = "Tambah KOL Baru";
    document.getElementById("kol-id").value = "";
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
  const s = parseRupiahInput(document.getElementById("f-rate-story").value);
  const t = parseRupiahInput(document.getElementById("f-rate-tiktok").value);
  document.getElementById("preview-publish-story").textContent = formatRp(calcPublish(s, m));
  document.getElementById("preview-publish-tiktok").textContent = formatRp(calcPublish(t, m));
}

document.querySelectorAll(".rate-input").forEach((inp) => {
  inp.addEventListener("input", (e) => {
    const raw = parseRupiahInput(e.target.value);
    e.target.value = raw > 0 ? raw.toLocaleString("id-ID") : "";
    updatePreview();
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (matchedDuplicate) return;

  const existingId = document.getElementById("kol-id").value;
  const existingData = kolList.find(x => x.id === existingId);

  const newIg = normUser(document.getElementById("f-ig").value);
  const newTt = normUser(document.getElementById("f-tiktok").value);

  const aliases = new Set(existingData?.aliases || []);
  if (existingData?.ig && existingData.ig !== newIg) aliases.add(existingData.ig);
  if (existingData?.tiktok && existingData.tiktok !== newTt) aliases.add(existingData.tiktok);

  const now = new Date().toISOString();
  const payload = {
    ...(existingData?.sourceLeadId ? { sourceLeadId: existingData.sourceLeadId } : {}),
    id: existingId || ("KOL-" + Date.now().toString().slice(-6)),
    name: document.getElementById("f-name").value.trim(),
    wa: normWA(document.getElementById("f-wa").value),
    ig: newIg,
    tiktok: newTt,
    aliases: Array.from(aliases),
    niche: document.getElementById("f-niche").value,
    tier: document.getElementById("f-tier").value,
    er: document.getElementById("f-er").value.trim(),
    markup: Number(document.getElementById("f-markup").value || 30),
    rates: {
      story: parseRupiahInput(document.getElementById("f-rate-story").value),
      reels: parseRupiahInput(document.getElementById("f-rate-reels").value),
      tiktok: parseRupiahInput(document.getElementById("f-rate-tiktok").value),
      kuning: parseRupiahInput(document.getElementById("f-rate-kuning").value),
      boost: parseRupiahInput(document.getElementById("f-rate-boost").value),
      visit: parseRupiahInput(document.getElementById("f-rate-visit").value)
    },
    rateUpdatedAt: now,
    updatedBy: user?.name || "Unknown",
    updatedAt: now
  };

  setDemoItem("master_kol", payload.id, payload);
  showToast("Data KOL disimpan (Demo Mode)!");
  closeModal();
});

async function deleteKOL(id) {
  const targetKol = kolList.find(x => x.id === id);
  const isFromLead = Boolean(targetKol?.sourceLeadId);

  const ok = await showConfirm(
    "Hapus dari Talent Database?",
    isFromLead
      ? `"${targetKol.name}" berasal dari Lead Masuk. Jika dihapus dari sini, statusnya akan otomatis dikembalikan ke menu Lead Masuk (Pending).`
      : "Data KOL ini akan dihapus permanen dari Talent Database.",
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

document.getElementById("btn-open-modal")?.addEventListener("click", () => openModal());
document.getElementById("btn-close-modal").addEventListener("click", closeModal);
document.getElementById("btn-cancel-modal").addEventListener("click", closeModal);
document.getElementById("btn-load-existing").addEventListener("click", () => {
  if (matchedDuplicate) openModal(matchedDuplicate);
});

["f-wa", "f-ig", "f-tiktok"].forEach(id => {
  document.getElementById(id).addEventListener("input", checkDuplicate);
});
document.getElementById("f-markup").addEventListener("input", updatePreview);
["search-input", "filter-niche", "filter-tier"].forEach(id => {
  document.getElementById(id).addEventListener("input", renderTable);
});

loadData();
