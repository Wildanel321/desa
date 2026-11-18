import { api, setAuthToken } from './api.js';
import { hydrateIcons } from './icons.js';
import { appState } from './state.js';
import { escapeHtml } from './utils.js';
import { renderDashboardView } from './views/dashboardView.js';
import { renderComplaintsView } from './views/complaintsView.js';
import { renderAnalyzerView } from './views/analyzerView.js';
import { renderAssistantView } from './views/assistantView.js';
import { renderVillageInfoView } from './views/villageInfoView.js';
import { openComplaintFormModal } from './modals/complaintFormModal.js';
import { openComplaintDetailModal } from './modals/complaintDetailModal.js';
import { openAdminLoginModal } from './modals/adminLoginModal.js';
import { openAnnouncementModal } from './modals/announcementModal.js';

const VALID_VIEWS = ['dashboard', 'pengaduan', 'analyzer', 'asisten', 'informasi'];

const PAGE_TITLES = {
  dashboard: 'Dashboard | Toyamas Smart Village Platform',
  pengaduan: 'Pengaduan Masyarakat | Toyamas',
  analyzer: 'AI Complaint Analyzer | Toyamas',
  asisten: 'AI Village Assistant | Toyamas',
  informasi: 'Informasi Desa | Toyamas'
};

const sidebar = document.getElementById('sidebar');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const mainContent = document.getElementById('main-content');

function setDrawerOpen(open) {
  sidebar.classList.toggle('is-open', open);
  drawerBackdrop.hidden = !open;
  menuToggleBtn.setAttribute('aria-expanded', String(open));
}

function updateAuthUi() {
  const topbarLabel = document.getElementById('topbar-auth-label');
  const sidebarBox = document.getElementById('sidebar-auth-box');

  if (appState.user) {
    topbarLabel.textContent = 'Admin Aktif';
    sidebarBox.innerHTML = `
      <div class="auth-box-row">
        <span class="avatar-initials is-admin" aria-hidden="true">AD</span>
        <div class="auth-meta">
          <div class="auth-name">${escapeHtml(appState.user.name)}</div>
          <div class="auth-role">Mode Pengelola Desa</div>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm btn-block" id="sidebar-auth-btn">Kelola Sesi Admin</button>
    `;
  } else {
    topbarLabel.textContent = 'Masuk Admin';
    sidebarBox.innerHTML = `
      <div class="auth-box-row">
        <span class="avatar-initials" aria-hidden="true">WG</span>
        <div class="auth-meta">
          <div class="auth-name">Pengunjung / Warga</div>
          <div class="auth-role">Mode Demo Publik</div>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm btn-block" id="sidebar-auth-btn">Masuk Admin Demo</button>
    `;
  }

  document.getElementById('sidebar-auth-btn')?.addEventListener('click', openAuthDialog);
}

function updateOpenCount(count) {
  const badge = document.getElementById('nav-open-count');
  if (badge) {
    badge.textContent = String(count);
  }
}

async function refreshOpenCount() {
  try {
    const data = await api.getDashboard();
    const active = (data.complaintsSummary?.menunggu || 0) + (data.complaintsSummary?.diproses || 0);
    updateOpenCount(active);
  } catch {
    // Keep the last rendered badge value if background count refresh fails.
  }
}

function resolveViewFromHash() {
  const raw = window.location.hash.replace(/^#/, '').trim().toLowerCase();
  return VALID_VIEWS.includes(raw) ? raw : 'dashboard';
}

function syncActiveNav(view) {
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.getAttribute('data-nav') === view;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  document.title = PAGE_TITLES[view] || PAGE_TITLES.dashboard;
}

const actions = {
  navigate(view) {
    const target = VALID_VIEWS.includes(view) ? view : 'dashboard';
    if (window.location.hash !== `#${target}`) {
      window.location.hash = `#${target}`;
    } else {
      renderCurrentView();
    }
    setDrawerOpen(false);
  },
  filterComplaints(nextFilter) {
    appState.complaintFilter = { ...nextFilter };
    actions.navigate('pengaduan');
  },
  openNewComplaint() {
    openComplaintFormModal({
      onCreated: () => {
        refreshOpenCount();
        renderCurrentView();
      }
    });
  },
  openComplaintDetail(id) {
    openComplaintDetailModal(id, {
      onUpdated: () => {
        updateAuthUi();
        refreshOpenCount();
        renderCurrentView();
      }
    });
  },
  openNewAnnouncement() {
    if (!appState.user) {
      openAuthDialog(() => {
        openAnnouncementModal({ onCreated: () => renderCurrentView() });
      });
      return;
    }
    openAnnouncementModal({
      onCreated: () => renderCurrentView()
    });
  },
  updateOpenCount
};

function openAuthDialog(afterLogin) {
  openAdminLoginModal({
    onSuccess: () => {
      updateAuthUi();
      renderCurrentView();
      if (typeof afterLogin === 'function') afterLogin();
    },
    onLogout: () => {
      updateAuthUi();
      renderCurrentView();
    }
  });
}

async function renderCurrentView() {
  const view = resolveViewFromHash();
  appState.view = view;
  syncActiveNav(view);

  if (view === 'dashboard') {
    await renderDashboardView(mainContent, actions);
  } else if (view === 'pengaduan') {
    await renderComplaintsView(mainContent, actions);
  } else if (view === 'analyzer') {
    await renderAnalyzerView(mainContent, actions);
  } else if (view === 'asisten') {
    renderAssistantView(mainContent, actions);
  } else if (view === 'informasi') {
    await renderVillageInfoView(mainContent, actions);
  }
}

async function bootstrap() {
  hydrateIcons();

  menuToggleBtn.addEventListener('click', () => {
    setDrawerOpen(!sidebar.classList.contains('is-open'));
  });
  sidebarCloseBtn.addEventListener('click', () => setDrawerOpen(false));
  drawerBackdrop.addEventListener('click', () => setDrawerOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
      setDrawerOpen(false);
    }
  });

  document.getElementById('topbar-new-complaint-btn').addEventListener('click', actions.openNewComplaint);
  document.getElementById('topbar-auth-btn').addEventListener('click', () => openAuthDialog());

  document.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', () => setDrawerOpen(false));
  });

  window.addEventListener('hashchange', renderCurrentView);

  try {
    const me = await api.getMe();
    if (me.authenticated && me.user) {
      appState.user = me.user;
    } else {
      setAuthToken('');
      appState.user = null;
    }
  } catch {
    appState.user = null;
  }

  updateAuthUi();
  await renderCurrentView();
  refreshOpenCount();
}

bootstrap();
