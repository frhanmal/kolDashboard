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

const SOP_STATUSES = [
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

const SOW_LABELS = {
  story: "IG Story",
  reels: "IG Reels",
  tiktok: "TikTok Video",
  kuning: "Keranjang Kuning",
  boost: "Boost Code",
  visit: "Visit"
};

const filterStatusEl = document.getElementById("filter-status");
const searchKolEl = document.getElementById("search-campaign-kol");
SOP_STATUSES.forEach(st => {
  const opt = document.createElement("option");
  opt.value = st;
  opt.textContent = st;
  filterStatusEl.appendChild(opt);
});

const cmpSearchInput = document.getElementById("campaign-search-input");
const cmpDropdown = document.getElementById("campaign-search-dropdown");
const btnClearCmpSearch = document.getElementById("btn-clear-campaign-search");

const sKolSearchInput = document.getElementById("s-kol-search");
const sKolDropdown = document.getElementById("s-kol-dropdown");
const sKolIdInput = document.getElementById("s-kol-id");
const btnClearSKol = document.getElementById("btn-clear-s-kol");

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
    <p class="text-xs text-slate-500 max-w-md mx-auto">Klik kotak <strong>Pilih Campaign</strong> di atas lalu pilih atau ketik nama campaign untuk menampilkan ringkasan dan tabel tracking KOL.</p>
  `;
  tableCardEl.parentNode.insertBefore(emptyPlaceholderEl, tableCardEl);
  if (window.lucide) window.lucide.createIcons();
}

let masterKols = [];
let campaigns = {};
let activeCampaignId = "";

function formatRp(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function calcPublish(nett, markup) {
  return Math.round(Number(nett || 0) * (1 + Number(markup || 0) / 100));
}

function initData() {
  subscribeDemoCollection("master_kol", (data) => {
    masterKols = Object.values(data || {});
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

function populateCampaignSelector() {
  const list = Object.values(campaigns);
  const statusWrap = document.getElementById("campaign-status-wrap");
  const statusSelect = document.getElementById("active-campaign-status");
  const editCmpBtn = document.getElementById("btn-edit-campaign");

  if (list.length === 0) {
    activeCampaignId = "";
    if (cmpSearchInput) cmpSearchInput.value = "";
    statusWrap?.classList.add("hidden");
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
    statusWrap?.classList.remove("hidden");
    editCmpBtn?.classList.remove("hidden");
    const st = active.status || "Planning";
    syncSelectOption(statusSelect, st);
    if (statusSelect) {
      statusSelect.className = `px-2.5 py-1.5 rounded-xl border text-xs font-bold focus:bg-white focus:ring-2 focus:ring-rose-400 outline-none cursor-pointer transition ${getCampaignStatusBadgeClass(st)}`;
    }
    document.getElementById("campaign-meta").textContent = `Niche: ${active.niche || "-"} • PIC: ${active.pic || "-"}`;
  } else {
    statusWrap?.classList.add("hidden");
    editCmpBtn?.classList.add("hidden");
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

function renderCampaignDropdown(query = "") {
  if (!cmpDropdown) return;
  const q = query.trim().toLowerCase();
  const list = Object.values(campaigns);
  const matches = list.filter(c => {
    if (!q) return true;
    const brandName = c.brand || c.client || "";
    return (c.name || "").toLowerCase().includes(q) ||
      brandName.toLowerCase().includes(q) ||
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
      return `
        <button type="button" data-id="${c.id}" class="opt-cmp w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center justify-between gap-2 transition ${isSelected ? "bg-rose-50/70" : ""}">
          <div class="min-w-0">
            <div class="font-bold text-slate-800 truncate">${c.name}</div>
            <div class="text-[11px] text-slate-400 truncate">Brand: ${brandName} • Niche: ${c.niche || "-"}</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCampaignStatusBadgeClass(st)} max-w-[130px] truncate">${st}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-600"}">
              ${isSelected ? "Aktif" : "Pilih"}
            </span>
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

  const allItems = Object.values(active.items || {});
  const filterSt = filterStatusEl.value;
  const searchQ = (searchKolEl?.value || "").trim().toLowerCase();

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

  const postedCount = allItems.filter(i => (i.status || "").startsWith("6 -") || (i.status || "").startsWith("7 -") || (i.status || "").startsWith("8 -")).length;
  const totalPublish = allItems.reduce((acc, i) => acc + Number(i.publishTotal || 0), 0);
  const totalNett = allItems.reduce((acc, i) => acc + Number(i.nettTotal || 0), 0);

  document.getElementById("sum-kol").textContent = allItems.length;
  document.getElementById("sum-posted").textContent = `${postedCount} / ${allItems.length}`;
  document.getElementById("sum-publish").textContent = formatRp(totalPublish);
  document.getElementById("sum-margin").textContent = formatRp(totalPublish - totalNett);

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-slate-400">${allItems.length === 0 ? 'Belum ada KOL di shortlist campaign ini. Klik "+ Shortlist KOL".' : 'Tidak ada kreator yang cocok dengan pencarian/filter.'}</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(item => {
    const st = item.status || "1 - Sudah di Reach Out";
    const isOvertime = st.startsWith("5 -");
    const isPayment = st.startsWith("7 -");
    const rowBg = isOvertime ? "bg-red-50/50" : (isPayment ? "bg-amber-50/40" : "hover:bg-rose-50/30");

    const sowArr = item.sow || [];
    const sowBadges = sowArr.length
      ? sowArr.map(s => `<span class="inline-block w-fit bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">${SOW_LABELS[s] || s}</span>`).join("")
      : (item.sowList || []).map(lbl => `<span class="inline-block w-fit bg-rose-50 text-rose-600 text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">${lbl}</span>`).join("");

    const margin = Number(item.publishTotal || 0) - Number(item.nettTotal || 0);

    const statusOptions = SOP_STATUSES.map(optSt =>
      `<option value="${optSt}" ${st === optSt ? "selected" : ""}>${optSt}</option>`
    ).join("");

    return `
      <tr class="${rowBg} transition align-middle">
        <td class="py-3 px-2.5">
          <div class="font-bold text-slate-800 text-xs">${item.kolName}</div>
          <div class="text-[10px] text-slate-400 truncate max-w-[155px]">@${item.ig || item.tiktok || "-"} • ${item.wa || "-"}</div>
          ${item.updatedBy ? `<div class="text-[10px] text-slate-400 truncate max-w-[155px]">By: ${item.updatedBy}</div>` : ""}
        </td>
        <td class="py-3 px-2.5">
          <div class="flex flex-col gap-1">${sowBadges || `<span class="text-slate-400 text-[10px]">-</span>`}</div>
        </td>
        <td class="py-3 px-2.5 text-xs font-bold text-slate-800 whitespace-nowrap">${formatRp(item.publishTotal)}</td>
        ${isOwner ? `
          <td class="py-3 px-2.5 text-[11px] whitespace-nowrap">
            <div class="text-slate-500">Nett: ${formatRp(item.nettTotal)}</div>
            <div class="text-emerald-600 font-bold">Margin: ${formatRp(margin)}</div>
          </td>
        ` : ""}
        <td class="py-3 px-2.5">
          <select data-kolid="${item.kolId}" class="status-select w-[170px] px-2 py-1.5 rounded-lg border text-[11px] font-semibold outline-none ${
            isOvertime ? "border-red-300 bg-red-50 text-red-700" :
            isPayment ? "border-amber-300 bg-amber-50 text-amber-800" :
            "border-rose-200 bg-white text-slate-700"
          }">
            ${statusOptions}
          </select>
          ${item.paymentStatus === "Paid" ? `<div class="text-[10px] font-bold text-emerald-600 mt-1">✓ Paid (${item.paidBy || "Finance"})</div>` : ""}
        </td>
        <td class="py-3 px-2.5 text-[11px]">
          ${item.postLink
            ? `<a href="${item.postLink}" target="_blank" class="text-rose-600 underline font-semibold block truncate max-w-[120px]">Lihat Konten</a>`
            : `<span class="text-slate-400 italic">Belum ada link</span>`}
          ${item.boostCode ? `<div class="text-[10px] text-slate-500 truncate max-w-[120px] mt-0.5">Boost: <code class="bg-slate-100 px-1 rounded">${item.boostCode}</code></div>` : ""}
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

      const updatedItems = {
        ...cmp.items,
        [kolId]: {
          ...cmp.items[kolId],
          status: newStatus,
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
      const item = campaigns[activeCampaignId]?.items?.[kolId];
      if (!item) return;

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
      document.getElementById("p-link").value = item.postLink || "";
      document.getElementById("p-boost").value = item.boostCode || "";
      toggleModal("modal-post", true);
    });
  });

  tbody.querySelectorAll(".btn-remove").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await showConfirm("Keluarkan KOL?", "KOL ini akan dihapus dari shortlist campaign ini.", "Ya, Keluarkan");
      if (!ok) return;
      const cmp = campaigns[activeCampaignId];
      if (!cmp?.items) return;
      const updatedItems = { ...cmp.items };
      delete updatedItems[btn.dataset.remove];
      updateDemoItem("campaigns", activeCampaignId, { items: updatedItems });
      showToast("KOL dikeluarkan dari campaign");
    });
  });
}

function toggleModal(id, show) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("hidden", !show);
  el.classList.toggle("flex", show);
}

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

const closeCmpBtn = document.getElementById("close-modal-campaign");
if (closeCmpBtn) {
  closeCmpBtn.setAttribute("type", "button");
  closeCmpBtn.addEventListener("click", () => toggleModal("modal-campaign", false));
}

document.getElementById("btn-new-campaign").addEventListener("click", () => {
  document.getElementById("form-campaign").reset();
  document.getElementById("c-edit-id").value = "";
  document.getElementById("modal-campaign-title").textContent = "Buat Campaign Baru";
  document.getElementById("btn-submit-campaign").textContent = "Simpan Campaign";
  document.getElementById("btn-delete-campaign")?.classList.add("hidden");
  toggleModal("modal-campaign", true);
});

document.getElementById("btn-edit-campaign")?.addEventListener("click", () => {
  const active = campaigns[activeCampaignId];
  if (!active) return;
  document.getElementById("c-edit-id").value = active.id;
  document.getElementById("c-name").value = active.name || "";
  document.getElementById("c-brand").value = active.brand || active.client || "";
  syncSelectOption(document.getElementById("c-niche"), active.niche || "Beauty");
  syncSelectOption(document.getElementById("c-status"), active.status || "Planning");

  document.getElementById("modal-campaign-title").textContent = "Edit Detail & Status Campaign";
  document.getElementById("btn-submit-campaign").textContent = "Simpan Perubahan";
  document.getElementById("btn-delete-campaign")?.classList.remove("hidden");
  toggleModal("modal-campaign", true);
});

document.getElementById("btn-delete-campaign")?.addEventListener("click", async () => {
  const editId = document.getElementById("c-edit-id").value;
  const target = campaigns[editId];
  if (!target) return;
  const ok = await showConfirm("Hapus Campaign?", `Campaign "${target.name}" beserta seluruh shortlist KOL di dalamnya akan dihapus.`, "Ya, Hapus");
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

  if (editId && campaigns[editId]) {
    updateDemoItem("campaigns", editId, {
      name: document.getElementById("c-name").value.trim(),
      brand: brandVal,
      client: brandVal,
      niche: document.getElementById("c-niche").value,
      status: document.getElementById("c-status").value,
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
    name: document.getElementById("c-name").value.trim(),
    brand: brandVal,
    client: brandVal,
    niche: document.getElementById("c-niche").value,
    pic: user?.name || "PIC",
    status: document.getElementById("c-status").value,
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
  showToast("Campaign baru berhasil dibuat!");
});

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

document.getElementById("btn-add-shortlist").addEventListener("click", () => {
  if (!activeCampaignId) {
    return showAlert("Belum Ada Campaign", "Pilih atau buat campaign terlebih dahulu sebelum menambah shortlist.", "warning");
  }
  const available = getAvailableMasterKols();
  if (available.length === 0) {
    return showAlert("Data Tidak Tersedia", "Semua KOL di Master sudah masuk ke campaign ini, atau Master KOL masih kosong.", "info");
  }

  const first = available[0];
  sKolIdInput.value = first.id;
  sKolSearchInput.value = `${first.name} (@${first.ig || first.tiktok || "-"})`;
  btnClearSKol.classList.remove("hidden");
  sKolDropdown.classList.add("hidden");

  updateShortlistPreview();
  toggleModal("modal-shortlist", true);
});

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

const closePostBtn = document.getElementById("close-modal-post");
if (closePostBtn) {
  closePostBtn.setAttribute("type", "button");
  closePostBtn.addEventListener("click", () => toggleModal("modal-post", false));
}
document.getElementById("cancel-modal-post").addEventListener("click", () => toggleModal("modal-post", false));

document.getElementById("form-post").addEventListener("submit", (e) => {
  e.preventDefault();
  const kolId = document.getElementById("p-item-id").value;
  const postLink = document.getElementById("p-link").value.trim();
  const boostCode = document.getElementById("p-boost").value.trim();
  const now = new Date().toISOString();

  const cmp = campaigns[activeCampaignId];
  const existingItem = cmp?.items?.[kolId];
  if (!existingItem) return;

  const updatedItem = {
    ...existingItem,
    postLink,
    boostCode,
    updatedBy: user?.name || "Unknown",
    updatedAt: now
  };
  if (postLink) updatedItem.status = "6 - Sudah Post Content";

  updateDemoItem("campaigns", activeCampaignId, {
    items: { ...cmp.items, [kolId]: updatedItem }
  });

  toggleModal("modal-post", false);
  showToast("Link konten & boost code disimpan!");
});

document.getElementById("btn-export-proposal").addEventListener("click", () => {
  const active = campaigns[activeCampaignId];
  if (!active) return showAlert("Belum Ada Campaign", "Pilih atau buat campaign terlebih dahulu.", "warning");
  const items = Object.values(active.items || {});
  if (items.length === 0) return showAlert("Shortlist Kosong", "Tambahkan minimal 1 KOL sebelum export proposal.", "warning");

  const today = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const totalPublish = items.reduce((acc, i) => acc + Number(i.publishTotal || 0), 0);
  const brandName = active.brand || active.client || "-";

  const sheetData = [
    ["PROPOSAL KOL CAMPAIGN"],
    ["Campaign", active.name],
    ["Brand / Klien", brandName],
    ["Niche", active.niche || "-"],
    ["Tanggal Export", today],
    [],
    ["No", "Nama KOL", "Instagram", "TikTok", "Deliverables (SOW)", "Publish Rate (IDR)", "Status"]
  ];

  items.forEach((item, idx) => {
    sheetData.push([
      idx + 1,
      item.kolName,
      item.ig ? `@${item.ig}` : "-",
      item.tiktok ? `@${item.tiktok}` : "-",
      (item.sow || []).map(s => SOW_LABELS[s] || s).join(" + ") || (item.sowList || []).join(" + "),
      Number(item.publishTotal || 0),
      item.status
    ]);
  });

  const startDataRow = 8;
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
  XLSX.utils.book_append_sheet(wb, ws, "Proposal KOL");

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
});

filterStatusEl.addEventListener("change", renderTrackingTable);
searchKolEl?.addEventListener("input", renderTrackingTable);

initData();
