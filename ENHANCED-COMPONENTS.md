# Enhanced Component System Documentation

This document explains the enhanced component-based architecture implemented for the Porsche Insurance landing page. It builds upon the original component system with advanced features for more complex interactions and state management.

## Overview

The enhanced component system provides:

- **Advanced templating** with conditionals, loops, and nested properties
- **Component lifecycle events** for fine-grained control
- **Reactive state management** with computed properties and watchers
- **Component communication** for coordinating between components
- **DOM data binding** for simplified UI updates
- **Nested components** for complex component hierarchies
- **Improved resource handling** with proper load tracking

## Getting Started

### Using the Component Loader

```html
<!-- Include the component loader -->
<script src="components-enhanced.js"></script>

<!-- Define a component container with data attributes -->
<div id="my-component" 
     data-component="components/path/Component.html" 
     data-param-title="My Title"
     data-param-description="My description"
     data-param-items='["Item 1", "Item 2", "Item 3"]'></div>
```

### Programmatic Component Loading

```javascript
// Load a component
ComponentSystem.loadComponent(
  'my-component',                    // Container ID
  'components/path/Component.html',  // Component path
  {                                  // Parameters
    title: 'My Title',
    description: 'My description',
    items: ['Item 1', 'Item 2', 'Item 3']
  }
);

// Preload components for faster rendering
ComponentSystem.preloadComponents([
  'components/navigation/Navbar.html',
  'components/hero/Hero.html'
]);
```

## Advanced Templating

The enhanced component system supports Handlebars-like templating syntax:

### Basic Variable Replacement

```html
<h1>{{title}}</h1>
<p>{{description}}</p>
```

### Conditionals

```html
{{#if showFeature}}
  <div class="feature">Feature is enabled</div>
{{/if}}

{{#unless isDisabled}}
  <button>Click Me</button>
{{/unless}}
```

### Loops

```html
<ul>
  {{#each items}}
    <li>{{this}} (Index: {{@index}})</li>
  {{/each}}
</ul>

<div class="user-list">
  {{#each users}}
    <div class="user">
      <h3>{{this.name}}</h3>
      <p>{{this.email}}</p>
    </div>
  {{/each}}
</div>
```

### Nested Properties

```html
<div class="user-profile">
  <h2>{{user.name}}</h2>
  <p>{{user.profile.bio}}</p>
  <span>Member since: {{user.joinDate}}</span>
</div>
```

### Raw HTML Insertion

```html
<div class="content">{{@htmlContent}}</div>
```

## Component Lifecycle Events

The component system provides several lifecycle hooks that you can use:

- **beforeLoad**: Before fetching the component HTML
- **load**: After HTML is loaded, before rendering
- **beforeRender**: Before rendering the template
- **render**: After the component is rendered
- **stateChange**: When component state changes
- **error**: When an error occurs during loading/rendering
- **beforeRemove**: Before component removal
- **destroyed**: After component destruction

### Using Lifecycle Events

```javascript
// Register a component with lifecycle hooks
ComponentSystem.registerComponent('my-component', {
  events: {
    beforeLoad: function() {
      console.log('Component is about to load');
    },
    render: function() {
      console.log('Component has been rendered');
      // Initialize component-specific functionality
      this.initializeFeatures();
    },
    stateChange: function(data) {
      console.log('State changed:', data.changes);
    }
  },
  methods: {
    initializeFeatures: function() {
      // Custom initialization logic
    }
  }
});

// Or register single hooks
ComponentSystem.registerHook('my-component', 'render', function() {
  console.log('Component rendered');
});
```

## State Management

The enhanced component system includes a powerful state management system:

### Basic State Operations

```javascript
// Get component instance
const component = ComponentSystem.registerComponent('my-component', {});

// Update state
component.setState({ 
  counter: 1,
  user: { name: 'John', role: 'Admin' }
});

// Get current state
const state = component.state;
console.log(state.counter); // 1

// Reset state
ComponentSystem.resetState('my-component');
```

### Computed Properties

```javascript
// Add a computed property
component.addComputed(
  'fullName',                                  // Property name
  state => `${state.firstName} ${state.lastName}`,  // Compute function
  ['firstName', 'lastName']                    // Dependencies
);

// Access computed property
const fullName = component.getComputed('fullName');
```

### Watchers

```javascript
// Watch for state changes
component.watch('counter', (newValue, oldValue) => {
  console.log(`Counter changed from ${oldValue} to ${newValue}`);
});

// Watch deeply nested properties
component.watch('user.profile.settings', (newValue) => {
  console.log('User settings changed:', newValue);
});

// Watch all state changes
component.watch('*', (newState, oldState, changes) => {
  console.log('State changes:', changes);
});
```

### DOM Binding

```javascript
// Bind state to DOM elements
component.bind(
  'counter',                // State property
  document.getElementById('counter-display'),  // DOM element
  {
    attribute: 'textContent',  // DOM property to update
    formatter: value => `Count: ${value}`,  // Optional formatter
    event: 'input',         // Event for two-way binding (optional)
    twoWay: true            // Enable two-way binding (optional)
  }
);

// Special class binding
component.bind('buttonState', buttonElement, {
  attribute: 'class',
  formatter: state => ({
    'active': state.isActive,
    'disabled': state.isDisabled,
    'highlight': state.isHighlighted
  })
});

// Style binding
component.bind('elementStyles', element, {
  attribute: 'style',
  formatter: styles => ({
    color: styles.textColor,
    backgroundColor: styles.bgColor,
    fontSize: `${styles.fontSize}px`
  })
});
```

## Component Communication

Components can communicate with each other through a message system:

```javascript
// Send a message from one component to another
ComponentSystem.sendMessage(
  'sender-component-id',     // Sender ID
  'receiver-component-id',   // Receiver ID (or null for broadcast)
  'userUpdated',             // Action name
  { userId: 123, name: 'John' }  // Data payload
);

// Listen for specific messages
ComponentSystem.onComponentAction('userUpdated', (data) => {
  console.log('User updated:', data);
});

// Listen once
ComponentSystem.onceComponentAction('pageLoad', () => {
  console.log('Page loaded - this runs only once');
});

// In component definition
ComponentSystem.registerComponent('profile-component', {
  events: {
    message: function(data) {
      if (data.action === 'userUpdated') {
        this.setState({ user: data.data });
      }
    }
  }
});
```

## Nested Components

You can include components within other components:

```javascript
// Include a child component
ComponentSystem.includeComponent(
  'parent-component-id',     // Parent component ID
  'child-container-id',      // Container ID for child
  'components/child/Child.html',  // Child component path
  { title: 'Child Component' },   // Parameters
  'append'                   // Position: 'append', 'prepend', or CSS selector
);

// In component HTML (declarative approach)
<div id="child-container" 
     data-nested-component="components/child/Child.html"
     data-param-title="Child Component"></div>
```

## Component Registration API

The enhanced system provides several ways to register components:

```javascript
// Basic component registration
const component = ComponentSystem.registerComponent('my-component', {
  // Lifecycle handlers
  events: {
    beforeLoad: function() { /* ... */ },
    render: function() { /* ... */ }
  },
  // Component methods
  methods: {
    doSomething: function() { /* ... */ }
  },
  // Initial state
  state: {
    counter: 0,
    isActive: false
  },
  // Computed properties
  computed: {
    doubleCounter: {
      compute: function(state) { return state.counter * 2; },
      dependencies: ['counter']
    }
  },
  // Watchers
  watch: {
    'counter': function(newValue, oldValue) {
      console.log(`Counter changed from ${oldValue} to ${newValue}`);
    }
  }
});

// Create reusable component definitions
const buttonComponent = ComponentSystem.createComponentDefinition({
  methods: {
    handleClick: function() { /* ... */ }
  },
  events: {
    render: function() {
      this.$$(this.element, 'button').addEventListener('click', this.handleClick.bind(this));
    }
  }
});

// Apply to multiple instances
buttonComponent.apply('button-1');
buttonComponent.apply('button-2');

// Apply a mixin to extend a component
ComponentSystem.applyMixin('my-component', {
  animationMethods: function() {
    // Animation-related logic
  }
});
```

## Performance Optimization

The enhanced component system includes several performance optimizations:

- Component caching to minimize network requests
- Template compilation and caching
- Resource deduplication to avoid loading the same CSS/JS multiple times
- Optimized state updates with change detection
- Efficient DOM updates with minimal reflows

## Debugging Components

```javascript
// Access all registered components
console.log(ComponentSystem.components);

// Inspect a component's state
console.log(ComponentSystem.getState('my-component'));

// Inspect event listeners
console.log(ComponentSystem.events.listeners);
```

## Backward Compatibility

The enhanced component system is backward compatible with the original component loader:

```javascript
// Create compatibility layer for migrating gradually
ComponentSystem.createCompatibilityLayer();
```

## Browser Support

The enhanced component system is designed to work in all modern browsers and IE11+ with appropriate polyfills.

## Best Practices

1. **Component Organization:**
   - Keep components small and focused
   - Use nested components for complex UIs
   - Follow the single responsibility principle

2. **State Management:**
   - Keep state minimal and normalized
   - Use computed properties for derived data
   - Avoid direct DOM manipulation

3. **Performance:**
   - Preload critical components
   - Use lazy loading for off-screen components
   - Minimize watcher and computed property dependencies

4. **Code Structure:**
   - Separate HTML, CSS, and JavaScript concerns
   - Use consistent naming conventions
   - Document component interfaces and parameters

## Example: Complete Component Implementation

```html
<!-- components/counter/Counter.html -->
<div class="counter-component">
  <h2>{{title}}</h2>
  
  <div class="counter-display">
    Count: <span class="value">{{count}}</span>
  </div>
  
  {{#if showControls}}
    <div class="controls">
      <button class="decrement">-</button>
      <button class="increment">+</button>
    </div>
  {{/if}}
  
  {{#each history}}
    <div class="history-item">{{this}}</div>
  {{/each}}
</div>
```

```javascript
// components/counter/Counter.js
(function() {
  // Register the counter component
  ComponentSystem.registerComponent('counter-container', {
    // Initial state
    state: {
      count: 0,
      history: [],
      showControls: true
    },
    
    // Computed properties
    computed: {
      doubleCount: {
        compute: function(state) {
          return state.count * 2;
        },
        dependencies: ['count']
      },
      countStatus: {
        compute: function(state) {
          if (state.count > 10) return 'high';
          if (state.count < 0) return 'low';
          return 'normal';
        },
        dependencies: ['count']
      }
    },
    
    // Watchers
    watch: {
      'count': function(newValue, oldValue) {
        // Update history when count changes
        const history = [...this.state.history];
        history.push(`Changed from ${oldValue} to ${newValue}`);
        
        if (history.length > 5) {
          history.shift(); // Keep only last 5 entries
        }
        
        this.setState({ history });
      }
    },
    
    // Event handlers
    events: {
      render: function() {
        // Set up event listeners after component is rendered
        this.setupEventListeners();
        
        // Set up data bindings
        this.setupBindings();
      }
    },
    
    // Custom methods
    methods: {
      setupEventListeners: function() {
        const increment = this.$$('.increment');
        const decrement = this.$$('.decrement');
        
        if (increment) {
          increment.addEventListener('click', () => {
            this.setState({ count: this.state.count + 1 });
          });
        }
        
        if (decrement) {
          decrement.addEventListener('click', () => {
            this.setState({ count: this.state.count - 1 });
          });
        }
      },
      
      setupBindings: function() {
        // Bind count to display element
        const display = this.$$('.value');
        if (display) {
          this.bind('count', display, {
            attribute: 'textContent'
          });
        }
        
        // Add class binding based on count status
        const container = this.element;
        this.bind('countStatus', container, {
          attribute: 'class',
          formatter: (status) => ({
            'counter-high': status === 'high',
            'counter-low': status === 'low',
            'counter-normal': status === 'normal'
          })
        });
      },
      
      reset: function() {
        this.setState({
          count: 0,
          history: []
        });
      }
    }
  });
})();
```

```css
/* components/counter/Counter.css */
.counter-component {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-width: 300px;
  margin: 0 auto;
}

.counter-display {
  font-size: 1.5rem;
  margin: 1rem 0;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.controls button {
  padding: 0.5rem 1rem;
  font-size: 1.25rem;
  cursor: pointer;
}

.history-item {
  font-size: 0.8rem;
  color: #666;
  margin: 0.25rem 0;
}

/* Status-based styling */
.counter-high .value {
  color: red;
}

.counter-low .value {
  color: blue;
}

.counter-normal .value {
  color: green;
}
```

## Migration from Original Component System

To migrate from the original component system to the enhanced version:

1. Replace `components.js` with `components-enhanced.js` in your HTML
2. Update component registrations to use the new API (optional)
3. Use the compatibility layer for gradual migration
4. Enhance templates with the new templating features
5. Implement state management and data binding

The enhanced component system is fully backward compatible with the original component format, so existing components will continue to work without modification.