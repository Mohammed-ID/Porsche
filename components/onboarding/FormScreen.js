/**
 * FormScreen Component JS
 * Handles the user information form functionality
 */

(function() {
  const formManager = {
    init: function() {
      // Get form element
      this.form = document.getElementById('insurance-form');
      
      if (!this.form) return;
      
      // Cache DOM elements
      this.submitButton = document.getElementById('next-to-step2');
      this.vehicleValueSlider = document.getElementById('vehicle-value');
      this.valueDisplay = document.getElementById('value-display');
      
      // Form input elements
      this.inputs = {
        model: document.getElementById('porsche-model'),
        value: this.vehicleValueSlider,
        year: document.getElementById('vehicle-year'),
        startDate: document.getElementById('start-date'),
        fullName: document.getElementById('full-name'),
        phone: document.getElementById('phone-number'),
        email: document.getElementById('email'),
        trackDay: document.getElementById('track-day-coverage'),
        coverageType: document.querySelector('input[name="coverage-type"]:checked'),
        oemParts: document.getElementById('oem-parts')
      };
      
      // Set up event listeners
      this.setupEventListeners();
    },
    
    setupEventListeners: function() {
      // Submit button click
      if (this.submitButton) {
        this.submitButton.addEventListener('click', this.handleSubmit.bind(this));
      }
      
      // Vehicle value slider
      if (this.vehicleValueSlider && this.valueDisplay) {
        this.vehicleValueSlider.addEventListener('input', this.updateValueDisplay.bind(this));
      }
      
      // Form validation on input
      Object.values(this.inputs).forEach(input => {
        if (input && input.tagName) {
          input.addEventListener('input', this.validateForm.bind(this));
        }
      });
    },
    
    updateValueDisplay: function() {
      this.valueDisplay.textContent = '$' + parseInt(this.vehicleValueSlider.value).toLocaleString();
    },
    
    validateForm: function() {
      // Basic validation
      let isValid = true;
      
      // Required fields
      const requiredFields = ['model', 'year', 'startDate', 'fullName', 'phone', 'email'];
      
      requiredFields.forEach(field => {
        const input = this.inputs[field];
        if (input && !input.value) {
          isValid = false;
          input.classList.add('border-red-500');
        } else if (input) {
          input.classList.remove('border-red-500');
        }
      });
      
      // Email validation
      if (this.inputs.email && this.inputs.email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.inputs.email.value)) {
          isValid = false;
          this.inputs.email.classList.add('border-red-500');
        } else {
          this.inputs.email.classList.remove('border-red-500');
        }
      }
      
      // Phone validation
      if (this.inputs.phone && this.inputs.phone.value) {
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(this.inputs.phone.value)) {
          isValid = false;
          this.inputs.phone.classList.add('border-red-500');
        } else {
          this.inputs.phone.classList.remove('border-red-500');
        }
      }
      
      // Enable/disable submit button
      if (this.submitButton) {
        this.submitButton.disabled = !isValid;
        this.submitButton.classList.toggle('opacity-50', !isValid);
      }
      
      return isValid;
    },
    
    handleSubmit: function(event) {
      event.preventDefault();
      
      // Validate form
      if (!this.validateForm()) {
        // Show validation error messages
        this.showValidationErrors();
        return;
      }
      
      // Collect form data
      const formData = this.collectFormData();
      
      // Dispatch form submitted event with data
      const formSubmittedEvent = new CustomEvent('formSubmitted', {
        detail: formData,
        bubbles: true
      });
      
      document.dispatchEvent(formSubmittedEvent);
    },
    
    showValidationErrors: function() {
      // Add validation error messages
      const requiredFields = ['model', 'year', 'startDate', 'fullName', 'phone', 'email'];
      
      requiredFields.forEach(field => {
        const input = this.inputs[field];
        if (input && !input.value) {
          // Get the parent form-control div
          const formControl = input.closest('.form-control');
          
          // Only add error message if it doesn't exist yet
          if (formControl && !formControl.querySelector('.error-message')) {
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message text-red-500 text-sm mt-1';
            errorMessage.textContent = 'This field is required';
            formControl.appendChild(errorMessage);
          }
        }
      });
    },
    
    collectFormData: function() {
      // Get coverage type (the checked radio button)
      const coverageType = document.querySelector('input[name="coverage-type"]:checked');
      
      return {
        vehicle: {
          model: this.inputs.model.value,
          value: this.inputs.value.value,
          year: this.inputs.year.value,
          startDate: this.inputs.startDate.value
        },
        personal: {
          name: this.inputs.fullName.value,
          phone: this.inputs.phone.value,
          email: this.inputs.email.value
        },
        coverage: {
          trackDay: this.inputs.trackDay.checked,
          type: coverageType ? coverageType.value : 'comprehensive',
          oemParts: this.inputs.oemParts.checked
        },
        timestamp: new Date().toISOString()
      };
    }
  };
  
  // Initialize on DOM content loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Allow a brief delay for the component to render completely
    setTimeout(() => {
      formManager.init();
    }, 100);
  });
})();