import type { WorkspacePublicConfig } from "./types";

const DEFAULT_BASE_URL = "https://app.tacksuite.it";
const DEFAULT_COLOR = "#517569";
const DEFAULT_SECONDARY_COLOR = "#f3f4f6";
const DEFAULT_POSITION: "right" | "left" = "right";
const DEFAULT_BUTTON_SIZE = 64;
const MOBILE_BREAKPOINT = 768;
const DESKTOP_PANEL_HEIGHT = 680;
const BUBBLE_REVEAL_DELAY_MS = 500;
const BUBBLE_TYPING_DURATION_MS = 1200;

function getReadableForeground(bg: string): string {
  const hex = bg.replace("#", "").trim();
  if (hex.length !== 3 && hex.length !== 6) return "#111827";
  const expanded =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return "#111827";
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff";
}

const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>`;

function buildStyles(
  color: string,
  position: "right" | "left",
  buttonSize: number,
  bubbleBackground: string,
  bubbleForeground: string,
): string {
  const side = position;
  const oppositeSide = position === "right" ? "left" : "right";
  const panelOrigin = position === "right" ? "bottom right" : "bottom left";
  const iconSize = Math.round(buttonSize * (24 / 56));
  const panelOffset = buttonSize + 32;
  const bubbleOffset = buttonSize + 30;
  const tailSideOffset = Math.max(8, Math.round(buttonSize / 2 - 6));

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

    .ts-bubble {
      position: fixed;
      bottom: ${bubbleOffset}px;
      ${side}: 20px;
      ${oppositeSide}: auto;
      max-width: min(260px, calc(100vw - 80px));
      background: ${bubbleBackground};
      color: ${bubbleForeground};
      padding: 10px 14px;
      padding-right: 32px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.35;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
      opacity: 0;
      transform: translateY(8px);
      pointer-events: none;
      transition: opacity 0.25s ease-out, transform 0.25s ease-out;
      cursor: pointer;
      word-wrap: break-word;
    }

    .ts-bubble.ts-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .ts-bubble::after {
      content: "";
      position: absolute;
      bottom: -5px;
      ${side}: ${tailSideOffset}px;
      width: 12px;
      height: 12px;
      background: ${bubbleBackground};
      border-radius: 2px;
      transform: rotate(45deg);
    }

    .ts-bubble-text {
      display: block;
    }

    .ts-bubble.ts-typing {
      padding: 10px 16px;
      text-align: center;
    }

    .ts-bubble.ts-typing .ts-bubble-text,
    .ts-bubble.ts-typing .ts-bubble-close {
      display: none;
    }

    .ts-bubble-typing {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 2px 0;
    }

    .ts-bubble.ts-typing .ts-bubble-typing {
      display: inline-flex;
    }

    .ts-bubble-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.4;
      animation: ts-bubble-typing-bounce 1.2s infinite ease-in-out;
    }

    .ts-bubble-typing-dot:nth-child(2) {
      animation-delay: 0.15s;
    }

    .ts-bubble-typing-dot:nth-child(3) {
      animation-delay: 0.3s;
    }

    @keyframes ts-bubble-typing-bounce {
      0%, 80%, 100% {
        transform: translateY(0);
        opacity: 0.35;
      }
      40% {
        transform: translateY(-3px);
        opacity: 1;
      }
    }

    .ts-bubble-close {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: ${bubbleForeground};
      opacity: 0.7;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      border-radius: 50%;
      transition: opacity 0.15s ease, background-color 0.15s ease;
    }

    .ts-bubble-close:hover {
      opacity: 1;
      background-color: rgba(0, 0, 0, 0.08);
    }

    @media (max-width: ${MOBILE_BREAKPOINT}px) {
      :host(.ts-open) .ts-button {
        display: none;
      }

      :host(.ts-open) .ts-bubble {
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

const HOST_STYLE_ID = "tacksuite-chat-host-styles";

function injectHostStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(HOST_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = HOST_STYLE_ID;
  style.textContent = `
    @media (max-width: ${MOBILE_BREAKPOINT}px) {
      html:has(tacksuite-chat.ts-open),
      body:has(tacksuite-chat.ts-open) {
        overflow: hidden;
        overscroll-behavior: none;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

export class TackSuiteChat extends SafeHTMLElement {
  private _isOpen = false;
  private _iframeLoaded = false;
  private _workspaceConfig: WorkspacePublicConfig | null = null;
  private _configRequestController: AbortController | null = null;
  private _configRequestId = 0;

  private _button: HTMLButtonElement | null = null;
  private _panel: HTMLDivElement | null = null;
  private _bubble: HTMLDivElement | null = null;
  private _bubbleRevealTimer: number | null = null;
  private _bubbleTypingTimer: number | null = null;
  private _bubbleDismissedForSession = false;

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
    injectHostStyles();
    this._setupListeners();
    void this._loadWorkspaceConfig();
  }

  disconnectedCallback() {
    this._configRequestController?.abort();
    this._configRequestController = null;
    this._clearBubbleRevealTimer();
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
    this._dismissBubble(true);

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

  private _getBubbleMessage(): string {
    const raw = this._workspaceConfig?.publicChat?.bubbleMessage;
    return typeof raw === "string" ? raw.trim() : "";
  }

  private _getBubbleBackground(): string {
    return (
      this._workspaceConfig?.publicChat?.secondaryColor ??
      DEFAULT_SECONDARY_COLOR
    );
  }

  private _bubbleStorageKey(): string {
    return `tacksuite-chat:bubble-dismissed:${this._config.workspace}`;
  }

  private _readBubbleDismissedFromStorage(): boolean {
    try {
      return (
        window.sessionStorage?.getItem(this._bubbleStorageKey()) === "1"
      );
    } catch {
      return false;
    }
  }

  private _persistBubbleDismissed() {
    try {
      window.sessionStorage?.setItem(this._bubbleStorageKey(), "1");
    } catch {
      // ignore (private mode, disabled storage)
    }
  }

  private _scheduleBubbleReveal() {
    if (this._bubbleRevealTimer != null) return;
    if (this._bubbleDismissedForSession || this._isOpen) return;
    if (!this._getBubbleMessage()) return;
    if (!this._bubble) return;

    this._bubbleRevealTimer = window.setTimeout(() => {
      this._bubbleRevealTimer = null;
      if (this._bubbleDismissedForSession || this._isOpen) return;
      if (!this._bubble) return;
      this._bubble.classList.add("ts-visible");

      this._bubbleTypingTimer = window.setTimeout(() => {
        this._bubbleTypingTimer = null;
        if (!this._bubble) return;
        this._bubble.classList.remove("ts-typing");
      }, BUBBLE_TYPING_DURATION_MS);
    }, BUBBLE_REVEAL_DELAY_MS);
  }

  private _clearBubbleRevealTimer() {
    if (this._bubbleRevealTimer != null) {
      window.clearTimeout(this._bubbleRevealTimer);
      this._bubbleRevealTimer = null;
    }
    if (this._bubbleTypingTimer != null) {
      window.clearTimeout(this._bubbleTypingTimer);
      this._bubbleTypingTimer = null;
    }
  }

  private _dismissBubble(persist: boolean) {
    this._clearBubbleRevealTimer();
    this._bubbleDismissedForSession = true;
    if (this._bubble) {
      this._bubble.classList.remove("ts-visible");
    }
    if (persist) {
      this._persistBubbleDismissed();
    }
  }

  private _clearRender() {
    this.classList.remove("ts-open");
    this.shadowRoot?.replaceChildren();
    this._button = null;
    this._panel = null;
    this._bubble = null;
  }

  private _resetWidget() {
    this._configRequestController?.abort();
    this._configRequestController = null;
    this._workspaceConfig = null;
    this._isOpen = false;
    this._iframeLoaded = false;
    this._clearBubbleRevealTimer();
    this._bubbleDismissedForSession = false;
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
      this._bubbleDismissedForSession = this._readBubbleDismissedFromStorage();

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

    this._clearBubbleRevealTimer();
    shadow.innerHTML = "";
    this._bubble = null;

    const bubbleBackground = this._getBubbleBackground();
    const bubbleForeground = getReadableForeground(bubbleBackground);

    const style = document.createElement("style");
    style.textContent = buildStyles(
      this._getLauncherColor(),
      this._getPosition(),
      this._getButtonSize(),
      bubbleBackground,
      bubbleForeground,
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

    // Bubble
    const bubbleMessage = this._getBubbleMessage();
    if (bubbleMessage) {
      this._bubble = document.createElement("div");
      this._bubble.className = "ts-bubble ts-typing";
      this._bubble.setAttribute("role", "button");
      this._bubble.setAttribute("tabindex", "0");
      this._bubble.setAttribute("aria-label", bubbleMessage);

      const typing = document.createElement("span");
      typing.className = "ts-bubble-typing";
      typing.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("span");
        dot.className = "ts-bubble-typing-dot";
        typing.appendChild(dot);
      }
      this._bubble.appendChild(typing);

      const text = document.createElement("span");
      text.className = "ts-bubble-text";
      text.textContent = bubbleMessage;
      this._bubble.appendChild(text);

      const close = document.createElement("button");
      close.className = "ts-bubble-close";
      close.type = "button";
      close.setAttribute("aria-label", "Dismiss");
      close.textContent = "×";
      close.addEventListener("click", (event) => {
        event.stopPropagation();
        this._dismissBubble(true);
      });
      this._bubble.appendChild(close);

      this._bubble.addEventListener("click", () => {
        this._open();
      });
      this._bubble.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._open();
        }
      });
    }

    shadow.appendChild(this._panel);
    shadow.appendChild(this._button);
    if (this._bubble) {
      shadow.appendChild(this._bubble);
      this._scheduleBubbleReveal();
    }
  }
}
