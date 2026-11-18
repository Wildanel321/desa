import { api } from '../api.js';
import { showToast } from '../utils.js';
import { openModal, closeModal } from './modalBase.js';

export function openAnnouncementModal({ onCreated } = {}) {
  const bodyHtml = `
    <form id="announcement-form" novalidate>
      <div id="ann-error" class="notice-box is-error" hidden></div>

      <div class="field-group">
        <label class="field-label" for="ann-title">Judul Pengumuman</label>
        <input id="ann-title" name="title" type="text" class="input" required minlength="5" placeholder="Contoh: Jadwal Musyawarah Desa Triwulan IV">
      </div>

      <div class="field-group">
        <label class="field-label" for="ann-category">Kategori</label>
        <select id="ann-category" name="category" class="select">
          <option value="Kegiatan Warga">Kegiatan Warga</option>
          <option value="Administrasi">Administrasi</option>
          <option value="Kesehatan">Kesehatan</option>
          <option value="Infrastruktur">Infrastruktur</option>
          <option value="Informasi Umum">Informasi Umum</option>
        </select>
      </div>

      <div class="field-group">
        <label class="field-label" for="ann-summary">Ringkasan Singkat (Opsional)</label>
        <input id="ann-summary" name="summary" type="text" class="input" placeholder="Satu kalimat ringkas untuk tampilan daftar pengumuman">
      </div>

      <div class="field-group">
        <label class="field-label" for="ann-content">Isi Pengumuman Lengkap</label>
        <textarea id="ann-content" name="content" class="textarea" required minlength="15" placeholder="Tuliskan jadwal, lokasi, dan informasi penting bagi warga Desa Toyamas."></textarea>
      </div>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-secondary" id="ann-cancel-btn">Batal</button>
    <button type="submit" form="announcement-form" class="btn btn-primary" id="ann-submit-btn">Terbitkan Pengumuman</button>
  `;

  openModal({
    title: 'Tambah Pengumuman Desa',
    bodyHtml,
    footerHtml,
    onMount: () => {
      const form = document.getElementById('announcement-form');
      const errorBox = document.getElementById('ann-error');
      const submitBtn = document.getElementById('ann-submit-btn');

      document.getElementById('ann-cancel-btn').addEventListener('click', closeModal);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorBox.hidden = true;

        const payload = {
          title: form.title.value.trim(),
          category: form.category.value,
          summary: form.summary.value.trim(),
          content: form.content.value.trim()
        };

        if (payload.title.length < 5 || payload.content.length < 15) {
          errorBox.textContent = 'Judul minimal 5 karakter dan isi pengumuman minimal 15 karakter.';
          errorBox.hidden = false;
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Menerbitkan...';

        try {
          const created = await api.createAnnouncement(payload);
          closeModal();
          showToast(`Pengumuman "${created.title}" berhasil diterbitkan.`);
          if (typeof onCreated === 'function') onCreated(created);
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Terbitkan Pengumuman';
        }
      });
    }
  });
}
