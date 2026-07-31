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

  /** Distance in px from the bottom of the viewport (default 20) */
  "bottom-offset"?: number | string;
}

export type WorkspaceWidgetMode = "chat" | "whatsapp";

export interface WorkspacePublicChatConfig {
  title?: string;
  subtitle?: string;
  welcomeMessages?: string[];
  primaryColor?: string;
  secondaryColor?: string;
  buttonPosition?: "right" | "left";
  buttonSize?: number;
  /** Distance in px from the bottom of the viewport (default 20) */
  buttonBottomOffset?: number;
  bubbleMessage?: string;
  /** Widget behaviour — "chat" (default) opens the chat iframe, "whatsapp" links to WhatsApp */
  mode?: WorkspaceWidgetMode;
  /** WhatsApp mode: CTA label shown on the launcher bubble */
  whatsappTitle?: string;
  /** WhatsApp mode: destination phone number (may contain spaces / "+") */
  phoneNumber?: string;
  /** WhatsApp mode: prefilled message inserted when the customer opens WhatsApp */
  whatsappDefaultMessage?: string;
}

export interface WorkspacePublicConfig {
  active: boolean;
  publicChat?: WorkspacePublicChatConfig | null;
}

declare global {
  interface HTMLElementTagNameMap {
    "tacksuite-chat": HTMLElement & TackSuiteChatAttributes;
  }
}
