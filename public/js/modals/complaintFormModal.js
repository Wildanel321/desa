import { api } from '../api.js';
import { COMPLAINT_CATEGORIES, escapeHtml, showToast } from '../utils.js';
import { openModal, closeModal } from './modalBase.js';

export function openComplaintFormModal({ onCreated } = {}) {
  const categoryOptions = COMPLAINT_CATEGORIES.map(
    (cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
  ).join('');

  const bodyHtml = `
    <form id="complaint-create-form" novalidate>
      <div id="complaint-form-error" class="notice-box is-error" hidden></div>

      <div class="field-group">
        <label class="field-label" for="cf-title">Judul Pengaduan</label>
        <input
          id="cf-title"
          name="title"
          type="text"
          class="input"
          required
          minlength="5"
          placeholder="Contoh: Lampu jalan padam di pertigaan RW 02"
        >
      </div>

      <div class="two-col-grid">
        <div class="field-group">
          <label class="field-label" for="cf-category">Kategori</label>
          <select id="cf-category" name="category" class="select" required>
            <option value="">Pilih kategori laporan</option>
            ${categoryOptions}
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="cf-reporter">Identitas Pelapor (Opsional)</label>
          <input
            id="cf-reporter"
            name="reporterLabel"
            type="text"
            class="input"
            placeholder="Contoh: Warga RW 02 (tanpa NIK)"
          >
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="cf-location">Lokasi Kejadian</label>
        <input
          id="cf-location"
          name="location"
          type="text"
          class="input"
          required
          minlength="3"
          placeholder="Contoh: Jl. Melati RT 03 / RW 02, Dusun Krajan"
        >
      </div>

      <div class="field-group">
        <label class="field-label" for="cf-description">Deskripsi Lengkap</label>
        <textarea
          id="cf-description"
          name="description"
          class="textarea"
          required
          minlength="15"
          placeholder="Jelaskan kondisi di lapangan, sejak kapan terjadi, dan dampaknya bagi warga sekitar."
        ></textarea>
        <span class="field-hint">Demi privasi demo, jangan mencantumkan NIK atau nomor telepon pribadi sungguhan.</span>
      </div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-secondary" id="cf-cancel-btn">Batal</button>
    <button type="submit" form="complaint-create-form" class="btn btn-primary" id="cf-submit-btn">Kirim Pengaduan</button>
  `;

  openModal({
    title: 'Buat Pengaduan Masyarakat Baru',
    bodyHtml,
    footerHtml,
    onMount: () => {
      const form = document.getElementById('complaint-create-form');
      const errorBox = document.getElementById('complaint-form-error');
      const submitBtn = document.getElementById('cf-submit-btn');
      const cancelBtn = document.getElementById('cf-cancel-btn');

      cancelBtn.addEventListener('click', closeModal);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorBox.hidden = true;

        const payload = {
          title: form.title.value.trim(),
          category: form.category.value,
          location: form.location.value.trim(),
          reporterLabel: form.reporterLabel.value.trim(),
          description: form.description.value.trim()
        };

        if (payload.title.length < 5) {
          errorBox.textContent = 'Judul laporan minimal 5 karakter.';
          errorBox.hidden = false;
          return;
        }
        if (!payload.category) {
          errorBox.textContent = 'Silakan pilih kategori pengaduan terlebih dahulu.';
          errorBox.hidden = false;
          return;
        }
        if (payload.location.length < 3) {
          errorBox.textContent = 'Lokasi kejadian wajib diisi minimal 3 karakter.';
          errorBox.hidden = false;
          return;
        }
        if (payload.description.length < 15) {
          errorBox.textContent = 'Deskripsi pengaduan minimal 15 karakter.';
          errorBox.hidden = false;
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim laporan...';

        try {
          const created = await api.createComplaint(payload);
          closeModal();
          showToast(`Pengaduan ${created.ticket_code} berhasil dicatat dengan status Menunggu.`);
          if (typeof onCreated === 'function') {
            onCreated(created);
          }
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Kirim Pengaduan';
        }
      });
    }
  });
}
