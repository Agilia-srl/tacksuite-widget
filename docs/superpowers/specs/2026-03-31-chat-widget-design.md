# TackSuite Chat Widget — Design Spec

## Overview

Embeddable Web Component that displays a floating chat button. On click, it opens an iframe to the TackSuite public chat page (`/chat/{workspace}`). Published to npm as `@tacksuite/widget`, auto-available via unpkg/jsdelivr.

## Usage

```html
<script src="https://unpkg.com/@tacksuite/widget" defer></script>
<tacksuite-chat workspace="my-workspace-slug"></tacksuite-chat>
```

## Component: `<tacksuite-chat>`

Shadow DOM Web Component. Renders two elements:

1. **Floating button** — fixed-position circle, bottom corner, configurable side
2. **Chat panel** — iframe overlay that appears on button click

### Attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `workspace` | yes | — | Workspace slug (maps to `/chat/{slug}`) |
| `base-url` | no | `https://app.tacksuite.it` | TackSuite instance URL |
| `color` | no | `#517569` | Button background color |
| `icon` | no | built-in chat bubble SVG | Custom SVG string for the button icon |
| `position` | no | `right` | `right` or `left` corner placement |

### Visual Design

**Button:**
- 56px circle, subtle box-shadow (`0 2px 12px rgba(0,0,0,0.15)`)
- Smooth hover scale (`transform: scale(1.05)`) and shadow lift
- Icon: 24px white chat bubble SVG (default) or custom SVG via attribute
- Transition to X icon when chat is open
- 20px offset from bottom and side edges

**Chat panel (desktop, >768px):**
- 400px wide, 600px tall
- Positioned above the button, same corner
- 16px border-radius, subtle shadow (`0 8px 32px rgba(0,0,0,0.16)`)
- Slide-up + fade-in animation on open (200ms ease-out)
- Slide-down + fade-out on close

**Chat panel (mobile, <=768px):**
- Fullscreen overlay (`position: fixed; inset: 0`)
- No border-radius
- Slide-up from bottom animation

**Iframe:**
- `src` = `{base-url}/chat/{workspace}`
- `width: 100%; height: 100%; border: none`
- `allow="microphone"` (for potential voice features)
- Lazy-loaded: iframe is only created on first open, then toggled via display

### Behavior

- **First click**: creates iframe, shows panel with animation
- **Subsequent clicks**: toggles panel visibility (iframe stays alive, preserves chat state)
- **Resize**: if window crosses 768px threshold, update panel mode (popup vs fullscreen)
- **postMessage**: listen for `tacksuite-chat:close` from iframe to close the panel (origin-checked against base-url)

### Security

- Chat page is already public — no API key or token needed
- `postMessage` communication is origin-checked against `base-url`
- Server-side `frame-ancestors` CSP (future, outside widget scope) can restrict embedding domains per workspace

## Build & Distribution

- **Bundler**: Vite library mode
- **Formats**: ES module + UMD (global `TackSuiteChat`)
- **Entry**: `src/main.ts` → exports `TackSuiteChat` class, registers `<tacksuite-chat>` element
- **Types**: `vite-plugin-dts` generates `.d.ts` files
- **Package name**: `@tacksuite/widget`
- **Files**: `dist/` only in published package

### Package structure

```
src/
  main.ts          — entry, re-exports + registers custom element
  tacksuite-chat.ts — Web Component class
  types.ts         — TypeScript interfaces
vite.config.ts
tsconfig.json
package.json
test/
  index.html       — local dev test page
```

## Not included

- No React/Vue wrappers
- No message bubble / typing animation
- No cookie state persistence
- No updateContext API
- No API key authentication
