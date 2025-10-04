# 🚀 Baseline Migrator Pro

[![Google Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)](https://ai.google.dev)
[![Data Features](https://img.shields.io/badge/Data-279%20Web%20Features-green)](https://github.com/web-platform-dx/web-features)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org)

**AI-Powered Web Feature Migration Tool for Baseline Compatibility**

Modernize your JavaScript codebase with confidence using official Chrome compatibility data and AI-powered migration suggestions from Google Gemini.

---

## ✨ Key Features

-   **🤖 AI-Powered Migrations**: Leverages Google Gemini for intelligent, context-aware code migration suggestions.
-   **🔍 Legacy Pattern Detection**: Uses AST-based analysis to detect over 27 legacy JavaScript patterns.
-   **📊 Official Baseline Data**: Integrates with the official `web-features` package for accurate compatibility data across 279 web features.
-   **💻 Interactive Web Interface**: A user-friendly web UI for analyzing code directly in your browser.
-   **🎨 Professional CLI**: A powerful and beautiful command-line experience for developers.
-   **⚡ Production Ready**: Built with smart rate limiting, error handling, and performance optimizations.

---

## 🛠️ Installation

### Prerequisites

-   Node.js (v18 or higher)
-   `npm` or `yarn`

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Rohit-panda4/baseline-migrator-proAi.git
    cd baseline-migrator-proAi
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

---

## ⚙️ Configuration

### Google Gemini AI (Optional)

To enable AI-powered code suggestions, you need a Google Gemini API key.

1.  Get your API key from [Google AI Studio](https://ai.google.dev).
2.  Create a `.env` file in the root of the project:
    ```bash
    echo "GEMINI_API_KEY=your-key-here" > .env
    ```
    Replace `your-key-here` with your actual API key.

### Output Preferences (Optional)

You can also configure the output format and other settings in the `.env` file:

```
# The format for the CLI output (e.g., 'table', 'json')
OUTPUT_FORMAT=table

# Whether to show a progress bar during analysis
SHOW_PROGRESS=true

# The maximum number of AI suggestions to display
MAX_AI_SUGGESTIONS=10
```

---

## 🚀 Usage

### 🌐 Web Interface

The easiest way to get started is with the interactive web-based analysis tool.

1.  **Start the web server:**
    ```bash
    npm run start:web
    ```

2.  **Open the web page:**
    Open your browser and navigate to `http://localhost:3000`.

From the web interface, you can paste your JavaScript code into the editor and click the "Analyze" button. The tool will display a detailed report of legacy patterns, compatibility issues, and AI-powered suggestions for modernization.

### 💻 Command-Line Interface (CLI)

For more advanced use cases and integration with build pipelines, you can use the CLI.

#### Basic Analysis

Analyze one or more files for legacy patterns:

```bash
# Analyze a single file
npx baseline-migrate analyze src/legacy-code.js

# Analyze multiple files using a glob pattern
npx baseline-migrate analyze 'src/**/*.js'
```

#### AI-Powered Analysis

To get intelligent migration suggestions from Google Gemini, use the `--ai` flag:

```bash
npx baseline-migrate analyze src/legacy-code.js --ai
```

#### Demo Commands

Run various demonstrations to see the tool in action:

```bash
# Run a basic analysis demo (fast)
npm run demo

# Run an impressive AI-powered analysis demo
npm run demo-ai
```

---

## 💡 How It Works

### Architecture

The tool is built on a modern, robust architecture:

```
src/
├── index.js          # Professional CLI with beautiful output
├── core/analyzer.js    # AST-based pattern detection engine
├── baseline/manager.js # Web Features integration + migration patterns
├── ai/engine.js        # Google Gemini AI with smart rate limiting
└── web/                # Web server and interface
    ├── server.js       # Express.js server for the web UI
    └── index.html      # The HTML for the web interface
```

### Detected Patterns

The analysis engine can detect a wide range of legacy patterns, including:

| Pattern          | Priority | Modern Alternative      | Impact              |
| ---------------- | :------: | ----------------------- | ------------------- |
| `innerHTML`      | 🔴 High  | `textContent`/`createElement` | XSS Vulnerability   |
| `XMLHttpRequest` | 🔴 High  | `fetch` API               | Performance         |
| `var` declarations | 🟡 Medium | `const`/`let`           | Scope Issues        |
| `==` operators   | 🟡 Medium | `===` strict equality   | Type Coercion Bugs  |
| `getElementById` | 🔵 Low   | `querySelector`         | Less Flexible       |

*...and 22 more patterns.*

---

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for guidelines on how to get started.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

-   [web-features](https://github.com/web-platform-dx/web-features) for the official browser compatibility data.
-   [Google Gemini](https://ai.google.dev) for powering the intelligent migration suggestions.
-   [Babel](https://babeljs.io) for the powerful JavaScript parsing and AST manipulation.
