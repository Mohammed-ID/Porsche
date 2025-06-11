/**
 * Onboarding Component JS
 * Handles the main functionality for the multi-step onboarding process
 */

(function() {
  // Onboarding controller
  class OnboardingController {
    constructor(containerElement) {
      this.container = containerElement;
      this.currentStep = 1;
      this.totalSteps = 3;
      
      // State for collected data
      this.onboardingData = {
        userInfo: {},
        selectedPlan: null,
        paymentInfo: {}
      };
      
      // Cache DOM elements once all components are loaded
      this.screens = {};
      
      // Initialize
      this.init();
    }
    
    // Initialize the controller
    init() {
      // Wait for all child components to load
      setTimeout(() => {
        this.cacheElements();
        this.setupEventListeners();
        this.navigateToStep(1);
      }, 200);
    }
    
    // Cache DOM elements for performance
    cacheElements() {
      this.screens = {
        form: document.getElementById('form-screen-container'),
        plans: document.getElementById('plans-screen-container'),
        payment: document.getElementById('payment-screen-container'),
        confirmation: document.getElementById('confirmation-screen-container')
      };
    }
    
    // Set up event listeners for all components
    setupEventListeners() {
      document.addEventListener('formSubmitted', this.handleFormSubmit.bind(this));
      document.addEventListener('planSelected', this.handlePlanSelection.bind(this));
      document.addEventListener('paymentSubmitted', this.handlePaymentSubmit.bind(this));
      document.addEventListener('navigateStep', this.handleNavigation.bind(this));
      
      // Add listeners for back buttons
      const backButtons = this.container.querySelectorAll('.back-button');
      backButtons.forEach(button => {
        button.addEventListener('click', () => {
          this.navigateToStep(this.currentStep - 1);
        });
      });
    }
    
    // Handle form submission
    handleFormSubmit(event) {
      // Save form data
      this.onboardingData.userInfo = event.detail;
      
      // Validate and move to next step
      if (this.validateUserInfo(this.onboardingData.userInfo)) {
        this.navigateToStep(2);
      }
    }
    
    // Handle plan selection
    handlePlanSelection(event) {
      // Save selected plan
      this.onboardingData.selectedPlan = event.detail;
      
      // Move to next step
      this.navigateToStep(3);
    }
    
    // Handle payment submission
    handlePaymentSubmit(event) {
      // Save payment info
      this.onboardingData.paymentInfo = event.detail;
      
      // Complete the onboarding process
      this.completeOnboarding();
    }
    
    // Handle navigation between steps
    handleNavigation(event) {
      const direction = event.detail.direction;
      const targetStep = direction === 'next' ? this.currentStep + 1 : this.currentStep - 1;
      
      // Validate before allowing forward navigation
      if (direction === 'next' && !this.validateCurrentStep()) {
        return;
      }
      
      this.navigateToStep(targetStep);
    }
    
    // Navigate to a specific step
    navigateToStep(step) {
      // Ensure step is within valid range
      if (step < 1 || step > this.totalSteps + 1) {
        return;
      }
      
      // Update current step
      this.currentStep = step;
      
      // Hide all screens
      Object.values(this.screens).forEach(screen => {
        if (screen) {
          screen.classList.remove('active');
        }
      });
      
      // Show the current screen
      let activeScreen;
      
      switch (step) {
        case 1:
          activeScreen = this.screens.form;
          break;
        case 2:
          activeScreen = this.screens.plans;
          this.prepareStepTwo();
          break;
        case 3:
          activeScreen = this.screens.payment;
          this.prepareStepThree();
          break;
        case 4:
          activeScreen = this.screens.confirmation;
          break;
      }
      
      if (activeScreen) {
        activeScreen.classList.add('active');
      }
      
      // Update step progress indicator
      this.updateStepProgress();
      
      // Scroll to top of container
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Prepare step two with any data from step one
    prepareStepTwo() {
      if (Object.keys(this.onboardingData.userInfo).length > 0) {
        // Pass user info to plans screen if needed
        document.dispatchEvent(new CustomEvent('prepareStepTwo', {
          detail: this.onboardingData.userInfo
        }));
      }
    }
    
    // Prepare step three with selected plan data
    prepareStepThree() {
      if (this.onboardingData.selectedPlan) {
        // Pass selected plan to payment screen
        document.dispatchEvent(new CustomEvent('prepareStepThree', {
          detail: {
            plan: this.onboardingData.selectedPlan,
            userInfo: this.onboardingData.userInfo
          }
        }));
      }
    }
    
    // Update the step progress indicator
    updateStepProgress() {
      document.dispatchEvent(new CustomEvent('updateStepProgress', {
        detail: { currentStep: this.currentStep }
      }));
    }
    
    // Validate the current step before proceeding
    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          return this.validateUserInfo(this.onboardingData.userInfo);
        case 2:
          return this.onboardingData.selectedPlan !== null;
        case 3:
          return true; // Validation handled by PaymentScreen component
        default:
          return true;
      }
    }
    
    // Validate user information
    validateUserInfo(userInfo) {
      // Basic validation - in a real app this would be more robust
      return (
        userInfo &&
        userInfo.name && 
        userInfo.email &&
        userInfo.vehicle
      );
    }
    
    // Complete the onboarding process
    completeOnboarding() {
      // Combine all collected data
      const completeData = {
        ...this.onboardingData.userInfo,
        plan: this.onboardingData.selectedPlan,
        payment: this.onboardingData.paymentInfo,
        timestamp: new Date().toISOString(),
        policyNumber: this.generatePolicyNumber()
      };
      
      // Store the data (in a real app, this would be sent to a server)
      sessionStorage.setItem('porscheInsurancePolicy', JSON.stringify(completeData));
      
      // Show confirmation screen with policy data
      document.dispatchEvent(new CustomEvent('showConfirmation', {
        detail: completeData
      }));
      
      // Navigate to confirmation screen
      this.navigateToStep(4);
    }
    
    // Generate a random policy number
    generatePolicyNumber() {
      const prefix = 'PI';
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${prefix}-${timestamp}-${random}`;
    }
  }
  
  // Initialize the controller when the component is loaded
  window.addEventListener('DOMContentLoaded', function() {
    // Find all onboarding containers and initialize controllers for each
    const containers = document.querySelectorAll('.onboarding-container');
    
    containers.forEach(container => {
      new OnboardingController(container);
    });
  });
})();