import type { WorkspacePublicConfig } from "./types";

const DEFAULT_BASE_URL = "https://app.tacksuite.it";
const DEFAULT_COLOR = "#517569";
const DEFAULT_POSITION: "right" | "left" = "right";
const DEFAULT_BUTTON_SIZE = 64;
const MOBILE_BREAKPOINT = 768;
const DESKTOP_PANEL_HEIGHT = 680;

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`;

function buildStyles(
  color: string,
  position: "right" | "left",
  buttonSize: number,
): string {
  const side = position;
  const oppositeSide = position === "right" ? "left" : "right";
  const panelOrigin = position === "right" ? "bottom right" : "bottom left";
  const iconSize = Math.round(buttonSize * (24 / 56));
  const panelOffset = buttonSize + 32;

  return `
    :host {
      position: fixed;
      bottom: 20px;
      ${side}: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .ts-button {
      width: ${buttonSize}px;
      height: ${buttonSize}px;
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
      width: ${iconSize}px;
      height: ${iconSize}px;
      pointer-events: none;
    }

    .ts-panel {
      position: fixed;
      bottom: ${panelOffset}px;
      ${side}: 20px;
      ${oppositeSide}: auto;
      width: 400px;
      height: min(${DESKTOP_PANEL_HEIGHT}px, calc(100dvh - ${panelOffset + 20}px));
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
      :host(.ts-open) .ts-button {
        display: none;
      }

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
  private _workspaceConfig: WorkspacePublicConfig | null = null;
  private _configRequestController: AbortController | null = null;
  private _configRequestId = 0;

  private _button: HTMLButtonElement | null = null;
  private _panel: HTMLDivElement | null = null;

  private _config = {
    workspace: "",
    baseUrl: DEFAULT_BASE_URL,
    customColor: null as string | null,
    icon: CHAT_ICON,
    customPosition: null as "right" | "left" | null,
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
        this._config.customColor = newValue || null;
        break;
      case "icon":
        this._config.icon = newValue || CHAT_ICON;
        break;
      case "position":
        this._config.customPosition =
          newValue === "left" || newValue === "right" ? newValue : null;
        break;
    }

    if (!this.isConnected) {
      return;
    }

    if (name === "workspace" || name === "base-url") {
      this._resetWidget();
      void this._loadWorkspaceConfig();
      return;
    }

    if (this._canRenderWidget()) {
      this.render();
    }
  }

  connectedCallback() {
    this._setupListeners();
    void this._loadWorkspaceConfig();
  }

  disconnectedCallback() {
    this._configRequestController?.abort();
    this._configRequestController = null;
    this._teardownListeners();
  }

  private _isCloseMessage(data: unknown) {
    if (data === "close") {
      return true;
    }

    if (typeof data !== "object" || data === null) {
      return false;
    }

    const payload = data as {
      type?: string;
      event?: string;
      action?: string;
      namespace?: string;
    };

    return (
      payload.type === "close" ||
      payload.type === "tacksuite-chat:close" ||
      payload.event === "close" ||
      payload.action === "close" ||
      payload.namespace === "chat-widget/close"
    );
  }

  private _handlePostMessage = (event: MessageEvent) => {
    const origin = new URL(this._config.baseUrl).origin;
    if (event.origin !== origin) return;
    if (this._isCloseMessage(event.data)) {
      this._close();
    }
  };

  private _setupListeners() {
    window.addEventListener("message", this._handlePostMessage);
  }

  private _teardownListeners() {
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

    if (!this._canRenderWidget()) {
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
    // Toggle host class for CSS selectors (:host(.ts-open))
    this.classList.toggle("ts-open", this._isOpen);

    if (this._panel) {
      this._panel.classList.toggle("ts-hidden", !this._isOpen);
    }
    if (this._button) {
      this._button.innerHTML = this._isOpen ? CLOSE_ICON : this._config.icon;
      this._button.setAttribute(
        "aria-label",
        this._isOpen ? "Close chat" : "Open chat",
      );
    }
  }

  private _canRenderWidget() {
    return this._workspaceConfig?.active === true;
  }

  private _getLauncherColor() {
    return (
      this._config.customColor ??
      this._workspaceConfig?.publicChat?.primaryColor ??
      DEFAULT_COLOR
    );
  }

  private _getPosition(): "right" | "left" {
    return (
      this._config.customPosition ??
      this._workspaceConfig?.publicChat?.buttonPosition ??
      DEFAULT_POSITION
    );
  }

  private _getButtonSize(): number {
    const configured = this._workspaceConfig?.publicChat?.buttonSize;
    return typeof configured === "number" && configured > 0
      ? configured
      : DEFAULT_BUTTON_SIZE;
  }

  private _clearRender() {
    this.classList.remove("ts-open");
    this.shadowRoot?.replaceChildren();
    this._button = null;
    this._panel = null;
  }

  private _resetWidget() {
    this._configRequestController?.abort();
    this._configRequestController = null;
    this._workspaceConfig = null;
    this._isOpen = false;
    this._iframeLoaded = false;
    this._clearRender();
  }

  private async _loadWorkspaceConfig() {
    if (!this._config.workspace) {
      this._resetWidget();
      console.warn("[tacksuite-chat] Missing required 'workspace' attribute.");
      return;
    }

    this._resetWidget();

    const requestId = ++this._configRequestId;
    const controller = new AbortController();
    this._configRequestController = controller;

    try {
      const response = await fetch(
        new URL(
          `/api/workspace/${this._config.workspace}/config`,
          this._config.baseUrl,
        ).toString(),
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Config request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as WorkspacePublicConfig;

      if (
        requestId !== this._configRequestId ||
        !this.isConnected ||
        this._configRequestController !== controller
      ) {
        return;
      }

      this._workspaceConfig = payload;

      if (!this._canRenderWidget()) {
        this._clearRender();
        return;
      }

      this.render();
    } catch (error) {
      if ((error as DOMException).name === "AbortError") {
        return;
      }

      if (
        requestId === this._configRequestId &&
        this._configRequestController === controller
      ) {
        this._workspaceConfig = null;
        this._clearRender();
      }
    } finally {
      if (this._configRequestController === controller) {
        this._configRequestController = null;
      }
    }
  }

  private render() {
    const shadow = this.shadowRoot;
    if (!shadow || !this._canRenderWidget()) {
      this._clearRender();
      return;
    }

    // Preserve iframe if already loaded
    const existingIframe = shadow.querySelector("iframe");

    shadow.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = buildStyles(
      this._getLauncherColor(),
      this._getPosition(),
      this._getButtonSize(),
    );
    shadow.appendChild(style);

    // Button
    this._button = document.createElement("button");
    this._button.className = "ts-button";
    this._button.innerHTML = this._isOpen ? CLOSE_ICON : this._config.icon;
    this._button.setAttribute(
      "aria-label",
      this._isOpen ? "Close chat" : "Open chat",
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
