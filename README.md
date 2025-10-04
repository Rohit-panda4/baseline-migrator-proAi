# 🚀 Baseline Migrator Pro

[![Google Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)](https://ai.google.dev)
[![Baseline Data](https://img.shields.io/badge/Baseline%20Data-279%20Web%20Features-green)](https://github.com/web-platform-dx/web-features)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org)

**AI-Powered Web Feature Migration Tool for Baseline Compatibility**

Modernize your JavaScript codebase with confidence using official Chrome compatibility data and AI-powered migration suggestions from Google Gemini.

---

## 🌟 Project Status

**✅ Active & Maintained (October 2025)**

The AI engine has been successfully migrated to the latest Google Gemini SDK (`@google/genai`) and now uses the `gemini-2.5-flash` model for faster and more accurate suggestions. All systems are fully operational.

---

## ✨ Key Features

-   **🤖 AI-Powered Migrations**: Leverages the official `@google/genai` SDK with the powerful `gemini-2.5-flash` model for intelligent, context-aware code migration suggestions.
-   **🔍 AST-Based Pattern Detection**: Uses Abstract Syntax Tree (AST) analysis to detect **over 15 common legacy JavaScript patterns.**
-   **📊 Baseline Compatibility Data**: Cross-references findings with a database of **over 279 web features** to check for modern browser compatibility (the "Baseline").
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
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

---

## ⚙️ Configuration

This project requires a Google Gemini API key to power its AI features.

1.  **Get your API key** from [Google AI Studio](https://ai.google.dev).

2.  **Copy the `.env.example` file** to a new `.env` file:
    ```bash
    cp .env.example .env
    ```

3.  **Open the `.env` file** and add your Gemini API key:
    ```
    GEMINI_API_KEY="<your-api-key-here>"
    ```
    Replace `<your-api-key-here>` with your actual key.

---

## 🚀 Usage

### 🌐 Web Interface

1.  **Start the web server:**
    ```bash
    npm run start:web
    ```

2.  **Open the web page:**
    Navigate to `http://localhost:3000` in your browser.

### 💻 Command-Line Interface (CLI)

```bash
# Analyze a file with AI-powered suggestions
npx baseline-migrate analyze src/legacy-code.js --ai
```

---

## 💡 How It Works

The tool operates on two primary data sources:

-   **Pattern Detection Engine:** The core analyzer is programmed to identify **15+ specific legacy code patterns**.
-   **Web Feature Database:** A comprehensive dataset of **279+ web features** used to ensure that migration suggestions are aligned with the modern web's "Baseline."

### Detected Legacy Patterns

The analysis engine can detect the following legacy patterns:

| Pattern                | Priority | Modern Alternative        | Impact                  |
| ---------------------- | :------: | ------------------------- | ----------------------- |
| `XMLHttpRequest`       | 🔴 High  | `fetch` API                 | Performance & Complexity |
| `attachEvent`          | 🔴 High  | `addEventListener`        | Cross-Browser Inompat. |
| `innerHTML`            | 🔴 High  | `textContent`/`createElement` | XSS Security Risk       |
| `with` statement       | 🔴 High  | Explicit References       | Performance & Bugs      |
| `var` declaration      | 🟡 Medium | `const`/`let`             | Scoping Issues          |
| `getElementsByClassName` | 🟡 Medium | `querySelectorAll`        | Less Flexible           |
| `getElementsByTagName` | 🟡 Medium | `querySelectorAll`        | Less Flexible           |
| `Promise` constructor  | 🟡 Medium | `async/await`             | Readability             |
| `==` operator          | 🟡 Medium | `===` strict equality     | Type Coercion Bugs      |
| `Array.apply`          | 🟡 Medium | Spread Syntax (`...`)     | Readability             |
| `userAgent` sniffing   | 🟡 Medium | Feature Detection         | Unreliable & Brittle    |
| `getElementById`       | 🔵 Low   | `querySelector`           | Less Flexible           |
| `function` keyword     | 🔵 Low   | Arrow Functions (`=>`)    | Verbose & `this` Binding |
| String concatenation   | 🔵 Low   | Template Literals         | Readability             |
| `indexOf` for existence| 🔵 Low   | `Array.includes()`        | Readability             |

---

## 🤝 Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for guidelines on how to get started.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

-   **[web-features](https://github.com/web-platform-dx/web-features)** for the official browser compatibility data.
-   **[Google Gemini](https://ai.google.dev)** for providing the state-of-the-art `gemini-2.5-flash` model.
-   **[Babel](https://babeljs.io)** for the powerful JavaScript parsing and AST manipulation.
