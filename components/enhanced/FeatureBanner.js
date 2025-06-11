/**
 * Enhanced Feature Banner Component
 * Demonstrates advanced component features like state management, lifecycle events,
 * and DOM manipulation
 */
(function() {
  // When component is loaded, register it with the component system
  ComponentSystem.registerHook('feature-banner', 'render', function() {
    // Reference to this component
    const component = this;
    
    // Initialize feature rotation functionality
    initFeatureRotation(component);
    
    // Setup interaction handlers
    setupInteractionHandlers(component);
    
    // Handle responsive behavior
    handleResponsiveBehavior(component);
    
    // Log component loaded
    console.log('Feature Banner component loaded and initialized');
  });
  
  /**
   * Initializes feature rotation
   */
  function initFeatureRotation(component) {
    // Get all feature overlays
    const featureOverlays = component.$('.feature-overlay');
    const featureItems = component.$('.feature-item');
    
    // Function to show specific feature
    function showFeature(index) {
      // Remove active class from all
      featureOverlays.forEach(overlay => overlay.classList.remove('active'));
      featureItems.forEach(item => item.classList.remove('active'));
      
      // Add active class to selected feature
      if (featureOverlays[index]) {
        featureOverlays[index].classList.add('active');
      }
      
      if (featureItems[index]) {
        featureItems[index].classList.add('active');
      }
      
      // Update component state
      component.setState({ activeFeatureIndex: index });
    }
    
    // Watch for state changes
    component.watch('activeFeatureIndex', (newIndex) => {
      showFeature(newIndex);
    });
    
    // Set initial active feature if not already set
    if (component.state.activeFeatureIndex === undefined) {
      showFeature(0);
    } else {
      showFeature(component.state.activeFeatureIndex);
    }
  }
  
  /**
   * Sets up interaction handlers
   */
  function setupInteractionHandlers(component) {
    // Get feature items
    const featureItems = component.$('.feature-item');
    
    // Add click handlers
    featureItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        // Stop auto-rotation when user interacts
        component.setState({ 
          autoRotate: false,
          activeFeatureIndex: index
        });
        
        // Restart auto-rotation after 10 seconds of inactivity
        clearTimeout(component._rotationTimeout);
        component._rotationTimeout = setTimeout(() => {
          component.setState({ autoRotate: true });
        }, 10000);
      });
    });
    
    // Add hover effect to pause rotation
    const bannerElement = component.getElement();
    bannerElement.addEventListener('mouseenter', () => {
      // Pause rotation on hover
      component._previousRotationState = component.state.autoRotate;
      component.setState({ autoRotate: false });
    });
    
    bannerElement.addEventListener('mouseleave', () => {
      // Resume rotation when mouse leaves (if it was active before)
      if (component._previousRotationState !== false) {
        component.setState({ autoRotate: true });
      }
    });
  }
  
  /**
   * Handles responsive behavior
   */
  function handleResponsiveBehavior(component) {
    // Get overlay card
    const overlayCard = component.$$('.overlay-card');
    
    // Handle resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        overlayCard.classList.remove('absolute');
        overlayCard.classList.add('relative');
      } else {
        overlayCard.classList.add('absolute');
        overlayCard.classList.remove('relative');
      }
    };
    
    // Initial check
    handleResize();
    
    // Setup resize observer
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.body);
    
    // Clean up on component removal
    component.onBeforeRemove = function() {
      resizeObserver.disconnect();
      clearTimeout(component._rotationTimeout);
    };
  }
})();