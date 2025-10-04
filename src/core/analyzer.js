
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { readFileSync } from 'fs';
import { Chalk } from 'chalk';
import { BaselineManager } from '../baseline/manager.js';
import { AIEngine } from '../ai/engine.js';

// Handle ES module import for traverse
const traverse = traverseModule.default || traverseModule;

export class BaselineAnalyzer {
  constructor(options = {}) {
    this.logger = options.logger || console;
    // Disable chalk if a custom logger is provided (e.g., for web UI)
    const chalkLevel = (options.logger && options.logger !== console) ? 0 : undefined;
    this.chalk = new Chalk({ level: chalkLevel });

    this.baselineManager = new BaselineManager();
    this.aiEngine = new AIEngine({ logger: this.logger, chalk: this.chalk });
    this.issues = [];
  }

  async analyzeFile(filePath, options = {}) {
    this.logger.log(this.chalk.blue(`🔍 Analyzing ${filePath}...`));
  
    // Initialize Baseline data
    await this.baselineManager.initialize();
  
    // Initialize AI if requested
    if (options.ai) {
      await this.aiEngine.initialize();
    }
  
    try {
      // Read and parse file
      const code = readFileSync(filePath, 'utf8');
      const ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript'],
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true
      });
  
      // Reset issues
      this.issues = [];
  
      this.logger.log(this.chalk.gray('📊 Parsing AST and detecting patterns...'));
  
      // Traverse AST with comprehensive pattern detectors
      traverse(ast, {
        // Visitor for new expressions (e.g., new Promise(), new XMLHttpRequest())
        NewExpression: (path) => {
          if (path.node.callee.name === 'XMLHttpRequest') {
            this.addIssue('XMLHttpRequest', path.node.loc.start.line, 
              'XMLHttpRequest detected', 'Legacy AJAX pattern found');
          }
          if (path.node.callee.name === 'Promise' && path.node.arguments.length > 0) {
            this.addIssue('Promise', path.node.loc.start.line, 
              'Promise constructor detected', 'Consider async/await for cleaner asynchronous code');
          }
        },

        // Visitor for variable declarations (e.g., var)
        VariableDeclaration: (path) => {
          if (path.node.kind === 'var') {
            this.addIssue('var', path.node.loc.start.line,
              'var declaration found', 'Use `let` or `const` instead for block-scoping');
          }
        },

        // Visitor for function declarations
        FunctionDeclaration: (path) => {
          if (!path.node.async && path.node.id && path.node.id.name !== 'main') {
            this.addIssue('function', path.node.loc.start.line,
              'Function declaration found', 'Consider using modern arrow functions for lexical `this` binding');
          }
        },

        // Visitor for binary expressions (e.g., ==, !=)
        BinaryExpression: (path) => {
          if (path.node.operator === '==' || path.node.operator === '!=') {
            this.addIssue('equality', path.node.loc.start.line,
              `Loose equality operator (${path.node.operator}) detected`, 'Use strict equality (=== or !==) to avoid type coercion issues');
          }
          if (path.node.operator === '+') {
            // Check if it's string concatenation
            const hasStringLiteral = path.node.left.type === 'StringLiteral' || 
                                   path.node.right.type === 'StringLiteral' ||
                                   (path.node.left.type === 'BinaryExpression' && path.node.left.operator === '+') ||
                                   (path.node.right.type === 'BinaryExpression' && path.node.right.operator === '+');
            
            if (hasStringLiteral) {
              this.addIssue('concatenation', path.node.loc.start.line,
                'String concatenation using +', 'Use template literals (e.g., `${a}${b}`) for better readability');
            }
          }
        },

        // Visitor for call expressions (e.g., func(), obj.method())
        CallExpression: (path) => {
          const callee = path.node.callee;
          if (callee.type !== 'MemberExpression') return;

          const propName = callee.property.name;
          const objectName = callee.object.name;

          // Legacy DOM Selection
          if (['getElementById', 'getElementsByClassName', 'getElementsByTagName'].includes(propName)) {
            this.addIssue(propName, path.node.loc.start.line,
              `Legacy DOM selector: ${propName}`, 'Use `querySelector` or `querySelectorAll` for modern, consistent selection');
          }
          
          // Legacy Event Handling
          if (propName === 'attachEvent') {
            this.addIssue('attachEvent', path.node.loc.start.line,
              'Legacy IE event handling', 'Use `addEventListener` for standards-compliant event handling');
          }

          // Array.prototype methods
          if (propName === 'apply' && objectName === 'Array' && path.parent.type === 'NewExpression') {
             this.addIssue('Array.apply', path.node.loc.start.line,
              'Array.apply(null, ...)', 'Use array spread syntax `[...arrayLike]` for modern array creation');
          }
          
          // indexOf checks
          if (propName === 'indexOf' && path.parent.type === 'BinaryExpression' && 
              (path.parent.operator === '>' || path.parent.operator === '>=') &&
              path.parent.right.type === 'NumericLiteral' && path.parent.right.value === -1) {
             this.addIssue('indexOf', path.node.loc.start.line,
              'indexOf > -1 check', 'Use `Array.prototype.includes()` for a cleaner existence check');
          }
        },

        // Visitor for member expressions (e.g., obj.prop)
        MemberExpression: (path) => {
          const propName = path.node.property.name;

          // Legacy Properties
          if (propName === 'innerHTML') {
            this.addIssue('innerHTML', path.node.loc.start.line,
              'Use of innerHTML', 'Potential security risk (XSS). Consider using `textContent` or `createElement` instead');
          }
          
          // User agent sniffing
          if (path.node.object.name === 'navigator' && propName === 'userAgent') {
            this.addIssue('userAgent', path.node.loc.start.line,
              'User agent sniffing', 'Avoid relying on user agent strings; use feature detection instead');
          }
        },
        
        // Visitor for dangerous statements
        WithStatement: (path) => {
          this.addIssue('with', path.node.loc.start.line,
            '`with` statement used', '`with` is deprecated and disallowed in strict mode due to performance and security issues');
        },

        // Assignment expressions (e.g., obj.innerHTML = value)
        AssignmentExpression: (path) => {
          if (path.node.left.type === 'MemberExpression' && 
              path.node.left.property.name === 'innerHTML') {
            this.addIssue('innerHTML', path.node.loc.start.line,
              'innerHTML assignment', 'Potential XSS vulnerability. Use textContent or createElement for safety');
          }
        }
      });
  
      // Get Baseline recommendations
      await this.enrichWithBaseline();
  
      // Add AI suggestions if requested
      if (options.ai && this.issues.length > 0) {
        await this.enrichWithAI(code);
      }
  
      // Display results
      await this.displayResults(options);
  
    } catch (error) {
      this.logger.error(this.chalk.red(`❌ Error analyzing ${filePath}: ${error.message}`));
    }
  }

  addIssue(pattern, line, message, details) {
    // Avoid duplicate issues on the same line for the same pattern
    const existing = this.issues.find(issue => 
      issue.pattern === pattern && issue.line === line
    );
    
    if (!existing) {
      this.issues.push({
        pattern,
        line,
        message,
        details,
        severity: 'medium'
      });
    }
  }

  async enrichWithBaseline() {
    this.logger.log(this.chalk.gray('🔍 Checking against Baseline data...'));
    
    for (let issue of this.issues) {
      const baselineInfo = await this.baselineManager.checkPattern(issue.pattern);
      if (baselineInfo) {
        issue.severity = baselineInfo.severity;
        issue.modern = baselineInfo.modern;
        issue.baseline = baselineInfo.baseline;
        issue.recommendation = baselineInfo.recommendation;
        issue.example = baselineInfo.example;
      }
    }
  }

  async enrichWithAI(fullCode) {
    this.logger.log(this.chalk.gray('🤖 Getting Google Gemini AI insights...'));
    this.logger.log(this.chalk.dim(`   Analyzing ${this.issues.length} patterns with smart rate limiting...`));
    
    const maxAISuggestions = Math.min(this.issues.length, 10);
    const issuesForAI = this.issues.slice(0, maxAISuggestions);
    
    if (this.issues.length > maxAISuggestions) {
      this.logger.log(this.chalk.dim(`   🔢 Processing top ${maxAISuggestions} issues to avoid rate limits`));
    }
    
    for (let [index, issue] of issuesForAI.entries()) {
      const lines = fullCode.split('\n');
      const start = Math.max(0, issue.line - 3);
      const end = Math.min(lines.length, issue.line + 2);
      const context = lines.slice(start, end).join('\n');
      
      this.logger.log(this.chalk.dim(`   🔍 Processing ${index + 1}/${issuesForAI.length}: ${issue.pattern} (Line ${issue.line})`));
          
      const aiResponse = await this.aiEngine.generateSuggestion(issue, context);
      issue.aiSuggestion = aiResponse.suggestion;
      issue.aiConfidence = aiResponse.confidence;
          
      if (aiResponse.model !== 'demo-mode') {
        this.logger.log(this.chalk.dim(`   ✅ Generated AI suggestion for ${issue.pattern}`));
      } else {
        this.logger.log(this.chalk.dim(`   📝 Used demo suggestion for ${issue.pattern}`));
      }
    }
    
    for (let i = maxAISuggestions; i < this.issues.length; i++) {
      this.issues[i].aiSuggestion = null;
      this.issues[i].aiConfidence = 0;
    }
    
    const stats = this.aiEngine.getStats();
    this.logger.log(this.chalk.dim(`   📊 Completed: ${stats.requestCount} AI requests processed successfully`));
  }

  async displayResults(options) {
    if (this.issues.length === 0) {
      this.logger.log(this.chalk.green('\n✅ No legacy patterns detected! Code is Baseline-ready.'));
      return;
    }
  
    this.logger.log(this.chalk.yellow(`\n⚠️  Found ${this.issues.length} legacy patterns:\n`));
  
    const sortedIssues = this.issues.sort((a, b) => {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return a.line - b.line;
    });

    sortedIssues.forEach((issue, index) => {
      const severityColor = issue.severity === 'high' ? 'red' :
                            issue.severity === 'medium' ? 'yellow' : 'blue';
      const severityIcon = issue.severity === 'high' ? '🔴' :
                           issue.severity === 'medium' ? '🟡' : '🔵';
              
      this.logger.log(`${severityIcon} ${this.chalk.bold(`Line ${issue.line}`)} - ${this.chalk[severityColor](issue.severity.toUpperCase())} PRIORITY`);
      this.logger.log(`   ${this.chalk.red('Legacy:')} ${issue.pattern}`);
      this.logger.log(`   ${this.chalk.green('Modern:')} ${issue.modern || 'Modern alternative available'}`);
      this.logger.log(`   ${this.chalk.gray('Fix:')} ${issue.recommendation || 'Update to Baseline-compatible pattern'}`);
              
      if (issue.example) {
        this.logger.log(`   ${this.chalk.cyan('Example:')} ${issue.example}`);
      }
  
      if (issue.aiSuggestion && options.ai) {
        this.logger.log(this.chalk.bold.magenta('\n   🤖 Google Gemini AI Analysis:'));
        const formattedSuggestion = issue.aiSuggestion
          .replace(/\*\*(.*?)\*\*/g, this.chalk.bold.cyan('$1'))
          .replace(/`(.*?)`/g, this.chalk.green('$1'));
              
        this.logger.log(this.chalk.white('   ' + formattedSuggestion.replace(/\n/g, '\n   ')));
              
        if (issue.aiConfidence > 0) {
          this.logger.log(this.chalk.dim(`   ✨ Confidence: ${Math.round(issue.aiConfidence * 100)}%`));
        }
      } else if (options.ai && !issue.aiSuggestion) {
        this.logger.log(this.chalk.dim('   💡 AI suggestion: Use modern Baseline-compatible patterns'));
      }
              
      if (index < sortedIssues.length - 1) {
        this.logger.log(''); // Add spacing between issues
      }
    });
  
    this.logger.log(this.chalk.bold('\n📊 Migration Summary:'));
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;
    
    this.logger.log(`   🔴 High priority: ${this.chalk.red.bold(highIssues)} (immediate attention needed)`);
    this.logger.log(`   🟡 Medium priority: ${this.chalk.yellow.bold(mediumIssues)} (should be updated)`);
    this.logger.log(`   🔵 Low priority: ${this.chalk.blue.bold(lowIssues)} (nice to have)`);
  
    this.logger.log(this.chalk.bold('\n🎯 Baseline Compatibility:'));
    const baselineReady = this.issues.length === 0;
    if (baselineReady) {
      this.logger.log(`   ✅ ${this.chalk.green('Ready for production - all patterns are Baseline compatible!')}`);
    } else {
      this.logger.log(`   ⚠️  ${this.chalk.yellow(`${this.issues.length} patterns need modernization for full Baseline compatibility`)}`);
      
      const criticalCount = highIssues + mediumIssues;
      if (criticalCount > 0) {
        this.logger.log(`   🚨 ${this.chalk.yellow(`Focus on ${criticalCount} high/medium priority issues first`)}`);
      }
    }
      
    if (!options.ai && this.issues.length > 0) {
      this.logger.log(this.chalk.bold.cyan('\n🚀 Run with --ai flag for intelligent migration suggestions!'));
    } else if (options.ai) {
      const aiSuggestions = this.issues.filter(i => i.aiSuggestion).length;
      this.logger.log(this.chalk.bold.green(`\n✨ Generated ${aiSuggestions} AI-powered migration suggestions!`));
    }
  }

  async scanDirectory(directory, options = {}) {
    this.logger.log(this.chalk.blue(`📁 Scanning directory ${directory}...`));
    this.logger.log(this.chalk.yellow('⚠️  Directory scanning coming in next version!'));
    this.logger.log(this.chalk.dim('   Will recursively analyze all .js, .ts, .jsx, .tsx files'));
    this.logger.log(this.chalk.dim('   Generate comprehensive migration report'));
    this.logger.log(this.chalk.dim('   Export results to HTML/JSON formats'));
  }
}
