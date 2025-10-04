
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

export class AIEngine {
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.chalk = options.chalk || new chalk.Instance();
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.requestCount = 0;
    this.lastRequestTime = 0;
  }

  async initialize() {
    if (!process.env.GEMINI_API_KEY) {
      this.logger.log(this.chalk.yellow('⚠️  No Gemini API key found. AI suggestions disabled.'));
      this.logger.log(this.chalk.gray('   Add GEMINI_API_KEY to .env file for Google AI features.'));
      return false;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.initialized = true;
      
      this.logger.log(this.chalk.green('🤖 Google Gemini AI initialized successfully!'));
      this.logger.log(this.chalk.gray('   Using Gemini Pro for intelligent migration suggestions'));
      return true;
    } catch (error) {
      this.logger.log(this.chalk.red('❌ Failed to initialize Gemini AI:', error.message));
      return false;
    }
  }

  async rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = 2000; // 2 second minimum between requests
    
    if (timeSinceLastRequest < minDelay) {
      const waitTime = minDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  async generateSuggestion(issue, codeContext) {
    if (!this.initialized) {
      return this.generateDemoSuggestion(issue);
    }

    await this.rateLimitDelay();

    this.logger.log(`Getting Gemini AI suggestion for ${issue.pattern}...`);
    
    try {
      const prompt = `You are a Google Chrome team expert on web standards and Baseline compatibility.

ANALYSIS TARGET:
- Legacy Pattern: ${issue.pattern}
- Line Number: ${issue.line}  
- Issue: ${issue.message}
- Baseline Status: ${issue.baseline || 'high'} (Widely supported)

CODE CONTEXT:
\`\`\`javascript
${codeContext}
\`\`\`

PROVIDE EXPERT GUIDANCE:

**🔍 Problem Analysis:**
Why this legacy pattern is problematic.

**✅ Baseline Solution:**  
The modern, Baseline-compatible replacement.

**🔄 Code Migration:**
Specific before/after code transformation.

Keep response focused and under 150 words.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const suggestion = response.text();
      
      this.logger.log(`Gemini AI suggestion generated (${this.requestCount} requests)`);
      
      return {
        suggestion: suggestion,
        confidence: 0.9,
        model: 'gemini-pro'
      };

    } catch (error) {
      this.logger.log(`Gemini AI failed, using demo mode: ${error.message}`);
      return this.generateDemoSuggestion(issue);
    }
  }

  async generateDemoSuggestion(issue) {
    const demoSuggestions = {
      XMLHttpRequest: `**🔍 Problem Analysis:**
XMLHttpRequest uses callback-based async patterns that are harder to chain and handle errors.

**✅ Baseline Solution:**
The fetch() API provides promise-based HTTP requests with better error handling and modern syntax.

**🔄 Code Migration:**
\`\`\`javascript
// Before
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.send();

// After  
fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data));
\`\`\``,
      
      var: `**🔍 Problem Analysis:**
var declarations are function-scoped and can cause hoisting issues and accidental global variables.

**✅ Baseline Solution:**
const and let provide block scope and prevent accidental redeclaration.

**🔄 Code Migration:**
\`\`\`javascript
// Before
var userName = 'John';
var userAge = 25;

// After
const userName = 'John';
let userAge = 25;
\`\`\``,
      
      getElementById: `**🔍 Problem Analysis:**
getElementById only selects by ID and lacks flexibility for complex selections.

**✅ Baseline Solution:**
querySelector supports CSS selectors for more flexible element selection.

**🔄 Code Migration:**
\`\`\`javascript
// Before
document.getElementById('myButton')

// After
document.querySelector('#myButton')
\`\`\``,

      innerHTML: `**🔍 Problem Analysis:**
innerHTML poses XSS security risks when used with untrusted content.

**✅ Baseline Solution:**
textContent or createElement provide safer DOM manipulation.

**🔄 Code Migration:**
\`\`\`javascript
// Before (unsafe)
element.innerHTML = userInput;

// After (safe)
element.textContent = userInput;
\`\`\``,

      equality: `**🔍 Problem Analysis:**
Loose equality (==) performs type coercion which can cause unexpected comparisons.

**✅ Baseline Solution:**
Strict equality (===) compares both value and type without coercion.

**🔄 Code Migration:**
\`\`\`javascript
// Before
if (value == '5') // true for both 5 and '5'

// After
if (value === '5') // only true for string '5'
\`\`\``,

      Promise: `**🔍 Problem Analysis:**
Promise constructors are verbose and can be error-prone with manual resolve/reject handling.

**✅ Baseline Solution:**
async/await provides cleaner, more readable asynchronous code.

**🔄 Code Migration:**
\`\`\`javascript
// Before
new Promise((resolve) => {
  setTimeout(() => resolve('done'), 1000);
});

// After
await new Promise(resolve => setTimeout(resolve, 1000));
\`\`\``,

      function: `**🔍 Problem Analysis:**
Function declarations have different hoisting behavior and lack lexical this binding.

**✅ Baseline Solution:**
Arrow functions provide cleaner syntax and predictable this binding.

**🔄 Code Migration:**
\`\`\`javascript
// Before
function handleClick(event) {
  console.log(this);
}

// After
const handleClick = (event) => {
  console.log('Event handled');
};
\`\`\``,

      concatenation: `**🔍 Problem Analysis:**
String concatenation with + is less readable and harder to maintain with complex expressions.

**✅ Baseline Solution:**
Template literals provide cleaner syntax with expression interpolation.

**🔄 Code Migration:**
\`\`\`javascript
// Before
const message = 'Hello ' + name + ', you have ' + count + ' items';

// After
const message = \`Hello \${name}, you have \${count} items\`;
\`\`\``,

      with: `**🔍 Problem Analysis:**
with statements create ambiguous scope and are prohibited in strict mode due to performance issues.

**✅ Baseline Solution:**
Use explicit object property access for clarity and performance.

**🔄 Code Migration:**
\`\`\`javascript
// Before (deprecated)
with (config) {
  console.log(apiUrl);
}

// After
console.log(config.apiUrl);
\`\`\``
    };
    
    return {
      suggestion: demoSuggestions[issue.pattern] || `**🔍 Problem Analysis:**
This legacy pattern may have compatibility or performance issues.

**✅ Baseline Solution:**
Consider using modern Baseline-compatible alternatives.

**🔄 Code Migration:**
Check MDN documentation for current best practices.`,
      confidence: 0.95,
      model: 'demo-mode'
    };
  }

  async generateBatchSuggestions(issues, codeContext) {
    if (!this.initialized) {
      return issues.map(issue => ({
        ...issue,
        aiSuggestion: 'Google Gemini AI features require API key'
      }));
    }

    this.logger.log(this.chalk.blue('🤖 Generating Google Gemini AI suggestions...'));
    this.logger.log(this.chalk.gray(`   Processing ${issues.length} patterns with rate limiting...`));
    
    const enhancedIssues = [];
    
    for (const [index, issue] of issues.entries()) {
      this.logger.log(this.chalk.dim(`   Processing ${index + 1}/${issues.length}: ${issue.pattern}`));
      
      const aiResponse = await this.generateSuggestion(issue, codeContext);
      enhancedIssues.push({
        ...issue,
        aiSuggestion: aiResponse.suggestion,
        aiConfidence: aiResponse.confidence,
        aiProvider: 'Google Gemini'
      });
      
      // Extra delay for batch operations
      if (index < issues.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return enhancedIssues;
  }

  formatAISuggestion(suggestion, confidence) {
    const sections = suggestion.split('\n\n');
    let formatted = this.chalk.bold.magenta('🤖 Google Gemini AI Analysis:\n\n');
    
    sections.forEach(section => {
      if (section.trim()) {
        // Handle emoji headers and bold formatting
        if (section.includes('**') || section.includes('🔍') || section.includes('✅') || section.includes('🔄') || section.includes('🚀') || section.includes('⚠️')) {
          const formatted_section = section
            .replace(/\*\*(.*?)\*\*/g, (match, text) => this.chalk.bold.cyan(text))
            .replace(/`(.*?)`/g, (match, code) => this.chalk.green(code));
          formatted += formatted_section + '\n\n';
        } else {
          formatted += this.chalk.white(section) + '\n\n';
        }
      }
    });
    
    if (confidence > 0) {
      formatted += this.chalk.dim(`\n✨ Google Gemini Confidence: ${Math.round(confidence * 100)}% | Model: gemini-pro`);
    }
    
    return formatted;
  }

  getStats() {
    return {
      requestCount: this.requestCount,
      initialized: this.initialized,
      model: 'gemini-pro'
    };
  }
}
