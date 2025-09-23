import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import chalk from 'chalk';
import ora from 'ora';

dotenv.config();

export class AIEngine {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
  }

  async initialize() {
    if (!process.env.GEMINI_API_KEY) {
      console.log(chalk.yellow('⚠️  No Gemini API key found. AI suggestions disabled.'));
      console.log(chalk.gray('   Add GEMINI_API_KEY to .env file for Google AI features.'));
      return false;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.initialized = true;
      
      console.log(chalk.green('🤖 Google Gemini AI initialized successfully!'));
      console.log(chalk.gray('   Using Gemini 1.5 Flash for intelligent migration suggestions'));
      return true;
    } catch (error) {
      console.log(chalk.red('❌ Failed to initialize Gemini AI:', error.message));
      return false;
    }
  }

  async generateSuggestion(issue, codeContext) {
    if (!this.initialized) {
      return {
        suggestion: 'AI suggestions require Gemini API key in .env file',
        confidence: 0
      };
    }

    const spinner = ora(`Getting Gemini AI suggestion for ${issue.pattern}...`).start();
    
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
      
      spinner.succeed(`Gemini AI suggestion generated`);
      
      return {
        suggestion: suggestion,
        confidence: 0.9,
        model: 'gemini-1.5-flash'
      };

    } catch (error) {
      spinner.fail(`Gemini AI failed: ${error.message}`);
      
      return {
        suggestion: `Unable to get Gemini suggestion: ${error.message}`,
        confidence: 0
      };
    }
  }
}
