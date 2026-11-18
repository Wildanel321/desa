let activeCleanup = null;
let previousFocus = null;

export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) {
    root.innerHTML = '';
  }
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  previousFocus = null;
}

export function openModal({ title, bodyHtml, footerHtml = '', onMount }) {
  closeModal();
  previousFocus = document.activeElement;

  const root = document.getElementById('modal-root');
  const titleId = 'modal-dialog-title';

  root.innerHTML = `
    <div class="modal-backdrop" id="active-modal-backdrop">
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <div class="modal-header">
          <h2 id="${titleId}" class="modal-title">${title}</h2>
          <button type="button" class="icon-btn" id="modal-close-x" aria-label="Tutup dialog">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;

  const backdrop = document.getElementById('active-modal-backdrop');
  const closeBtn = document.getElementById('modal-close-x');

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  };

  const onBackdropClick = (event) => {
    if (event.target === backdrop) {
      closeModal();
    }
  };

  document.addEventListener('keydown', onKeyDown);
  backdrop.addEventListener('click', onBackdropClick);
  closeBtn.addEventListener('click', closeModal);

  activeCleanup = () => {
    document.removeEventListener('keydown', onKeyDown);
  };

  if (typeof onMount === 'function') {
    onMount(root);
  }

  const firstFocusable = root.querySelector('input, select, textarea, button');
  if (firstFocusable) {
    firstFocusable.focus();
  }
}
