import {
  initPageLayout, showAlert, showConfirm, showToast,
  subscribeDemoCollection, setDemoItem, updateDemoItem, removeDemoItem
} from "./auth.js";

const user = initPageLayout("campaign", ["owner", "kol_specialist"]);
const isOwner = user?.role === "owner";

if (isOwner) {
  document.querySelector(".owner-col")?.classList.remove("hidden");
  document.getElementById("sum-margin-box")?.classList.remove("hidden");
  document.getElementById("s-preview-nett-box")?.classList.remove("hidden");
  document.getElementById("es-preview-nett-box")?.classList.remove("hidden");
}

const KOL_SOP_STATUSES = [
  "1 - Sudah di Reach Out",
  "2 - Client Approved, Proses Negotiate",
  "3 - KOL Approved, Agreement",
  "4 - Barang Endorse Dikirim",
  "5 - Waiting Content (Overtime)",
  "6 - Sudah Post Content",
  "7 - Butuh Payment",
  "8 - Sudah Pernah Endorse, Approved",
  "9 - Unavailable",
  "10 - Taken Agency Lain",
  "11 - Ghosting"
];

const AFFILIATE_SOP_STATUSES = [
  "1 - Sudah di Reach Out",
  "2 - Pengajuan Sampel",
  "3 - Kirim Sampel",
  "4 - Posting",
  "5 - Butuh Payment (Paid Affiliate)",
  "6 - Selesai",
  "7 - Ditolak / Batal"
];

const SOW_LABELS = {
  story: "IG Story",
  reels: "IG Reels",
  tiktok: "TikTok Video",
  kuning: "Keranjang Kuning",
  boost: "Boost Code",
  visit: "Visit",
  Vidio: "Vidio",
  Livestreaming: "Livestreaming"
};

const filterStatusEl = document.getElementById("filter-status");
const searchKolEl = document.getElementById("search-campaign-kol");

const cmpSearchInput = document.getElementById("campaign-search-input");
const cmpDropdown = document.getElementById("campaign-search-dropdown");
const btnClearCmpSearch = document.getElementById("btn-clear-campaign-search");

const sKolSearchInput = document.getElementById("s-kol-search");
const sKolDropdown = document.getElementById("s-kol-dropdown");
const sKolIdInput = document.getElementById("s-kol-id");
const btnClearSKol = document.getElementById("btn-clear-s-kol");

const saAffSearchInput = document.getElementById("sa-aff-search");
const saAffDropdown = document.getElementById("sa-aff-dropdown");
const saAffIdInput = document.getElementById("sa-aff-id");
const btnClearSaAff = document.getElementById("btn-clear-sa-aff");

const summaryGridEl = document.getElementById("sum-kol")?.closest(".grid");
const filterBarEl = searchKolEl?.closest(".flex.flex-wrap.items-center.justify-between");
const tableCardEl = document.getElementById("tracking-table-body")?.closest(".bg-white");

let emptyPlaceholderEl = document.getElementById("campaign-empty-placeholder");
if (!emptyPlaceholderEl && tableCardEl) {
  emptyPlaceholderEl = document.createElement("div");
  emptyPlaceholderEl.id = "campaign-empty-placeholder";
  emptyPlaceholderEl.className = "bg-white rounded-2xl border border-dashed border-rose-200 p-8 sm:p-12 text-center space-y-2 shadow-xs";
  emptyPlaceholderEl.innerHTML = `
    <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
      <i data-lucide="mouse-pointer-click" class="w-6 h-6"></i>
    </div>
    <h3 class="text-sm font-bold text-slate-800">Belum Ada Campaign Dipilih</h3>
    <p class="text-xs text-slate-500 max-w-md mx-auto">Klik kotak <strong>Pilih Campaign</strong> di atas untuk membuka campaign KOL atau Affiliate, atau klik <strong>+ Campaign KOL</strong> / <strong>+ Campaign Affiliate</strong> untuk membuat baru.</p>
  `;
  tableCardEl.parentNode.insertBefore(emptyPlaceholderEl, tableCardEl);
  if (window.lucide) window.lucide.createIcons();
}

let masterKols = [];
let masterAffiliates = [];
let campaigns = {};
let activeCampaignId = "";

function formatRp(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function calcPublish(nett, markup) {
  return Math.round(Number(nett || 0) * (1 + Number(markup || 0) / 100));
}

function getSopListForCampaign(cmp) {
  return (cmp?.type || "kol") === "affiliate" ? AFFILIATE_SOP_STATUSES : KOL_SOP_STATUSES;
}

function syncFilterStatusDropdown(cmp) {
  const currentVal = filterStatusEl.value;
  const list = getSopListForCampaign(cmp);
  filterStatusEl.innerHTML = `<option value="">Semua Status SOP</option>` +
    list.map(st => `<option value="${st}" ${st === currentVal ? "selected" : ""}>${st}</option>`).join("");
}

function initData() {
  subscribeDemoCollection("master_kol", (data) => {
    masterKols = Object.values(data || {});
  });

  subscribeDemoCollection("affiliates", (data) => {
    masterAffiliates = Object.values(data || {});
  });

  subscribeDemoCollection("campaigns", (data) => {
    campaigns = data || {};
    populateCampaignSelector();
    renderTrackingTable();
  });
}

function syncSelectOption(selectEl, val) {
  if (!selectEl || !val) return;
  const exists = Array.from(selectEl.options).some(o => o.value === val);
  if (!exists) {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    selectEl.appendChild(opt);
  }
  selectEl.value = val;
}

function getCampaignStatusBadgeClass(status = "") {
  const s = status.toLowerCase();
  if (s.includes("planning") || s.includes("unsent")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("active") || s.includes("approved") || s.includes("onprocess")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("hold") || s.includes("postponed")) return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("complete")) return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-rose-50 text-rose-700 border-rose-200";
}

function getClientPayBadgeClass(pay = "Belum") {
  if (pay === "Lunas") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (pay === "DP") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function populateCampaignSelector() {
  const list = Object.values(campaigns);
  const statusWrap = document.getElementById("campaign-status-wrap");
  const statusSelect = document.getElementById("active-campaign-status");
  const payWrap = document.getElementById("campaign-client-pay-wrap");
  const paySelect = document.getElementById("active-client-pay-status");
  const typeBadge = document.getElementById("active-campaign-type-badge");
  const editCmpBtn = document.getElementById("btn-edit-campaign");
  const shortlistLabel = document.getElementById("btn-add-shortlist-label");

  if (list.length === 0) {
    activeCampaignId = "";
    if (cmpSearchInput) cmpSearchInput.value = "";
    statusWrap?.classList.add("hidden");
    payWrap?.classList.add("hidden");
    typeBadge?.classList.add("hidden");
    editCmpBtn?.classList.add("hidden");
    document.getElementById("campaign-meta").textContent = "Belum ada campaign tersimpan.";
    return;
  }

  if (activeCampaignId && !campaigns[activeCampaignId]) {
    activeCampaignId = "";
  }

  const active = activeCampaignId ? campaigns[activeCampaignId] : null;
  if (cmpSearchInput && document.activeElement !== cmpSearchInput) {
    cmpSearchInput.value = active ? `${active.name} (${active.brand || active.client || "-"})` : "";
  }
  if (btnClearCmpSearch) {
    btnClearCmpSearch.classList.toggle("hidden", !cmpSearchInput?.value);
  }

  if (active) {
    const isAff = (active.type || "kol") === "affiliate";
    syncFilterStatusDropdown(active);

    if (typeBadge) {
      typeBadge.classList.remove("hidden");
      typeBadge.textContent = isAff ? "AFFILIATE" : "KOL";
      typeBadge.className = isAff
        ? "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-900 text-pink-400"
        : "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-700";
    }

    if (shortlistLabel) {
      shortlistLabel.textContent = isAff ? "+ Shortlist Affiliate" : "+ Shortlist KOL";
    }

    statusWrap?.classList.remove("hidden");
    payWrap?.classList.remove("hidden");
    editCmpBtn?.classList.remove("hidden");

    const st = active.status || "Planning";
    syncSelectOption(statusSelect, st);
    if (statusSelect) {
      statusSelect.className = `px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none cursor-pointer transition ${getCampaignStatusBadgeClass(st)}`;
    }

    const paySt = active.clientPaymentStatus || "Belum";
    if (paySelect) {
      paySelect.value = paySt;
      paySelect.className = `px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none cursor-pointer transition ${getClientPayBadgeClass(paySt)}`;
    }

    document.getElementById("campaign-meta").textContent = `Niche: ${active.niche || "-"} • PIC: ${active.pic || "-"}`;
  } else {
    statusWrap?.classList.add("hidden");
    payWrap?.classList.add("hidden");
    typeBadge?.classList.add("hidden");
    editCmpBtn?.classList.add("hidden");
    if (shortlistLabel) shortlistLabel.textContent = "+ Shortlist";
    document.getElementById("campaign-meta").textContent = `${list.length} campaign tersedia — pilih untuk melihat data`;
  }
}

document.getElementById("active-campaign-status")?.addEventListener("change", (e) => {
  if (!activeCampaignId || !campaigns[activeCampaignId]) return;
  const newStatus = e.target.value;
  updateDemoItem("campaigns", activeCampaignId, {
    status: newStatus,
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  });
  showToast(`Status campaign diubah ke "${newStatus}"!`);
});

document.getElementById("active-client-pay-status")?.addEventListener("change", (e) => {
  if (!activeCampaignId || !campaigns[activeCampaignId]) return;
  const newPay = e.target.value;
  updateDemoItem("campaigns", activeCampaignId, {
    clientPaymentStatus: newPay,
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  });
  showToast(`Status pembayaran klien: "${newPay}"!`);
});

function renderCampaignDropdown(query = "") {
  if (!cmpDropdown) return;
  const q = query.trim().toLowerCase();
  const list = Object.values(campaigns);
  const matches = list.filter(c => {
    if (!q) return true;
    const brandName = c.brand || c.client || "";
    const typeStr = (c.type || "kol") === "affiliate" ? "affiliate" : "kol";
    return (c.name || "").toLowerCase().includes(q) ||
      brandName.toLowerCase().includes(q) ||
      typeStr.includes(q) ||
      (c.niche || "").toLowerCase().includes(q) ||
      (c.status || "").toLowerCase().includes(q) ||
      (c.id || "").toLowerCase().includes(q);
  });

  if (matches.length === 0) {
    cmpDropdown.innerHTML = `<div class="p-3 text-slate-400 text-center">Tidak ada campaign cocok dengan "${query}".</div>`;
  } else {
    cmpDropdown.innerHTML = matches.map(c => {
      const isSelected = c.id === activeCampaignId;
      const brandName = c.brand || c.client || "-";
      const st = c.status || "Planning";
      const isAff = (c.type || "kol") === "affiliate";
      const paySt = c.clientPaymentStatus || "Belum";
      return `
        <button type="button" data-id="${c.id}" class="opt-cmp w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center justify-between gap-2 transition ${isSelected ? "bg-rose-50/70" : ""}">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded ${isAff ? "bg-slate-900 text-pink-400" : "bg-rose-100 text-rose-700"}">${isAff ? "AFFILIATE" : "KOL"}</span>
              <span class="font-bold text-slate-800 truncate">${c.name}</span>
            </div>
            <div class="text-[11px] text-slate-400 truncate mt-0.5">Brand: ${brandName} • Klien: <strong>${paySt}</strong></div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCampaignStatusBadgeClass(st)} max-w-[120px] truncate">${st}</span>
          </div>
        </button>
      `;
    }).join("");
  }
  cmpDropdown.classList.remove("hidden");
}

function computeRatesForSow(kolId, currentItem, checkedSow) {
  const kol = masterKols.find(k => k.id === kolId);
  if (kol && kol.rates) {
    let nettTotal = 0;
    checkedSow.forEach(s => { nettTotal += Number(kol.rates?.[s] || 0); });
    const publishTotal = calcPublish(nettTotal, kol.markup ?? 30);
    return { nettTotal, publishTotal };
  }

  const prevSow = currentItem?.sow || [];
  const prevNett = Number(currentItem?.nettTotal || 0);
  const prevPub = Number(currentItem?.publishTotal || 0);

  if (prevSow.length > 0 && checkedSow.length > 0) {
    const ratio = checkedSow.length / prevSow.length;
    return {
      nettTotal: Math.round(prevNett * ratio),
      publishTotal: Math.round(prevPub * ratio)
    };
  }
  return { nettTotal: prevNett, publishTotal: prevPub };
}

function renderTrackingTable() {
  const tbody = document.getElementById("tracking-table-body");
  const active = activeCampaignId ? campaigns[activeCampaignId] : null;
  const hasSelection = Boolean(active);

  summaryGridEl?.classList.toggle("hidden", !hasSelection);
  filterBarEl?.classList.toggle("hidden", !hasSelection);
  tableCardEl?.classList.toggle("hidden", !hasSelection);
  emptyPlaceholderEl?.classList.toggle("hidden", hasSelection);

  if (!active) {
    tbody.innerHTML = "";
    return;
  }

  const isAffCmp = (active.type || "kol") === "affiliate";
  const sopList = getSopListForCampaign(active);
  const allItems = Object.values(active.items || {});
  const filterSt = filterStatusEl.value;
  const searchQ = (searchKolEl?.value || "").trim().toLowerCase();

  document.getElementById("sum-kol-label").textContent = isAffCmp ? "Total Affiliate Shortlist" : "Total KOL Shortlist";
  document.getElementById("sum-posted-label").textContent = isAffCmp ? "Sudah Posting (4 - Posting+)" : "Sudah Post (Status 6+)";
  document.getElementById("campaign-tip-text").innerHTML = isAffCmp
    ? 'Tip: Affiliate gratis/barter sampel cukup pilih skema <strong>Barter Sampel</strong>; jika berbayar ubah status ke <strong class="text-amber-600">5 - Butuh Payment</strong> agar masuk menu Finance.'
    : 'Tip: Ubah status ke <strong class="text-amber-600">7 - Butuh Payment</strong> agar otomatis masuk ke menu Finance.';

  const items = allItems.filter(i => {
    const matchStatus = !filterSt || i.status === filterSt;
    const sowText = (i.sow || []).map(s => SOW_LABELS[s] || s).join(" ").toLowerCase();
    const matchSearch = !searchQ ||
      (i.kolName || "").toLowerCase().includes(searchQ) ||
      (i.ig || "").toLowerCase().includes(searchQ) ||
      (i.tiktok || "").toLowerCase().includes(searchQ) ||
      (i.wa || "").includes(searchQ) ||
      (i.boostCode || "").toLowerCase().includes(searchQ) ||
      sowText.includes(searchQ);
    return matchStatus && matchSearch;
  });

  const postedCount = allItems.filter(i => {
    const st = i.status || "";
    if (isAffCmp) {
      return st.startsWith("4 -") || st.startsWith("5 -") || st.startsWith("6 -");
    }
    return st.startsWith("6 -") || st.startsWith("7 -") || st.startsWith("8 -");
  }).length;

  const totalPublish = allItems.reduce((acc, i) => acc + Number(i.publishTotal || 0), 0);
  const totalNett = allItems.reduce((acc, i) => acc + Number(i.nettTotal || 0), 0);

  document.getElementById("sum-kol").textContent = allItems.length;
  document.getElementById("sum-posted").textContent = `${postedCount} / ${allItems.length}`;
  document.getElementById("sum-publish").textContent = formatRp(totalPublish);
  document.getElementById("sum-margin").textContent = formatRp(totalPublish - totalNett);

  if (items.length === 0) {
    const emptyMsg = allItems.length === 0
      ? (isAffCmp
        ? 'Belum ada Affiliate di shortlist campaign ini. Klik "+ Shortlist Affiliate".'
        : 'Belum ada KOL di shortlist campaign ini. Klik "+ Shortlist KOL".')
      : 'Tidak ada kreator yang cocok dengan pencarian/filter.';
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-slate-400">${emptyMsg}</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const st = item.status || sopList[0];
    const isOvertime = !isAffCmp && st.startsWith("5 -");
    const isPayment = (!isAffCmp && st.startsWith("7 -")) || (isAffCmp && st.startsWith("5 -"));
    const rowBg = isOvertime ? "bg-red-50/50" : (isPayment ? "bg-amber-50/40" : "hover:bg-rose-50/30");

    const sowArr = item.sow || [];
    const sowBadges = sowArr.length
      ? sowArr.map(s => `<span class="inline-block w-fit bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">${SOW_LABELS[s] || s}</span>`).join("")
      : (item.sowList || []).map(lbl => `<span class="inline-block w-fit bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">${lbl}</span>`).join("");

    const isBarter = isAffCmp && (item.dealType === "barter" || (Number(item.publishTotal || 0) === 0 && Number(item.nettTotal || 0) === 0));
    const margin = Number(item.publishTotal || 0) - Number(item.nettTotal || 0);

    const statusOptions = sopList.map(optSt =>
      `<option value="${optSt}" ${st === optSt ? "selected" : ""}>${optSt}</option>`
    ).join("");

    const platBadge = item.platform
      ? `<span class="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${item.platform.toLowerCase() === "shopee" ? "bg-orange-100 text-orange-700" : "bg-slate-800 text-white"}">${item.platform}</span>`
      : "";

    return `
      <tr class="${rowBg} transition align-middle">
        <td class="py-3 px-2.5">
          <div class="font-bold text-slate-800 text-xs">${item.kolName}${platBadge}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-[165px]">@${item.ig || item.tiktok || "-"} • ${item.wa || "-"}</div>
          ${item.updatedBy ? `<div class="text-[10px] text-slate-400 truncate max-w-[165px]">By: ${item.updatedBy}</div>` : ""}
        </td>
        <td class="py-3 px-2.5">
          <div class="flex flex-col gap-1">${sowBadges || `<span class="text-slate-400 text-[10px]">-</span>`}</div>
        </td>
        <td class="py-3 px-2.5 text-xs font-bold text-slate-800 whitespace-nowrap">
          ${isBarter
            ? `<span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Barter Sampel (Gratis)</span>`
            : formatRp(item.publishTotal)}
        </td>
        ${isOwner ? `
          <td class="py-3 px-2.5 text-[11px] whitespace-nowrap">
            ${isBarter
              ? `<span class="text-slate-400 italic">Free / Komisi Affiliate</span>`
              : `<div class="text-slate-500">Nett: ${formatRp(item.nettTotal)}</div>
                 <div class="text-emerald-600 font-bold">Margin: ${formatRp(margin)}</div>`}
          </td>
        ` : ""}
        <td class="py-3 px-2.5">
          <select data-kolid="${item.kolId}" class="status-select w-[185px] px-2 py-1.5 rounded-lg border text-[11px] font-semibold outline-none ${
            isOvertime ? "border-red-300 bg-red-50 text-red-700" :
            isPayment ? "border-amber-300 bg-amber-50 text-amber-800" :
            "border-rose-200 bg-white text-slate-700"
          }">
            ${statusOptions}
          </select>
          ${item.paymentStatus === "Paid" ? `<div class="text-[10px] font-bold text-emerald-600 mt-1">✓ Paid (${item.paidBy || "Finance"})</div>` : ""}
        </td>
        <td class="py-3 px-2.5 text-[11px] space-y-0.5">
          ${item.draftLink ? `<a href="${item.draftLink}" target="_blank" class="text-amber-600 underline font-semibold block truncate max-w-[130px]">Cek Draft Video</a>` : ""}
          ${item.postLink
            ? `<a href="${item.postLink}" target="_blank" class="text-rose-600 underline font-semibold block truncate max-w-[130px]">Lihat Konten</a>`
            : `<span class="text-slate-400 italic block">Belum ada link</span>`}
          ${item.boostCode ? `<div class="text-[10px] text-slate-500 truncate max-w-[130px]">Boost: <code class="bg-slate-100 px-1 rounded">${item.boostCode}</code></div>` : ""}
          ${item.insightNote ? `<div class="text-[10px] text-emerald-700 truncate max-w-[140px]" title="${item.insightNote}">📊 ${item.insightNote}</div>` : ""}
        </td>
        <td class="py-3 px-2.5 text-center">
          <div class="flex flex-col sm:flex-row items-center justify-center gap-1">
            <button type="button" data-editsow="${item.kolId}" class="btn-editsow px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-semibold transition">Edit</button>
            <button type="button" data-post="${item.kolId}" class="btn-post px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-semibold transition">Link/Boost</button>
            <button type="button" data-remove="${item.kolId}" class="btn-remove px-2 py-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 text-[11px] font-semibold transition">Hapus</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll(".status-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const kolId = e.target.dataset.kolid;
      const newStatus = e.target.value;
      const cmp = campaigns[activeCampaignId];
      if (!cmp?.items?.[kolId]) return;

      const isNeedsPay = (!isAffCmp && newStatus.startsWith("7 -")) || (isAffCmp && newStatus.startsWith("5 -"));
      const curPayStatus = cmp.items[kolId].paymentStatus;

      const updatedItems = {
        ...cmp.items,
        [kolId]: {
          ...cmp.items[kolId],
          status: newStatus,
          ...(isNeedsPay && curPayStatus === "Barter" ? { paymentStatus: "Unpaid" } : {}),
          updatedBy: user?.name || "Unknown",
          updatedAt: new Date().toISOString()
        }
      };
      updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });
      showToast("Status SOP diperbarui!");
    });
  });

  tbody.querySelectorAll(".btn-editsow").forEach(btn => {
    btn.addEventListener("click", () => {
      const kolId = btn.dataset.editsow;
      const cmp = campaigns[activeCampaignId];
      const item = cmp?.items?.[kolId];
      if (!item) return;

      if ((cmp.type || "kol") === "affiliate") {
        document.getElementById("ea-kol-id").value = kolId;
        document.getElementById("edit-aff-item-name").textContent = `Affiliate: ${item.kolName} (@${item.tiktok || item.ig || "-"})`;
        document.getElementById("ea-package").value = (item.sow && item.sow[0]) || "Vidio";
        const dType = item.dealType || (Number(item.nettTotal || 0) > 0 || Number(item.publishTotal || 0) > 0 ? "paid" : "barter");
        document.getElementById("ea-deal-type").value = dType;
        document.getElementById("ea-nett").value = Number(item.nettTotal || 0);
        document.getElementById("ea-publish").value = Number(item.publishTotal || 0);
        document.getElementById("ea-fee-fields").classList.toggle("hidden", dType !== "paid");
        toggleModal("modal-edit-aff-item", true);
        return;
      }

      document.getElementById("es-kol-id").value = kolId;
      document.getElementById("edit-sow-kol-name").textContent = `Kreator: ${item.kolName} (@${item.ig || item.tiktok || "-"})`;

      const currentSow = item.sow || [];
      document.querySelectorAll(".esow-check").forEach(chk => {
        chk.checked = currentSow.includes(chk.value);
      });

      updateEditSowPreview();
      toggleModal("modal-edit-sow", true);
    });
  });

  tbody.querySelectorAll(".btn-post").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = campaigns[activeCampaignId]?.items?.[btn.dataset.post];
      if (!item) return;
      document.getElementById("p-item-id").value = item.kolId;
      document.getElementById("p-draft-link").value = item.draftLink || "";
      document.getElementById("p-link").value = item.postLink || "";
      document.getElementById("p-boost").value = item.boostCode || "";
      document.getElementById("p-insight").value = item.insightNote || "";
      toggleModal("modal-post", true);
    });
  });

  tbody.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await showConfirm("Keluarkan Kreator?", "Kreator ini akan dihapus dari shortlist campaign ini.", "Ya, Keluarkan");
      if (!ok) return;
      const cmp = campaigns[activeCampaignId];
      if (!cmp?.items) return;
      const updatedItems = { ...cmp.items };
      delete updatedItems[btn.dataset.remove];
      updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });
      showToast("Kreator dikeluarkan dari campaign");
    });
  });
}

function toggleModal(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("hidden", !show);
  el.classList.toggle("flex", show);
}

// Edit SOW KOL
function updateEditSowPreview() {
  const kolId = document.getElementById("es-kol-id").value;
  const item = campaigns[activeCampaignId]?.items?.[kolId];
  const checked = Array.from(document.querySelectorAll(".esow-check:checked")).map(c => c.value);
  const { nettTotal, publishTotal } = computeRatesForSow(kolId, item, checked);

  document.getElementById("es-preview-publish").textContent = formatRp(publishTotal);
  document.getElementById("es-preview-nett").textContent = formatRp(nettTotal);
}

document.getElementById("close-modal-edit-sow")?.addEventListener("click", () => toggleModal("modal-edit-sow", false));
document.getElementById("cancel-modal-edit-sow")?.addEventListener("click", () => toggleModal("modal-edit-sow", false));
document.querySelectorAll(".esow-check").forEach(c => c.addEventListener("change", updateEditSowPreview));

document.getElementById("form-edit-sow")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const kolId = document.getElementById("es-kol-id").value;
  const cmp = campaigns[activeCampaignId];
  const item = cmp?.items?.[kolId];
  if (!item) return;

  const checked = Array.from(document.querySelectorAll(".esow-check:checked")).map(c => c.value);
  if (checked.length === 0) {
    return showAlert("SOW Kosong", "Pilih minimal 1 SOW / Deliverables.", "warning");
  }

  const { nettTotal, publishTotal } = computeRatesForSow(kolId, item, checked);
  const updatedItems = {
    ...cmp.items,
    [kolId]: {
      ...item,
      sow: checked,
      nettTotal,
      publishTotal,
      updatedBy: user?.name || "Unknown",
      updatedAt: new Date().toISOString()
    }
  };
  updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });

  toggleModal("modal-edit-sow", false);
  showToast(`SOW ${item.kolName} diperbarui!`);
});

// Edit Affiliate Item in Campaign
document.getElementById("ea-deal-type")?.addEventListener("change", (e) => {
  const isPaid = e.target.value === "paid";
  document.getElementById("ea-fee-fields").classList.toggle("hidden", !isPaid);
  if (!isPaid) {
    document.getElementById("ea-nett").value = 0;
    document.getElementById("ea-publish").value = 0;
  }
});
document.getElementById("close-modal-edit-aff-item")?.addEventListener("click", () => toggleModal("modal-edit-aff-item", false));
document.getElementById("cancel-modal-edit-aff-item")?.addEventListener("click", () => toggleModal("modal-edit-aff-item", false));

document.getElementById("form-edit-aff-item")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const kolId = document.getElementById("ea-kol-id").value;
  const cmp = campaigns[activeCampaignId];
  const item = cmp?.items?.[kolId];
  if (!item) return;

  const pkg = document.getElementById("ea-package").value;
  const dType = document.getElementById("ea-deal-type").value;
  const nettVal = dType === "paid" ? Number(document.getElementById("ea-nett").value || 0) : 0;
  const pubVal = dType === "paid" ? Number(document.getElementById("ea-publish").value || 0) : 0;

  const updatedItems = {
    ...cmp.items,
    [kolId]: {
      ...item,
      sow: [pkg],
      dealType: dType,
      nettTotal: nettVal,
      publishTotal: pubVal,
      paymentStatus: dType === "paid" ? (item.paymentStatus === "Paid" ? "Paid" : "Unpaid") : "Barter",
      updatedBy: user?.name || "Unknown",
      updatedAt: new Date().toISOString()
    }
  };
  updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });
  toggleModal("modal-edit-aff-item", false);
  showToast(`Data ${item.kolName} diperbarui!`);
});

// Create / Edit Campaign
const closeCmpBtn = document.getElementById("close-modal-campaign");
if (closeCmpBtn) {
  closeCmpBtn.setAttribute("type", "button");
  closeCmpBtn.addEventListener("click", () => toggleModal("modal-campaign", false));
}

function openCreateCampaignModal(defaultType = "kol") {
  document.getElementById("form-campaign").reset();
  document.getElementById("c-edit-id").value = "";
  document.getElementById("c-type").value = defaultType;
  document.getElementById("c-client-pay").value = "Belum";
  document.getElementById("modal-campaign-title").textContent = defaultType === "affiliate"
    ? "Buat Campaign Affiliate Baru"
    : "Buat Campaign KOL Baru";
  document.getElementById("btn-submit-campaign").textContent = "Simpan Campaign";
  document.getElementById("btn-delete-campaign")?.classList.add("hidden");
  toggleModal("modal-campaign", true);
}

document.getElementById("btn-new-campaign-kol")?.addEventListener("click", () => openCreateCampaignModal("kol"));
document.getElementById("btn-new-campaign-aff")?.addEventListener("click", () => openCreateCampaignModal("affiliate"));

document.getElementById("btn-edit-campaign")?.addEventListener("click", () => {
  const active = campaigns[activeCampaignId];
  if (!active) return;
  document.getElementById("c-edit-id").value = active.id;
  document.getElementById("c-type").value = active.type || "kol";
  document.getElementById("c-name").value = active.name || "";
  document.getElementById("c-brand").value = active.brand || active.client || "";
  syncSelectOption(document.getElementById("c-niche"), active.niche || "Beauty");
  syncSelectOption(document.getElementById("c-status"), active.status || "Planning");
  document.getElementById("c-client-pay").value = active.clientPaymentStatus || "Belum";

  document.getElementById("modal-campaign-title").textContent = "Edit Detail & Status Campaign";
  document.getElementById("btn-submit-campaign").textContent = "Simpan Perubahan";
  document.getElementById("btn-delete-campaign")?.classList.remove("hidden");
  toggleModal("modal-campaign", true);
});

document.getElementById("btn-delete-campaign")?.addEventListener("click", async () => {
  const editId = document.getElementById("c-edit-id").value;
  const target = campaigns[editId];
  if (!target) return;
  const ok = await showConfirm("Hapus Campaign?", `Campaign "${target.name}" beserta seluruh shortlist kreator di dalamnya akan dihapus.`, "Ya, Hapus");
  if (!ok) return;

  if (activeCampaignId === editId) activeCampaignId = "";
  removeDemoItem("campaigns", editId);
  toggleModal("modal-campaign", false);
  showToast("Campaign berhasil dihapus!");
});

document.getElementById("cancel-modal-campaign").addEventListener("click", () => toggleModal("modal-campaign", false));

document.getElementById("form-campaign").addEventListener("submit", (e) => {
  e.preventDefault();
  const editId = document.getElementById("c-edit-id").value;
  const now = new Date().toISOString();
  const brandVal = document.getElementById("c-brand").value.trim();
  const cmpType = document.getElementById("c-type").value || "kol";
  const clientPayVal = document.getElementById("c-client-pay").value || "Belum";

  if (editId && campaigns[editId]) {
    updateDemoItem("campaigns", editId, {
      type: cmpType,
      name: document.getElementById("c-name").value.trim(),
      brand: brandVal,
      client: brandVal,
      niche: document.getElementById("c-niche").value,
      status: document.getElementById("c-status").value,
      clientPaymentStatus: clientPayVal,
      updatedBy: user?.name || "Unknown",
      updatedAt: now
    });
    toggleModal("modal-campaign", false);
    showToast("Perubahan campaign berhasil disimpan!");
    return;
  }

  const id = "CMP-" + Date.now().toString().slice(-5);
  const newCmp = {
    id,
    type: cmpType,
    name: document.getElementById("c-name").value.trim(),
    brand: brandVal,
    client: brandVal,
    niche: document.getElementById("c-niche").value,
    pic: user?.name || "PIC",
    status: document.getElementById("c-status").value,
    clientPaymentStatus: clientPayVal,
    createdBy: user?.name || "Unknown",
    updatedBy: user?.name || "Unknown",
    createdAt: now,
    updatedAt: now,
    items: {}
  };

  activeCampaignId = id;
  setDemoItem("campaigns", id, newCmp);
  e.target.reset();
  toggleModal("modal-campaign", false);
  showToast(`Campaign ${cmpType === "affiliate" ? "Affiliate" : "KOL"} berhasil dibuat!`);
});

// Shortlist KOL (from Database KOL)
function getAvailableMasterKols() {
  const existingIds = Object.keys(campaigns[activeCampaignId]?.items || {});
  return masterKols.filter(k => !existingIds.includes(k.id));
}

function updateShortlistPreview() {
  const kolId = sKolIdInput.value;
  const kol = masterKols.find(k => k.id === kolId);
  if (!kol) {
    document.getElementById("s-preview-publish").textContent = "Rp 0";
    document.getElementById("s-preview-nett").textContent = "Rp 0";
    return;
  }

  const checked = Array.from(document.querySelectorAll(".sow-check:checked")).map(c => c.value);
  let nett = 0;
  checked.forEach(s => { nett += Number(kol.rates?.[s] || 0); });
  const pub = calcPublish(nett, kol.markup);

  document.getElementById("s-preview-publish").textContent = formatRp(pub);
  document.getElementById("s-preview-nett").textContent = formatRp(nett);
}

function renderShortlistKolDropdown(query = "") {
  const q = query.trim().toLowerCase();
  const available = getAvailableMasterKols();
  const matches = available.filter(k => {
    if (!q) return true;
    const aliases = (k.aliases || []).join(" ").toLowerCase();
    return (k.name || "").toLowerCase().includes(q) ||
      (k.ig || "").toLowerCase().includes(q) ||
      (k.tiktok || "").toLowerCase().includes(q) ||
      (k.wa || "").includes(q) ||
      aliases.includes(q);
  }).slice(0, 25);

  if (matches.length === 0) {
    sKolDropdown.innerHTML = `<div class="p-3 text-slate-400 text-center">Tidak ada KOL cocok dengan "${query}".</div>`;
  } else {
    sKolDropdown.innerHTML = matches.map(k => `
      <button type="button" data-id="${k.id}" class="opt-s-kol w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center justify-between gap-2 transition">
        <div>
          <div class="font-bold text-slate-800">${k.name} <span class="text-[10px] font-semibold text-rose-500">(${k.niche || "-"})</span></div>
          <div class="text-[11px] text-slate-400">@${k.ig || k.tiktok || "-"} • WA: ${k.wa || "-"}</div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 shrink-0">${k.tier || "-"}</span>
      </button>
    `).join("");
  }
  sKolDropdown.classList.remove("hidden");
}

// Shortlist Affiliate (from Database Affiliate)
function getAvailableMasterAffiliates() {
  const existingIds = Object.keys(campaigns[activeCampaignId]?.items || {});
  return masterAffiliates.filter(a => !existingIds.includes(a.id));
}

function renderShortlistAffDropdown(query = "") {
  const q = query.trim().toLowerCase();
  const available = getAvailableMasterAffiliates();
  const matches = available.filter(a => {
    if (!q) return true;
    return (a.username || "").toLowerCase().includes(q) ||
      (a.platform || "").toLowerCase().includes(q) ||
      (a.niche || "").toLowerCase().includes(q) ||
      (a.contact || "").includes(q);
  }).slice(0, 25);

  if (matches.length === 0) {
    saAffDropdown.innerHTML = `<div class="p-3 text-slate-400 text-center">Tidak ada Affiliate cocok dengan "${query}".</div>`;
  } else {
    saAffDropdown.innerHTML = matches.map(a => `
      <button type="button" data-id="${a.id}" class="opt-sa-aff w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center justify-between gap-2 transition">
        <div>
          <div class="font-bold text-slate-800">${a.username} <span class="text-[10px] font-semibold text-rose-500">(${a.niche || "-"})</span></div>
          <div class="text-[11px] text-slate-400">${a.platform || "Tiktok"} • Kontak: ${a.contact || "-"}</div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shrink-0">${a.package || "Vidio"}</span>
      </button>
    `).join("");
  }
  saAffDropdown.classList.remove("hidden");
}

document.getElementById("btn-add-shortlist").addEventListener("click", () => {
  if (!activeCampaignId) {
    return showAlert("Belum Ada Campaign", "Pilih atau buat campaign terlebih dahulu sebelum menambah shortlist.", "warning");
  }
  const active = campaigns[activeCampaignId];
  const isAff = (active?.type || "kol") === "affiliate";

  if (isAff) {
    const availableAff = getAvailableMasterAffiliates();
    if (availableAff.length === 0) {
      return showAlert("Data Tidak Tersedia", "Semua kreator di Database Affiliate sudah masuk ke campaign ini, atau Database Affiliate masih kosong.", "info");
    }
    const firstAff = availableAff[0];
    saAffIdInput.value = firstAff.id;
    saAffSearchInput.value = `${firstAff.username} (${firstAff.platform || "Tiktok"})`;
    document.getElementById("sa-package").value = (firstAff.package || "").toLowerCase().includes("live") ? "Livestreaming" : "Vidio";
    document.getElementById("sa-deal-type").value = "barter";
    document.getElementById("sa-fee-fields").classList.add("hidden");
    document.getElementById("sa-nett").value = 0;
    document.getElementById("sa-publish").value = 0;
    btnClearSaAff.classList.remove("hidden");
    saAffDropdown.classList.add("hidden");
    toggleModal("modal-shortlist-aff", true);
    return;
  }

  const available = getAvailableMasterKols();
  if (available.length === 0) {
    return showAlert("Data Tidak Tersedia", "Semua KOL di Database KOL sudah masuk ke campaign ini, atau Database KOL masih kosong.", "info");
  }

  const first = available[0];
  sKolIdInput.value = first.id;
  sKolSearchInput.value = `${first.name} (@${first.ig || first.tiktok || "-"})`;
  btnClearSKol.classList.remove("hidden");
  sKolDropdown.classList.add("hidden");

  updateShortlistPreview();
  toggleModal("modal-shortlist", true);
});

// Events for KOL shortlist modal
sKolSearchInput?.addEventListener("focus", () => {
  sKolSearchInput.select();
  renderShortlistKolDropdown("");
});
sKolSearchInput?.addEventListener("input", () => {
  btnClearSKol.classList.toggle("hidden", !sKolSearchInput.value);
  sKolIdInput.value = "";
  updateShortlistPreview();
  renderShortlistKolDropdown(sKolSearchInput.value);
});
btnClearSKol?.addEventListener("click", () => {
  sKolSearchInput.value = "";
  sKolIdInput.value = "";
  btnClearSKol.classList.add("hidden");
  updateShortlistPreview();
  sKolSearchInput.focus();
  renderShortlistKolDropdown("");
});
sKolDropdown?.addEventListener("click", (e) => {
  const opt = e.target.closest(".opt-s-kol");
  if (!opt) return;
  const selected = masterKols.find(k => k.id === opt.dataset.id);
  if (!selected) return;
  sKolIdInput.value = selected.id;
  sKolSearchInput.value = `${selected.name} (@${selected.ig || selected.tiktok || "-"})`;
  btnClearSKol.classList.remove("hidden");
  sKolDropdown.classList.add("hidden");
  updateShortlistPreview();
});

const closeShortlistBtn = document.getElementById("close-modal-shortlist");
if (closeShortlistBtn) {
  closeShortlistBtn.setAttribute("type", "button");
  closeShortlistBtn.addEventListener("click", () => toggleModal("modal-shortlist", false));
}
document.getElementById("cancel-modal-shortlist").addEventListener("click", () => toggleModal("modal-shortlist", false));
document.querySelectorAll(".sow-check").forEach(c => c.addEventListener("change", updateShortlistPreview));

document.getElementById("form-shortlist").addEventListener("submit", (e) => {
  e.preventDefault();
  const kolId = sKolIdInput.value;
  const kol = masterKols.find(k => k.id === kolId);
  if (!kol) {
    return showAlert("KOL Belum Dipilih", "Ketik dan pilih salah satu KOL dari daftar terlebih dahulu.", "warning");
  }
  const checked = Array.from(document.querySelectorAll(".sow-check:checked")).map(c => c.value);
  if (checked.length === 0) {
    return showAlert("SOW Kosong", "Pilih minimal 1 SOW / Deliverables.", "warning");
  }

  let nettTotal = 0;
  checked.forEach(s => { nettTotal += Number(kol.rates?.[s] || 0); });
  const publishTotal = calcPublish(nettTotal, kol.markup);

  const itemData = {
    kolId: kol.id,
    kolName: kol.name,
    ig: kol.ig || "",
    tiktok: kol.tiktok || "",
    wa: kol.wa || "",
    sow: checked,
    nettTotal,
    publishTotal,
    dealType: "paid",
    status: "1 - Sudah di Reach Out",
    postLink: "",
    boostCode: "",
    paymentStatus: "Unpaid",
    addedBy: user?.name || "Unknown",
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  };

  const cmp = campaigns[activeCampaignId];
  const updatedItems = { ...(cmp?.items || {}), [kol.id]: itemData };
  updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });

  toggleModal("modal-shortlist", false);
  showToast(`${kol.name} ditambahkan ke campaign!`);
});

// Events for Affiliate shortlist modal
saAffSearchInput?.addEventListener("focus", () => {
  saAffSearchInput.select();
  renderShortlistAffDropdown("");
});
saAffSearchInput?.addEventListener("input", () => {
  btnClearSaAff.classList.toggle("hidden", !saAffSearchInput.value);
  saAffIdInput.value = "";
  renderShortlistAffDropdown(saAffSearchInput.value);
});
btnClearSaAff?.addEventListener("click", () => {
  saAffSearchInput.value = "";
  saAffIdInput.value = "";
  btnClearSaAff.classList.add("hidden");
  saAffSearchInput.focus();
  renderShortlistAffDropdown("");
});
saAffDropdown?.addEventListener("click", (e) => {
  const opt = e.target.closest(".opt-sa-aff");
  if (!opt) return;
  const selected = masterAffiliates.find(a => a.id === opt.dataset.id);
  if (!selected) return;
  saAffIdInput.value = selected.id;
  saAffSearchInput.value = `${selected.username} (${selected.platform || "Tiktok"})`;
  document.getElementById("sa-package").value = (selected.package || "").toLowerCase().includes("live") ? "Livestreaming" : "Vidio";
  btnClearSaAff.classList.remove("hidden");
  saAffDropdown.classList.add("hidden");
});

document.getElementById("sa-deal-type")?.addEventListener("change", (e) => {
  const isPaid = e.target.value === "paid";
  document.getElementById("sa-fee-fields").classList.toggle("hidden", !isPaid);
  if (!isPaid) {
    document.getElementById("sa-nett").value = 0;
    document.getElementById("sa-publish").value = 0;
  }
});

document.getElementById("close-modal-shortlist-aff")?.addEventListener("click", () => toggleModal("modal-shortlist-aff", false));
document.getElementById("cancel-modal-shortlist-aff")?.addEventListener("click", () => toggleModal("modal-shortlist-aff", false));

document.getElementById("form-shortlist-aff")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const affId = saAffIdInput.value;
  const aff = masterAffiliates.find(a => a.id === affId);
  if (!aff) {
    return showAlert("Affiliate Belum Dipilih", "Ketik dan pilih salah satu kreator dari Database Affiliate.", "warning");
  }

  const pkg = document.getElementById("sa-package").value || "Vidio";
  const dealType = document.getElementById("sa-deal-type").value || "barter";
  const nettTotal = dealType === "paid" ? Number(document.getElementById("sa-nett").value || 0) : 0;
  const publishTotal = dealType === "paid" ? Number(document.getElementById("sa-publish").value || 0) : 0;

  const itemData = {
    kolId: aff.id,
    kolName: aff.username,
    platform: aff.platform || "Tiktok",
    ig: "",
    tiktok: aff.username,
    wa: aff.contact || "",
    sow: [pkg],
    dealType,
    nettTotal,
    publishTotal,
    status: "1 - Sudah di Reach Out",
    postLink: "",
    boostCode: "",
    paymentStatus: dealType === "paid" ? "Unpaid" : "Barter",
    addedBy: user?.name || "Unknown",
    updatedBy: user?.name || "Unknown",
    updatedAt: new Date().toISOString()
  };

  const cmp = campaigns[activeCampaignId];
  const updatedItems = { ...(cmp?.items || {}), [aff.id]: itemData };
  updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });

  toggleModal("modal-shortlist-aff", false);
  showToast(`${aff.username} ditambahkan ke campaign affiliate!`);
});

// Post Link / Draft / Boost modal
const closePostBtn = document.getElementById("close-modal-post");
if (closePostBtn) {
  closePostBtn.setAttribute("type", "button");
  closePostBtn.addEventListener("click", () => toggleModal("modal-post", false));
}
document.getElementById("cancel-modal-post").addEventListener("click", () => toggleModal("modal-post", false));

document.getElementById("form-post").addEventListener("submit", (e) => {
  e.preventDefault();
  const kolId = document.getElementById("p-item-id").value;
  const draftLink = document.getElementById("p-draft-link").value.trim();
  const postLink = document.getElementById("p-link").value.trim();
  const boostCode = document.getElementById("p-boost").value.trim();
  const insightNote = document.getElementById("p-insight").value.trim();
  const now = new Date().toISOString();

  const cmp = campaigns[activeCampaignId];
  const existingItem = cmp?.items?.[kolId];
  if (!existingItem) return;

  const isAffCmp = (cmp.type || "kol") === "affiliate";
  const updatedItem = {
    ...existingItem,
    draftLink,
    postLink,
    boostCode,
    insightNote,
    updatedBy: user?.name || "Unknown",
    updatedAt: now
  };
  if (postLink) {
    updatedItem.status = isAffCmp ? "4 - Posting" : "6 - Sudah Post Content";
  }

  updateDemoItem("campaigns", activeCampaignId, {
    items: { ...cmp.items, [kolId]: updatedItem }
  });

  toggleModal("modal-post", false);
  showToast("Draft, link konten & insight disimpan!");
});

// Export Proposal
document.getElementById("btn-export-proposal").addEventListener("click", () => {
  const active = campaigns[activeCampaignId];
  if (!active) return showAlert("Belum Ada Campaign", "Pilih atau buat campaign terlebih dahulu.", "warning");
  const items = Object.values(active.items || {});
  if (items.length === 0) return showAlert("Shortlist Kosong", "Tambahkan minimal 1 kreator sebelum export proposal.", "warning");

  const isAffCmp = (active.type || "kol") === "affiliate";
  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const totalPublish = items.reduce((acc, i) => acc + Number(i.publishTotal || 0), 0);
  const brandName = active.brand || active.client || "-";

  const sheetData = [
    [isAffCmp ? "PROPOSAL AFFILIATE CAMPAIGN" : "PROPOSAL KOL CAMPAIGN"],
    ["Campaign", active.name],
    ["Brand / Klien", brandName],
    ["Niche", active.niche || "-"],
    ["Status Pembayaran Klien", active.clientPaymentStatus || "Belum"],
    ["Tanggal Export", today],
    [],
    ["No", "Nama Kreator", "Platform / IG", "TikTok", "Deliverables (SOW / Package)", "Publish Rate (IDR)", "Status"]
  ];

  items.forEach((item, idx) => {
    sheetData.push([
      idx + 1,
      item.kolName,
      item.platform || (item.ig ? `@${item.ig}` : "-"),
      item.tiktok ? `@${item.tiktok}` : "-",
      (item.sow || []).map(s => SOW_LABELS[s] || s).join(" + ") || (item.sowList || []).join(" + "),
      Number(item.publishTotal || 0),
      item.status
    ]);
  });

  const startDataRow = 9;
  const endDataRow = startDataRow + items.length - 1;
  sheetData.push([
    "",
    "",
    "",
    "",
    "TOTAL ESTIMASI",
    { f: `SUM(F${startDataRow}:F${endDataRow})`, v: totalPublish },
    ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  for (let r = startDataRow; r <= endDataRow + 1; r++) {
    const cellRef = `F${r}`;
    if (ws[cellRef]) ws[cellRef].z = '#,##0';
  }

  ws["!cols"] = [
    { wch: 5 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 },
    { wch: 20 },
    { wch: 28 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, isAffCmp ? "Proposal Affiliate" : "Proposal KOL");

  const safeName = brandName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `Proposal_${safeName}.xlsx`);
  showToast("File Proposal .xlsx berhasil diunduh!");
});

cmpSearchInput?.addEventListener("focus", () => {
  cmpSearchInput.select();
  renderCampaignDropdown("");
});

cmpSearchInput?.addEventListener("input", () => {
  btnClearCmpSearch?.classList.toggle("hidden", !cmpSearchInput.value);
  renderCampaignDropdown(cmpSearchInput.value);
});

btnClearCmpSearch?.addEventListener("click", () => {
  if (!cmpSearchInput) return;
  cmpSearchInput.value = "";
  activeCampaignId = "";
  btnClearCmpSearch.classList.add("hidden");
  populateCampaignSelector();
  renderTrackingTable();
  cmpSearchInput.focus();
  renderCampaignDropdown("");
});

cmpDropdown?.addEventListener("click", (e) => {
  const opt = e.target.closest(".opt-cmp");
  if (!opt) return;
  activeCampaignId = opt.dataset.id;
  filterStatusEl.value = "";
  cmpDropdown.classList.add("hidden");
  populateCampaignSelector();
  renderTrackingTable();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#campaign-search-input") && !e.target.closest("#campaign-search-dropdown") && !e.target.closest("#btn-clear-campaign-search")) {
    cmpDropdown?.classList.add("hidden");
    populateCampaignSelector();
  }
  if (!e.target.closest("#s-kol-search") && !e.target.closest("#s-kol-dropdown") && !e.target.closest("#btn-clear-s-kol")) {
    sKolDropdown?.classList.add("hidden");
  }
  if (!e.target.closest("#sa-aff-search") && !e.target.closest("#sa-aff-dropdown") && !e.target.closest("#btn-clear-sa-aff")) {
    saAffDropdown?.classList.add("hidden");
  }
});

filterStatusEl.addEventListener("change", renderTrackingTable);
searchKolEl?.addEventListener("input", renderTrackingTable);

initData();
