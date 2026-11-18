import { api } from '../api.js';
import {
  escapeHtml,
  formatNumber,
  formatDateTime,
  statusTag,
  urgencyTag
} from '../utils.js';

export async function renderDashboardView(container, actions) {
  container.innerHTML = `
    <div class="state-card">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">Memuat ringkasan operasional Desa Toyamas</p>
      <p class="state-desc">Mengambil statistik pengaduan, data simulasi penduduk, dan aktivitas terbaru.</p>
    </div>
  `;

  try {
    const data = await api.getDashboard();
    const { population, complaintsSummary, byCategory, recentActivities, openComplaints, aiEngine } = data;
    const activeCount = complaintsSummary.menunggu + complaintsSummary.diproses;
    const maxCatCount = byCategory.reduce((max, item) => Math.max(max, item.count), 1);

    const chartHtml = byCategory.length
      ? `<div class="chart-list">
          ${byCategory
            .map((item, idx) => {
              const pct = complaintsSummary.total
                ? Math.round((item.count / complaintsSummary.total) * 100)
                : 0;
              const widthPct = Math.max(8, Math.round((item.count / maxCatCount) * 100));
              return `
                <button type="button" class="chart-row-btn" data-filter-category="${escapeHtml(item.category)}">
                  <div class="chart-row-head">
                    <span class="chart-cat-name">${escapeHtml(item.category)}</span>
                    <span class="chart-cat-count">${item.count} laporan (${pct}%)</span>
                  </div>
                  <div class="chart-track" aria-hidden="true">
                    <div class="chart-bar ${idx === 0 ? 'is-accent' : ''}" style="width: ${widthPct}%;"></div>
                  </div>
                </button>
              `;
            })
            .join('')}
        </div>`
      : `
        <div class="state-card">
          <p class="state-title">Belum ada data kategori pengaduan</p>
          <p class="state-desc">Tambahkan pengaduan pertama untuk melihat distribusi kategori warga.</p>
          <button type="button" class="btn btn-primary btn-sm" id="dash-empty-create">Buat Pengaduan Baru</button>
        </div>
      `;

    const activitiesHtml = recentActivities.length
      ? `<ul class="activity-list">
          ${recentActivities
            .map(
              (act) => `
              <li class="activity-item">
                <p class="activity-desc">${escapeHtml(act.description)}</p>
                <div class="activity-meta">
                  <span>${escapeHtml(act.actor)}</span>
                  <span class="mono">${escapeHtml(formatDateTime(act.created_at))}</span>
                </div>
              </li>
            `
            )
            .join('')}
        </ul>`
      : `
        <div class="state-card">
          <p class="state-title">Belum ada aktivitas tercatat</p>
          <p class="state-desc">Aktivitas sistem muncul otomatis saat ada pengaduan masuk, analisis dijalankan, atau status diubah.</p>
        </div>
      `;

    const openListHtml = openComplaints.length
      ? `
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Kode & Ringkasan Laporan</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Estimasi Urgensi</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              ${openComplaints
                .map(
                  (c) => `
                  <tr>
                    <td>
                      <div class="mono" style="color: var(--text-secondary); margin-bottom: 2px;">${escapeHtml(c.ticket_code)}</div>
                      <div class="row-title">${escapeHtml(c.title)}</div>
                      <div class="row-sub">${escapeHtml(c.category)}</div>
                    </td>
                    <td>${escapeHtml(c.location)}</td>
                    <td>${statusTag(c.status)}</td>
                    <td>${urgencyTag(c.ai_urgency)}</td>
                    <td>
                      <button type="button" class="btn btn-secondary btn-sm" data-open-complaint="${c.id}">
                        Detail & Analisis
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
          ${openComplaints
            .map(
              (c) => `
              <article class="complaint-card">
                <div class="complaint-card-top">
                  <span class="mono" style="color: var(--text-secondary);">${escapeHtml(c.ticket_code)}</span>
                  ${statusTag(c.status)}
                </div>
                <div>
                  <h3 class="row-title">${escapeHtml(c.title)}</h3>
                  <p class="row-sub">${escapeHtml(c.location)}</p>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  <span class="tag tag-neutral">${escapeHtml(c.category)}</span>
                  ${urgencyTag(c.ai_urgency)}
                </div>
                <div class="complaint-card-actions">
                  <button type="button" class="btn btn-secondary btn-sm btn-block" data-open-complaint="${c.id}">
                    Buka Detail & Analisis
                  </button>
                </div>
              </article>
            `
            )
            .join('')}
        </div>
      `
      : `
        <div class="state-card">
          <p class="state-title">Semua pengaduan telah selesai ditangani</p>
          <p class="state-desc">Tidak ada antrean pengaduan aktif saat ini. Anda dapat membuat laporan baru untuk simulasi alur penanganan.</p>
          <button type="button" class="btn btn-primary btn-sm" id="dash-open-empty-create">Buat Pengaduan Baru</button>
        </div>
      `;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard Pengelolaan Desa Toyamas</h1>
          <p class="page-subtitle">Ringkasan antrean pengaduan warga, distribusi masalah per kategori, dan statistik kependudukan simulasi.</p>
        </div>
        <div class="page-actions">
          <span class="tag tag-sim">${escapeHtml(aiEngine.modeLabel)}</span>
        </div>
      </div>

      <section class="hero-split" aria-label="Ringkasan pengaduan dan kependudukan">
        <div class="panel panel-primary">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Antrean Pengaduan Warga</h2>
              <p class="panel-subtitle">Data langsung dari basis data SQLite lokal</p>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="dash-filter-waiting">
              Lihat Status Menunggu
            </button>
          </div>

          <div class="queue-headline">
            <span class="metric-big">${activeCount}</span>
            <span class="metric-caption">pengaduan aktif menunggu atau sedang ditangani dari total ${complaintsSummary.total} laporan masuk.</span>
          </div>

          <div class="status-strip">
            <div class="status-cell">
              <span class="status-cell-label">Total Masuk</span>
              <span class="status-cell-value">${complaintsSummary.total}</span>
            </div>
            <div class="status-cell">
              <span class="status-cell-label">Menunggu</span>
              <span class="status-cell-value">${complaintsSummary.menunggu}</span>
            </div>
            <div class="status-cell">
              <span class="status-cell-label">Diproses</span>
              <span class="status-cell-value">${complaintsSummary.diproses}</span>
            </div>
            <div class="status-cell">
              <span class="status-cell-label">Selesai</span>
              <span class="status-cell-value">${complaintsSummary.selesai}</span>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button type="button" class="btn btn-primary" id="dash-new-complaint">Buat Pengaduan Baru</button>
            <button type="button" class="btn btn-accent" id="dash-go-analyzer">Buka AI Complaint Analyzer</button>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Kependudukan Desa Toyamas</h2>
              <p class="panel-subtitle">${escapeHtml(population.label)}</p>
            </div>
            <span class="tag tag-neutral">Data Simulasi</span>
          </div>

          <div class="queue-headline" style="margin-bottom: 10px;">
            <span class="metric-big" style="color: var(--text-primary);">${formatNumber(population.totalPenduduk)}</span>
            <span class="metric-caption">jiwa tercatat pada ${population.jumlahDusun} dusun, ${population.jumlahRw} RW, dan ${population.jumlahRt} RT.</span>
          </div>

          <div class="demo-grid">
            <div class="demo-cell">
              <div class="demo-cell-label">Kepala Keluarga</div>
              <div class="demo-cell-value">${formatNumber(population.kepalaKeluarga)} KK</div>
            </div>
            <div class="demo-cell">
              <div class="demo-cell-label">Sebaran Wilayah</div>
              <div class="demo-cell-value">${population.jumlahDusun} Dusun / ${population.jumlahRt} RT</div>
            </div>
            <div class="demo-cell">
              <div class="demo-cell-label">Penduduk Laki-laki</div>
              <div class="demo-cell-value">${formatNumber(population.lakiLaki)}</div>
            </div>
            <div class="demo-cell">
              <div class="demo-cell-label">Penduduk Perempuan</div>
              <div class="demo-cell-value">${formatNumber(population.perempuan)}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="analysis-split" aria-label="Grafik kategori dan aktivitas terbaru">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Kategori apa yang paling banyak dilaporkan warga?</h2>
              <p class="panel-subtitle">Klik salah satu kategori untuk menyaring daftar pengaduan terkait.</p>
            </div>
          </div>
          ${chartHtml}
        </div>

        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Aktivitas Terbaru</h2>
              <p class="panel-subtitle">Catatan langsung setiap perubahan laporan dan analisis.</p>
            </div>
          </div>
          ${activitiesHtml}
        </div>
      </section>

      <section class="panel" aria-label="Pengaduan perlu tindak lanjut">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">Pengaduan Perlu Tindak Lanjut</h2>
            <p class="panel-subtitle">Diurutkan berdasarkan estimasi urgensi tertinggi dan waktu masuk terbaru.</p>
          </div>
          <a href="#pengaduan" class="btn btn-secondary btn-sm">Lihat Semua Pengaduan</a>
        </div>
        ${openListHtml}
      </section>
    `;

    actions.updateOpenCount(activeCount);

    document.getElementById('dash-new-complaint')?.addEventListener('click', actions.openNewComplaint);
    document.getElementById('dash-empty-create')?.addEventListener('click', actions.openNewComplaint);
    document.getElementById('dash-open-empty-create')?.addEventListener('click', actions.openNewComplaint);
    document.getElementById('dash-go-analyzer')?.addEventListener('click', () => actions.navigate('analyzer'));
    document.getElementById('dash-filter-waiting')?.addEventListener('click', () => {
      actions.filterComplaints({ status: 'Menunggu', category: 'Semua', q: '' });
    });

    container.querySelectorAll('[data-filter-category]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.filterComplaints({
          status: 'Semua',
          category: btn.getAttribute('data-filter-category'),
          q: ''
        });
      });
    });

    container.querySelectorAll('[data-open-complaint]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.openComplaintDetail(Number(btn.getAttribute('data-open-complaint')));
      });
    });
  } catch (err) {
    container.innerHTML = `
      <div class="state-card">
        <p class="state-title">Gagal memuat data Dashboard</p>
        <p class="state-desc">${escapeHtml(err.message)}</p>
        <button type="button" class="btn btn-primary" id="dash-retry-btn">Coba Muat Ulang</button>
      </div>
    `;
    document.getElementById('dash-retry-btn')?.addEventListener('click', () => {
      renderDashboardView(container, actions);
    });
  }
}
