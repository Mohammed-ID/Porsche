/**
 * Enhanced Component Loader
 * A lightweight, template-driven component system with lifecycle events
 * 
 * Features:
 * - Handlebars-style templates with helpers
 * - Component lifecycle events
 * - Type-safe parameter handling
 * - Component communication
 * - Automatic CSS/JS loading
 * - Performance optimizations
 */

// Component System Namespace
const ComponentSystem = (function() {
  // Private properties
  const componentCache = {};
  const templateCache = {};
  const componentRegistry = {};
  const loadedResources = new Set();
  const componentState = new Map();
  
  /**
   * Template Parser with Handlebars-like syntax
   */
  const TemplateEngine = {
    // Compile template to a function
    compile: function(template) {
      // Return cached template function if available
      if (templateCache[template]) {
        return templateCache[template];
      }
      
      // Replace variables with proper escaping: {{varName}}
      let processed = template.replace(/\{\{([^#\/][^}]*)\}\}/g, (match, variable) => {
        variable = variable.trim();
        if (variable.startsWith('@')) {
          // Special non-escaped variable (e.g., HTML content)
          return `\${this.raw("${variable.substring(1)}")}`;
        }
        return `\${this.escape(this.get("${variable}"))}`;
      });
      
      // Process conditionals: {{#if condition}}...{{/if}}
      processed = processed.replace(/\{\{#if\s+([^}]*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
        return `\${this.get("${condition.trim()}") ? \`${content}\` : ''}`;
      });
      
      // Process negated conditionals: {{#unless condition}}...{{/unless}}
      processed = processed.replace(/\{\{#unless\s+([^}]*)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, condition, content) => {
        return `\${!this.get("${condition.trim()}") ? \`${content}\` : ''}`;
      });
      
      // Process loops: {{#each items}}...{{this}}...{{/each}}
      processed = processed.replace(/\{\{#each\s+([^}]*)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, array, content) => {
        const iterContent = content.replace(/\{\{this\}\}/g, '${item}')
                                  .replace(/\{\{this\.([^}]*)\}\}/g, '${item.$1}')
                                  .replace(/\{\{@index\}\}/g, '${index}');
        return `\${this.each("${array.trim()}", \`${iterContent}\`)}`;
      });
      
      // Create the template function using template literals
      const templateFunc = new Function('return function(data) { with(this) { return `' + processed + '`; }}')();
      
      // Create template context with helper methods
      const templateContext = {
        escape: function(value) {
          if (value == null) return '';
          return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
        },
        raw: function(value) {
          return data[value] != null ? data[value] : '';
        },
        get: function(path) {
          if (!path) return '';
          // Support nested properties with dot notation
          const parts = path.split('.');
          let result = data;
          for (const part of parts) {
            if (result == null) return '';
            result = result[part];
          }
          return result != null ? result : '';
        },
        each: function(path, template) {
          const array = this.get(path);
          if (!Array.isArray(array) || array.length === 0) return '';
          
          return array.map((item, index) => {
            // Replace {{this}} and {{this.property}} in the template
            return eval('`' + template + '`');
          }).join('');
        },
        // Data object will be injected at render time
        data: {}
      };
      
      // Cache and return the template function
      templateCache[template] = function(data) {
        // Inject data into context
        templateContext.data = data;
        return templateFunc.call(templateContext, data);
      };
      
      return templateCache[template];
    },
    
    // Render template with data
    render: function(template, data) {
      const templateFunc = this.compile(template);
      return templateFunc(data || {});
    }
  };
  
  /**
   * Component Lifecycle Events
   */
  const LifecycleEvents = {
    // Trigger event for a component
    trigger: function(componentId, eventName, data) {
      const component = componentRegistry[componentId];
      if (!component) return;
      
      // Call specific lifecycle method if defined
      const methodName = 'on' + eventName.charAt(0).toUpperCase() + eventName.slice(1);
      if (typeof component[methodName] === 'function') {
        component[methodName](data);
      }
      
      // Call general event handler if defined
      if (typeof component.onEvent === 'function') {
        component.onEvent(eventName, data);
      }
      
      // Dispatch DOM event for external listeners
      const element = document.getElementById(componentId);
      if (element) {
        const event = new CustomEvent('component:' + eventName, {
          detail: { componentId, data },
          bubbles: true
        });
        element.dispatchEvent(event);
      }
    }
  };
  
  /**
   * Enhanced State Management for Components
   * - Supports reactive updates
   * - Handles deep state changes
   * - Provides state binding to DOM
   * - Computed properties
   * - Watchers
   */
  const StateManager = {
    // Watchers storage
    watchers: new Map(),
    
    // Computed properties storage
    computed: new Map(),
    
    // State bindings storage
    bindings: new Map(),
    
    // Get state for a component
    getState: function(componentId) {
      if (!componentState.has(componentId)) {
        componentState.set(componentId, {});
      }
      return componentState.get(componentId);
    },
    
    // Deep clone an object
    deepClone: function(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      
      // Handle Date
      if (obj instanceof Date) return new Date(obj);
      
      // Handle Array
      if (Array.isArray(obj)) {
        return obj.map(item => this.deepClone(item));
      }
      
      // Handle Object
      const result = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.deepClone(obj[key]);
        }
      }
      
      return result;
    },
    
    // Deep merge objects
    deepMerge: function(target, source) {
      // For each property in source
      for (const key in source) {
        // If source property is an object and target property is an object too
        if (typeof source[key] === 'object' && source[key] !== null && 
            typeof target[key] === 'object' && target[key] !== null) {
          // Recursively merge the nested objects
          this.deepMerge(target[key], source[key]);
        } else {
          // Otherwise just assign source property to target
          target[key] = source[key];
        }
      }
      return target;
    },
    
    // Check if two values are deeply equal
    deepEqual: function(a, b) {
      // Fast equality check
      if (a === b) return true;
      
      // Check if both are objects
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
      }
      
      // Check if both are arrays
      const aIsArray = Array.isArray(a);
      const bIsArray = Array.isArray(b);
      
      if (aIsArray !== bIsArray) return false;
      
      // If arrays, check each element
      if (aIsArray) {
        if (a.length !== b.length) return false;
        
        for (let i = 0; i < a.length; i++) {
          if (!this.deepEqual(a[i], b[i])) return false;
        }
        
        return true;
      }
      
      // If objects, check keys and values
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    },
    
    // Find differences between old and new state
    findChanges: function(oldState, newState, path = '') {
      const changes = [];
      
      // All keys from both objects
      const allKeys = new Set([
        ...Object.keys(oldState), 
        ...Object.keys(newState)
      ]);
      
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Key exists in both objects
        if (key in oldState && key in newState) {
          // Both values are objects or arrays, recursively check them
          if (
            typeof oldState[key] === 'object' && oldState[key] !== null &&
            typeof newState[key] === 'object' && newState[key] !== null
          ) {
            const nestedChanges = this.findChanges(
              oldState[key], 
              newState[key],
              currentPath
            );
            changes.push(...nestedChanges);
          } 
          // Simple values are different
          else if (!this.deepEqual(oldState[key], newState[key])) {
            changes.push({
              path: currentPath,
              oldValue: oldState[key],
              newValue: newState[key],
              type: 'update'
            });
          }
        }
        // Key only in old state = deleted
        else if (key in oldState) {
          changes.push({
            path: currentPath,
            oldValue: oldState[key],
            newValue: undefined,
            type: 'delete'
          });
        }
        // Key only in new state = added
        else {
          changes.push({
            path: currentPath,
            oldValue: undefined,
            newValue: newState[key],
            type: 'add'
          });
        }
      }
      
      return changes;
    },
    
    // Update state for a component
    setState: function(componentId, newState) {
      // Get current state and clone it for comparison
      const currentState = this.getState(componentId);
      const previousState = this.deepClone(currentState);
      
      // Update state with deep merge
      const updatedState = this.deepMerge(this.deepClone(currentState), newState);
      componentState.set(componentId, updatedState);
      
      // Find which properties changed
      const changes = this.findChanges(previousState, updatedState);
      
      // Run computed properties that depend on changed paths
      this.runComputedProperties(componentId, changes);
      
      // Run watchers for changed paths
      this.runWatchers(componentId, changes, previousState, updatedState);
      
      // Update bindings
      this.updateBindings(componentId, changes);
      
      // Trigger update event with details of what changed
      LifecycleEvents.trigger(componentId, 'stateChange', {
        state: updatedState,
        previousState,
        changes
      });
      
      return updatedState;
    },
    
    // Reset state for a component
    resetState: function(componentId) {
      const previousState = this.getState(componentId);
      const emptyState = {};
      
      // Clear state
      componentState.set(componentId, emptyState);
      
      // Find what was removed
      const changes = this.findChanges(previousState, emptyState);
      
      // Clear computed properties
      if (this.computed.has(componentId)) {
        this.computed.delete(componentId);
      }
      
      // Clear watchers
      if (this.watchers.has(componentId)) {
        this.watchers.delete(componentId);
      }
      
      // Clear bindings
      if (this.bindings.has(componentId)) {
        this.bindings.delete(componentId);
      }
      
      // Trigger events
      LifecycleEvents.trigger(componentId, 'stateReset', {
        previousState,
        changes
      });
    },
    
    // Watch for state changes
    watch: function(componentId, path, callback) {
      if (!this.watchers.has(componentId)) {
        this.watchers.set(componentId, new Map());
      }
      
      const componentWatchers = this.watchers.get(componentId);
      
      if (!componentWatchers.has(path)) {
        componentWatchers.set(path, []);
      }
      
      componentWatchers.get(path).push(callback);
      
      // Return unwatch function
      return () => {
        if (!this.watchers.has(componentId)) return;
        
        const watchers = this.watchers.get(componentId).get(path);
        if (!watchers) return;
        
        const index = watchers.indexOf(callback);
        if (index !== -1) {
          watchers.splice(index, 1);
        }
      };
    },
    
    // Run watchers for changed paths
    runWatchers: function(componentId, changes, oldState, newState) {
      if (!this.watchers.has(componentId)) return;
      
      const componentWatchers = this.watchers.get(componentId);
      
      // Process each changed path
      for (const change of changes) {
        // Check exact path watchers
        if (componentWatchers.has(change.path)) {
          const watchers = componentWatchers.get(change.path);
          watchers.forEach(callback => {
            try {
              callback(change.newValue, change.oldValue, change);
            } catch (error) {
              console.error(`Error in watcher for ${change.path}:`, error);
            }
          });
        }
        
        // Check wildcard watchers
        if (componentWatchers.has('*')) {
          const watchers = componentWatchers.get('*');
          watchers.forEach(callback => {
            try {
              callback(newState, oldState, changes);
            } catch (error) {
              console.error('Error in wildcard watcher:', error);
            }
          });
        }
        
        // Check parent path watchers (e.g., 'user' for 'user.name')
        const pathParts = change.path.split('.');
        if (pathParts.length > 1) {
          for (let i = 1; i < pathParts.length; i++) {
            const parentPath = pathParts.slice(0, i).join('.');
            
            if (componentWatchers.has(parentPath)) {
              const watchers = componentWatchers.get(parentPath);
              watchers.forEach(callback => {
                try {
                  // Get old and new values for the parent path
                  const getNestedValue = (obj, path) => {
                    const parts = path.split('.');
                    return parts.reduce((acc, part) => 
                      acc && acc[part] !== undefined ? acc[part] : undefined, obj);
                  };
                  
                  const parentNewValue = getNestedValue(newState, parentPath);
                  const parentOldValue = getNestedValue(oldState, parentPath);
                  
                  callback(parentNewValue, parentOldValue, {
                    path: parentPath,
                    oldValue: parentOldValue,
                    newValue: parentNewValue,
                    type: 'update',
                    nestedChange: change
                  });
                } catch (error) {
                  console.error(`Error in watcher for ${parentPath}:`, error);
                }
              });
            }
          }
        }
      }
    },
    
    // Add a computed property
    addComputed: function(componentId, name, computeFunc, dependencies) {
      if (!this.computed.has(componentId)) {
        this.computed.set(componentId, new Map());
      }
      
      const componentComputed = this.computed.get(componentId);
      
      componentComputed.set(name, {
        compute: computeFunc,
        dependencies: dependencies || [],
        value: undefined,
        initialized: false
      });
      
      // Calculate initial value
      this.calculateComputed(componentId, name);
      
      return () => {
        if (!this.computed.has(componentId)) return;
        this.computed.get(componentId).delete(name);
      };
    },
    
    // Calculate a computed property
    calculateComputed: function(componentId, name) {
      if (!this.computed.has(componentId)) return undefined;
      
      const componentComputed = this.computed.get(componentId);
      if (!componentComputed.has(name)) return undefined;
      
      const computed = componentComputed.get(name);
      const state = this.getState(componentId);
      
      try {
        const newValue = computed.compute(state);
        const oldValue = computed.value;
        
        // Only update if value changed
        if (!this.deepEqual(oldValue, newValue) || !computed.initialized) {
          computed.value = newValue;
          computed.initialized = true;
          
          // Trigger computed property change event
          LifecycleEvents.trigger(componentId, 'computedChange', {
            name,
            oldValue,
            newValue
          });
          
          return newValue;
        }
        
        return computed.value;
      } catch (error) {
        console.error(`Error calculating computed property ${name}:`, error);
        return undefined;
      }
    },
    
    // Get computed property value
    getComputed: function(componentId, name) {
      if (!this.computed.has(componentId)) return undefined;
      
      const componentComputed = this.computed.get(componentId);
      if (!componentComputed.has(name)) return undefined;
      
      return componentComputed.get(name).value;
    },
    
    // Run computed properties when dependencies change
    runComputedProperties: function(componentId, changes) {
      if (!this.computed.has(componentId)) return;
      
      const componentComputed = this.computed.get(componentId);
      
      // For each computed property
      for (const [name, computed] of componentComputed.entries()) {
        // If no specific dependencies, always recompute
        if (!computed.dependencies || computed.dependencies.length === 0) {
          this.calculateComputed(componentId, name);
          continue;
        }
        
        // Check if any of its dependencies changed
        const shouldUpdate = computed.dependencies.some(dep => 
          changes.some(change => 
            change.path === dep || 
            change.path.startsWith(dep + '.') ||
            dep === '*'
          )
        );
        
        if (shouldUpdate) {
          this.calculateComputed(componentId, name);
        }
      }
    },
    
    // Bind state to DOM elements
    bindToElement: function(componentId, path, element, options = {}) {
      if (!this.bindings.has(componentId)) {
        this.bindings.set(componentId, new Map());
      }
      
      const componentBindings = this.bindings.get(componentId);
      
      if (!componentBindings.has(path)) {
        componentBindings.set(path, []);
      }
      
      const binding = {
        element,
        options: {
          attribute: options.attribute || 'textContent',
          formatter: options.formatter || (value => value),
          event: options.event,
          twoWay: options.twoWay || false
        }
      };
      
      componentBindings.get(path).push(binding);
      
      // Set up two-way binding if needed
      if (binding.options.twoWay && binding.options.event) {
        element.addEventListener(binding.options.event, (e) => {
          let value;
          
          // Get value based on element type and attribute
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
            if (element.type === 'checkbox') {
              value = element.checked;
            } else if (element.type === 'radio') {
              value = element.checked ? element.value : undefined;
            } else {
              value = element.value;
            }
          } else {
            value = element[binding.options.attribute];
          }
          
          // Create update object with nested path support
          const pathParts = path.split('.');
          let updateObj = {};
          let current = updateObj;
          
          for (let i = 0; i < pathParts.length - 1; i++) {
            current[pathParts[i]] = {};
            current = current[pathParts[i]];
          }
          
          current[pathParts[pathParts.length - 1]] = value;
          
          // Update state (without triggering this binding again)
          binding.updating = true;
          this.setState(componentId, updateObj);
          binding.updating = false;
        });
      }
      
      // Initial update
      this.updateBinding(componentId, path, binding);
      
      // Return unbind function
      return () => {
        if (!this.bindings.has(componentId)) return;
        
        const bindings = this.bindings.get(componentId).get(path);
        if (!bindings) return;
        
        const index = bindings.indexOf(binding);
        if (index !== -1) {
          bindings.splice(index, 1);
        }
      };
    },
    
    // Update a single binding
    updateBinding: function(componentId, path, binding) {
      if (binding.updating) return;
      
      // Get the current value for the path
      const state = this.getState(componentId);
      const getValue = (obj, path) => {
        const parts = path.split('.');
        return parts.reduce((acc, part) => 
          acc && acc[part] !== undefined ? acc[part] : undefined, obj);
      };
      
      const value = getValue(state, path);
      
      // Apply formatter
      let formattedValue = value;
      try {
        formattedValue = binding.options.formatter(value);
      } catch (error) {
        console.error(`Error formatting value for ${path}:`, error);
      }
      
      // Update element based on attribute
      try {
        const { element, options } = binding;
        
        if (options.attribute === 'textContent') {
          element.textContent = formattedValue ?? '';
        } 
        else if (options.attribute === 'innerHTML') {
          element.innerHTML = formattedValue ?? '';
        }
        else if (options.attribute === 'value') {
          element.value = formattedValue ?? '';
        }
        else if (options.attribute === 'checked') {
          element.checked = !!formattedValue;
        }
        else if (options.attribute === 'class') {
          // Special case for class binding
          if (typeof formattedValue === 'object') {
            // { className: true/false } object syntax
            for (const [className, active] of Object.entries(formattedValue)) {
              if (active) {
                element.classList.add(className);
              } else {
                element.classList.remove(className);
              }
            }
          } else if (Array.isArray(formattedValue)) {
            // ['class1', 'class2'] array syntax
            element.className = '';
            formattedValue.forEach(className => {
              element.classList.add(className);
            });
          } else {
            // Simple string value
            element.className = formattedValue ?? '';
          }
        }
        else if (options.attribute === 'style') {
          // Special case for style binding
          if (typeof formattedValue === 'object') {
            // { property: value } object syntax
            for (const [prop, val] of Object.entries(formattedValue)) {
              element.style[prop] = val;
            }
          } else {
            // Simple string value
            element.style = formattedValue ?? '';
          }
        }
        else if (options.attribute.startsWith('data-')) {
          // Data attribute
          if (formattedValue === null || formattedValue === undefined) {
            element.removeAttribute(options.attribute);
          } else {
            element.setAttribute(options.attribute, formattedValue);
          }
        }
        else if (options.attribute.startsWith('attr-')) {
          // Regular attribute (attr-href => href)
          const attrName = options.attribute.substring(5);
          if (formattedValue === null || formattedValue === undefined) {
            element.removeAttribute(attrName);
          } else {
            element.setAttribute(attrName, formattedValue);
          }
        }
        else {
          // Default: set as property
          element[options.attribute] = formattedValue;
        }
      } catch (error) {
        console.error(`Error updating binding for ${path}:`, error);
      }
    },
    
    // Update all bindings for changed paths
    updateBindings: function(componentId, changes) {
      if (!this.bindings.has(componentId)) return;
      
      const componentBindings = this.bindings.get(componentId);
      
      // For each changed path
      for (const change of changes) {
        // Update exact path bindings
        if (componentBindings.has(change.path)) {
          const bindings = componentBindings.get(change.path);
          bindings.forEach(binding => {
            this.updateBinding(componentId, change.path, binding);
          });
        }
        
        // Update parent bindings (e.g. 'user' affected by 'user.name' change)
        const pathParts = change.path.split('.');
        
        for (let i = 1; i < pathParts.length; i++) {
          const parentPath = pathParts.slice(0, i).join('.');
          
          if (componentBindings.has(parentPath)) {
            const bindings = componentBindings.get(parentPath);
            bindings.forEach(binding => {
              this.updateBinding(componentId, parentPath, binding);
            });
          }
        }
      }
    }
  };
  
  /**
   * Resource Loader for CSS and JavaScript
   */
  const ResourceLoader = {
    // Load CSS file
    loadCSS: function(href) {
      if (loadedResources.has(href)) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        fetch(href, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              // File doesn't exist, resolve without loading
              resolve();
              return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
              loadedResources.add(href);
              resolve();
            };
            link.onerror = reject;
            document.head.appendChild(link);
          })
          .catch(() => {
            // Error checking if file exists, resolve without loading
            resolve();
          });
      });
    },
    
    // Load JavaScript file
    loadJS: function(src) {
      if (loadedResources.has(src)) return Promise.resolve();
      
      return new Promise((resolve, reject) => {
        fetch(src, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              // File doesn't exist, resolve without loading
              resolve();
              return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
              loadedResources.add(src);
              resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
          })
          .catch(() => {
            // Error checking if file exists, resolve without loading
            resolve();
          });
      });
    },
    
    // Load both CSS and JS for a component
    loadComponentResources: function(componentPath) {
      const basePath = componentPath.replace(/\.html$/, '');
      const cssPath = basePath + '.css';
      const jsPath = basePath + '.js';
      
      return Promise.all([
        this.loadCSS(cssPath),
        this.loadJS(jsPath)
      ]);
    }
  };
  
  /**
   * Component Definition and Registration
   */
  class Component {
    constructor(id, options = {}) {
      this.id = id;
      this.element = document.getElementById(id);
      this.options = options;
      this.isRendered = false;
      this._watchers = [];
      this._computed = [];
      this._bindings = [];
      
      // Initialize state
      this.state = StateManager.getState(id);
      
      // Register component
      componentRegistry[id] = this;
      
      // Initialize computed properties if defined
      if (options.computed) {
        for (const [name, config] of Object.entries(options.computed)) {
          this.addComputed(name, config.compute, config.dependencies);
        }
      }
      
      // Initialize watchers if defined
      if (options.watch) {
        for (const [path, callback] of Object.entries(options.watch)) {
          this.watch(path, callback);
        }
      }
    }
    
    // Update component state
    setState(newState) {
      return StateManager.setState(this.id, newState);
    }
    
    // Get component element
    getElement() {
      return this.element;
    }
    
    // Get component param
    getParam(name, defaultValue) {
      return this.options.params && this.options.params[name] !== undefined 
        ? this.options.params[name] 
        : defaultValue;
    }
    
    // Add a watcher for a state property
    watch(path, callback) {
      const unwatchFunc = StateManager.watch(this.id, path, callback.bind(this));
      this._watchers.push(unwatchFunc);
      return unwatchFunc;
    }
    
    // Add a computed property
    addComputed(name, computeFunc, dependencies) {
      const removeFunc = StateManager.addComputed(this.id, name, computeFunc.bind(this), dependencies);
      this._computed.push({ name, removeFunc });
      return removeFunc;
    }
    
    // Get a computed property value
    getComputed(name) {
      return StateManager.getComputed(this.id, name);
    }
    
    // Bind state to a DOM element
    bind(path, element, options = {}) {
      const unbindFunc = StateManager.bindToElement(this.id, path, element, options);
      this._bindings.push(unbindFunc);
      return unbindFunc;
    }
    
    // Find elements within the component
    $(selector) {
      return this.element ? this.element.querySelectorAll(selector) : [];
    }
    
    // Find first element within the component
    $$(selector) {
      return this.element ? this.element.querySelector(selector) : null;
    }
    
    // Send a message to another component
    sendMessage(receiver, action, data) {
      return sendMessage(this.id, receiver, action, data);
    }
    
    // Listen for a message from any component
    onMessage(action, callback, options = {}) {
      const handler = function(data) {
        // Only process messages not from self
        if (data.sender !== this.id) {
          return callback.call(this, data);
        }
      };
      
      return onComponentAction(action, handler.bind(this), options);
    }
    
    // Include a nested component
    include(containerId, componentPath, params = {}, position = 'append') {
      return includeComponent(this.id, containerId, componentPath, params, position);
    }
    
    // Reload the component
    reload() {
      loadComponent(this.id, this.options.path, this.options.params);
    }
    
    // Cleanup resources before removal
    destroy() {
      // Remove all watchers
      this._watchers.forEach(unwatch => unwatch());
      this._watchers = [];
      
      // Remove all computed properties
      this._computed.forEach(({ removeFunc }) => removeFunc());
      this._computed = [];
      
      // Remove all bindings
      this._bindings.forEach(unbind => unbind());
      this._bindings = [];
      
      // Reset state
      StateManager.resetState(this.id);
      
      // Trigger destroyed event
      LifecycleEvents.trigger(this.id, 'destroyed', {});
    }
    
    // Default lifecycle methods - can be overridden
    onBeforeLoad() {}
    onLoad() {}
    onBeforeRender() {}
    onRender() {}
    onError() {}
    onEvent() {}
    onStateChange() {}
    onComputedChange() {}
    onBeforeRemove() {}
    onDestroyed() {}
    onMessage() {}
  }
  
  /**
   * Main Component Loading Function
   */
  async function loadComponent(elementId, componentPath, params = {}) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element #${elementId} not found in the document`);
        return;
      }
      
      // Create component instance if it doesn't exist
      let component = componentRegistry[elementId];
      if (!component) {
        component = new Component(elementId, { 
          path: componentPath, 
          params: params 
        });
      }
      
      // Trigger beforeLoad event
      LifecycleEvents.trigger(elementId, 'beforeLoad', { 
        componentPath, 
        params 
      });
      
      // Load HTML template
      let html;
      if (componentCache[componentPath]) {
        html = componentCache[componentPath];
      } else {
        const response = await fetch(componentPath);
        if (!response.ok) {
          throw new Error(`Failed to load component: ${componentPath}`);
        }
        html = await response.text();
        componentCache[componentPath] = html;
      }
      
      // Trigger load event
      LifecycleEvents.trigger(elementId, 'load', { html });
      
      // Load component resources (CSS & JS)
      await ResourceLoader.loadComponentResources(componentPath);
      
      // Prepare data for template
      const templateData = {
        ...params,
        $component: {
          id: elementId,
          path: componentPath
        }
      };
      
      // Trigger beforeRender event
      LifecycleEvents.trigger(elementId, 'beforeRender', { 
        templateData 
      });
      
      // Render template with data
      const renderedHtml = TemplateEngine.render(html, templateData);
      element.innerHTML = renderedHtml;
      
      // Set component as rendered
      component.isRendered = true;
      
      // Execute inline scripts if any
      const scripts = element.querySelectorAll('script');
      scripts.forEach(script => {
        // Only process inline scripts
        if (!script.src) {
          // Create a new script element to execute the code
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach(attr => {
            if (attr.name !== 'type' || attr.value !== 'text/x-template') {
              newScript.setAttribute(attr.name, attr.value);
            }
          });
          newScript.textContent = script.textContent;
          script.parentNode.replaceChild(newScript, script);
        }
      });
      
      // Trigger render event
      LifecycleEvents.trigger(elementId, 'render', { 
        element 
      });
      
      // Dispatch component:loaded event for dynamic component loading
      const loadedEvent = new CustomEvent('component:loaded', {
        detail: { 
          componentId: elementId,
          componentPath: componentPath
        },
        bubbles: true
      });
      element.dispatchEvent(loadedEvent);
      
      return element;
    } catch (error) {
      console.error(error);
      
      // Get component instance
      const component = componentRegistry[elementId];
      
      // Trigger error event
      LifecycleEvents.trigger(elementId, 'error', { 
        error, 
        componentPath 
      });
      
      // Show error message in component container
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="component-error">
            <h3>Component Error</h3>
            <p>Failed to load: ${componentPath}</p>
            <button onclick="ComponentSystem.loadComponent('${elementId}', '${componentPath}', ${JSON.stringify(params)})">
              Retry
            </button>
          </div>
        `;
      }
    }
  }
  
  /**
   * Preload multiple components
   */
  async function preloadComponents(componentPaths) {
    const promises = componentPaths.map(path => 
      fetch(path)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to preload component: ${path}`);
          return response.text();
        })
        .then(html => {
          componentCache[path] = html;
          
          // Also preload CSS and JS
          return ResourceLoader.loadComponentResources(path);
        })
        .catch(error => {
          console.error(error);
        })
    );
    
    return Promise.all(promises);
  }
  
  /**
   * Register a new component
   */
  function registerComponent(id, definition) {
    // Create the component instance
    const component = new Component(id, definition);
    
    // Add custom methods
    if (definition.methods) {
      Object.assign(component, definition.methods);
    }
    
    // Add event handlers
    if (definition.events) {
      for (const [event, handler] of Object.entries(definition.events)) {
        component['on' + event.charAt(0).toUpperCase() + event.slice(1)] = handler;
      }
    }
    
    // Initialize state
    if (definition.state) {
      StateManager.setState(id, definition.state);
    }
    
    return component;
  }
  
  /**
   * Load all components from data attributes
   */
  function loadAllComponents() {
    const componentElements = document.querySelectorAll('[data-component]');
    
    componentElements.forEach(element => {
      const componentPath = element.getAttribute('data-component');
      const elementId = element.id;
      
      if (!elementId) {
        console.error('Component element must have an ID attribute:', element);
        return;
      }
      
      // Get parameters from data attributes
      const params = {};
      Array.from(element.attributes)
        .filter(attr => attr.name.startsWith('data-param-'))
        .forEach(attr => {
          const paramName = attr.name.replace('data-param-', '');
          let paramValue = attr.value;
          
          // Try to parse JSON value
          try {
            if (paramValue.startsWith('[') || paramValue.startsWith('{')) {
              paramValue = JSON.parse(paramValue.replace(/&quot;/g, '"'));
            }
          } catch (e) {
            // Keep as string if parsing fails
          }
          
          params[paramName] = paramValue;
        });
      
      // Load the component
      loadComponent(elementId, componentPath, params);
    });
  }
  
  /**
   * Initialize the component system
   */
  function init() {
    // Auto-load components on DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadAllComponents);
    } else {
      loadAllComponents();
    }
    
    // Set up global event listeners for component communication
    document.addEventListener('component:message', function(event) {
      const { sender, receiver, action, data } = event.detail;
      
      // If receiver is specified, only send to that component
      if (receiver && componentRegistry[receiver]) {
        LifecycleEvents.trigger(receiver, 'message', {
          sender,
          action,
          data
        });
      } 
      // Otherwise broadcast to all components
      else if (!receiver) {
        for (const id in componentRegistry) {
          if (id !== sender) {  // Don't send back to sender
            LifecycleEvents.trigger(id, 'message', {
              sender,
              action,
              data
            });
          }
        }
      }
    });
    
    // Process any dynamic component inclusions
    document.addEventListener('component:loaded', function(event) {
      const elementId = event.detail.componentId;
      const element = document.getElementById(elementId);
      if (!element) return;
      
      // Process any nested components inside this one
      const nestedComponents = element.querySelectorAll('[data-nested-component]');
      nestedComponents.forEach(nestedEl => {
        const componentPath = nestedEl.getAttribute('data-nested-component');
        const containerId = nestedEl.id;
        
        if (!containerId) {
          console.error('Nested component must have an ID attribute:', nestedEl);
          return;
        }
        
        // Extract parameters
        const params = {};
        Array.from(nestedEl.attributes)
          .filter(attr => attr.name.startsWith('data-param-'))
          .forEach(attr => {
            const paramName = attr.name.replace('data-param-', '');
            let paramValue = attr.value;
            
            // Try to parse JSON value
            try {
              if (paramValue.startsWith('[') || paramValue.startsWith('{')) {
                paramValue = JSON.parse(paramValue.replace(/&quot;/g, '"'));
              }
            } catch (e) {
              // Keep as string if parsing fails
            }
            
            params[paramName] = paramValue;
          });
        
        // Load the nested component
        loadComponent(containerId, componentPath, params);
      });
    });
    
    // Set up mutation observer to handle dynamically added components
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node is a component
              if (node.hasAttribute('data-component')) {
                const componentPath = node.getAttribute('data-component');
                const elementId = node.id;
                
                if (!elementId) {
                  console.error('Component element must have an ID attribute:', node);
                  return;
                }
                
                // Get parameters from data attributes
                const params = {};
                Array.from(node.attributes)
                  .filter(attr => attr.name.startsWith('data-param-'))
                  .forEach(attr => {
                    const paramName = attr.name.replace('data-param-', '');
                    let paramValue = attr.value;
                    
                    // Try to parse JSON value
                    try {
                      if (paramValue.startsWith('[') || paramValue.startsWith('{')) {
                        paramValue = JSON.parse(paramValue.replace(/&quot;/g, '"'));
                      }
                    } catch (e) {
                      // Keep as string if parsing fails
                    }
                    
                    params[paramName] = paramValue;
                  });
                
                // Load the component
                loadComponent(elementId, componentPath, params);
              }
              
              // Check for components inside the added node
              const components = node.querySelectorAll('[data-component]');
              components.forEach(element => {
                const componentPath = element.getAttribute('data-component');
                const elementId = element.id;
                
                if (!elementId) {
                  console.error('Component element must have an ID attribute:', element);
                  return;
                }
                
                // Get parameters from data attributes
                const params = {};
                Array.from(element.attributes)
                  .filter(attr => attr.name.startsWith('data-param-'))
                  .forEach(attr => {
                    const paramName = attr.name.replace('data-param-', '');
                    let paramValue = attr.value;
                    
                    // Try to parse JSON value
                    try {
                      if (paramValue.startsWith('[') || paramValue.startsWith('{')) {
                        paramValue = JSON.parse(paramValue.replace(/&quot;/g, '"'));
                      }
                    } catch (e) {
                      // Keep as string if parsing fails
                    }
                    
                    params[paramName] = paramValue;
                  });
                
                // Load the component
                loadComponent(elementId, componentPath, params);
              });
            }
          });
        }
      });
    });
    
    // Start observing the document body
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Event Bus for component communication
   */
  const EventBus = {
    // Listeners storage by event type
    listeners: {},
    
    // Subscribe to an event
    on: function(eventType, callback, options = {}) {
      if (!this.listeners[eventType]) {
        this.listeners[eventType] = [];
      }
      
      // Add listener with options
      this.listeners[eventType].push({
        callback,
        options: {
          once: options.once || false,
          priority: options.priority || 0,
          filter: options.filter || null
        }
      });
      
      // Sort by priority (higher numbers first)
      this.listeners[eventType].sort((a, b) => b.options.priority - a.options.priority);
      
      return this; // Allow chaining
    },
    
    // Subscribe to an event once
    once: function(eventType, callback, options = {}) {
      return this.on(eventType, callback, { ...options, once: true });
    },
    
    // Remove subscription
    off: function(eventType, callback) {
      if (!this.listeners[eventType]) return this;
      
      // Remove specific callback
      if (callback) {
        this.listeners[eventType] = this.listeners[eventType]
          .filter(listener => listener.callback !== callback);
      } 
      // Remove all listeners for this event
      else {
        delete this.listeners[eventType];
      }
      
      return this; // Allow chaining
    },
    
    // Emit an event
    emit: function(eventType, data = {}) {
      // If no listeners, return empty array (no results)
      if (!this.listeners[eventType]) return [];
      
      const results = [];
      const listenersToRemove = [];
      
      // Execute callbacks
      for (let i = 0; i < this.listeners[eventType].length; i++) {
        const { callback, options } = this.listeners[eventType][i];
        
        // Apply filter if exists
        if (options.filter && !options.filter(data)) {
          continue;
        }
        
        // Execute callback and collect result
        try {
          const result = callback(data);
          results.push(result);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
          results.push(null);
        }
        
        // Mark for removal if once
        if (options.once) {
          listenersToRemove.push(callback);
        }
      }
      
      // Remove 'once' listeners
      listenersToRemove.forEach(callback => {
        this.off(eventType, callback);
      });
      
      return results;
    },
    
    // Check if event has listeners
    hasListeners: function(eventType) {
      return !!(this.listeners[eventType] && this.listeners[eventType].length > 0);
    },
    
    // Clear all listeners
    clear: function() {
      this.listeners = {};
      return this;
    }
  };

  /**
   * Send a message from one component to another
   * @param {string} sender - ID of the sender component
   * @param {string} receiver - ID of the receiver component, or null for broadcast
   * @param {string} action - Action name
   * @param {any} data - Message data
   * @returns {Array} - Array of results from handlers
   */
  function sendMessage(sender, receiver, action, data) {
    // Create event object
    const messageData = { 
      sender, 
      receiver, 
      action, 
      data,
      timestamp: Date.now()
    };
    
    // Emit via event bus
    EventBus.emit(`component:${action}`, messageData);
    
    // Create DOM event for compatibility
    const event = new CustomEvent('component:message', {
      detail: messageData,
      bubbles: true
    });
    
    // Dispatch event
    const senderElement = document.getElementById(sender);
    if (senderElement) {
      senderElement.dispatchEvent(event);
    } else {
      document.dispatchEvent(event);
    }
    
    return messageData;
  }
  
  /**
   * Listen for a specific component action
   * @param {string} action - Action name to listen for
   * @param {Function} callback - Callback function
   * @param {Object} options - Options object
   * @returns {Object} - Event bus instance for chaining
   */
  function onComponentAction(action, callback, options = {}) {
    return EventBus.on(`component:${action}`, callback, options);
  }
  
  /**
   * Listen for a specific component action once
   * @param {string} action - Action name to listen for
   * @param {Function} callback - Callback function
   * @param {Object} options - Options object
   * @returns {Object} - Event bus instance for chaining
   */
  function onceComponentAction(action, callback, options = {}) {
    return EventBus.once(`component:${action}`, callback, options);
  }
  
  /**
   * Remove listener for a specific component action
   * @param {string} action - Action name
   * @param {Function} [callback] - Callback function (if omitted, removes all listeners)
   * @returns {Object} - Event bus instance for chaining
   */
  function offComponentAction(action, callback) {
    return EventBus.off(`component:${action}`, callback);
  }
  
  /**
   * Create a nested component (include a component within another)
   * @param {string} parentId - ID of the parent component
   * @param {string} containerId - ID for the container element
   * @param {string} componentPath - Path to the component HTML file
   * @param {Object} params - Parameters to pass to the component
   * @param {string} [position='append'] - Where to insert the component: 'append', 'prepend', or a CSS selector
   * @returns {Promise} - Promise that resolves with the container element
   */
  function includeComponent(parentId, containerId, componentPath, params = {}, position = 'append') {
    // Get the parent element
    const parentElement = document.getElementById(parentId);
    if (!parentElement) {
      console.error(`Parent element with ID ${parentId} not found`);
      return Promise.reject(new Error(`Parent element with ID ${parentId} not found`));
    }
    
    // Create container if it doesn't exist
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.setAttribute('data-nested-component', componentPath);
      
      // Add parameters as data attributes
      for (const [key, value] of Object.entries(params)) {
        const attributeValue = typeof value === 'object' ? JSON.stringify(value) : value;
        container.setAttribute(`data-param-${key}`, attributeValue);
      }
      
      // Insert the container based on position
      if (position === 'append') {
        parentElement.appendChild(container);
      } else if (position === 'prepend') {
        parentElement.insertBefore(container, parentElement.firstChild);
      } else {
        // Insert before the specified selector
        const targetElement = parentElement.querySelector(position);
        if (targetElement) {
          parentElement.insertBefore(container, targetElement);
        } else {
          parentElement.appendChild(container);
        }
      }
    } else {
      // Update data attributes if container already exists
      container.setAttribute('data-nested-component', componentPath);
      
      // Update parameters
      for (const [key, value] of Object.entries(params)) {
        const attributeValue = typeof value === 'object' ? JSON.stringify(value) : value;
        container.setAttribute(`data-param-${key}`, attributeValue);
      }
    }
    
    // Load the component into the container
    return loadComponent(containerId, componentPath, params);
  }
  
  /**
   * Remove a component from the DOM and unregister it
   * @param {string} componentId - ID of the component to remove
   * @returns {boolean} - Whether the component was successfully removed
   */
  function removeComponent(componentId) {
    // Get the component element
    const element = document.getElementById(componentId);
    if (!element) {
      console.warn(`Component with ID ${componentId} not found`);
      return false;
    }
    
    // Trigger beforeRemove event
    LifecycleEvents.trigger(componentId, 'beforeRemove', {});
    
    // Remove from component registry
    if (componentRegistry[componentId]) {
      delete componentRegistry[componentId];
    }
    
    // Remove state
    if (componentState.has(componentId)) {
      componentState.delete(componentId);
    }
    
    // Remove from DOM
    element.remove();
    
    return true;
  }
  
  /**
   * Register a hook for a specific component lifecycle event
   * @param {string} componentId - The ID of the component
   * @param {string} hookName - The name of the hook (beforeLoad, load, beforeRender, render, error, stateChange)
   * @param {Function} callback - The callback function to execute
   */
  function registerHook(componentId, hookName, callback) {
    // Create component if it doesn't exist
    if (!componentRegistry[componentId]) {
      registerComponent(componentId, {});
    }
    
    const component = componentRegistry[componentId];
    const methodName = 'on' + hookName.charAt(0).toUpperCase() + hookName.slice(1);
    component[methodName] = callback;
    
    return component;
  }
  
  /**
   * Apply a mixin to a component (adds reusable functionality)
   * @param {string} componentId - The ID of the component
   * @param {Object} mixin - The mixin object with methods to add
   */
  function applyMixin(componentId, mixin) {
    // Create component if it doesn't exist
    if (!componentRegistry[componentId]) {
      registerComponent(componentId, {});
    }
    
    const component = componentRegistry[componentId];
    
    // Add mixin methods to component
    for (const [key, value] of Object.entries(mixin)) {
      if (typeof value === 'function') {
        const originalMethod = component[key];
        
        // If original method exists, create a wrapper that calls both
        if (typeof originalMethod === 'function') {
          component[key] = function(...args) {
            originalMethod.apply(component, args);
            return value.apply(component, args);
          };
        } else {
          component[key] = function(...args) {
            return value.apply(component, args);
          };
        }
      }
    }
    
    return component;
  }
  
  /**
   * Create a reusable component definition that can be applied to multiple instances
   * @param {Object} definition - Component definition with methods and lifecycle hooks
   * @returns {Object} - Reusable component definition
   */
  function createComponentDefinition(definition) {
    return {
      ...definition,
      apply: function(componentId) {
        return registerComponent(componentId, this);
      }
    };
  }
  
  /**
   * Import a component from a URL and register it
   * @param {string} url - URL to the component definition (JSON)
   * @returns {Promise} - Resolves with the imported component definition
   */
  function importComponent(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to import component: ${url}`);
        }
        return response.json();
      })
      .then(definition => {
        return createComponentDefinition(definition);
      });
  }
  
  /**
   * Create a backward compatibility layer with the original component loader
   */
  function createCompatibilityLayer() {
    // Verify original component loader is not present
    if (window.loadComponent || window.preloadComponents) {
      console.warn('Original component loader detected. Skipping compatibility layer.');
      return;
    }
    
    // Create global functions with same API as original loader
    window.loadComponent = loadComponent;
    window.preloadComponents = preloadComponents;
    window.loadComponentScript = ResourceLoader.loadJS;
    window.loadComponentCSS = ResourceLoader.loadCSS;
    window.loadAllComponents = loadAllComponents;
    
    console.info('Enhanced component loader: Compatibility layer created');
  }

  // Public API
  return {
    // Component loading
    loadComponent,
    preloadComponents,
    loadAllComponents,
    includeComponent,
    removeComponent,
    
    // Component registration
    registerComponent,
    registerHook,
    applyMixin,
    createComponentDefinition,
    importComponent,
    
    // Component messaging
    sendMessage,
    onComponentAction,
    onceComponentAction,
    offComponentAction,
    
    // State management
    getState: StateManager.getState,
    setState: StateManager.setState,
    resetState: StateManager.resetState,
    watchState: StateManager.watch,
    addComputed: StateManager.addComputed,
    getComputed: StateManager.getComputed,
    bindState: StateManager.bindToElement,
    
    // Event bus access
    events: EventBus,
    
    // Utilities
    createCompatibilityLayer,
    init
  };
})();

// Initialize the component system
ComponentSystem.init();

// Export to global scope
window.ComponentSystem = ComponentSystem;