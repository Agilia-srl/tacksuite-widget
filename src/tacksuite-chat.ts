import type { WorkspacePublicConfig } from "./types";
import {
  BUBBLE_REVEAL_DELAY_MS,
  BUBBLE_TYPING_DURATION_MS,
  DEFAULT_BASE_URL,
  DEFAULT_BOTTOM_OFFSET,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_COLOR,
  DEFAULT_POSITION,
  DEFAULT_SECONDARY_COLOR,
  WHATSAPP_COLOR,
} from "./constants";
import { getReadableForeground } from "./color";
import { CHAT_ICON, CLOSE_ICON, WHATSAPP_ICON } from "./icons";
import { buildStyles, injectHostStyles } from "./styles";

/** Accepts a plain number or a "24px" string; negatives and junk yield null. */
function parseOffset(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : parseFloat(String(value ?? "").trim());
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
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
  private _bubble: HTMLDivElement | null = null;
  private _bubbleRevealTimer: number | null = null;
  private _bubbleTypingTimer: number | null = null;
  private _bubbleDismissedForSession = false;

  private _config = {
    workspace: "",
    baseUrl: DEFAULT_BASE_URL,
    customColor: null as string | null,
    customIcon: null as string | null,
    customPosition: null as "right" | "left" | null,
    customBottomOffset: null as number | null,
  };

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return [
      "workspace",
      "base-url",
      "color",
      "icon",
      "position",
      "bottom-offset",
    ];
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
        this._config.customIcon = newValue || null;
        break;
      case "position":
        this._config.customPosition =
          newValue === "left" || newValue === "right" ? newValue : null;
        break;
      case "bottom-offset":
        this._config.customBottomOffset = parseOffset(newValue);
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
    if (this._isWhatsapp()) {
      this._openWhatsapp();
      return;
    }
    if (this._isOpen) {
      this._close();
    } else {
      this._open();
    }
  }

  private _openWhatsapp() {
    const href = this._getWhatsappHref();
    if (!href) {
      console.warn(
        "[tacksuite-chat] WhatsApp mode is missing a valid 'phoneNumber'.",
      );
      return;
    }
    this._dismissBubble(true);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  private _open() {
    if (!this._config.workspace) {
      console.warn("[tacksuite-chat] Missing required 'workspace' attribute.");
      return;
    }

    if (!this._canRenderWidget()) {
      return;
    }

    if (this._isWhatsapp()) {
      this._openWhatsapp();
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
      this._button.innerHTML = this._isOpen ? CLOSE_ICON : this._getIcon();
      this._button.setAttribute(
        "aria-label",
        this._isOpen ? "Close chat" : "Open chat",
      );
    }
  }

  private _canRenderWidget() {
    if (this._workspaceConfig?.active !== true) return false;
    if (this._isWhatsapp()) return this._getWhatsappHref() !== null;
    return true;
  }

  private _isWhatsapp(): boolean {
    return this._workspaceConfig?.publicChat?.mode === "whatsapp";
  }

  private _getIcon(): string {
    return (
      this._config.customIcon ?? (this._isWhatsapp() ? WHATSAPP_ICON : CHAT_ICON)
    );
  }

  private _getWhatsappHref(): string | null {
    const raw = this._workspaceConfig?.publicChat?.phoneNumber;
    if (typeof raw !== "string") return null;
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return null;
    const message = this._workspaceConfig?.publicChat?.whatsappDefaultMessage;
    const query = message ? `?text=${encodeURIComponent(message)}` : "";
    return `https://wa.me/${digits}${query}`;
  }

  private _getLauncherColor() {
    return (
      this._config.customColor ??
      this._workspaceConfig?.publicChat?.primaryColor ??
      (this._isWhatsapp() ? WHATSAPP_COLOR : DEFAULT_COLOR)
    );
  }

  private _getPosition(): "right" | "left" {
    return (
      this._config.customPosition ??
      this._workspaceConfig?.publicChat?.buttonPosition ??
      DEFAULT_POSITION
    );
  }

  private _getBottomOffset(): number {
    return (
      this._config.customBottomOffset ??
      parseOffset(this._workspaceConfig?.publicChat?.buttonBottomOffset) ??
      DEFAULT_BOTTOM_OFFSET
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
    const message = typeof raw === "string" ? raw.trim() : "";
    if (message) return message;
    if (this._isWhatsapp()) {
      const title = this._workspaceConfig?.publicChat?.whatsappTitle;
      return typeof title === "string" ? title.trim() : "";
    }
    return message;
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
    style.textContent = buildStyles({
      color: this._getLauncherColor(),
      position: this._getPosition(),
      buttonSize: this._getButtonSize(),
      bottomOffset: this._getBottomOffset(),
      bubbleBackground,
      bubbleForeground,
    });
    shadow.appendChild(style);

    const isWhatsapp = this._isWhatsapp();

    // Button
    this._button = document.createElement("button");
    this._button.className = isWhatsapp
      ? "ts-button ts-button--whatsapp"
      : "ts-button";
    this._button.innerHTML = this._isOpen ? CLOSE_ICON : this._getIcon();
    this._button.setAttribute(
      "aria-label",
      isWhatsapp
        ? this._getBubbleMessage() || "Open WhatsApp"
        : this._isOpen
          ? "Close chat"
          : "Open chat",
    );
    this._button.addEventListener("click", () => this._toggle());

    // Panel (chat mode only — WhatsApp links out instead of opening an iframe)
    if (!isWhatsapp) {
      this._panel = document.createElement("div");
      this._panel.className = `ts-panel${this._isOpen ? "" : " ts-hidden"}`;

      // Restore existing iframe if we had one
      if (existingIframe) {
        this._panel.appendChild(existingIframe);
      }
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

    if (this._panel) {
      shadow.appendChild(this._panel);
    }
    shadow.appendChild(this._button);
    if (this._bubble) {
      shadow.appendChild(this._bubble);
      this._scheduleBubbleReveal();
    }
  }
}
