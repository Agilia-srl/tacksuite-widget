import { TackSuiteChat } from "./tacksuite-chat";
import type { TackSuiteChatAttributes } from "./types";

export { TackSuiteChat, TackSuiteChatAttributes };

if (typeof window !== "undefined" && window.customElements) {
  if (!customElements.get("tacksuite-chat")) {
    customElements.define("tacksuite-chat", TackSuiteChat);
  }
}
