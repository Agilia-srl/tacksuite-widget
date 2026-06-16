=== TackSuite Chat ===
Contributors: tacksuite
Tags: chat, widget, support, livechat, whatsapp
Requires at least: 5.0
Tested up to: 7.0
Requires PHP: 7.2
Stable tag: 1.0.0
License: MIT
License URI: https://opensource.org/licenses/MIT

Add the TackSuite floating chat widget to your WordPress site without editing any code.

== Description ==

TackSuite Chat embeds the official `@tacksuite/widget` Web Component on every page
of your site. Configure your workspace and appearance from **Settings → TackSuite Chat**,
with no theme edits or copy-pasted script tags required.

The plugin admin interface is available in Italian.

Features:

* Single-field setup: paste your workspace slug and you are done.
* Optional overrides for button color, position (left or right) and base URL.
* The widget script is bundled with the plugin and loaded deferred, so it does
  not block page rendering and does not depend on any external CDN.
* Enable or disable the widget without deactivating the plugin.
* Supports self-hosted TackSuite instances through a custom base URL.

The widget script ships inside the plugin. Once loaded, it communicates with
your TackSuite instance to retrieve the public configuration of your workspace
(colors, position, WhatsApp mode, and so on) and to open the chat.

== Installation ==

1. Upload the `tacksuite-chat` folder to `/wp-content/plugins/`, or install the ZIP
   from **Plugins → Add New → Upload Plugin**.
2. Activate the plugin through the **Plugins** menu in WordPress.
3. Go to **Settings → TackSuite Chat** and enter your workspace slug
   (the `workspace` value from your embed code).
4. Save. The chat button now appears on your site.

== External services ==

This plugin connects to the TackSuite chat service to render the widget. The
widget JavaScript itself is bundled with the plugin and is not loaded from any
external server.

TackSuite chat backend

Once loaded, the widget calls your TackSuite instance (by default
`https://app.tacksuite.it`, configurable via the "Base URL" setting) to fetch
the public configuration of your workspace (`/api/workspace/{slug}/config`) and
to open the chat conversation in an iframe (`/chat/{slug}`). These requests
happen on the front end of your site when the widget loads. Data exchanged
during a chat (messages, and any information a visitor chooses to provide) is
processed by TackSuite.

This service is operated by TackSuite, not by this plugin.

TackSuite website: https://www.tacksuite.it
Privacy policy: https://www.tacksuite.it/privacy-policy

== Frequently Asked Questions ==

= Where do I find the workspace slug? =

It is the identifier in your embed code:
`<tacksuite-chat workspace="your-slug"></tacksuite-chat>`.

= The widget does not appear =

Make sure "Enabled" is checked, the workspace slug is set, and your TackSuite
workspace is active. The widget renders nothing if the workspace is disabled or the
configuration request fails.

= Where is the source code of the bundled widget? =

The widget script in `assets/tacksuite-widget.umd.js` is a compiled build of the
open-source `@tacksuite/widget` project. The human-readable source code and the
build instructions are available at https://github.com/tacksuite/widget and on
npm as `@tacksuite/widget`.

== Changelog ==

= 1.0.0 =
* Initial release.
