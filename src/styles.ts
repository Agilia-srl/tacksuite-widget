import { DESKTOP_PANEL_HEIGHT, MOBILE_BREAKPOINT } from "./constants";

export interface StyleOptions {
  color: string;
  position: "right" | "left";
  buttonSize: number;
  /** Distance in px between the bottom of the viewport and the launcher */
  bottomOffset: number;
  bubbleBackground: string;
  bubbleForeground: string;
}

export function buildStyles({
  color,
  position,
  buttonSize,
  bottomOffset,
  bubbleBackground,
  bubbleForeground,
}: StyleOptions): string {
  const side = position;
  const oppositeSide = position === "right" ? "left" : "right";
  const panelOrigin = position === "right" ? "bottom right" : "bottom left";
  const iconSize = Math.round(buttonSize * (24 / 56));
  // The WhatsApp glyph fills its viewBox edge-to-edge, so it gets its own,
  // slightly larger proportion to sit comfortably inside the launcher.
  const whatsappIconSize = Math.round(buttonSize * 0.55);
  // The panel and the bubble are fixed-positioned siblings of the launcher, so
  // they carry the bottom offset themselves instead of inheriting it: each one
  // sits its own gap above the top edge of the launcher.
  const panelOffset = bottomOffset + buttonSize + 12;
  const bubbleOffset = bottomOffset + buttonSize + 10;
  const tailSideOffset = Math.max(8, Math.round(buttonSize / 2 - 6));

  return `
    :host {
      position: fixed;
      bottom: ${bottomOffset}px;
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

    .ts-button--whatsapp svg {
      width: ${whatsappIconSize}px;
      height: ${whatsappIconSize}px;
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

const HOST_STYLE_ID = "tacksuite-chat-host-styles";

export function injectHostStyles() {
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
