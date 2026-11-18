import { api } from '../api.js';
import { appState } from '../state.js';
import { escapeHtml, formatDate } from '../utils.js';

export async function renderVillageInfoView(container, actions) {
  container.innerHTML = `
    <div class="state-card">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">Memuat Informasi Desa Toyamas</p>
      <p class="state-desc">Mengambil profil desa, struktur pemerintahan, panduan layanan administrasi, dan pengumuman terbaru.</p>
    </div>
  `;

  try {
    const data = await api.getVillageInfo();
    const { profile, officials, services, announcements } = data;
    const activeTab = appState.villageTab || 'profil';

    const renderTabBody = () => {
      if (activeTab === 'struktur') {
        return `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Struktur Pemerintahan Desa Toyamas</h2>
                <p class="panel-subtitle">Susunan perangkat desa simulasi beserta tanggung jawab layanan masing-masing bidang.</p>
              </div>
              <span class="tag tag-neutral">Data Peran Simulasi</span>
            </div>
            <div class="two-col-grid">
              ${officials
                .map(
                  (person) => `
                  <article class="official-card">
                    <span class="avatar-initials" aria-hidden="true">${escapeHtml(person.initials)}</span>
                    <div>
                      <h3 style="font-size: 0.96rem; font-weight: 700;">${escapeHtml(person.role)}</h3>
                      <p class="row-sub" style="margin-bottom: 6px;">${escapeHtml(person.name)} | ${escapeHtml(person.unit)}</p>
                      <p style="font-size: 0.86rem; color: var(--text-primary);">${escapeHtml(person.responsibilities)}</p>
                    </div>
                  </article>
                `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      if (activeTab === 'layanan') {
        return `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Informasi Layanan Administrasi</h2>
                <p class="panel-subtitle">Panduan syarat dokumen, estimasi waktu pengerjaan, dan biaya resmi loket Kantor Desa Toyamas.</p>
              </div>
              <span class="tag tag-selesai">Bebas Pungutan (Rp0)</span>
            </div>
            <div class="two-col-grid">
              ${services
                .map(
                  (srv) => `
                  <article class="service-card">
                    <div style="display: flex; justify-content: space-between; gap: 8px; align-items: flex-start;">
                      <h3 style="font-size: 0.98rem; font-weight: 700;">${escapeHtml(srv.name)}</h3>
                      <span class="tag tag-neutral">${escapeHtml(srv.fee)}</span>
                    </div>
                    <p class="row-sub">Estimasi selesai: ${escapeHtml(srv.estimatedTime)}</p>
                    <ul class="info-list">
                      ${srv.requirements.map((req) => `<li>${escapeHtml(req)}</li>`).join('')}
                    </ul>
                    <div style="margin-top: auto; padding-top: 8px;">
                      <button type="button" class="btn btn-secondary btn-sm" data-ask-service="${escapeHtml(srv.sampleQuestion)}">
                        Tanyakan di Asisten Desa
                      </button>
                    </div>
                  </article>
                `
                )
                .join('')}
            </div>
          </div>
        `;
      }

      if (activeTab === 'pengumuman') {
        const isAdmin = Boolean(appState.user && appState.user.role === 'admin');
        return `
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Pengumuman Desa Toyamas</h2>
                <p class="panel-subtitle">Informasi kegiatan warga, kesehatan, dan pemutakhiran data administrasi desa.</p>
              </div>
              <button type="button" class="btn btn-primary btn-sm" id="vi-add-announcement-btn">
                ${isAdmin ? 'Tambah Pengumuman' : 'Masuk Admin untuk Tambah'}
              </button>
            </div>
            ${
              announcements.length
                ? `<div style="display: flex; flex-direction: column; gap: 12px;">
                    ${announcements
                      .map(
                        (ann) => `
                        <article class="announcement-item">
                          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; align-items: center;">
                            <span class="tag tag-neutral">${escapeHtml(ann.category)}</span>
                            <span class="mono" style="color: var(--text-secondary);">${escapeHtml(formatDate(ann.published_at))}</span>
                          </div>
                          <h3 style="font-size: 1rem; font-weight: 700;">${escapeHtml(ann.title)}</h3>
                          <p style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(ann.content)}</p>
                        </article>
                      `
                      )
                      .join('')}
                  </div>`
                : `
                  <div class="state-card">
                    <p class="state-title">Belum ada pengumuman diterbitkan</p>
                    <p class="state-desc">Pengumuman desa akan muncul di halaman ini setelah ditambahkan oleh Admin Desa.</p>
                  </div>
                `
            }
          </div>
        `;
      }

      return `
        <div class="analysis-split">
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">Profil ${escapeHtml(profile.name)}</h2>
                <p class="panel-subtitle">${escapeHtml(profile.district)}, ${escapeHtml(profile.regency)}, ${escapeHtml(profile.province)}</p>
              </div>
              <span class="tag tag-neutral">Profil Simulasi</span>
            </div>
            <p style="margin-bottom: 16px; color: var(--text-primary);">${escapeHtml(profile.summary)}</p>

            <h3 style="font-size: 0.96rem; margin-bottom: 6px;">Visi Desa</h3>
            <p style="margin-bottom: 16px; padding: 12px 14px; border-radius: var(--radius-control); background: var(--brand-green-soft); border: 1px solid var(--brand-green-border); color: var(--brand-green-ink); font-weight: 500;">
              ${escapeHtml(profile.vision)}
            </p>

            <h3 style="font-size: 0.96rem; margin-bottom: 8px;">Misi Desa</h3>
            <ol class="info-list">
              ${profile.missions.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}
            </ol>
          </div>

          <div class="panel">
            <h2 class="panel-title" style="margin-bottom: 12px;">Kantor & Jam Pelayanan</h2>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              <div class="ai-kv">
                <div class="ai-kv-label">Alamat Kantor Desa</div>
                <div class="ai-kv-value">${escapeHtml(profile.officeAddress)}</div>
              </div>
              <div class="ai-kv">
                <div class="ai-kv-label">Luas Wilayah & Pembagian Dusun</div>
                <div class="ai-kv-value">${escapeHtml(profile.areaKm2)} (${escapeHtml(profile.dusunList.join(', '))})</div>
              </div>
              <div class="ai-kv">
                <div class="ai-kv-label">Kontak Resmi (Demo)</div>
                <div class="ai-kv-value">${escapeHtml(profile.officePhone)} | ${escapeHtml(profile.officeEmail)}</div>
              </div>
            </div>

            <h3 style="font-size: 0.96rem; margin-bottom: 8px;">Jadwal Pelayanan Loket</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${profile.serviceHours
                .map(
                  (row) => `
                  <div class="activity-item">
                    <p style="font-weight: 600; font-size: 0.88rem;">${escapeHtml(row.day)}</p>
                    <p class="row-sub">${escapeHtml(row.hours)}</p>
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Informasi Desa Toyamas</h1>
          <p class="page-subtitle">Profil wilayah, visi dan misi, struktur pemerintahan, panduan administrasi, serta pengumuman warga.</p>
        </div>
      </div>

      <div class="tabs" role="tablist" aria-label="Kategori informasi desa">
        <button type="button" class="tab-btn ${activeTab === 'profil' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'profil'}" data-village-tab="profil">
          Profil & Visi Misi
        </button>
        <button type="button" class="tab-btn ${activeTab === 'struktur' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'struktur'}" data-village-tab="struktur">
          Struktur Pemerintahan
        </button>
        <button type="button" class="tab-btn ${activeTab === 'layanan' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'layanan'}" data-village-tab="layanan">
          Layanan Administrasi
        </button>
        <button type="button" class="tab-btn ${activeTab === 'pengumuman' ? 'is-active' : ''}" role="tab" aria-selected="${activeTab === 'pengumuman'}" data-village-tab="pengumuman">
          Pengumuman Desa (${announcements.length})
        </button>
      </div>

      ${renderTabBody()}
    `;

    container.querySelectorAll('[data-village-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        appState.villageTab = btn.getAttribute('data-village-tab');
        renderVillageInfoView(container, actions);
      });
    });

    container.querySelectorAll('[data-ask-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        appState.pendingAssistantQuestion = btn.getAttribute('data-ask-service');
        actions.navigate('asisten');
      });
    });

    document.getElementById('vi-add-announcement-btn')?.addEventListener('click', () => {
      actions.openNewAnnouncement();
    });
  } catch (err) {
    container.innerHTML = `
      <div class="state-card">
        <p class="state-title">Gagal memuat Informasi Desa</p>
        <p class="state-desc">${escapeHtml(err.message)}</p>
        <button type="button" class="btn btn-primary" id="vi-retry-btn">Coba Muat Ulang</button>
      </div>
    `;
    document.getElementById('vi-retry-btn')?.addEventListener('click', () => {
      renderVillageInfoView(container, actions);
    });
  }
}
