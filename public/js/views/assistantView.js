import { api } from '../api.js';
import { appState } from '../state.js';
import { getIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';

const SAMPLE_QUESTIONS = [
  'Apa saja persyaratan membuat surat domisili?',
  'Jam pelayanan Kantor Desa Toyamas hari apa saja?',
  'Bagaimana cara mengurus Surat Keterangan Usaha (SKU)?',
  'Prosedur pembuatan pengantar KTP dan Kartu Keluarga?',
  'Kapan jadwal Posyandu dan kerja bakti bulan ini?',
  'Berapa jadwal keberangkatan kereta dari desa ini? (Uji konfirmasi)'
];

export function renderAssistantView(container, actions) {
  container.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">AI Village Assistant</h1>
        <p class="page-subtitle">Asisten tanya jawab layanan administrasi dan informasi Desa Toyamas menggunakan basis pengetahuan desa lokal.</p>
      </div>
      <div class="page-actions">
        <span class="tag tag-sim">Basis Pengetahuan Lokal (Simulasi)</span>
      </div>
    </div>

    <div class="assistant-grid">
      <section class="panel chat-panel" aria-label="Percakapan Asisten Desa">
        <div class="chat-header">
          <div>
            <h2 class="panel-title" style="font-size: 1rem;">Asisten Layanan Desa Toyamas</h2>
            <p class="field-hint">Menjawab dari basis data desa simulasi. Jika tidak tersedia, akan mengarahkan konfirmasi ke kantor desa.</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="chat-reset-btn">Mulai Baru</button>
        </div>

        <div id="chat-messages" class="chat-messages" aria-live="polite"></div>

        <form id="chat-form" class="chat-form">
          <label class="sr-only" for="chat-input">Tulis pertanyaan Anda</label>
          <input
            id="chat-input"
            name="question"
            type="text"
            class="input"
            autocomplete="off"
            placeholder="Tanyakan syarat surat domisili, jam pelayanan, atau info desa..."
          >
          <button type="submit" class="btn btn-primary" id="chat-send-btn">
            <span class="btn-icon" aria-hidden="true">${getIcon('send')}</span>
            <span>Kirim</span>
          </button>
        </form>
      </section>

      <aside class="panel" aria-label="Contoh pertanyaan warga">
        <h2 class="panel-title" style="font-size: 1rem; margin-bottom: 6px;">Contoh Pertanyaan Cepat</h2>
        <p class="field-hint" style="margin-bottom: 12px;">Klik salah satu pertanyaan di bawah untuk langsung mencoba respons asisten.</p>

        <div class="prompt-list">
          ${SAMPLE_QUESTIONS.map(
            (q) =>
              `<button type="button" class="prompt-btn" data-sample-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`
          ).join('')}
        </div>

        <div class="notice-box" style="margin-top: 14px;">
          <strong>Batasan Asisten:</strong> Asisten hanya menjawab berdasarkan data desa yang tersedia di sistem demo. Pertanyaan di luar basis pengetahuan akan diarahkan untuk konfirmasi langsung ke Kantor Desa Toyamas.
        </div>
      </aside>
    </div>
  `;

  const messagesEl = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  const renderMessages = () => {
    messagesEl.innerHTML = appState.assistantMessages
      .map((msg) => {
        if (msg.role === 'user') {
          return `<div class="chat-bubble is-user">${escapeHtml(msg.text)}</div>`;
        }
        const actionBtn =
          msg.relatedView === 'informasi'
            ? '<button type="button" class="btn btn-secondary btn-sm" data-chat-nav="informasi">Buka Informasi Desa</button>'
            : msg.relatedView === 'pengaduan'
              ? '<button type="button" class="btn btn-secondary btn-sm" data-chat-nav="pengaduan">Buka Pengaduan</button>'
              : '';
        return `
          <div class="chat-bubble is-bot ${msg.found === false ? 'is-fallback' : ''}">
            <div>${escapeHtml(msg.text)}</div>
            <div class="chat-bubble-meta">
              <span>${escapeHtml(msg.source || 'Basis Pengetahuan Desa Toyamas')}</span>
              ${actionBtn}
            </div>
          </div>
        `;
      })
      .join('');

    messagesEl.querySelectorAll('[data-chat-nav]').forEach((btn) => {
      btn.addEventListener('click', () => {
        actions.navigate(btn.getAttribute('data-chat-nav'));
      });
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const submitQuestion = async (rawQuestion) => {
    const clean = String(rawQuestion || '').trim();
    if (!clean) return;

    appState.assistantMessages.push({ role: 'user', text: clean });
    renderMessages();

    input.value = '';
    input.disabled = true;
    sendBtn.disabled = true;

    try {
      const reply = await api.askAssistant(clean);
      appState.assistantMessages.push({
        role: 'bot',
        text: reply.answer,
        source: reply.source,
        found: reply.found,
        relatedView: reply.relatedView
      });
    } catch (err) {
      appState.assistantMessages.push({
        role: 'bot',
        text: `Maaf, permintaan tidak dapat diproses saat ini (${err.message}). Silakan coba lagi atau hubungi Kantor Desa Toyamas.`,
        source: 'Gangguan Koneksi Lokal',
        found: false,
        relatedView: null
      });
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      renderMessages();
      input.focus();
    }
  };

  renderMessages();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitQuestion(input.value);
  });

  container.querySelectorAll('[data-sample-q]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const raw = btn.getAttribute('data-sample-q').replace(/\s*\(Uji konfirmasi\)$/, '');
      submitQuestion(raw);
    });
  });

  document.getElementById('chat-reset-btn').addEventListener('click', () => {
    appState.assistantMessages = [
      {
        role: 'bot',
        text: 'Percakapan dimulai ulang. Silakan tanyakan informasi layanan administrasi, jam kantor desa, atau pengumuman Desa Toyamas.',
        source: 'Basis Pengetahuan Lokal Desa Toyamas',
        found: true,
        relatedView: null
      }
    ];
    renderMessages();
  });

  if (appState.pendingAssistantQuestion) {
    const pending = appState.pendingAssistantQuestion;
    appState.pendingAssistantQuestion = '';
    submitQuestion(pending);
  }
}
