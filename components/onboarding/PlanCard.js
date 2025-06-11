/**
 * PlanCard Component JS
 * Handles the selection and interaction with insurance plan cards
 */

(function() {
  // Initialize the component
  const planCardManager = {
    init: function() {
      // Get container element
      this.container = document.querySelector('.plan-card');
      
      if (!this.container) return;
      
      // Cache DOM elements
      this.selectButton = this.container.querySelector('.select-plan');
      this.planId = this.selectButton ? this.selectButton.getAttribute('data-plan') : null;
      
      // Set up event listeners
      this.setupEventListeners();
    },
    
    setupEventListeners: function() {
      // Add click handler to the select button
      if (this.selectButton) {
        this.selectButton.addEventListener('click', this.handleSelection.bind(this));
      }
      
      // Listen for external selection events
      document.addEventListener('planSelected', this.handleExternalSelection.bind(this));
    },
    
    handleSelection: function(event) {
      // Prevent default button behavior
      event.preventDefault();
      
      // Get all plan cards
      const allPlanCards = document.querySelectorAll('.plan-card');
      const allSelectButtons = document.querySelectorAll('.select-plan');
      
      // Reset all plan cards and buttons
      allPlanCards.forEach(card => {
        card.classList.remove('recommended', 'animated');
      });
      
      allSelectButtons.forEach(btn => {
        btn.classList.remove('onboarding-button-selected');
        btn.classList.add('onboarding-button', 'text-white', 'hover:bg-gray-700');
      });
      
      // Highlight this plan card
      this.container.classList.add('recommended', 'animated');
      this.selectButton.classList.remove('hover:bg-gray-700');
      this.selectButton.classList.add('onboarding-button-selected');
      
      // Remove animation class after it completes
      setTimeout(() => {
        this.container.classList.remove('animated');
      }, 600);
      
      // Dispatch event with selected plan data
      this.dispatchSelectionEvent();
    },
    
    handleExternalSelection: function(event) {
      // If another plan was selected, check if it's this one
      if (event.detail && event.detail.planId === this.planId) {
        // This plan was selected externally, highlight it
        this.container.classList.add('recommended');
        this.selectButton.classList.remove('hover:bg-gray-700');
        this.selectButton.classList.add('onboarding-button-selected');
      } else {
        // Another plan was selected, remove highlights from this one
        this.container.classList.remove('recommended');
        this.selectButton.classList.remove('onboarding-button-selected');
        this.selectButton.classList.add('hover:bg-gray-700');
      }
    },
    
    dispatchSelectionEvent: function() {
      // Get plan details from the card
      const planTitle = this.container.querySelector('h3').textContent;
      const planDescription = this.container.querySelector('.plan-header p').textContent;
      const planPrice = this.container.querySelector('.plan-price').textContent.trim();
      
      // Collect feature list
      const features = [];
      const featureElements = this.container.querySelectorAll('.plan-features li');
      
      featureElements.forEach(li => {
        features.push({
          text: li.textContent.trim(),
          enabled: !li.classList.contains('feature-disabled'),
          isNew: li.classList.contains('feature-new')
        });
      });
      
      // Create plan data object
      const planData = {
        planId: this.planId,
        title: planTitle,
        description: planDescription,
        price: planPrice,
        features: features,
        recommended: this.container.classList.contains('recommended')
      };
      
      // Dispatch custom event with plan data
      const planSelectedEvent = new CustomEvent('planSelected', {
        detail: planData,
        bubbles: true
      });
      
      document.dispatchEvent(planSelectedEvent);
    }
  };
  
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Allow a brief delay for the component to render completely
    setTimeout(() => {
      planCardManager.init();
    }, 100);
  });
})();