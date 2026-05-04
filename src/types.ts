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

export interface WorkspacePublicChatConfig {
  title: string;
  subtitle: string;
  welcomeMessages: string[];
  primaryColor: string;
  secondaryColor: string;
  buttonPosition: "right" | "left";
  buttonSize: number;
  bubbleMessage?: string;
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
