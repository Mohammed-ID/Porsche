/**
 * StepProgress Component JS
 * Handles the step indicator and progress tracking
 */

(function() {
  // Initialize the component
  const stepProgressManager = {
    init: function() {
      // Get container element
      this.container = document.querySelector('.step-progress');
      
      if (!this.container) return;
      
      // Cache DOM elements
      this.progressBar = document.getElementById('progress-bar');
      this.stepCircles = document.querySelectorAll('.step-circle');
      this.stepTitle = document.getElementById('step-title');
      this.stepDescription = document.getElementById('step-description');
      
      // Parse the current step and total steps
      this.currentStep = parseInt(this.container.dataset.currentStep || 1, 10);
      this.totalSteps = this.stepCircles.length;
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize the progress display
      this.updateProgress(this.currentStep);
    },
    
    setupEventListeners: function() {
      // Listen for step change events from the Onboarding component
      document.addEventListener('updateStepProgress', this.handleUpdateStepProgress.bind(this));
    },
    
    handleUpdateStepProgress: function(event) {
      if (event.detail && typeof event.detail.currentStep === 'number') {
        this.updateProgress(event.detail.currentStep);
      }
    },
    
    updateProgress: function(step) {
      // Ensure step is within valid range
      if (step < 1 || step > this.totalSteps) return;
      
      // Update current step
      this.currentStep = step;
      
      // Update progress bar width
      const percentage = ((step - 1) / (this.totalSteps - 1)) * 100;
      if (this.progressBar) {
        this.progressBar.style.width = `${percentage}%`;
      }
      
      // Update step circles
      this.stepCircles.forEach((circle, index) => {
        if (index + 1 < step) {
          // Previous steps are completed
          circle.classList.remove('active');
          circle.classList.add('completed');
        } else if (index + 1 === step) {
          // Current step is active
          circle.classList.add('active');
          circle.classList.remove('completed');
        } else {
          // Future steps are neither active nor completed
          circle.classList.remove('active', 'completed');
        }
      });
      
      // Update the title and description based on the current step
      this.updateTitleAndDescription(step);
    },
    
    updateTitleAndDescription: function(step) {
      // Define the content for each step
      const stepContent = [
        {
          title: 'Tell us about your Porsche',
          description: 'To provide you with the most accurate coverage, we need some information about your vehicle.'
        },
        {
          title: 'Choose your plan',
          description: 'Select the insurance plan that best fits your needs.'
        },
        {
          title: 'Payment information',
          description: 'Enter your payment details to complete your purchase.'
        },
        {
          title: 'Confirmation',
          description: 'Your Porsche insurance policy has been successfully activated.'
        }
      ];
      
      // Update the title and description if elements exist
      if (this.stepTitle && this.stepDescription && stepContent[step - 1]) {
        this.stepTitle.textContent = stepContent[step - 1].title;
        this.stepDescription.textContent = stepContent[step - 1].description;
      }
    }
  };
  
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', function() {
    stepProgressManager.init();
  });
})();