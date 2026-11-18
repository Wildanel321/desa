import { api } from '../api.js';
import { COMPLAINT_CATEGORIES, escapeHtml, statusTag, urgencyTag, showToast } from '../utils.js';

function renderAnalysisOutput(result, linkedTicket = null) {
  if (!result) {
    return `
      <div class="state-card">
        <p class="state-title">Belum ada hasil analisis ditampilkan</p>
        <p class="state-desc">Pilih salah satu laporan warga di sebelah kiri atau ketik contoh pengaduan baru, lalu klik tombol Analisis Pengaduan.</p>
      </div>
    `;
  }

  return `
    <div class="ai-result-box">
      <div class="panel-header" style="margin-bottom: 4px;">
        <div>
          <h2 class="panel-title" style="font-size: 1.05rem;">
            ${linkedTicket ? `Hasil Analisis ${escapeHtml(linkedTicket)}` : 'Hasil Uji Analisis Pengaduan'}
          </h2>
          <p class="field-hint">${escapeHtml(result.modeLabel)}</p>
        </div>
        ${urgencyTag(result.urgency)}
      </div>

      <div class="ai-kv-grid">
        <div class="ai-kv">
          <div class="ai-kv-label">Klasifikasi Kategori</div>
          <div class="ai-kv-value">${escapeHtml(result.category)}</div>
        </div>
        <div class="ai-kv">
          <div class="ai-kv-label">Saran Instansi / Petugas Penanganan</div>
          <div class="ai-kv-value">${escapeHtml(result.suggestedHandler)}</div>
        </div>
      </div>

      <div class="ai-kv">
        <div class="ai-kv-label">Ringkasan Otomatis</div>
        <div class="ai-kv-value" style="font-weight: 500;">${escapeHtml(result.summary)}</div>
      </div>

      <div class="ai-kv">
        <div class="ai-kv-label">Alasan Estimasi Urgensi (${escapeHtml(result.urgency)})</div>
        <div class="ai-kv-value" style="font-weight: 500;">${escapeHtml(result.urgencyReason)}</div>
      </div>

      <div class="notice-box">
        <strong>Transparansi Sistem:</strong> ${escapeHtml(result.disclaimer)}
      </div>
    </div>
  `;
}

export async function renderAnalyzerView(container, actions) {
  container.innerHTML = `
    <div class="state-card">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">Menyiapkan AI Complaint Analyzer</p>
      <p class="state-desc">Memeriksa status mesin analisis dan daftar laporan masuk.</p>
    </div>
  `;

  try {
    const [statusInfo, complaintsRes] = await Promise.all([
      api.getAiStatus(),
      api.getComplaints()
    ]);
    const complaints = complaintsRes.items || [];

    const complaintOptions = complaints
      .map(
        (c) =>
          `<option value="${c.id}">${escapeHtml(c.ticket_code)} - ${escapeHtml(c.title)} (${escapeHtml(
            c.ai_urgency ? `Urgensi ${c.ai_urgency}` : 'Belum dianalisis'
          )})</option>`
      )
      .join('');

    const categoryOptions = COMPLAINT_CATEGORIES.map(
      (cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">AI Complaint Analyzer</h1>
          <p class="page-subtitle">Klasifikasi kategori, ringkasan laporan, estimasi urgensi (Rendah, Sedang, Tinggi), dan saran petugas penanggung jawab.</p>
        </div>
        <div class="page-actions">
          <span class="tag tag-sim">${escapeHtml(statusInfo.modeLabel)}</span>
        </div>
      </div>

      ${
        !statusInfo.externalApiConfigured
          ? `
            <div class="notice-box is-info" style="margin-bottom: 18px;">
              <strong>Informasi Mode Demo:</strong> Kunci API AI eksternal belum dikonfigurasi pada server. Fitur ini berjalan menggunakan <strong>Mode Simulasi Lokal</strong> (berbasis aturan kata kunci Bahasa Indonesia) dan tidak mengklaim sebagai keluaran model AI sungguhan.
            </div>
          `
          : ''
      }

      <div class="workbench-grid">
        <div class="panel">
          <div class="tabs" role="tablist" aria-label="Pilih sumber teks pengaduan">
            <button type="button" class="tab-btn is-active" role="tab" aria-selected="true" id="tab-existing">
              Dari Daftar Pengaduan
            </button>
            <button type="button" class="tab-btn" role="tab" aria-selected="false" id="tab-custom">
              Uji Teks Pengaduan Baru
            </button>
          </div>

          <div id="pane-existing">
            <div class="field-group">
              <label class="field-label" for="an-select-complaint">Pilih Laporan Warga</label>
              <select id="an-select-complaint" class="select">
                ${
                  complaintOptions ||
                  '<option value="">Belum ada pengaduan tersimpan</option>'
                }
              </select>
            </div>

            <div id="an-selected-preview" class="notice-box" style="margin-bottom: 14px;"></div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <button type="button" class="btn btn-accent" id="an-run-existing-btn" ${
                complaints.length ? '' : 'disabled'
              }>
                Analisis Pengaduan & Simpan
              </button>
              <button type="button" class="btn btn-secondary" id="an-open-detail-btn" ${
                complaints.length ? '' : 'disabled'
              }>
                Buka Detail Laporan
              </button>
            </div>
          </div>

          <form id="pane-custom" hidden novalidate>
            <div id="an-custom-error" class="notice-box is-error" hidden style="margin-bottom: 12px;"></div>

            <div class="field-group">
              <label class="field-label" for="an-title">Judul Pengaduan Uji Coba</label>
              <input id="an-title" name="title" type="text" class="input" placeholder="Contoh: Pohon besar tumbang menutup jalan desa">
            </div>

            <div class="two-col-grid">
              <div class="field-group">
                <label class="field-label" for="an-category">Kategori Awal (Opsional)</label>
                <select id="an-category" name="category" class="select">
                  <option value="">Biarkan sistem mendeteksi</option>
                  ${categoryOptions}
                </select>
              </div>
              <div class="field-group">
                <label class="field-label" for="an-location">Lokasi</label>
                <input id="an-location" name="location" type="text" class="input" placeholder="Contoh: Dusun Mulyo RT 02 / RW 05">
              </div>
            </div>

            <div class="field-group">
              <label class="field-label" for="an-description">Deskripsi Kejadian</label>
              <textarea id="an-description" name="description" class="textarea" placeholder="Tuliskan uraian masalah warga untuk menguji klasifikasi kategori, urgensi, dan rekomendasi petugas."></textarea>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <button type="submit" class="btn btn-accent" id="an-run-custom-btn">Analisis Pengaduan</button>
              <button type="button" class="btn btn-secondary" id="an-sample-fill-btn">Isi Contoh Kasus Darurat</button>
            </div>
          </form>
        </div>

        <div id="an-result-region">
          ${renderAnalysisOutput(null)}
        </div>
      </div>
    `;

    const tabExisting = document.getElementById('tab-existing');
    const tabCustom = document.getElementById('tab-custom');
    const paneExisting = document.getElementById('pane-existing');
    const paneCustom = document.getElementById('pane-custom');
    const selectEl = document.getElementById('an-select-complaint');
    const previewBox = document.getElementById('an-selected-preview');
    const resultRegion = document.getElementById('an-result-region');

    const updateSelectedPreview = () => {
      const selectedId = Number(selectEl.value);
      const found = complaints.find((c) => c.id === selectedId);
      if (!found) {
        previewBox.innerHTML = 'Belum ada laporan yang dapat dipilih.';
        return;
      }
      previewBox.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: space-between; margin-bottom: 6px;">
          <span class="mono" style="font-weight: 600;">${escapeHtml(found.ticket_code)}</span>
          ${statusTag(found.status)}
        </div>
        <p style="font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">${escapeHtml(found.title)}</p>
        <p style="margin-bottom: 6px;">${escapeHtml(found.description)}</p>
        <p><strong>Lokasi:</strong> ${escapeHtml(found.location)}</p>
      `;

      if (found.ai_summary) {
        resultRegion.innerHTML = renderAnalysisOutput(
          {
            category: found.ai_category,
            summary: found.ai_summary,
            urgency: found.ai_urgency,
            urgencyReason:
              found.ai_urgency_reason || 'Tersimpan dari hasil analisis sebelumnya.',
            suggestedHandler: found.ai_handler,
            mode: found.ai_mode || 'simulation',
            modeLabel:
              found.ai_mode === 'external_api'
                ? 'API AI Eksternal'
                : 'Mode Simulasi Lokal (Tanpa API AI)',
            disclaimer:
              found.ai_mode === 'external_api'
                ? 'Hasil tersimpan dari API AI eksternal.'
                : 'Hasil tersimpan dari mesin simulasi berbasis aturan lokal untuk keperluan demo studi kasus.'
          },
          found.ticket_code
        );
      } else {
        resultRegion.innerHTML = renderAnalysisOutput(null);
      }
    };

    updateSelectedPreview();
    selectEl.addEventListener('change', updateSelectedPreview);

    const switchTab = (mode) => {
      const isExisting = mode === 'existing';
      tabExisting.classList.toggle('is-active', isExisting);
      tabExisting.setAttribute('aria-selected', String(isExisting));
      tabCustom.classList.toggle('is-active', !isExisting);
      tabCustom.setAttribute('aria-selected', String(!isExisting));
      paneExisting.hidden = !isExisting;
      paneCustom.hidden = isExisting;
    };

    tabExisting.addEventListener('click', () => switchTab('existing'));
    tabCustom.addEventListener('click', () => switchTab('custom'));

    const runExistingBtn = document.getElementById('an-run-existing-btn');
    runExistingBtn?.addEventListener('click', async () => {
      const selectedId = Number(selectEl.value);
      if (!selectedId) return;
      runExistingBtn.disabled = true;
      runExistingBtn.textContent = 'Menganalisis...';
      try {
        const res = await api.analyzeComplaint(selectedId);
        const idx = complaints.findIndex((c) => c.id === selectedId);
        if (idx >= 0) complaints[idx] = res.complaint;
        resultRegion.innerHTML = renderAnalysisOutput(res.analysis, res.complaint.ticket_code);
        showToast(`Hasil analisis disimpan untuk ${res.complaint.ticket_code}.`);
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        runExistingBtn.disabled = false;
        runExistingBtn.textContent = 'Analisis Pengaduan & Simpan';
      }
    });

    document.getElementById('an-open-detail-btn')?.addEventListener('click', () => {
      const selectedId = Number(selectEl.value);
      if (selectedId) actions.openComplaintDetail(selectedId);
    });

    document.getElementById('an-sample-fill-btn')?.addEventListener('click', () => {
      paneCustom.title.value = 'Kabel tiang listrik menjuntai rendah di dekat sekolah';
      paneCustom.category.value = '';
      paneCustom.location.value = 'Jl. Pendidikan RT 01 / RW 02, depan SDN Toyamas';
      paneCustom.description.value =
        'Setelah angin kencang tadi malam, kabel tiang PJU di depan gerbang sekolah melorot rendah dan mengeluarkan percikan ringan. Kondisi sangat berbahaya bagi siswa dan warga yang melintas.';
    });

    paneCustom.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errBox = document.getElementById('an-custom-error');
      const submitBtn = document.getElementById('an-run-custom-btn');
      errBox.hidden = true;

      const payload = {
        title: paneCustom.title.value.trim(),
        category: paneCustom.category.value,
        location: paneCustom.location.value.trim(),
        description: paneCustom.description.value.trim()
      };

      if (payload.title.length < 3 && payload.description.length < 10) {
        errBox.textContent = 'Masukkan judul atau deskripsi pengaduan minimal 10 karakter.';
        errBox.hidden = false;
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Menganalisis...';

      try {
        const analysis = await api.analyzePreview(payload);
        resultRegion.innerHTML = renderAnalysisOutput(analysis);
        showToast('Analisis simulasi selesai.');
      } catch (err) {
        errBox.textContent = err.message;
        errBox.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Analisis Pengaduan';
      }
    });
  } catch (err) {
    container.innerHTML = `
      <div class="state-card">
        <p class="state-title">Gagal memuat AI Complaint Analyzer</p>
        <p class="state-desc">${escapeHtml(err.message)}</p>
        <button type="button" class="btn btn-primary" id="an-retry-btn">Coba Muat Ulang</button>
      </div>
    `;
    document.getElementById('an-retry-btn')?.addEventListener('click', () => {
      renderAnalyzerView(container, actions);
    });
  }
}
