/**
 * Component Loader Utility
 * Handles loading, caching, and rendering of HTML components
 */

// Cache for loaded components to improve performance
const componentCache = {};

/**
 * Load a component with parameters
 * @param {string} elementId - ID of the element to insert component into
 * @param {string} componentPath - Path to the component HTML file
 * @param {Object} params - Key/value parameters to replace in the component template
 * @returns {Promise} - Resolves when component is loaded
 */
async function loadComponent(elementId, componentPath, params = {}) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found in the document`);
      return;
    }

    // Try to get from cache first
    let html = componentCache[componentPath];
    
    // Fetch if not in cache
    if (!html) {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`Failed to load component: ${componentPath}`);
      html = await response.text();
      componentCache[componentPath] = html;
    }
    
    // Replace parameters
    for (const key in params) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
    }
    
    // Insert into DOM
    element.innerHTML = html;
    
    // Execute any scripts in the component
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy content if it's an inline script
      newScript.textContent = script.textContent;
      
      // Replace the original script with the new one to execute it
      script.parentNode.replaceChild(newScript, script);
    });
    
    // Load associated CSS if it exists
    const cssPath = componentPath.replace('.html', '.css');
    loadComponentCSS(cssPath);
    
    // Load associated script if it exists
    const scriptPath = componentPath.replace('.html', '.js');
    if (scriptPath !== componentPath) {
      loadComponentScript(scriptPath);
    }
    
    return element;
  } catch (error) {
    console.error(error);
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div class="component-error">Component failed to load: ${componentPath}</div>`;
    }
  }
}

/**
 * Load a component's JavaScript file
 * @param {string} scriptPath - Path to the JavaScript file
 */
function loadComponentScript(scriptPath) {
  // Skip if already loaded
  if (document.querySelector(`script[src="${scriptPath}"]`)) return;
  
  // Create and append script tag
  const script = document.createElement('script');
  script.src = scriptPath;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Load a component's CSS file
 * @param {string} cssPath - Path to the CSS file
 */
function loadComponentCSS(cssPath) {
  // Skip if already loaded
  if (document.querySelector(`link[href="${cssPath}"]`)) return;
  
  // Check if the CSS file exists
  fetch(cssPath, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // Create and append link tag
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
      }
    })
    .catch(() => {
      // Silently fail if CSS file doesn't exist
    });
}

/**
 * Preload multiple components to improve performance
 * @param {Array} componentPaths - Array of component paths to preload
 * @returns {Promise} - Resolves when all components are preloaded
 */
function preloadComponents(componentPaths) {
  return Promise.all(componentPaths.map(path => 
    fetch(path)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to preload component: ${path}`);
        return response.text();
      })
      .then(html => {
        componentCache[path] = html;
        
        // Preload associated CSS
        const cssPath = path.replace('.html', '.css');
        fetch(cssPath, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              // Preload CSS file
              const link = document.createElement('link');
              link.rel = 'preload';
              link.as = 'style';
              link.href = cssPath;
              document.head.appendChild(link);
            }
          })
          .catch(() => {
            // Silently fail if CSS file doesn't exist
          });
      })
      .catch(error => {
        console.error(error);
      })
  ));
}

/**
 * Load all components by data attribute
 * Automatically loads components based on data-component attribute
 */
function loadAllComponents() {
  const componentElements = document.querySelectorAll('[data-component]');
  
  componentElements.forEach(element => {
    const componentPath = element.getAttribute('data-component');
    const elementId = element.id;
    
    // Get parameters from data attributes
    const params = {};
    Array.from(element.attributes)
      .filter(attr => attr.name.startsWith('data-param-'))
      .forEach(attr => {
        const paramName = attr.name.replace('data-param-', '');
        params[paramName] = attr.value;
      });
    
    // Load the component
    loadComponent(elementId, componentPath, params);
  });
}

// Auto-load components on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadAllComponents);