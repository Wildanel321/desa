export const COMPLAINT_CATEGORIES = [
  'Infrastruktur & Jalan',
  'Air Bersih & Drainase',
  'Penerangan & Listrik',
  'Kebersihan & Lingkungan',
  'Layanan Administrasi',
  'Keamanan & Ketertiban',
  'Fasilitas Umum Lainnya'
];

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(Number(num) || 0);
}

export function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function statusTag(status) {
  const safe = escapeHtml(status || 'Menunggu');
  const map = {
    Menunggu: 'tag-menunggu',
    Diproses: 'tag-diproses',
    Selesai: 'tag-selesai'
  };
  return `<span class="tag ${map[status] || 'tag-neutral'}">${safe}</span>`;
}

export function urgencyTag(urgency) {
  if (!urgency) {
    return '<span class="tag tag-neutral">Belum dianalisis</span>';
  }
  const safe = escapeHtml(urgency);
  const map = {
    Tinggi: 'tag-tinggi',
    Sedang: 'tag-sedang',
    Rendah: 'tag-rendah'
  };
  return `<span class="tag ${map[urgency] || 'tag-neutral'}">Urgensi ${safe}</span>`;
}

export function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  if (!root) return;
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'is-error' : ''}`;
  el.textContent = message;
  root.appendChild(el);
  window.setTimeout(() => {
    el.remove();
  }, 3600);
}
