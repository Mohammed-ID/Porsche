/**
 * Navbar Component JavaScript
 * Handles mobile menu toggle and navigation behavior
 */
(function() {
  // Cache DOM elements
  const nav = document.querySelector('nav');
  const navGradient = nav ? nav.querySelector('div:first-child') : null;
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.getElementById('navMenu');

  /**
   * Update header state
   */
  const updateHeader = () => {
    if (!nav || !navGradient) return;

    // Apply all styles at once without conditional logic for better performance
    navGradient.style.opacity = '1';
    nav.style.backgroundColor = 'transparent';
    nav.style.boxShadow = 'none';
  };

  /**
   * Handle mobile menu toggle
   */
  const setupMobileMenu = () => {
    if (!menuBtn || !navMenu) return;

    menuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('hidden');
    });

    // Use event delegation instead of multiple event listeners
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navMenu.classList.add('hidden');
      }
    });
  };

  /**
   * Initialize component
   */
  function init() {
    updateHeader();
    setupMobileMenu();

    // Add passive event listener for better scroll performance
    window.addEventListener('scroll', updateHeader, { passive: true });

    // Listen for resize events with debounce
    let resizeTimeout;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateHeader();
        }, 100);
      },
      { passive: true }
    );
  }

  // Initialize when component is loaded
  init();
})();