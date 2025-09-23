import webFeatures from 'web-features';
import chalk from 'chalk';
import ora from 'ora';

export class BaselineManager {
  constructor() {
    // Handle different export formats
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
        // Fallback: create basic patterns for demo
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
      fetch: {
        name: 'Fetch API',
        status: { baseline: 'high' },
        description: 'Modern HTTP request API'
      },
      const: {
        name: 'const declaration',
        status: { baseline: 'high' },
        description: 'Block-scoped constant declarations'
      },
      querySelector: {
        name: 'querySelector',
        status: { baseline: 'high' },
        description: 'CSS selector-based element selection'
      }
    };
  }

  createMigrationPatterns() {
    return {
      XMLHttpRequest: {
        modern: 'fetch',
        featureId: 'fetch',
        severity: 'high',
        description: 'XMLHttpRequest is legacy. Use fetch() for promise-based requests.',
        example: "fetch('/api/data').then(response => response.json())"
      },
      var: {
        modern: 'const/let',
        featureId: 'const',
        severity: 'medium', 
        description: 'var has function scope. Use const/let for block scope.',
        example: "const name = 'value'; let counter = 0;"
      },
      getElementById: {
        modern: 'querySelector',
        featureId: 'querySelector',
        severity: 'low',
        description: 'querySelector provides more flexible element selection.',
        example: "document.querySelector('#myId')"
      }
    };
  }

  async checkPattern(patternName) {
    const pattern = this.migrationPatterns[patternName];
    if (!pattern) return null;

    // Get Baseline status from web-features
    let baselineStatus = 'high'; // Default to high for basic patterns
    
    if (pattern.featureId && this.features[pattern.featureId]) {
      const feature = this.features[pattern.featureId];
      baselineStatus = feature.status?.baseline || 'high';
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
