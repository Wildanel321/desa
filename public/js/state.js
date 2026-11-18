export const appState = {
  view: 'dashboard',
  user: null,
  complaintFilter: {
    status: 'Semua',
    category: 'Semua',
    q: ''
  },
  villageTab: 'profil',
  assistantMessages: [
    {
      role: 'bot',
      text: 'Halo, saya Asisten Layanan Desa Toyamas (Mode Simulasi Lokal). Silakan tanyakan persyaratan surat administrasi, jam pelayanan kantor desa, pengumuman desa, atau cara membuat pengaduan.',
      source: 'Basis Pengetahuan Lokal Desa Toyamas',
      found: true,
      relatedView: null
    }
  ],
  pendingAssistantQuestion: ''
};
