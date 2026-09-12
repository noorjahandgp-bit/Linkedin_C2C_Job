/**
 * STUDENT TASK & TO-DO MANAGER - MODAL MANAGER
 * Pure vanilla JavaScript modal dialog controller with keyboard ESC support.
 */

window.ModalManager = {
  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Autofocus first input if present
    const firstInput = modal.querySelector('input, select, textarea, button:not(.modal-close)');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
  },

  init() {
    // Open triggers: elements with data-modal-target="modalId"
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = trigger.getAttribute('data-modal-target');
        this.open(targetId);
      });
    });

    // Close buttons: elements with data-modal-close or .modal-close
    document.querySelectorAll('[data-modal-close], .modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('.modal-overlay');
        if (modal) {
          this.close(modal.id);
        }
      });
    });

    // Backdrop click closes
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close(modal.id);
        }
      });
    });

    // Keyboard ESC key closes open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal-overlay.active');
        if (openModal) {
          this.close(openModal.id);
        }
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.ModalManager.init();
});
