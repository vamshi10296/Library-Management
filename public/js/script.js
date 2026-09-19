/**
 * LibManager - Global Client Interactions & Micro-Animations
 * College Assignment-2 (PS 0) | Author: Vamshi Yarragorla
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNav();
  initAutoDismissAlerts();
  initStatCounters();
  initFormLoadingStates();
});

/**
 * 1. Glass Navbar Blur on Scroll
 */
function initNavbarScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * 2. Mobile Responsive Navigation Drawer
 */
function initMobileNav() {
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');

  if (!mobileToggle || !navLinks) return;

  mobileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = navLinks.classList.toggle('show');
    mobileToggle.setAttribute('aria-expanded', String(isExpanded));
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('show') && !navLinks.contains(/** @type {Node} */ (e.target)) && e.target !== mobileToggle) {
      navLinks.classList.remove('show');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 3. Flash Alerts Auto-Dismiss
 */
function initAutoDismissAlerts() {
  const alerts = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.alert'));
  alerts.forEach((alert) => {
    const closeBtn = alert.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissElement(alert);
      });
    }

    // Auto-fade timer (6 seconds)
    setTimeout(() => {
      dismissElement(alert);
    }, 6000);
  });
}

/**
 * Smoothly fade out and remove an element
 * @param {HTMLElement} el
 */
function dismissElement(el) {
  if (!el || !el.parentNode) return;
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateY(-6px)';
  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 400);
}

/**
 * 4. Animated Number Counters on Metric Cards
 */
function initStatCounters() {
  const counterElements = document.querySelectorAll('.stat-value, .hero-stat-value');
  counterElements.forEach((el) => {
    const rawText = el.textContent ? el.textContent.trim() : '';
    // Check if content is purely a number
    const match = rawText.match(/^(\d+)$/);
    if (!match) return;

    const targetNum = parseInt(match[1], 10);
    if (isNaN(targetNum) || targetNum === 0) return;

    let current = 0;
    const duration = 1200; // ms
    const stepTime = 30; // ms
    const totalSteps = Math.max(Math.floor(duration / stepTime), 1);
    const increment = Math.ceil(targetNum / totalSteps);

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNum) {
        current = targetNum;
        clearInterval(timer);
      }
      el.textContent = String(current);
    }, stepTime);
  });
}

/**
 * 5. Form Submit Loading State
 */
function initFormLoadingStates() {
  const forms = document.querySelectorAll('form:not([data-no-loading])');
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      // Find submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.hasAttribute('disabled')) {
        setTimeout(() => {
          submitBtn.classList.add('btn-loading');
        }, 50);
      }
    });
  });
}

/**
 * Toast Notification System API
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span>${icons[type] || 'ℹ️'}</span>
    <div style="flex: 1; line-height: 1.4;">${message}</div>
    <button type="button" class="toast-close" aria-label="Close">&times;</button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      dismissElement(toast);
    });
  }

  setTimeout(() => {
    dismissElement(toast);
  }, 5000);
}

/**
 * Confirmation dialog for destructive/critical actions
 * @param {string} [message]
 * @returns {boolean}
 */
function confirmAction(message) {
  return window.confirm(message || 'Are you sure you want to proceed with this action?');
}
