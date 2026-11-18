import { api, setAuthToken } from '../api.js';
import { appState } from '../state.js';
import { escapeHtml, showToast } from '../utils.js';
import { openModal, closeModal } from './modalBase.js';

export function openAdminLoginModal({ onSuccess, onLogout } = {}) {
  const isLoggedIn = Boolean(appState.user);

  if (isLoggedIn) {
    openModal({
      title: 'Sesi Admin Desa Aktif',
      bodyHtml: `
        <div class="notice-box is-info">
          Anda sedang masuk sebagai <strong>${escapeHtml(appState.user.name)}</strong> (${escapeHtml(appState.user.email)}).
          Anda memiliki akses untuk mengubah status pengaduan masyarakat, menambahkan catatan tindak lanjut, menghapus laporan, dan menerbitkan pengumuman desa.
        </div>
      `,
      footerHtml: `
        <button type="button" class="btn btn-secondary" id="al-close-btn">Tutup</button>
        <button type="button" class="btn btn-danger" id="al-logout-btn">Keluar dari Sesi Admin</button>
      `,
      onMount: () => {
        document.getElementById('al-close-btn').addEventListener('click', closeModal);
        document.getElementById('al-logout-btn').addEventListener('click', () => {
          setAuthToken('');
          appState.user = null;
          closeModal();
          showToast('Sesi Admin Desa diakhiri.');
          if (typeof onLogout === 'function') onLogout();
        });
      }
    });
    return;
  }

  const bodyHtml = `
    <div class="notice-box is-info">
      <strong>Akun Admin Demo Studi Kasus:</strong><br>
      Email: <span class="mono">admin@toyamas.desa.id</span><br>
      Kata sandi: <span class="mono">toyamas2026</span>
    </div>

    <form id="admin-login-form" novalidate>
      <div id="admin-login-error" class="notice-box is-error" hidden></div>

      <div class="field-group">
        <label class="field-label" for="al-email">Email Admin</label>
        <input id="al-email" name="email" type="email" class="input" required placeholder="email@contoh.desa.id">
      </div>

      <div class="field-group">
        <label class="field-label" for="al-password">Kata Sandi</label>
        <input id="al-password" name="password" type="password" class="input" required placeholder="Masukkan kata sandi admin">
      </div>

      <button type="button" class="btn btn-secondary btn-sm" id="al-fill-demo-btn">
        Isi Otomatis Kredensial Demo
      </button>
    </form>
  `;

  const footerHtml = `
    <button type="button" class="btn btn-secondary" id="al-cancel-btn">Batal</button>
    <button type="submit" form="admin-login-form" class="btn btn-primary" id="al-submit-btn">Masuk sebagai Admin</button>
  `;

  openModal({
    title: 'Masuk Akun Admin Desa',
    bodyHtml,
    footerHtml,
    onMount: () => {
      const form = document.getElementById('admin-login-form');
      const errorBox = document.getElementById('admin-login-error');
      const submitBtn = document.getElementById('al-submit-btn');

      document.getElementById('al-cancel-btn').addEventListener('click', closeModal);
      document.getElementById('al-fill-demo-btn').addEventListener('click', () => {
        form.email.value = 'admin@toyamas.desa.id';
        form.password.value = 'toyamas2026';
        errorBox.hidden = true;
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorBox.hidden = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memverifikasi...';

        try {
          const res = await api.login(form.email.value, form.password.value);
          setAuthToken(res.token);
          appState.user = res.user;
          closeModal();
          showToast('Berhasil masuk sebagai Admin Desa Toyamas.');
          if (typeof onSuccess === 'function') onSuccess(res.user);
        } catch (err) {
          errorBox.textContent = err.message;
          errorBox.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Masuk sebagai Admin';
        }
      });
    }
  });
}
