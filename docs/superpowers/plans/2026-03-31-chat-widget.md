# TackSuite Chat Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embeddable Web Component that shows a floating chat button and opens the TackSuite chat page in an iframe.

**Architecture:** Shadow DOM Web Component (`<tacksuite-chat>`) with lazy-loaded iframe. Single TypeScript source file plus entry point. Vite library mode builds ES + UMD bundles for npm/CDN distribution.

**Tech Stack:** TypeScript, Vite, Web Components (Shadow DOM), vite-plugin-dts

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Package config, scripts, npm metadata |
| `tsconfig.json` | TypeScript compiler options |
| `vite.config.ts` | Vite library mode build config |
| `src/main.ts` | Entry point — exports class, registers custom element |
| `src/tacksuite-chat.ts` | Web Component class (all logic + styles) |
| `src/types.ts` | TypeScript interfaces for attributes |
| `test/index.html` | Local dev/test page |

---

### Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@tacksuite/widget",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/tacksuite-widget.umd.js",
  "module": "dist/tacksuite-widget.es.js",
  "types": "dist/types/main.d.ts",
  "files": ["dist"],
  "exports": {
    ".": {
      "import": "./dist/tacksuite-widget.es.js",
      "require": "./dist/tacksuite-widget.umd.js",
      "types": "./dist/types/main.d.ts"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "prepublishOnly": "npm run build"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tacksuite/widget.git"
  },
  "description": "Embeddable chat widget for TackSuite",
  "author": "TackSuite",
  "license": "MIT"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "declarationDir": "dist/types",
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```ts
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: "dist/types",
    }),
  ],
  build: {
    target: "es2020",
    lib: {
      entry: "./src/main.ts",
      name: "TackSuiteChat",
      fileName: (format) => `tacksuite-widget.${format}.js`,
      formats: ["es", "umd"],
    },
  },
});
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, lock file generated.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts package-lock.json
git commit -m "feat: scaffold project with Vite library mode"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create types.ts**

```ts
export interface TackSuiteChatAttributes {
  /** Workspace slug (required) — maps to /chat/{slug} */
  workspace: string;

  /** TackSuite instance URL */
  "base-url"?: string;

  /** Button background color (hex) */
  color?: string;

  /** Custom SVG string for button icon */
  icon?: string;

  /** Corner placement: "right" or "left" */
  position?: "right" | "left";
}

declare global {
  interface HTMLElementTagNameMap {
    "tacksuite-chat": HTMLElement & TackSuiteChatAttributes;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: Web Component implementation

**Files:**
- Create: `src/tacksuite-chat.ts`

This is the core file. It contains the Web Component class with all styles, DOM construction, and event handling.

- [ ] **Step 1: Create src/tacksuite-chat.ts with the full component**

The component has these responsibilities:
- Parse attributes and maintain config state
- Render a floating button with Shadow DOM styles
- On first click, create iframe and panel; on subsequent clicks, toggle visibility
- Handle desktop/mobile layout switching on resize
- Listen for postMessage from iframe for close events
- Animate open/close with CSS transitions

```ts
const DEFAULT_BASE_URL = "https://app.tacksuite.it";
const DEFAULT_COLOR = "#517569";
const MOBILE_BREAKPOINT = 768;

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`;

function buildStyles(color: string, position: "right" | "left"): string {
  const side = position;
  const oppositeSide = position === "right" ? "left" : "right";
  const panelOrigin = position === "right" ? "bottom right" : "bottom left";

  return `
    :host {
      position: fixed;
      bottom: 20px;
      ${side}: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ts-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      background: ${color};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      padding: 0;
      outline: none;
    }

    .ts-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .ts-button:active {
      transform: scale(0.97);
    }

    .ts-button svg {
      width: 24px;
      height: 24px;
      pointer-events: none;
    }

    .ts-panel {
      position: fixed;
      bottom: 88px;
      ${side}: 20px;
      ${oppositeSide}: auto;
      width: 400px;
      height: min(600px, calc(100dvh - 108px));
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
      transform-origin: ${panelOrigin};
      transition: opacity 0.2s ease-out, transform 0.2s ease-out;
      opacity: 1;
      transform: scale(1) translateY(0);
    }

    .ts-panel.ts-hidden {
      opacity: 0;
      transform: scale(0.95) translateY(8px);
      pointer-events: none;
    }

    .ts-panel iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      background: white;
    }

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
      .ts-panel {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        bottom: 0;
        ${side}: 0;
        transform-origin: bottom center;
      }

      .ts-panel.ts-hidden {
        transform: translateY(100%);
        opacity: 0;
      }
    }
  `;
}

const SafeHTMLElement =
  typeof window !== "undefined"
    ? window.HTMLElement
    : (class {} as typeof HTMLElement);

export class TackSuiteChat extends SafeHTMLElement {
  private _isOpen = false;
  private _iframeLoaded = false;

  private _button: HTMLButtonElement | null = null;
  private _panel: HTMLDivElement | null = null;

  private _config = {
    workspace: "",
    baseUrl: DEFAULT_BASE_URL,
    color: DEFAULT_COLOR,
    icon: CHAT_ICON,
    position: "right" as "right" | "left",
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["workspace", "base-url", "color", "icon", "position"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case "workspace":
        this._config.workspace = newValue;
        break;
      case "base-url":
        this._config.baseUrl = newValue || DEFAULT_BASE_URL;
        break;
      case "color":
        this._config.color = newValue || DEFAULT_COLOR;
        break;
      case "icon":
        this._config.icon = newValue || CHAT_ICON;
        break;
      case "position":
        this._config.position = newValue === "left" ? "left" : "right";
        break;
    }

    // Re-render if already connected (attribute changed after mount)
    if (this.isConnected) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this._setupListeners();
  }

  disconnectedCallback() {
    this._teardownListeners();
  }

  private _handleResize = () => {
    // Panel CSS handles mobile/desktop switch via media query.
    // Nothing to do in JS — CSS handles it.
  };

  private _handlePostMessage = (event: MessageEvent) => {
    const origin = new URL(this._config.baseUrl).origin;
    if (event.origin !== origin) return;
    if (event.data?.type === "tacksuite-chat:close") {
      this._close();
    }
  };

  private _setupListeners() {
    window.addEventListener("resize", this._handleResize);
    window.addEventListener("message", this._handlePostMessage);
  }

  private _teardownListeners() {
    window.removeEventListener("resize", this._handleResize);
    window.removeEventListener("message", this._handlePostMessage);
  }

  private _toggle() {
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _open() {
    if (!this._config.workspace) {
      console.warn("[tacksuite-chat] Missing required 'workspace' attribute.");
      return;
    }

    this._isOpen = true;

    // Lazy-load iframe on first open
    if (!this._iframeLoaded && this._panel) {
      const iframe = document.createElement("iframe");
      iframe.src = `${this._config.baseUrl}/chat/${this._config.workspace}`;
      iframe.allow = "microphone";
      iframe.title = "TackSuite Chat";
      this._panel.appendChild(iframe);
      this._iframeLoaded = true;
    }

    this._updateState();
  }

  private _close() {
    this._isOpen = false;
    this._updateState();
  }

  private _updateState() {
    if (this._panel) {
      this._panel.classList.toggle("ts-hidden", !this._isOpen);
    }
    if (this._button) {
      this._button.innerHTML = this._isOpen
        ? CLOSE_ICON
        : this._config.icon;
      this._button.setAttribute(
        "aria-label",
        this._isOpen ? "Close chat" : "Open chat"
      );
    }
  }

  private render() {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    // Preserve iframe if already loaded
    const existingIframe = shadow.querySelector("iframe");

    shadow.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = buildStyles(this._config.color, this._config.position);
    shadow.appendChild(style);

    // Button
    this._button = document.createElement("button");
    this._button.className = "ts-button";
    this._button.innerHTML = this._isOpen ? CLOSE_ICON : this._config.icon;
    this._button.setAttribute(
      "aria-label",
      this._isOpen ? "Close chat" : "Open chat"
    );
    this._button.addEventListener("click", () => this._toggle());

    // Panel
    this._panel = document.createElement("div");
    this._panel.className = `ts-panel${this._isOpen ? "" : " ts-hidden"}`;

    // Restore existing iframe if we had one
    if (existingIframe) {
      this._panel.appendChild(existingIframe);
    }

    shadow.appendChild(this._panel);
    shadow.appendChild(this._button);
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/tacksuite-chat.ts
git commit -m "feat: implement TackSuiteChat web component"
```

---

### Task 4: Entry point and custom element registration

**Files:**
- Create: `src/main.ts`

- [ ] **Step 1: Create src/main.ts**

```ts
import { TackSuiteChat } from "./tacksuite-chat";
import type { TackSuiteChatAttributes } from "./types";

export { TackSuiteChat, TackSuiteChatAttributes };

if (typeof window !== "undefined" && window.customElements) {
  if (!customElements.get("tacksuite-chat")) {
    customElements.define("tacksuite-chat", TackSuiteChat);
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `dist/tacksuite-widget.es.js` and `dist/tacksuite-widget.umd.js` are created.

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: add entry point and register custom element"
```

---

### Task 5: Test page

**Files:**
- Create: `test/index.html`

- [ ] **Step 1: Create test/index.html**

This is the local dev test page. Vite serves it at `http://localhost:5173/test/`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TackSuite Widget — Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 640px;
      margin: 60px auto;
      padding: 0 20px;
      color: #333;
    }
    h1 { font-size: 1.5rem; }
    p { line-height: 1.6; color: #666; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>TackSuite Chat Widget — Test Page</h1>
  <p>The chat widget should appear in the bottom-right corner.</p>
  <p>Try resizing the window below 768px to see the mobile fullscreen mode.</p>
  <p>
    Workspace: <code>test</code><br/>
    Base URL: <code>http://localhost:3000</code>
  </p>

  <script type="module" src="../src/main.ts"></script>
  <tacksuite-chat
    workspace="test"
    base-url="http://localhost:3000"
  ></tacksuite-chat>
</body>
</html>
```

- [ ] **Step 2: Create vite dev server entry**

Create `index.html` at project root that redirects to test page, so `npm run dev` works:

```html
<!DOCTYPE html>
<html>
<head><meta http-equiv="refresh" content="0;url=/test/" /></head>
<body></body>
</html>
```

- [ ] **Step 3: Verify dev server**

Run: `npm run dev`
Expected: Opens at `http://localhost:5173`, redirects to `/test/`, widget button visible in bottom-right.

- [ ] **Step 4: Commit**

```bash
git add test/index.html index.html
git commit -m "feat: add test page for local development"
```

---

### Task 6: Build verification and .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
dist/
*.local
```

- [ ] **Step 2: Run full build**

Run: `npm run build`
Expected: Clean build, `dist/` contains:
- `tacksuite-widget.es.js`
- `tacksuite-widget.umd.js`
- `types/main.d.ts`

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```
