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
