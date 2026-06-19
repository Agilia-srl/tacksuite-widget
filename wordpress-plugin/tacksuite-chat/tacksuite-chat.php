<?php
/**
 * Plugin Name:       TackSuite Chat
 * Plugin URI:        https://github.com/Agilia-srl/tacksuite-widget
 * Description:       Add the TackSuite floating chat widget to your site. Configure your workspace and appearance from Settings → TackSuite Chat.
 * Version:           1.0.0
 * Requires at least: 5.0
 * Requires PHP:      7.2
 * Author:            TackSuite
 * Author URI:        https://tacksuite.it
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       tacksuite-chat
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'TACKSUITE_CHAT_VERSION', '1.0.0' );
define( 'TACKSUITE_CHAT_OPTION', 'tacksuite_chat_settings' );
define( 'TACKSUITE_CHAT_DEFAULT_BASE_URL', 'https://app.tacksuite.it' );
// Version of the bundled @tacksuite/widget build in assets/ — used for cache-busting.
define( 'TACKSUITE_CHAT_WIDGET_VERSION', '0.1.8' );

// Translations load automatically (just-in-time) from /languages via the
// Text Domain + Domain Path headers — no load_plugin_textdomain() needed.

/**
 * Return saved settings merged with defaults.
 *
 * @return array
 */
function tacksuite_chat_get_settings() {
	$defaults = array(
		'workspace' => '',
		'base_url'  => '',
		'color'     => '',
		'position'  => '',
		'enabled'   => 1,
	);

	$settings = get_option( TACKSUITE_CHAT_OPTION, array() );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}

	return wp_parse_args( $settings, $defaults );
}

/* -------------------------------------------------------------------------
 * Frontend: inject the widget script + element into the footer.
 * ---------------------------------------------------------------------- */

add_action( 'wp_enqueue_scripts', 'tacksuite_chat_enqueue_assets' );
/**
 * Enqueue the bundled widget script (deferred) when the plugin is configured.
 */
function tacksuite_chat_enqueue_assets() {
	$settings = tacksuite_chat_get_settings();

	if ( empty( $settings['enabled'] ) || '' === trim( $settings['workspace'] ) ) {
		return;
	}

	// Served locally from the plugin (no external CDN); loaded deferred.
	wp_enqueue_script(
		'tacksuite-chat-widget',
		plugins_url( 'assets/tacksuite-widget.umd.js', __FILE__ ),
		array(),
		TACKSUITE_CHAT_WIDGET_VERSION,
		false
	);
	wp_script_add_data( 'tacksuite-chat-widget', 'defer', true );
}

// Fallback for themes/setups where the registered handle does not pick up `defer`.
add_filter( 'script_loader_tag', 'tacksuite_chat_defer_tag', 10, 2 );
/**
 * Ensure the widget script tag is deferred.
 *
 * @param string $tag    The script tag HTML.
 * @param string $handle The script handle.
 * @return string
 */
function tacksuite_chat_defer_tag( $tag, $handle ) {
	if ( 'tacksuite-chat-widget' === $handle && false === strpos( $tag, ' defer' ) ) {
		$tag = str_replace( ' src=', ' defer src=', $tag );
	}
	return $tag;
}

add_action( 'wp_footer', 'tacksuite_chat_render_element' );
/**
 * Print the <tacksuite-chat> custom element in the footer.
 */
function tacksuite_chat_render_element() {
	$settings = tacksuite_chat_get_settings();

	if ( empty( $settings['enabled'] ) || '' === trim( $settings['workspace'] ) ) {
		return;
	}

	$attributes = array(
		'workspace' => sanitize_text_field( $settings['workspace'] ),
	);

	if ( '' !== trim( $settings['base_url'] ) ) {
		$attributes['base-url'] = esc_url_raw( trim( $settings['base_url'] ) );
	}
	if ( '' !== trim( $settings['color'] ) ) {
		$attributes['color'] = sanitize_text_field( $settings['color'] );
	}
	if ( 'left' === $settings['position'] || 'right' === $settings['position'] ) {
		$attributes['position'] = $settings['position'];
	}

	$attr_html = '';
	foreach ( $attributes as $name => $value ) {
		$attr_html .= sprintf( ' %s="%s"', esc_attr( $name ), esc_attr( $value ) );
	}

	printf( "<tacksuite-chat%s></tacksuite-chat>\n", $attr_html ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- attributes escaped above.
}

/* -------------------------------------------------------------------------
 * Admin: settings page under Settings → TackSuite Chat.
 * ---------------------------------------------------------------------- */

add_action( 'admin_menu', 'tacksuite_chat_add_settings_page' );
/**
 * Register the options page.
 */
function tacksuite_chat_add_settings_page() {
	add_options_page(
		__( 'TackSuite Chat', 'tacksuite-chat' ),
		__( 'TackSuite Chat', 'tacksuite-chat' ), // Menu label.
		'manage_options',
		'tacksuite-chat',
		'tacksuite_chat_render_settings_page'
	);
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'tacksuite_chat_action_links' );
/**
 * Add a "Settings" link on the Plugins list row.
 *
 * @param array $links Existing action links.
 * @return array
 */
function tacksuite_chat_action_links( $links ) {
	$settings_link = sprintf(
		'<a href="%s">%s</a>',
		esc_url( admin_url( 'options-general.php?page=tacksuite-chat' ) ),
		esc_html__( 'Settings', 'tacksuite-chat' )
	);
	array_unshift( $links, $settings_link );
	return $links;
}

add_action( 'admin_init', 'tacksuite_chat_register_settings' );
/**
 * Register the single settings option with a sanitization callback.
 */
function tacksuite_chat_register_settings() {
	register_setting(
		'tacksuite_chat_group',
		TACKSUITE_CHAT_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'tacksuite_chat_sanitize_settings',
			'default'           => array(),
		)
	);
}

/**
 * Sanitize submitted settings.
 *
 * @param array $input Raw form input.
 * @return array
 */
function tacksuite_chat_sanitize_settings( $input ) {
	$input = is_array( $input ) ? $input : array();

	$position = isset( $input['position'] ) ? $input['position'] : '';
	if ( ! in_array( $position, array( 'left', 'right' ), true ) ) {
		$position = '';
	}

	$base_url = isset( $input['base_url'] ) ? trim( $input['base_url'] ) : '';
	$base_url = '' === $base_url ? '' : esc_url_raw( $base_url );

	return array(
		'workspace' => isset( $input['workspace'] ) ? sanitize_text_field( $input['workspace'] ) : '',
		'base_url'  => $base_url,
		'color'     => isset( $input['color'] ) ? sanitize_text_field( $input['color'] ) : '',
		'position'  => $position,
		'enabled'   => empty( $input['enabled'] ) ? 0 : 1,
	);
}

/**
 * Render the settings page markup.
 */
function tacksuite_chat_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$settings = tacksuite_chat_get_settings();

	// Open the advanced section automatically when any advanced value is set.
	$has_advanced = '' !== $settings['position']
		|| '' !== $settings['color']
		|| '' !== $settings['base_url'];
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'TackSuite Chat', 'tacksuite-chat' ); ?></h1>
		<p><?php esc_html_e( 'Add the TackSuite floating chat widget to your site. Enter your workspace slug below — everything else is optional.', 'tacksuite-chat' ); ?></p>

		<form action="options.php" method="post">
			<?php settings_fields( 'tacksuite_chat_group' ); ?>

			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row"><?php esc_html_e( 'Enabled', 'tacksuite-chat' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( TACKSUITE_CHAT_OPTION ); ?>[enabled]" value="1" <?php checked( 1, $settings['enabled'] ); ?> />
								<?php esc_html_e( 'Show the chat widget on your site', 'tacksuite-chat' ); ?>
							</label>
						</td>
					</tr>

					<tr>
						<th scope="row">
							<label for="tacksuite-workspace"><?php esc_html_e( 'Workspace slug', 'tacksuite-chat' ); ?> <span style="color:#d63638">*</span></label>
						</th>
						<td>
							<input type="text" id="tacksuite-workspace" class="regular-text" name="<?php echo esc_attr( TACKSUITE_CHAT_OPTION ); ?>[workspace]" value="<?php echo esc_attr( $settings['workspace'] ); ?>" placeholder="your-workspace-slug" />
							<p class="description"><?php esc_html_e( 'The workspace identifier from your embed code (the workspace attribute on <tacksuite-chat>).', 'tacksuite-chat' ); ?></p>
						</td>
					</tr>
				</tbody>
			</table>

			<details<?php echo $has_advanced ? ' open' : ''; ?> style="margin-top:1.5em;">
				<summary style="cursor:pointer;font-weight:600;font-size:1.15em;padding:.5em 0;"><?php esc_html_e( 'Advanced settings', 'tacksuite-chat' ); ?></summary>
				<p class="description" style="margin:.25em 0 0;"><?php esc_html_e( 'Optional. Defaults come from the workspace configuration.', 'tacksuite-chat' ); ?></p>
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="tacksuite-position"><?php esc_html_e( 'Position', 'tacksuite-chat' ); ?></label>
							</th>
							<td>
								<select id="tacksuite-position" name="<?php echo esc_attr( TACKSUITE_CHAT_OPTION ); ?>[position]">
									<option value="" <?php selected( '', $settings['position'] ); ?>><?php esc_html_e( 'Default (from workspace)', 'tacksuite-chat' ); ?></option>
									<option value="right" <?php selected( 'right', $settings['position'] ); ?>><?php esc_html_e( 'Bottom right', 'tacksuite-chat' ); ?></option>
									<option value="left" <?php selected( 'left', $settings['position'] ); ?>><?php esc_html_e( 'Bottom left', 'tacksuite-chat' ); ?></option>
								</select>
							</td>
						</tr>

						<tr>
							<th scope="row">
								<label for="tacksuite-color"><?php esc_html_e( 'Button color', 'tacksuite-chat' ); ?></label>
							</th>
							<td>
								<input type="text" id="tacksuite-color" class="regular-text" name="<?php echo esc_attr( TACKSUITE_CHAT_OPTION ); ?>[color]" value="<?php echo esc_attr( $settings['color'] ); ?>" placeholder="#517569" />
								<p class="description"><?php esc_html_e( 'Optional. Any CSS color overrides the workspace default.', 'tacksuite-chat' ); ?></p>
							</td>
						</tr>

						<tr>
							<th scope="row">
								<label for="tacksuite-base-url"><?php esc_html_e( 'Base URL', 'tacksuite-chat' ); ?></label>
							</th>
							<td>
								<input type="url" id="tacksuite-base-url" class="regular-text" name="<?php echo esc_attr( TACKSUITE_CHAT_OPTION ); ?>[base_url]" value="<?php echo esc_attr( $settings['base_url'] ); ?>" placeholder="<?php echo esc_attr( TACKSUITE_CHAT_DEFAULT_BASE_URL ); ?>" />
								<p class="description"><?php esc_html_e( 'Optional. Only change this for self-hosted TackSuite instances.', 'tacksuite-chat' ); ?></p>
							</td>
						</tr>
					</tbody>
				</table>
			</details>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}
