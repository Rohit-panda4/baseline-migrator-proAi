import webFeatures from 'web-features';
import chalk from 'chalk';
import ora from 'ora';

export class BaselineManager {
  constructor() {
    this.features = webFeatures.features || webFeatures || {};
    this.groups = webFeatures.groups || {};
    this.migrationPatterns = this.createMigrationPatterns();
  }

  async initialize() {
    const spinner = ora('Loading Baseline data...').start();
    
    try {
      let featureCount = 0;
      
      if (typeof this.features === 'object') {
        featureCount = Object.keys(this.features).length;
      }
      
      if (featureCount === 0) {
        this.features = this.createFallbackFeatures();
        featureCount = Object.keys(this.features).length;
        spinner.succeed(`Created ${featureCount} baseline patterns for analysis`);
      } else {
        spinner.succeed(`Loaded ${featureCount} web features from official web-features package`);
      }
      
      return true;
    } catch (error) {
      spinner.fail(`Failed to load Baseline data: ${error.message}`);
      return false;
    }
  }

  createFallbackFeatures() {
    return {
      fetch: { name: 'Fetch API', status: { baseline: 'high' } },
      const: { name: 'const declaration', status: { baseline: 'high' } },
      querySelector: { name: 'querySelector', status: { baseline: 'high' } }
    };
  }

  createMigrationPatterns() {
    return {
      // HTTP & AJAX
      XMLHttpRequest: {
        modern: 'fetch',
        severity: 'high',
        description: 'XMLHttpRequest is legacy. Use fetch() for promise-based HTTP requests.',
        example: "fetch('/api/data').then(response => response.json())"
      },
      
      // Variable Declarations  
      var: {
        modern: 'const/let',
        severity: 'medium', 
        description: 'var has function scope and hoisting issues. Use const/let for block scope.',
        example: "const name = 'value'; let counter = 0;"
      },
      
      // DOM Selection
      getElementById: {
        modern: 'querySelector',
        severity: 'low',
        description: 'querySelector provides more flexible element selection with CSS selectors.',
        example: "document.querySelector('#myId')"
      },
      getElementsByClassName: {
        modern: 'querySelectorAll',
        severity: 'medium',
        description: 'querySelectorAll provides more flexible selection and returns a proper array.',
        example: "document.querySelectorAll('.myClass')"
      },
      getElementsByTagName: {
        modern: 'querySelectorAll',
        severity: 'medium',
        description: 'querySelectorAll is more flexible and consistent with modern DOM APIs.',
        example: "document.querySelectorAll('div')"
      },
      
      // Async Patterns
      Promise: {
        modern: 'async/await',
        severity: 'medium',
        description: 'Promise constructors can be complex. async/await provides cleaner syntax.',
        example: "async function getData() { const data = await fetch('/api'); return data.json(); }"
      },
      
      // Functions
      function: {
        modern: 'arrow functions',
        severity: 'low',
        description: 'Arrow functions provide cleaner syntax and lexical this binding.',
        example: "const handleClick = () => { console.log('clicked'); };"
      },
      
      // Equality & Logic
      equality: {
        modern: 'strict equality',
        severity: 'medium',
        description: 'Strict equality (=== / !==) prevents type coercion bugs.',
        example: "if (value === 'expected') { /* safer comparison */ }"
      },
      
      // String Operations
      concatenation: {
        modern: 'template literals',
        severity: 'low',
        description: 'Template literals provide better readability and expression interpolation.',
        example: "const message = `Hello ${name}, you have ${count} items`;"
      },
      
      // Array Methods
      indexOf: {
        modern: 'includes',
        severity: 'low',
        description: 'Array.includes() is more readable than indexOf() > -1 checks.',
        example: "if (array.includes(item)) { /* cleaner existence check */ }"
      },
      'Array.apply': {
        modern: 'spread syntax',
        severity: 'medium',
        description: 'Spread syntax is cleaner and more intuitive than Array.apply.',
        example: "const newArray = [...arrayLike]; // instead of Array.apply"
      },
      
      // Event Handling
      attachEvent: {
        modern: 'addEventListener',
        severity: 'high',
        description: 'attachEvent is IE-specific. addEventListener works across all browsers.',
        example: "element.addEventListener('click', handler, false);"
      },
      
      // Security & Best Practices
      innerHTML: {
        modern: 'textContent/createElement',
        severity: 'high',
        description: 'innerHTML poses XSS risks. Use textContent or createElement for safety.',
        example: "element.textContent = safeText; // or createElement for complex HTML"
      },
      userAgent: {
        modern: 'feature detection',
        severity: 'medium',
        description: 'User agent sniffing is unreliable. Use feature detection instead.',
        example: "if ('fetch' in window) { /* feature exists */ }"
      },
      with: {
        modern: 'explicit references',
        severity: 'high',
        description: 'with statements are deprecated and cause performance issues.',
        example: "// Use explicit object references instead of with(obj) { prop }"
      }
    };
  }

  async checkPattern(patternName) {
    const pattern = this.migrationPatterns[patternName];
    if (!pattern) return null;

    let baselineStatus = 'high'; // Default for most modern patterns
    
    // Adjust baseline status based on pattern complexity
    if (['innerHTML', 'attachEvent', 'with', 'XMLHttpRequest'].includes(patternName)) {
      baselineStatus = 'high'; // High priority for security/compatibility
    }

    return {
      pattern: patternName,
      modern: pattern.modern,
      severity: pattern.severity,
      description: pattern.description,
      example: pattern.example,
      baseline: baselineStatus,
      recommendation: this.generateRecommendation(pattern, baselineStatus)
    };
  }

  generateRecommendation(pattern, baselineStatus) {
    const status = baselineStatus === 'high' ? 'widely supported' : 
                  baselineStatus === 'low' ? 'newly available' : 'limited support';
                  
    return `Replace with ${pattern.modern} (${status} in Baseline)`;
  }

  getFeatureInfo(featureId) {
    return this.features[featureId] || null;
  }

  getAllFeatures() {
    return Object.keys(this.features).length;
  }
}
