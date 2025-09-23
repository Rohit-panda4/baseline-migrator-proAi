#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import { readFileSync } from 'fs';
import { SecurityManager } from './utils/security.js';
import { BaselineAnalyzer } from './core/analyzer.js';

// Initialize security
SecurityManager.maskSensitiveFiles();
SecurityManager.checkEnvironmentSecurity();

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

// Professional banner
console.log(boxen(
  chalk.cyan.bold('BASELINE MIGRATOR PRO') + '\n' +
  chalk.white('AI-Powered Web Feature Migration Tool\n') +
  chalk.gray(`v${packageJson.version} • Built for Baseline Tooling Hackathon 2025`),
  { 
    padding: 1, 
    margin: 1, 
    borderStyle: 'round', 
    borderColor: 'cyan',
    textAlignment: 'center'
  }
));

const program = new Command();

program
  .name('baseline-migrate')
  .description('AI-powered migration tool for Baseline web features')
  .version(packageJson.version);

program
  .command('analyze <file>')
  .description('Analyze JavaScript file for legacy patterns')
  .option('--ai', 'Include AI-powered suggestions', false)
  .option('--fix', 'Generate automatic fixes', false)
  .option('--format <type>', 'Output format (table|json|markdown)', 'table')
  .action(async (file, options) => {
    const analyzer = new BaselineAnalyzer();
    await analyzer.analyzeFile(file, options);
  });

program
  .command('scan <directory>')
  .description('Scan entire directory for legacy patterns')  
  .option('--ai', 'Include AI suggestions for each issue', false)
  .option('--report <path>', 'Generate detailed HTML report', 'report.html')
  .action(async (directory, options) => {
    console.log(chalk.blue(`📁 Scanning ${directory}...`));
    console.log(chalk.yellow('⚠️  Directory scanning coming next!'));
  });

program.parse();