# Component-Based Architecture

This document explains the component-based architecture implemented for the Porsche Insurance landing page.

## Overview

The website has been restructured from a single monolithic HTML file into reusable, modular components. This approach:

- Improves maintainability and readability
- Enables reuse of common UI elements
- Simplifies updates and modifications
- Maintains responsiveness across devices
- Separates concerns (HTML, CSS, JS)

## Structure

```
/components/
  /navigation/     - Navigation-related components
  /hero/           - Hero section components
  /cards/          - Reusable card components
  /layout/         - Layout utilities and containers
  /footer/         - Footer components
  /utilities/      - Utility components and helpers
```

## Component Format

Each component follows a standard format:

1. **HTML File** (.html)
   - Contains the component markup
   - Includes commented usage instructions
   - Uses mustache-style placeholders: `{{paramName}}`
   - May include inline JS for component initialization

2. **CSS File** (.css)
   - Component-specific styles
   - Properly namespaced to avoid conflicts
   - Responsive styles included

3. **JavaScript File** (.js, optional)
   - Component-specific behaviors
   - Encapsulated in self-executing functions
   - Avoids global scope pollution

## Component Loader

The architecture is powered by a component loader (`components.js`) that:

1. Loads component HTML files via AJAX
2. Replaces placeholders with parameter values
3. Injects the HTML into the appropriate container
4. Automatically loads associated CSS and JS files
5. Provides caching for improved performance

## Usage

There are two ways to use components:

### Method 1: JavaScript API

```javascript
// Load a component with parameters
loadComponent('elementId', 'components/path/Component.html', {
  title: 'My Title',
  description: 'My description text',
  // Additional parameters
});

// Preload multiple components for better performance
preloadComponents([
  'components/navigation/Navbar.html',
  'components/hero/Hero.html'
]);
```

### Method 2: HTML Data Attributes

```html
<div id="my-component" 
     data-component="components/path/Component.html" 
     data-param-title="My Title"
     data-param-description="My description text"></div>
```

## Available Components

### Navigation Components

- **Navbar**: `components/navigation/Navbar.html`
  - Main navigation with desktop and mobile views
  - Parameters: logo

### Hero Components

- **Hero**: `components/hero/Hero.html`
  - Full-screen hero with video background
  - Parameters: title, description, videoSrc, posterSrc

### Card Components

- **BenefitCard**: `components/cards/BenefitCard.html`
  - Card with image, title and list items
  - Parameters: title, imageSrc, imageAlt, translateKey, listItems

- **FeatureCard**: `components/cards/FeatureCard.html`
  - Feature box with icon, title, description and list items
  - Parameters: title, description, translateKey, icon, delay, listItems

### Layout Components

- **SectionHeader**: `components/layout/SectionHeader.html`
  - Reusable section header with title and description
  - Parameters: title, description, translateKey

- **Container**: `components/layout/Container.html`
  - Section container with standard styling
  - Parameters: id, class

### Footer Components

- **Footer**: `components/footer/Footer.html`
  - Page footer with logo, social links and copyright
  - Parameters: logo, year

## Performance Considerations

The component-based architecture maintains the performance optimizations of the original site:

- Lazy loading of off-screen components
- Preloading of critical components
- Component caching for faster rendering
- GPU-accelerated animations
- Responsive images with srcset
- Content-visibility for better rendering performance

## Responsive Design

All components maintain the responsive design of the original site:

- Fluid typography with clamp()
- Responsive grid layouts
- Mobile-first approach
- Tailwind CSS utility classes
- Custom responsive variables

## Extending the System

To add a new component:

1. Create the component files in the appropriate directory
2. Add usage documentation in the HTML comment
3. Ensure proper parameter handling
4. Use CSS variables for consistent styling
5. Keep JavaScript minimal and encapsulated

## Benefits Over Previous Approach

- **Maintainability**: Isolated components are easier to understand and update
- **Reusability**: Components can be reused across pages
- **Collaboration**: Multiple developers can work on different components
- **Testing**: Components can be tested in isolation
- **Documentation**: Each component is self-documented
- **Performance**: Efficient loading and caching of components