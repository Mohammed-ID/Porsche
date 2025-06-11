/**
 * PlansScreen Component JS
 * Handles the plan selection screen functionality
 */

(function() {
  const plansScreenManager = {
    init: function() {
      // Get component container
      this.container = document.getElementById('screen-2');
      
      if (!this.container) return;
      
      // Cache DOM elements
      this.comparisonToggle = document.getElementById('comparison-toggle');
      this.nextButton = document.getElementById('next-to-step3');
      this.backButton = document.getElementById('back-to-step1');
      
      // Set initial state
      this.selectedPlan = null;
      
      // Set up event listeners
      this.setupEventListeners();
    },
    
    setupEventListeners: function() {
      // Comparison toggle
      if (this.comparisonToggle) {
        this.comparisonToggle.addEventListener('click', this.showComparison.bind(this));
      }
      
      // Navigation buttons
      if (this.nextButton) {
        this.nextButton.addEventListener('click', this.handleNext.bind(this));
      }
      
      if (this.backButton) {
        this.backButton.addEventListener('click', this.handleBack.bind(this));
      }
      
      // Listen for plan selection events from PlanCard components
      document.addEventListener('planSelected', this.handlePlanSelection.bind(this));
    },
    
    handlePlanSelection: function(event) {
      // Get plan data from event
      const planData = event.detail;
      
      // Update selected plan
      this.selectedPlan = planData;
      
      // Enable next button
      if (this.nextButton) {
        this.nextButton.disabled = false;
        this.nextButton.classList.remove('opacity-50');
        this.nextButton.classList.add('attention-pulse');
      }
    },
    
    handleNext: function() {
      if (!this.selectedPlan) {
        // Show validation error message
        alert('Please select a plan to continue');
        return;
      }
      
      // Dispatch plan selection event
      const planSelectedEvent = new CustomEvent('navigateStep', {
        detail: { direction: 'next' },
        bubbles: true
      });
      
      document.dispatchEvent(planSelectedEvent);
    },
    
    handleBack: function() {
      // Dispatch navigation event
      const navigateEvent = new CustomEvent('navigateStep', {
        detail: { direction: 'back' },
        bubbles: true
      });
      
      document.dispatchEvent(navigateEvent);
    },
    
    showComparison: function() {
      // Create a popup with detailed comparison if not exists
      if (!document.getElementById('plan-comparison-popup')) {
        const popup = document.createElement('div');
        popup.id = 'plan-comparison-popup';
        popup.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center opacity-0 transition-opacity duration-300';
        popup.style.backdropFilter = 'blur(5px)';
        
        // Create popup content
        popup.innerHTML = `
          <div class="bg-white p-6 max-w-3xl w-full max-h-[90vh] overflow-auto relative transform transition-transform duration-300 scale-95">
            <button type="button" id="close-comparison" class="absolute top-4 right-4 text-gray-500 hover:text-black">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 class="text-xl font-bold mb-6">Plan Comparison</h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr>
                    <th class="py-2 text-left border-b w-1/3 font-medium text-sm">Features</th>
                    <th class="py-2 text-center border-b font-medium text-sm">Basic</th>
                    <th class="py-2 text-center border-b font-medium text-sm bg-black text-white">Preferred</th>
                    <th class="py-2 text-center border-b font-medium text-sm">Premium</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr>
                    <td class="py-3 border-b text-gray-700">Monthly Premium</td>
                    <td class="py-3 border-b text-center">$99</td>
                    <td class="py-3 border-b text-center bg-gray-50 font-medium">$189</td>
                    <td class="py-3 border-b text-center">$299</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">Liability Coverage</td>
                    <td class="py-3 border-b text-center">✓</td>
                    <td class="py-3 border-b text-center bg-gray-50">✓</td>
                    <td class="py-3 border-b text-center">✓</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">Collision Coverage</td>
                    <td class="py-3 border-b text-center">✓</td>
                    <td class="py-3 border-b text-center bg-gray-50">✓</td>
                    <td class="py-3 border-b text-center">✓</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">Roadside Assistance</td>
                    <td class="py-3 border-b text-center">Basic</td>
                    <td class="py-3 border-b text-center bg-gray-50">Premium</td>
                    <td class="py-3 border-b text-center">Premium</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">Track Day Coverage</td>
                    <td class="py-3 border-b text-center">—</td>
                    <td class="py-3 border-b text-center bg-gray-50">✓</td>
                    <td class="py-3 border-b text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">OEM Parts Guarantee</td>
                    <td class="py-3 border-b text-center">—</td>
                    <td class="py-3 border-b text-center bg-gray-50">✓</td>
                    <td class="py-3 border-b text-center">✓</td>
                  </tr>
                  <tr>
                    <td class="py-3 border-b text-gray-700">Concierge Service</td>
                    <td class="py-3 border-b text-center">—</td>
                    <td class="py-3 border-b text-center bg-gray-50">—</td>
                    <td class="py-3 border-b text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-4 text-center text-sm text-gray-500">
              <p>All plans include 24/7 roadside assistance and collision coverage.</p>
            </div>
          </div>
        `;
        
        document.body.appendChild(popup);
        
        // Add close handlers
        document.getElementById('close-comparison').addEventListener('click', () => {
          this.closeComparisonPopup();
        });
        
        // Close on outside click
        popup.addEventListener('click', (e) => {
          if (e.target === popup) {
            this.closeComparisonPopup();
          }
        });
        
        // Show popup with animation
        setTimeout(() => {
          popup.classList.add('opacity-100');
          popup.querySelector('div').classList.add('scale-100');
          popup.querySelector('div').classList.remove('scale-95');
        }, 10);
      } else {
        // If popup exists, just show it
        const popup = document.getElementById('plan-comparison-popup');
        popup.classList.add('opacity-100');
        popup.querySelector('div').classList.add('scale-100');
        popup.querySelector('div').classList.remove('scale-95');
      }
    },
    
    closeComparisonPopup: function() {
      const popup = document.getElementById('plan-comparison-popup');
      popup.classList.remove('opacity-100');
      popup.querySelector('div').classList.add('scale-95');
      popup.querySelector('div').classList.remove('scale-100');
      
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 300);
    }
  };
  
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Allow a brief delay for the component to render completely
    setTimeout(() => {
      plansScreenManager.init();
    }, 100);
  });
})();