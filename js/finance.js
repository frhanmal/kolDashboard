import {
  initPageLayout, showAlert, showConfirm, showToast,
  subscribeDemoCollection, updateDemoItem
} from "./auth.js";

const currentUser = initPageLayout("finance", ["owner", "finance"]);

let campaigns = {};
let paymentRows = [];
let activeTab = "Unpaid";

function formatRp(num) {
  return "Rp " + Number(num || 0).toLocaleString("id-ID");
}

function compressImage(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadFinanceData() {
  subscribeDemoCollection("campaigns", (data) => {
    campaigns = data || {};
    extractPaymentQueue();
    renderFinanceTable();
  });
}

function extractPaymentQueue() {
  paymentRows = [];
  Object.values(campaigns || {}).forEach(cmp => {
    Object.values(cmp.items || {}).forEach(item => {
      if ((item.status || "").startsWith("7 -") || item.paymentStatus === "Paid") {
        paymentRows.push({
          campaignId: cmp.id,
          campaignName: cmp.name,
          brand: cmp.brand || cmp.client || "-",
          ...item,
          paymentStatus: item.paymentStatus || "Unpaid"
        });
      }
    });
  });

  const unpaid = paymentRows.filter(r => r.paymentStatus !== "Paid");
  const paid = paymentRows.filter(r => r.paymentStatus === "Paid");

  const unpaidSum = unpaid.reduce((a, b) => a + Number(b.nettTotal || 0), 0);
  const paidSum = paid.reduce((a, b) => a + Number(b.nettTotal || 0), 0);

  document.getElementById("fin-unpaid-total").textContent = formatRp(unpaidSum);
  document.getElementById("fin-unpaid-count").textContent = `${unpaid.length} KOL menunggu transfer`;
  document.getElementById("fin-paid-total").textContent = formatRp(paidSum);
  document.getElementById("fin-paid-count").textContent = `${paid.length} KOL selesai dibayar`;
}

function openProofModalWithTarget(target) {
  const modalProof = document.getElementById("modal-proof-preview");
  const imgEl = document.getElementById("proof-modal-img");
  const dlBtn = document.getElementById("proof-modal-download");

  document.getElementById("proof-modal-title").textContent = `Bukti Transfer — ${target.kolName}`;
  document.getElementById("proof-modal-subtitle").textContent = `${target.paymentNote || "-"} • ${formatRp(target.nettTotal)}`;

  if (target.paymentProof && target.paymentProof.startsWith("data:image")) {
    imgEl.src = target.paymentProof;
    imgEl.classList.remove("hidden");
    dlBtn.href = target.paymentProof;
    dlBtn.download = `Bukti_TF_${(target.kolName || "KOL").replace(/\s+/g, "_")}.jpg`;
    dlBtn.classList.remove("hidden");
  } else {
    imgEl.src = "";
    imgEl.classList.add("hidden");
    dlBtn.classList.add("hidden");
    showAlert(
      "Foto Bukti TF Belum Ada",
      "Transaksi ini belum memiliki foto bukti transfer. Klik 'Batal Paid' lalu klik 'Proses Bayar' untuk mengunggah foto.",
      "info"
    );
    return;
  }

  modalProof.classList.remove("hidden");
  modalProof.classList.add("flex");
  if (window.lucide) window.lucide.createIcons();
}

function renderFinanceTable() {
  const tbody = document.getElementById("finance-table-body");
  const filtered = activeTab === "All"
    ? paymentRows
    : paymentRows.filter(r => r.paymentStatus === activeTab);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-10 text-center text-slate-400">Tidak ada data pada tab <strong>${activeTab}</strong>. Ubah status KOL ke "7 - Butuh Payment" di menu Campaign untuk memunculkannya di sini.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(row => {
    const isPaid = row.paymentStatus === "Paid";
    const hasPhoto = Boolean(row.paymentProof && row.paymentProof.startsWith("data:image"));

    return `
      <tr class="hover:bg-rose-50/30 transition">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800">${row.campaignName}</div>
          <div class="text-[11px] text-slate-400">${row.brand}</div>
        </td>
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800">${row.kolName}</div>
          <div class="text-[11px] text-slate-400">@${row.ig || row.tiktok || "-"} • WA: ${row.wa || "-"}</div>
        </td>
        <td class="py-3.5 px-4 text-xs">
          ${row.postLink
            ? `<a href="${row.postLink}" target="_blank" class="text-rose-600 underline font-semibold">Cek Konten</a>`
            : `<span class="text-amber-600 font-medium">Belum ada link</span>`}
        </td>
        <td class="py-3.5 px-4 font-extrabold text-slate-800">${formatRp(row.nettTotal)}</td>
        <td class="py-3.5 px-4 text-xs">
          ${isPaid
            ? `<span class="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[11px]">✓ PAID</span>
               <div class="text-[11px] text-slate-500 mt-1">${row.paymentNote || "-"}</div>
               <div class="text-[10px] text-slate-400">Diproses oleh: ${row.paidBy || row.updatedBy || "-"}</div>
               <button type="button" data-cmp="${row.campaignId}" data-kol="${row.kolId}" class="btn-view-proof mt-1 inline-flex items-center gap-1 text-[11px] ${hasPhoto ? "text-rose-600 hover:text-rose-700 font-semibold" : "text-slate-400 hover:text-rose-600"} underline cursor-pointer">
                 ${hasPhoto ? "Lihat Foto Bukti TF" : "Foto Bukti TF (Kosong)"}
               </button>`
            : `<span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold text-[11px]">⏳ UNPAID</span>
               <div class="text-[10px] text-slate-400 mt-1">Diajukan oleh: ${row.updatedBy || "-"}</div>`
          }
        </td>
        <td class="py-3.5 px-4 text-right">
          ${!isPaid
            ? `<button type="button" data-cmp="${row.campaignId}" data-kol="${row.kolId}" class="btn-pay px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition">Proses Bayar</button>`
            : `<button type="button" data-cmp="${row.campaignId}" data-kol="${row.kolId}" class="btn-undo px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 text-xs font-semibold transition">Batal Paid</button>`
          }
        </td>
      </tr>
    `;
  }).join("");
}

document.getElementById("finance-table-body").addEventListener("click", async (e) => {
  const proofBtn = e.target.closest(".btn-view-proof");
  if (proofBtn) {
    e.preventDefault();
    e.stopPropagation();
    const target = paymentRows.find(r => r.campaignId === proofBtn.dataset.cmp && r.kolId === proofBtn.dataset.kol);
    if (target) openProofModalWithTarget(target);
    return;
  }

  const payBtn = e.target.closest(".btn-pay");
  if (payBtn) {
    const target = paymentRows.find(r => r.campaignId === payBtn.dataset.cmp && r.kolId === payBtn.dataset.kol);
    if (!target) return;
    document.getElementById("pay-cmp-id").value = target.campaignId;
    document.getElementById("pay-kol-id").value = target.kolId;
    document.getElementById("pay-subtitle").textContent = `${target.kolName} — ${target.campaignName}`;
    document.getElementById("pay-amount").textContent = formatRp(target.nettTotal);
    document.getElementById("pay-note").value = target.paymentNote || "";
    document.getElementById("pay-proof-file").value = "";

    const proofDataEl = document.getElementById("pay-proof-data");
    const previewBox = document.getElementById("pay-proof-preview-box");
    const previewImg = document.getElementById("pay-proof-preview");

    if (target.paymentProof && target.paymentProof.startsWith("data:image")) {
      proofDataEl.value = target.paymentProof;
      previewImg.src = target.paymentProof;
      previewBox.classList.remove("hidden");
    } else {
      proofDataEl.value = "";
      previewImg.src = "";
      previewBox.classList.add("hidden");
    }
    togglePayModal(true);
    return;
  }

  const undoBtn = e.target.closest(".btn-undo");
  if (undoBtn) {
    const ok = await showConfirm("Batalkan Status Paid?", "Status pembayaran akan dikembalikan menjadi Unpaid.", "Ya, Kembalikan");
    if (!ok) return;

    updatePaymentStatus(undoBtn.dataset.cmp, undoBtn.dataset.kol, {
      paymentStatus: "Unpaid",
      paidAt: "",
      paidBy: "",
      updatedBy: currentUser?.name || "Finance",
      updatedAt: new Date().toISOString()
    });
    showToast("Status dikembalikan ke Unpaid", "info");
  }
});

document.getElementById("pay-proof-file")?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    e.target.value = "";
    return showAlert("File Tidak Valid", "Pilih file berupa gambar (JPG, PNG, WebP).", "warning");
  }
  try {
    const compressed = await compressImage(file);
    document.getElementById("pay-proof-data").value = compressed;
    document.getElementById("pay-proof-preview").src = compressed;
    document.getElementById("pay-proof-preview-box").classList.remove("hidden");
  } catch (err) {
    showAlert("Gagal Memproses Foto", err.message, "error");
  }
});

document.getElementById("btn-clear-proof")?.addEventListener("click", () => {
  document.getElementById("pay-proof-file").value = "";
  document.getElementById("pay-proof-data").value = "";
  document.getElementById("pay-proof-preview").src = "";
  document.getElementById("pay-proof-preview-box").classList.add("hidden");
});

function togglePayModal(show) {
  const el = document.getElementById("modal-pay");
  el.classList.toggle("hidden", !show);
  el.classList.toggle("flex", show);
}

function closeProofModal() {
  const modalProof = document.getElementById("modal-proof-preview");
  modalProof?.classList.add("hidden");
  modalProof?.classList.remove("flex");
}

document.getElementById("close-modal-pay").addEventListener("click", () => togglePayModal(false));
document.getElementById("cancel-modal-pay").addEventListener("click", () => togglePayModal(false));
document.getElementById("close-modal-proof")?.addEventListener("click", closeProofModal);
document.getElementById("btn-close-proof-footer")?.addEventListener("click", closeProofModal);
document.getElementById("modal-proof-preview")?.addEventListener("click", (e) => {
  if (e.target.id === "modal-proof-preview") closeProofModal();
});

function updatePaymentStatus(cmpId, kolId, payload) {
  const cmp = campaigns[cmpId];
  const existingItem = cmp?.items?.[kolId];
  if (!existingItem) return;

  updateDemoItem("campaigns", cmpId, {
    items: {
      ...cmp.items,
      [kolId]: { ...existingItem, ...payload }
    }
  });
}

document.getElementById("form-pay").addEventListener("submit", (e) => {
  e.preventDefault();
  const cmpId = document.getElementById("pay-cmp-id").value;
  const kolId = document.getElementById("pay-kol-id").value;
  const now = new Date().toISOString();

  updatePaymentStatus(cmpId, kolId, {
    paymentStatus: "Paid",
    paymentNote: document.getElementById("pay-note").value.trim(),
    paymentProof: document.getElementById("pay-proof-data").value || "",
    paidBy: currentUser?.name || "Finance",
    paidAt: now,
    updatedBy: currentUser?.name || "Finance",
    updatedAt: now
  });

  togglePayModal(false);
  showToast("Pembayaran & bukti foto berhasil disimpan!");
});

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => {
      const active = b.dataset.tab === activeTab;
      b.className = active
        ? "tab-btn flex-1 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white transition"
        : "tab-btn flex-1 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition";
    });
    renderFinanceTable();
  });
});

document.getElementById("btn-export-finance").addEventListener("click", () => {
  if (paymentRows.length === 0) {
    return showAlert("Data Kosong", "Belum ada data payment untuk di-export.", "warning");
  }

  const sheetData = [
    ["REKAP PAYMENT KOL (FINANCE)"],
    [],
    ["No", "Campaign", "Brand", "Nama KOL", "WhatsApp", "Nominal Nett (IDR)", "Status Bayar", "Catatan Transfer", "Bukti Foto", "Diproses Oleh", "Tanggal Bayar"]
  ];

  paymentRows.forEach((r, idx) => {
    sheetData.push([
      idx + 1,
      r.campaignName,
      r.brand,
      r.kolName,
      r.wa || "-",
      Number(r.nettTotal || 0),
      r.paymentStatus,
      r.paymentNote || "-",
      r.paymentProof ? "Ada (Tersimpan di Sistem)" : "Tidak ada",
      r.paidBy || "-",
      r.paidAt ? new Date(r.paidAt).toLocaleDateString("id-ID") : "-"
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  for (let r = 4; r <= 3 + paymentRows.length; r++) {
    const cellRef = `F${r}`;
    if (ws[cellRef]) ws[cellRef].z = '#,##0';
  }

  ws["!cols"] = [
    { wch: 5 }, { wch: 24 }, { wch: 16 }, { wch: 20 },
    { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 28 },
    { wch: 24 }, { wch: 18 }, { wch: 14 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Payment Queue");
  XLSX.writeFile(wb, `Rekap_Payment_KOL.xlsx`);
  showToast("Rekap Payment .xlsx berhasil diunduh!");
});

loadFinanceData();
