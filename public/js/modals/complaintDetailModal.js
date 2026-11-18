import { api } from '../api.js';
import { appState } from '../state.js';
import { escapeHtml, formatDateTime, statusTag, urgencyTag, showToast } from '../utils.js';
import { openModal, closeModal } from './modalBase.js';
import { openAdminLoginModal } from './adminLoginModal.js';

function renderAiSection(complaint) {
  if (!complaint.ai_summary) {
    return `
      <div class="notice-box is-info">
        Laporan ini belum memiliki hasil klasifikasi AI. Klik tombol <strong>Analisis Pengaduan</strong> di bawah untuk menghasilkan kategori, ringkasan, estimasi urgensi, dan saran petugas penanganan.
      </div>
    `;
  }

  const modeLabel =
    complaint.ai_mode === 'external_api'
      ? 'API AI Eksternal'
      : 'Mode Simulasi Lokal (Tanpa API AI)';

  return `
    <div class="ai-result-box">
      <div class="panel-header" style="margin-bottom: 4px;">
        <div>
          <h3 style="font-size: 0.96rem; font-weight: 700;">Hasil AI Complaint Analyzer</h3>
          <p class="field-hint">Sumber pemrosesan: ${escapeHtml(modeLabel)}</p>
        </div>
        ${urgencyTag(complaint.ai_urgency)}
      </div>

      <div class="ai-kv-grid">
        <div class="ai-kv">
          <div class="ai-kv-label">Klasifikasi Kategori</div>
          <div class="ai-kv-value">${escapeHtml(complaint.ai_category)}</div>
        </div>
        <div class="ai-kv">
          <div class="ai-kv-label">Saran Instansi / Petugas</div>
          <div class="ai-kv-value">${escapeHtml(complaint.ai_handler)}</div>
        </div>
      </div>

      <div class="ai-kv">
        <div class="ai-kv-label">Ringkasan Laporan</div>
        <div class="ai-kv-value" style="font-weight: 500;">${escapeHtml(complaint.ai_summary)}</div>
      </div>

      <div class="ai-kv">
        <div class="ai-kv-label">Dasar Estimasi Urgensi</div>
        <div class="ai-kv-value" style="font-weight: 500;">${escapeHtml(complaint.ai_urgency_reason || 'Berdasarkan indikasi tingkat dampak laporan.')}</div>
      </div>

      ${
        complaint.ai_mode !== 'external_api'
          ? '<p class="field-hint">Catatan transparansi: hasil ini dihasilkan oleh simulasi berbasis aturan lokal karena kunci API AI eksternal belum dikonfigurasi.</p>'
          : ''
      }
    </div>
  `;
}

export async function openComplaintDetailModal(complaintId, { onUpdated } = {}) {
  openModal({
    title: 'Memuat Detail Pengaduan',
    bodyHtml: `
      <div class="state-card">
        <div class="spinner" aria-hidden="true"></div>
        <p class="state-title">Mengambil data laporan</p>
        <p class="state-desc">Sedang memuat rincian pengaduan dari basis data lokal.</p>
      </div>
    `
  });

  try {
    const complaint = await api.getComplaint(complaintId);
    renderDetailContent(complaint, onUpdated);
  } catch (err) {
    openModal({
      title: 'Gagal Memuat Pengaduan',
      bodyHtml: `<div class="notice-box is-error">${escapeHtml(err.message)}</div>`,
      footerHtml: '<button type="button" class="btn btn-secondary" id="cd-err-close">Tutup</button>',
      onMount: () => {
        document.getElementById('cd-err-close').addEventListener('click', closeModal);
      }
    });
  }
}

function renderDetailContent(complaint, onUpdated) {
  const isAdmin = Boolean(appState.user && appState.user.role === 'admin');

  const adminSection = isAdmin
    ? `
      <form id="cd-status-form" class="panel" style="padding: 15px; background: var(--bg-page);">
        <h3 style="font-size: 0.96rem; margin-bottom: 10px;">Tindak Lanjut Admin Desa</h3>
        <div id="cd-status-error" class="notice-box is-error" hidden style="margin-bottom: 10px;"></div>
        <div class="field-group">
          <label class="field-label" for="cd-status-select">Status Penanganan</label>
          <select id="cd-status-select" name="status" class="select">
            <option value="Menunggu" ${complaint.status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
            <option value="Diproses" ${complaint.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
            <option value="Selesai" ${complaint.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label" for="cd-admin-note">Catatan Petugas Desa</label>
          <textarea
            id="cd-admin-note"
            name="adminNote"
            class="textarea"
            style="min-height: 82px;"
            placeholder="Tuliskan jadwal pengecekan lapangan atau hasil penyelesaian laporan."
          >${escapeHtml(complaint.admin_note || '')}</textarea>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between;">
          <button type="submit" class="btn btn-primary" id="cd-save-status-btn">Simpan Perubahan Status</button>
          <button type="button" class="btn btn-danger btn-sm" id="cd-delete-btn">Hapus Laporan</button>
        </div>
      </form>
    `
    : `
      <div class="panel" style="padding: 15px; background: var(--bg-page); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">
        <div>
          <p style="font-weight: 600; font-size: 0.9rem;">Ubah Status Penanganan (Khusus Admin)</p>
          <p class="field-hint">Masuk menggunakan akun Admin Demo untuk mengubah status Menunggu, Diproses, atau Selesai.</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="cd-open-admin-login">Masuk sebagai Admin Demo</button>
      </div>
    `;

  const bodyHtml = `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;">
      <span class="mono" style="font-weight: 600; color: var(--text-secondary);">${escapeHtml(complaint.ticket_code)}</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${statusTag(complaint.status)}
        <span class="tag tag-neutral">${escapeHtml(complaint.category)}</span>
      </div>
    </div>

    <div>
      <h3 style="font-size: 1.05rem; margin-bottom: 6px;">${escapeHtml(complaint.title)}</h3>
      <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.6;">${escapeHtml(complaint.description)}</p>
    </div>

    <div class="ai-kv-grid">
      <div class="ai-kv">
        <div class="ai-kv-label">Lokasi Kejadian</div>
        <div class="ai-kv-value">${escapeHtml(complaint.location)}</div>
      </div>
      <div class="ai-kv">
        <div class="ai-kv-label">Pelapor & Waktu Masuk</div>
        <div class="ai-kv-value">${escapeHtml(complaint.reporter_label)} (${escapeHtml(formatDateTime(complaint.created_at))})</div>
      </div>
    </div>

    ${
      complaint.admin_note
        ? `
          <div class="notice-box">
            <strong>Catatan Tindak Lanjut Desa:</strong> ${escapeHtml(complaint.admin_note)}
          </div>
        `
        : ''
    }

    <div id="cd-ai-container">
      ${renderAiSection(complaint)}
    </div>

    <div>
      <button type="button" class="btn btn-accent" id="cd-analyze-btn">
        ${complaint.ai_summary ? 'Jalankan Ulang Analisis Pengaduan' : 'Analisis Pengaduan'}
      </button>
    </div>

    ${adminSection}
  `;

  const footerHtml = '<button type="button" class="btn btn-secondary" id="cd-close-btn">Tutup</button>';

  openModal({
    title: `Detail Pengaduan ${escapeHtml(complaint.ticket_code)}`,
    bodyHtml,
    footerHtml,
    onMount: () => {
      document.getElementById('cd-close-btn').addEventListener('click', closeModal);

      const analyzeBtn = document.getElementById('cd-analyze-btn');
      analyzeBtn.addEventListener('click', async () => {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Menganalisis laporan...';
        try {
          const result = await api.analyzeComplaint(complaint.id);
          showToast('Analisis pengaduan selesai dan tersimpan.');
          if (typeof onUpdated === 'function') {
            onUpdated();
          }
          renderDetailContent(result.complaint, onUpdated);
        } catch (err) {
          showToast(err.message, 'error');
          analyzeBtn.disabled = false;
          analyzeBtn.textContent = 'Analisis Pengaduan';
        }
      });

      const loginBtn = document.getElementById('cd-open-admin-login');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          openAdminLoginModal({
            onSuccess: () => {
              if (typeof onUpdated === 'function') onUpdated();
              openComplaintDetailModal(complaint.id, { onUpdated });
            }
          });
        });
      }

      const statusForm = document.getElementById('cd-status-form');
      if (statusForm) {
        statusForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const saveBtn = document.getElementById('cd-save-status-btn');
          const errBox = document.getElementById('cd-status-error');
          errBox.hidden = true;
          saveBtn.disabled = true;
          saveBtn.textContent = 'Menyimpan...';

          try {
            const updated = await api.updateComplaintStatus(complaint.id, {
              status: statusForm.status.value,
              adminNote: statusForm.adminNote.value
            });
            showToast(`Status ${updated.ticket_code} diperbarui menjadi ${updated.status}.`);
            if (typeof onUpdated === 'function') onUpdated();
            renderDetailContent(updated, onUpdated);
          } catch (err) {
            errBox.textContent = err.message;
            errBox.hidden = false;
            saveBtn.disabled = false;
            saveBtn.textContent = 'Simpan Perubahan Status';
          }
        });
      }

      const deleteBtn = document.getElementById('cd-delete-btn');
      if (deleteBtn) {
        let confirming = false;
        deleteBtn.addEventListener('click', async () => {
          if (!confirming) {
            confirming = true;
            deleteBtn.textContent = 'Klik sekali lagi untuk hapus';
            return;
          }
          deleteBtn.disabled = true;
          try {
            await api.deleteComplaint(complaint.id);
            closeModal();
            showToast(`Laporan ${complaint.ticket_code} telah dihapus.`);
            if (typeof onUpdated === 'function') onUpdated();
          } catch (err) {
            showToast(err.message, 'error');
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Hapus Laporan';
            confirming = false;
          }
        });
      }
    }
  });
}
