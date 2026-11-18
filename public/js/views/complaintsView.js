import { api } from '../api.js';
import { appState } from '../state.js';
import {
  COMPLAINT_CATEGORIES,
  escapeHtml,
  formatDateTime,
  statusTag,
  urgencyTag
} from '../utils.js';

export async function renderComplaintsView(container, actions) {
  const { status, category, q } = appState.complaintFilter;

  const categoryOptions = ['Semua', ...COMPLAINT_CATEGORIES]
    .map(
      (cat) =>
        `<option value="${escapeHtml(cat)}" ${category === cat ? 'selected' : ''}>${escapeHtml(
          cat === 'Semua' ? 'Semua Kategori' : cat
        )}</option>`
    )
    .join('');

  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Pengaduan Masyarakat</h1>
        <p class="page-subtitle">Ajukan laporan warga, pantau status penanganan, jalankan analisis klasifikasi, atau ubah status sebagai Admin Desa.</p>
      </div>
      <div class="page-actions">
        <button type="button" class="btn btn-primary" id="cmp-new-btn">Buat Pengaduan Baru</button>
      </div>
    </div>

    <div class="panel">
      <form id="cmp-filter-form" class="filter-bar" aria-label="Saring daftar pengaduan">
        <div class="filter-search">
          <label class="sr-only" for="cmp-search">Cari pengaduan</label>
          <input
            id="cmp-search"
            type="search"
            class="input"
            value="${escapeHtml(q)}"
            placeholder="Cari judul, kode tiket, atau lokasi dusun/RT..."
          >
        </div>

        <div class="filter-select">
          <label class="sr-only" for="cmp-status">Filter status</label>
          <select id="cmp-status" class="select">
            <option value="Semua" ${status === 'Semua' ? 'selected' : ''}>Semua Status</option>
            <option value="Menunggu" ${status === 'Menunggu' ? 'selected' : ''}>Menunggu</option>
            <option value="Diproses" ${status === 'Diproses' ? 'selected' : ''}>Diproses</option>
            <option value="Selesai" ${status === 'Selesai' ? 'selected' : ''}>Selesai</option>
          </select>
        </div>

        <div class="filter-select">
          <label class="sr-only" for="cmp-category">Filter kategori</label>
          <select id="cmp-category" class="select">
            ${categoryOptions}
          </select>
        </div>

        <button type="submit" class="btn btn-secondary">Terapkan</button>
        ${
          status !== 'Semua' || category !== 'Semua' || q
            ? '<button type="button" class="btn btn-secondary" id="cmp-reset-btn">Reset</button>'
            : ''
        }
      </form>

      <div id="cmp-list-region">
        <div class="state-card">
          <div class="spinner" aria-hidden="true"></div>
          <p class="state-title">Memuat daftar pengaduan</p>
          <p class="state-desc">Mengambil laporan warga dari database lokal.</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('cmp-new-btn').addEventListener('click', actions.openNewComplaint);

  const filterForm = document.getElementById('cmp-filter-form');
  const statusEl = document.getElementById('cmp-status');
  const categoryEl = document.getElementById('cmp-category');
  const searchEl = document.getElementById('cmp-search');

  const applyFilter = () => {
    appState.complaintFilter = {
      status: statusEl.value,
      category: categoryEl.value,
      q: searchEl.value.trim()
    };
    renderComplaintsView(container, actions);
  };

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    applyFilter();
  });
  statusEl.addEventListener('change', applyFilter);
  categoryEl.addEventListener('change', applyFilter);

  document.getElementById('cmp-reset-btn')?.addEventListener('click', () => {
    appState.complaintFilter = { status: 'Semua', category: 'Semua', q: '' };
    renderComplaintsView(container, actions);
  });

  const listRegion = document.getElementById('cmp-list-region');

  try {
    const res = await api.getComplaints(appState.complaintFilter);
    const items = res.items || [];

    if (!items.length) {
      const hasFilter = status !== 'Semua' || category !== 'Semua' || Boolean(q);
      listRegion.innerHTML = `
        <div class="state-card">
          <p class="state-title">${
            hasFilter ? 'Tidak ada pengaduan yang cocok dengan filter' : 'Belum ada pengaduan masyarakat'
          }</p>
          <p class="state-desc">${
            hasFilter
              ? 'Coba ubah kata kunci pencarian atau atur ulang filter status dan kategori.'
              : 'Klik tombol di bawah untuk mencatat laporan pengaduan warga pertama.'
          }</p>
          ${
            hasFilter
              ? '<button type="button" class="btn btn-secondary" id="cmp-empty-reset">Reset Filter</button>'
              : '<button type="button" class="btn btn-primary" id="cmp-empty-create">Buat Pengaduan Baru</button>'
          }
        </div>
      `;
      document.getElementById('cmp-empty-reset')?.addEventListener('click', () => {
        appState.complaintFilter = { status: 'Semua', category: 'Semua', q: '' };
        renderComplaintsView(container, actions);
      });
      document.getElementById('cmp-empty-create')?.addEventListener('click', actions.openNewComplaint);
      return;
    }

    listRegion.innerHTML = `
      <p class="field-hint" style="margin-bottom: 12px;">Menampilkan <strong>${items.length}</strong> laporan pengaduan.</p>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode & Laporan</th>
              <th>Lokasi & Pelapor</th>
              <th>Status</th>
              <th>Analisis Urgensi</th>
              <th>Masuk Pada</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                <tr>
                  <td>
                    <div class="mono" style="color: var(--text-secondary); margin-bottom: 2px;">${escapeHtml(item.ticket_code)}</div>
                    <div class="row-title">${escapeHtml(item.title)}</div>
                    <div class="row-sub">${escapeHtml(item.category)}</div>
                  </td>
                  <td>
                    <div>${escapeHtml(item.location)}</div>
                    <div class="row-sub">${escapeHtml(item.reporter_label)}</div>
                  </td>
                  <td>${statusTag(item.status)}</td>
                  <td>${urgencyTag(item.ai_urgency)}</td>
                  <td class="mono" style="white-space: nowrap;">${escapeHtml(formatDateTime(item.created_at))}</td>
                  <td>
                    <button type="button" class="btn btn-secondary btn-sm" data-open-detail="${item.id}">
                      Buka Detail
                    </button>
                  </td>
                </tr>
              `
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="complaint-cards-mobile">
        ${items
          .map(
            (item) => `
            <article class="complaint-card">
              <div class="complaint-card-top">
                <span class="mono" style="color: var(--text-secondary);">${escapeHtml(item.ticket_code)}</span>
                ${statusTag(item.status)}
              </div>
              <div>
                <h2 class="row-title" style="font-size: 0.96rem;">${escapeHtml(item.title)}</h2>
                <p class="row-sub">${escapeHtml(item.location)} | ${escapeHtml(formatDateTime(item.created_at))}</p>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                <span class="tag tag-neutral">${escapeHtml(item.category)}</span>
                ${urgencyTag(item.ai_urgency)}
              </div>
              <div class="complaint-card-actions">
                <button type="button" class="btn btn-secondary btn-sm btn-block" data-open-detail="${item.id}">
                  Buka Detail & Tindak Lanjut
                </button>
              </div>
            </article>
          `
          )
          .join('')}
      </div>
    `;

    listRegion.querySelectorAll('[data-open-detail]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.openComplaintDetail(Number(btn.getAttribute('data-open-detail')));
      });
    });
  } catch (err) {
    listRegion.innerHTML = `
      <div class="state-card">
        <p class="state-title">Gagal memuat daftar pengaduan</p>
        <p class="state-desc">${escapeHtml(err.message)}</p>
        <button type="button" class="btn btn-primary" id="cmp-retry-btn">Muat Ulang</button>
      </div>
    `;
    document.getElementById('cmp-retry-btn')?.addEventListener('click', () => {
      renderComplaintsView(container, actions);
    });
  }
}
