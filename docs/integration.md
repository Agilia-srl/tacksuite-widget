# TackSuite Chat Widget — Integration Guide

## What it does

`@tacksuite/widget` is a Web Component that adds a floating chat button to any website. Clicking it opens the TackSuite public chat page (`/chat/{workspace-slug}`) in an iframe overlay. Desktop shows a 400x600 popup; mobile (<768px) goes fullscreen.

## Installation

### Script tag (CDN)

```html
<script src="https://unpkg.com/@tacksuite/widget" defer></script>
<tacksuite-chat workspace="your-workspace-slug"></tacksuite-chat>
```

### npm

```bash
npm install @tacksuite/widget
```

```js
import "@tacksuite/widget";
// <tacksuite-chat> is now registered and ready to use in HTML
```

## Attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `workspace` | yes | — | Workspace slug (the URL path segment from `/chat/{slug}`) |
| `base-url` | no | `https://app.tacksuite.it` | TackSuite instance URL |
| `color` | no | `#517569` | Button background color (any CSS color) |
| `icon` | no | built-in chat SVG | Custom SVG string for the button icon |
| `position` | no | `right` | `right` or `left` corner placement |

## How it works

- The widget renders inside a **Shadow DOM** — its styles are fully isolated from the host page.
- The **iframe is lazy-loaded** on first click and preserved across open/close toggles (chat state is not lost).
- On **desktop**, clicking the button toggles a popup panel above the button.
- On **mobile** (<=768px), the panel goes fullscreen. The FAB button hides and a small floating X appears at the top-right of the iframe to close it.
- The widget listens for `postMessage` events from the iframe. If the chat page sends `{ type: "tacksuite-chat:close" }`, the widget closes the panel. The message origin is validated against `base-url`.

## TackSuite app-side integration (postMessage)

To allow the chat page to close the widget (e.g. a "back" button in the chat header when embedded), add this to the chat page when it detects it's inside an iframe:

```ts
// In the TackSuite chat page
if (window !== window.parent) {
  // We're inside the widget iframe
  window.parent.postMessage(
    { type: "tacksuite-chat:close" },
    "*" // The widget validates the origin on its side
  );
}
```

The widget only accepts messages whose `origin` matches its configured `base-url`.

## File structure

```
src/
  main.ts            — Entry point, exports class, registers <tacksuite-chat>
  tacksuite-chat.ts  — Web Component (Shadow DOM, styles, iframe management)
  types.ts           — TypeScript interfaces
dist/
  tacksuite-widget.es.js   — ES module (~7 kB)
  tacksuite-widget.umd.js  — UMD bundle (~7 kB)
  types/main.d.ts          — Type declarations
```

## Build & publish

```bash
npm run build        # tsc --noEmit && vite build
npm publish --access public
```

## Local development

```bash
npm run dev          # Vite dev server at http://localhost:5173
```

The test page at `test/index.html` loads the widget pointing to `http://localhost:3000` (the TackSuite Next.js dev server).
