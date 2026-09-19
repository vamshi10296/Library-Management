/**
 * LibManager - Interactive Dashboard & Authentication Features
 * College Assignment-2 (PS 0) | Author: Vamshi Yarragorla
 */

document.addEventListener('DOMContentLoaded', () => {
  initCatalogueLiveFilter();
});

/**
 * 1. Quick-fill demo credentials on the Login page
 * @param {'admin'|'member'} role 
 */
function fillDemoCredentials(role) {
  const emailInput = /** @type {HTMLInputElement | null} */ (document.getElementById('email'));
  const passwordInput = /** @type {HTMLInputElement | null} */ (document.getElementById('password'));

  if (!emailInput || !passwordInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@library.com';
    passwordInput.value = 'admin123';
  } else if (role === 'member') {
    emailInput.value = 'member@library.com';
    passwordInput.value = 'member123';
  }

  // Highlight filled inputs with glow animation
  [emailInput, passwordInput].forEach(input => {
    input.style.borderColor = 'var(--accent-blue)';
    input.style.boxShadow = '0 0 16px rgba(14, 165, 233, 0.4)';
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }, 500);
  });

  if (typeof showToast === 'function') {
    showToast(`Filled ${role.toUpperCase()} demo credentials!`, 'info');
  }
}

/**
 * 2. Password Visibility Show / Hide Toggle
 * @param {string} inputId
 * @param {HTMLElement} btnEl
 */
function togglePasswordVisibility(inputId, btnEl) {
  const input = /** @type {HTMLInputElement | null} */ (document.getElementById(inputId));
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = '👁️‍🗨️';
    btnEl.setAttribute('aria-label', 'Hide password');
    btnEl.title = 'Hide password';
  } else {
    input.type = 'password';
    btnEl.innerHTML = '👁️';
    btnEl.setAttribute('aria-label', 'Show password');
    btnEl.title = 'Show password';
  }
}

/**
 * 3. Client-Side Live Catalogue Search & Filter
 * Provides instant sub-millisecond filtering across book cards
 */
function initCatalogueLiveFilter() {
  const searchInput = /** @type {HTMLInputElement | null} */ (document.querySelector('.search-input-group input[name="search"]'));
  const booksGrid = document.querySelector('.books-grid');
  const bookCards = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.books-grid .book-card'));

  if (!searchInput || !booksGrid || bookCards.length === 0) return;

  // Real-time live filtering on typing
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    bookCards.forEach(card => {
      const title = (card.querySelector('.book-card-title')?.textContent || '').toLowerCase();
      const author = (card.querySelector('.book-card-author')?.textContent || '').toLowerCase();
      const category = (card.querySelector('.book-category-pill')?.textContent || '').toLowerCase();
      const isbn = (card.querySelector('code')?.textContent || '').toLowerCase();

      const matches = !query || title.includes(query) || author.includes(query) || category.includes(query) || isbn.includes(query);

      if (matches) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Handle dynamic empty state
    let liveEmptyState = document.getElementById('liveEmptyState');
    if (visibleCount === 0) {
      if (!liveEmptyState) {
        liveEmptyState = document.createElement('div');
        liveEmptyState.id = 'liveEmptyState';
        liveEmptyState.className = 'empty-state';
        liveEmptyState.style.gridColumn = '1 / -1';
        liveEmptyState.innerHTML = `
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No matching books found</h3>
          <p class="empty-state-desc">Try adjusting your keywords or clearing the search query.</p>
        `;
        booksGrid.appendChild(liveEmptyState);
      }
      liveEmptyState.style.display = 'block';
    } else if (liveEmptyState) {
      liveEmptyState.style.display = 'none';
    }
  });
}

/**
 * Filter catalogue by category chip
 * @param {string} category
 */
function filterByCategoryChip(category) {
  const select = /** @type {HTMLSelectElement | null} */ (document.querySelector('select[name="category"]'));
  if (select) {
    select.value = category;
    if (select.form) select.form.submit();
  }
}
