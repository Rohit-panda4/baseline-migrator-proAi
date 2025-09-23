import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { readFileSync } from 'fs';
import chalk from 'chalk';
import { BaselineManager } from '../baseline/manager.js';
import { AIEngine } from '../ai/engine.js';

// Handle ES module import for traverse
const traverse = traverseModule.default || traverseModule;

export class BaselineAnalyzer {
  constructor() {
    this.baselineManager = new BaselineManager();
    this.aiEngine = new AIEngine();
    this.issues = [];
  }

  async analyzeFile(filePath, options = {}) {
    console.log(chalk.blue(`🔍 Analyzing ${filePath}...`));
  
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
  
      console.log(chalk.gray('📊 Parsing AST and detecting patterns...'));
  
      // Traverse AST and detect patterns
      traverse(ast, {
        // Detect XMLHttpRequest
        NewExpression: (path) => {
          if (path.node.callee.name === 'XMLHttpRequest') {
            this.addIssue('XMLHttpRequest', path.node.loc.start.line, 
              'XMLHttpRequest detected', 
              'Legacy AJAX pattern found');
          }
        },
  
        // Detect var declarations
        VariableDeclaration: (path) => {
          if (path.node.kind === 'var') {
            this.addIssue('var', path.node.loc.start.line,
              'var declaration found', 
              'Function-scoped variable declaration');
          }
        },
  
        // Detect getElementById
        CallExpression: (path) => {
          if (path.node.callee.type === 'MemberExpression' &&
              path.node.callee.property.name === 'getElementById') {
            this.addIssue('getElementById', path.node.loc.start.line,
              'getElementById detected', 
              'Legacy DOM selection method');
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
      console.error(chalk.red(`❌ Error analyzing ${filePath}: ${error.message}`));
    }
  }

  addIssue(pattern, line, message, details) {
    this.issues.push({
      pattern,
      line,
      message,
      details,
      severity: 'medium'
    });
  }

  async enrichWithBaseline() {
    console.log(chalk.gray('🔍 Checking against Baseline data...'));
    
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
    console.log(chalk.gray('🤖 Getting Google Gemini AI insights...'));
  
    for (let issue of this.issues) {
      // Get relevant code context (5 lines around the issue)
      const lines = fullCode.split('\n');
      const start = Math.max(0, issue.line - 3);
      const end = Math.min(lines.length, issue.line + 2);
      const context = lines.slice(start, end).join('\n');
          
      const aiResponse = await this.aiEngine.generateSuggestion(issue, context);
      issue.aiSuggestion = aiResponse.suggestion;
      issue.aiConfidence = aiResponse.confidence;
          
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async displayResults(options) {
    if (this.issues.length === 0) {
      console.log(chalk.green('\n✅ No legacy patterns detected! Code is Baseline-ready.'));
      return;
    }
  
    console.log(chalk.yellow(`\n⚠️  Found ${this.issues.length} legacy patterns:\n`));
  
    // Display each issue with optional AI suggestions
    this.issues.forEach((issue, index) => {
      const severityColor = issue.severity === 'high' ? 'red' :
                            issue.severity === 'medium' ? 'yellow' : 'blue';
      const severityIcon = issue.severity === 'high' ? '🔴' :
                           issue.severity === 'medium' ? '🟡' : '🔵';
              
      console.log(`${severityIcon} ${chalk.bold(`Line ${issue.line}`)} - ${chalk[severityColor](issue.severity.toUpperCase())} PRIORITY`);
      console.log(`   ${chalk.red('Legacy:')} ${issue.pattern}`);
      console.log(`   ${chalk.green('Modern:')} ${issue.modern}`);
      console.log(`   ${chalk.gray('Fix:')} ${issue.recommendation}`);
              
      if (issue.example) {
        console.log(`   ${chalk.cyan('Example:')} ${issue.example}`);
      }
  
      // Show AI suggestion if available
      if (issue.aiSuggestion && options.ai) {
        console.log(chalk.bold.magenta('\n   🤖 Google Gemini AI Analysis:'));
        const formattedSuggestion = issue.aiSuggestion
          .replace(/\*\*(.*?)\*\*/g, chalk.bold.cyan('$1'))
          .replace(/`(.*?)`/g, chalk.green('$1'));
              
        console.log(chalk.white('   ' + formattedSuggestion.replace(/\n/g, '\n   ')));
              
        if (issue.aiConfidence > 0) {
          console.log(chalk.dim(`   ✨ Confidence: ${Math.round(issue.aiConfidence * 100)}%`));
        }
      }
              
      if (index < this.issues.length - 1) {
        console.log(''); // Add spacing between issues
      }
    });
  
    // Professional summary
    console.log(chalk.bold('\n📊 Migration Summary:'));
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = this.issues.filter(i => i.severity === 'low').length;
    console.log(`   🔴 High priority: ${chalk.red.bold(highIssues)} (immediate attention needed)`);
    console.log(`   🟡 Medium priority: ${chalk.yellow.bold(mediumIssues)} (should be updated)`);
    console.log(`   🔵 Low priority: ${chalk.blue.bold(lowIssues)} (nice to have)`);
  
    // Baseline status
    console.log(chalk.bold('\n🎯 Baseline Compatibility:'));
    const baselineReady = this.issues.length === 0;
    if (baselineReady) {
      console.log(`   ✅ ${chalk.green('Ready for production - all patterns are Baseline compatible!')}`);
    } else {
      console.log(`   ⚠️  ${chalk.yellow(`${this.issues.length} patterns need modernization for full Baseline compatibility`)}`);
    }
      
    if (!options.ai && this.issues.length > 0) {
      console.log(chalk.bold.cyan('\n🚀 Run with --ai flag for intelligent migration suggestions!'));
    }
  }

  async scanDirectory(directory, options = {}) {
    console.log(chalk.blue(`📁 Scanning directory ${directory}...`));
    console.log(chalk.yellow('⚠️  Directory scanning coming in next version!'));
  }
}
