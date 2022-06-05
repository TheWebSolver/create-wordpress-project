<?php
/**
 * Assets handler.
 *
 * -----------------------------------
 * DEVELOPED-MAINTAINED-SUPPORTED BY
 * -----------------------------------
 * ███║     ███╗   ████████████████
 * ███║     ███║   ═════════██████╗
 * ███║     ███║        ╔══█████═╝
 *  ████████████║      ╚═█████
 * ███║═════███║      █████╗
 * ███║     ███║    █████═╝
 * ███║     ███║   ████████████████╗
 * ╚═╝      ╚═╝    ═══════════════╝
 *
 * @package TheWebSolver\Codegarage\Assets
 * @author Shesh Ghimire <shesh@thewebsolver.com>
 */

namespace TheWebSolver\Codegarage;

/**
 * Asset class.
 */
class Asset {
	use Singleton;

	/**
	 * Associative array of Google Fonts to load.
	 *
	 * It is set as $font_name => $font_variants pairs.
	 *
	 * @var (string[])[]
	 * @since 1.0
	 */
	private $google_fonts;

	/**
	 * Google fonts display attribute value.
	 *
	 * @var string
	 * @since 1.0
	 */
	private $google_fonts_display = 'swap';

	/**
	 * Associative array of CSS files.
	 *
	 * @var (string[]|bool[])[]
	 * @since 1.0
	 */
	private $css_files;

	/**
	 * Registered scripts.
	 *
	 * @var ((bool|callable)[]|string|bool|null)[]
	 * @since 1.0
	 */
	private $registered_scripts;

	/**
	 * An array of localized object for a given script handle.
	 *
	 * Script handle as key and localized object data as value.
	 *
	 * @var array
	 * @since 1.0
	 */
	private $localized;

	/**
	 * Asset constructor.
	 *
	 * @since 1.0
	 */
	protected function __construct() {
		if ( Bootstrap::load()->is_plugin() ) {
			add_filter( 'mce_css', array( $this, 'filter_editor_styles' ) );
		} else {
			add_action( 'after_setup_theme', array( $this, 'add_editor_styles' ) );
		}

		// Stylesheets.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 99 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ), 99 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_styles' ), 99 );

		// Scripts.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ), 99 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ), 99 );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_scripts' ), 99 );
		add_filter( 'wp_resource_hints', array( $this, 'resource_hints' ), 10, 2 );

		/**
		 * Enable preload.
		 *
		 * `wp_body_open` {@since WP.5.2} instead of `wp_head` coz `wp_enqueue_scripts`
		 * runs after `wp_head` but before `wp_body_open` hook on frontend.
		 */
		add_action( 'wp_body_open', array( $this, 'preload_styles' ) );
		add_action( 'admin_head', array( $this, 'preload_styles' ) );
	}

	/**
	 * Adds editor style from the plugin.
	 *
	 * @param string $css The editor styles.
	 * @return string
	 * @since 1.0
	 */
	public function filter_editor_styles( string $css ): string {
		if ( $_url = $this->google_fonts() ) {
			/**
			 * Encode only space and comma present in google fonts URL.
			 *
			 * - Space can't be used in a URL. Who am I kidding?
			 * - Comma is for separating script URLs. So, it can't be used either.
			 *
			 * @var string The encoded URI.
			 * @link https://www.w3schools.com/tags/ref_urlencode.asp
			 */
			$url  = str_replace( array( ' ', ',' ), array( '%20', '%2C' ), $_url );
			$css .= ',' . $url;
		}

		// Map URI to editor styles from the plugin's directory.
		if ( file_exists( Bootstrap::load()->path( 'CSS/editor/editor-styles.min.css' ) ) ) {
			$css .= ',' . Bootstrap::load()->url( 'CSS/editor/editor-styles.min.css' );
		}

		return $css;
	}

	/**
	 * Verifies that preloading is set and enabled.
	 *
	 * @param bool|callable $enabled The asset preload arg.
	 * @return bool True if enabled, false otherwise.
	 * @since 1.0
	 */
	public function is_preload( $enabled ): bool {
		if ( is_bool( $enabled ) ) {
			return $enabled;
		}

		return is_callable( $enabled ) && call_user_func( $enabled );
	}

	/**
	 * Validates what and where the asset is being used.
	 *
	 * Validation works in following ways:
	 * - Checks which hook is being used.
	 * - Verifies that current screen admin/frontend/blockeditor
	 *   is enabled when the asset was added.
	 *
	 * @param array $data The assets args data.
	 * @return bool True if state matched, false otherwise.
	 * @since 1.0
	 */
	public function validate( array $data ): bool {
		// Enqueuing on frontend, check if asset has been enabled for frontend.
		if ( doing_action( 'wp_enqueue_scripts' ) ) {
			return ! is_admin() === $data['front'];
		}

		// Enqueuing on block editor, check if asset has been enabled for block editor.
		if ( doing_action( 'enqueue_block_editor_assets' ) ) {
			return ( is_admin() === $data['admin'] ) && $data['block'];
		}

		// Enqueuing on admin, check if asset has been enabled for admin side.
		return doing_action( 'admin_enqueue_scripts' ) && is_admin() === $data['admin'];
	}

	/**
	 * Registers or enqueues stylesheets.
	 *
	 * Stylesheets that are global are enqueued.
	 * All other stylesheets are only registered, to be enqueued later.
	 *
	 * @since 1.0
	 */
	public function enqueue_styles() {
		// Enqueue Google Fonts.
		$google_fonts = $this->google_fonts();

		if ( ! empty( $google_fonts ) ) {
			/**
			 * Workaround for enqueuing google fonts with `version` parameters.
			 *
			 * @link https://core.trac.wordpress.org/ticket/49742#comment:2
			 */
			wp_enqueue_style( 'tws-codegarage-fonts', $google_fonts, array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		}

		$path = Bootstrap::load()->path();

		if ( ! $path ) {
			/* translators: %s The stylesheet path */
			_doing_it_wrong( __METHOD__, esc_html( sprintf( __( 'The stylesheet path "%s" could not be found.', 'tws-codegarage' ), $path ) ), '1.0' );

			return;
		}

		foreach ( $this->get_styles() as $handle => $data ) {
			$src     = Bootstrap::load()->url( "Assets/CSS/{$data['file']}" );
			$version = Bootstrap::load()->version( "Assets/CSS/{$data['file']}" );

			// Ignore CSS file that has no current context (admin/frontend/block) matched.
			if ( ! $this->validate( $data ) ) {
				continue;
			}

			$enabled = $data['preload'];

			/**
			 * Stylesheets are handled with two different logics.
			 *
			 * - FIRST LOGIC:
			 * -- If `$data['global']` is set to `true`, enqueue it immediately.
			 * -- If preloading is not supported as well as `$data['preload']` is set
			 *    and it's a `true` value (by default it is), then enqueue it immediately.
			 *    Here, `$data['preload']` means the stylesheet is needed for current page.
			 *
			 * - SECOND LOGIC:
			 * -- If `$data['global']` is set to `false`, only register it to load later.
			 * -- If preloading is supported, only register it to be loaded later.
			 * -- <link> element will be generated with rel="preload" attribute from
			 *    "wp_body_open" and/or "admin_head" action hooks.
			 *
			 * If stylesheet is set with the SECOND LOGIC, manually load stylesheet.
			 * For example:
			 * * Stylesheet handle is `tws-codegarage-content`.
			 * * Use {@see Assets::print_styles('tws-codegarage-content')} method.
			 * * Use it just before when you add the content like so:
			 *
			 *```
			 * <?php // template file: content-single.php
			 *
			 * <div id="some-other-info">Info goes here...</div>
			 * <?php Assets::load()->print_styles('tws-codegarage-content'); ?>
			 * <article id="blog-content">Content to be styled goes here...</article>
			 * ```
			 */
			if ( $data['global'] || ! $this->has_preload() && $this->is_preload( $enabled ) ) {
				wp_enqueue_style( $handle, $src, array(), $version, $data['media'] );
			} else {
				wp_register_style( $handle, $src, array(), $version, $data['media'] );
			}

			wp_style_add_data( $handle, 'precache', true );
		}
	}

	/**
	 * Preloads in-body stylesheets depending on what templates are being used.
	 *
	 * Only stylesheets that have a 'preload' provided will be considered.
	 * If that callback evaluates to true for the current request,
	 * the stylesheet will be preloaded.
	 *
	 * Preloading is disabled when AMP is active, as AMP injects the stylesheets inline.
	 *
	 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content
	 * @since 1.0
	 */
	public function preload_styles() {
		// Bail early if preloading is disabled.
		if ( ! $this->has_preload() ) {
			return;
		}

		$wp_styles = wp_styles();

		foreach ( $this->get_styles() as $handle => $data ) {
			// Ignore stylesheet not registered.
			if ( ! isset( $wp_styles->registered[ $handle ] ) ) {
				continue;
			}

			// Ignore stylesheet already enqueued.
			if ( wp_style_is( $handle ) ) {
				continue;
			}

			// Ignore stylesheet with preloading disabled.
			if ( ! $this->is_preload( $data['preload'] ) ) {
				continue;
			}

			$preload_uri = $wp_styles->registered[ $handle ]->src . '?ver=' . $wp_styles->registered[ $handle ]->ver;

			echo '<link rel="preload" id="' . esc_attr( $handle ) . '-preload" href="' . esc_url( $preload_uri ) . '" as="style">';
			echo "\n";
		}
	}

	/**
	 * Enqueues WordPress theme styles for the editor.
	 *
	 * @since 1.0
	 */
	public function add_editor_styles() {
		$url = $this->google_fonts();

		if ( ! empty( $url ) ) {
			// Enqueue Google Fonts.
			add_editor_style( $url );
		}

		// Enqueue editor stylesheet.
		if ( file_exists( Bootstrap::load()->path( 'Assets/CSS/editor/editor-styles.min.css' ) ) ) {
			add_editor_style( 'Assets/CSS/editor/editor-styles.min.css' );
		}
	}

	/**
	 * Adds preconnect resource hint for Google Fonts.
	 *
	 * @param array  $urls          URLs to print for resource hints.
	 * @param string $relation_type The relation type the URLs are printed.
	 * @return array URLs to print for resource hints.
	 * @since 1.0
	 */
	public function resource_hints( array $urls, string $relation_type ): array {
		if ( 'preconnect' === $relation_type && wp_style_is( 'tws-codegarage-fonts', 'queue' ) ) {
			$urls[] = array(
				'href' => 'https://fonts.gstatic.com',
				'crossorigin',
			);
		}

		return $urls;
	}

	/**
	 * Filters out CSS files to be printed directly.
	 *
	 * @param string $handle The CSS file handle.
	 * @return bool
	 * @since 1.0
	 */
	public function filter_css_files( string $handle ): bool {
		$files    = $this->get_styles();
		$is_valid = isset( $files[ $handle ] ) && ! $files[ $handle ]['global'];

		// Check if not set globally and hasn't been enqueued already.
		if ( ! $is_valid && ! wp_style_is( $handle ) ) {
			/* translators: %s: stylesheet handle */
			_doing_it_wrong( __METHOD__, esc_html( sprintf( __( 'Invalid stylesheet handle: %s', 'tws-codegarage' ), $handle ) ), '1.0' );
		}

		return $is_valid;
	}

	/**
	 * Prints stylesheet link tags directly.
	 *
	 * This should be used for stylesheets that aren't global and thus should only be loaded if the HTML markup
	 * they are responsible for is actually present. Template parts should use this method when the related markup
	 * requires a specific stylesheet to be loaded. If preloading stylesheets is disabled, this method will not do
	 * anything.
	 *
	 * If the `<link>` tag for a given stylesheet has already been printed, it will be skipped.
	 *
	 * @param string ...$handles One or more stylesheet handles.
	 * @since 1.0
	 */
	public function print_styles( string ...$handles ) {
		// Bail early if preloading is disabled.
		if ( ! $this->has_preload() ) {
			return;
		}

		$handles = array_filter( $handles, array( $this, 'filter_css_files' ) );

		// Bail if nothing left to print.
		if ( empty( $handles ) ) {
			return;
		}

		wp_print_styles( $handles );
	}

	/**
	 * Determines whether to preload stylesheets and inject their link tags directly within the page content.
	 *
	 * Using this technique generally improves performance, however may not be preferred under certain circumstances.
	 * For example, since AMP will include all style rules directly in the head, it must not be used in that context.
	 * By default, this method returns true unless the page is being served in AMP. The
	 * {@see 'tws_codegarage_preloading_styles_enabled'} filter can be used to tweak the return value.
	 *
	 * @return bool True if preloading stylesheets and injecting them is enabled, false otherwise.
	 * @since 1.0
	 */
	private function has_preload(): bool {
		/**
		 * Filters whether to preload stylesheets and inject their link tags within the page content.
		 *
		 * @param bool $enabled Whether preloading is enabled.
		 * @var   bool
		 * @since 1.0
		 */
		return apply_filters( 'tws_codegarage_preloading_styles_enabled', ! $this->is_amp() );
	}

	/**
	 * Adds stylesheet to be enqueued.
	 *
	 * @param string $handle The stylesheet handle.
	 * @param array  $args   The stylesheet args with index as:
	 * * `string`        `file`    - The file relative to `Assets/CSS` directory.
	 *                               Pass the `*.min.css` filename.
	 * * `bool`          `global`  - Whether to enqueue on all pages. Default `false`.
	 *                               If set to `true`, `preload` has no effect.
	 * * `bool`          `front`   - Add on site frontend. Default `true`.
	 * * `bool`          `admin`   - Add on site admin. Default `false`.
	 * * `bool`          `block`   - Add on gutenberg block editor. Default `false`.
	 * * `string`        `media`   - The media option for enqueuing. Default `all`.
	 * * `bool|callable` `preload` - Whether to preload or enqueue.
	 *                               Can be a callable or bool value.
	 *                               Callable function must return bool value.
	 *                               Default `true`.
	 * @since 1.0
	 */
	public function add_style( string $handle, array $args ) {
		$defaults = array(
			'global'  => false,
			'front'   => true,
			'admin'   => false,
			'block'   => false,
			'media'   => 'all',
			'preload' => true,
		);

		$this->css_files[ $handle ] = array_merge( $defaults, $args );
	}

	/**
	 * Gets all CSS files.
	 *
	 * @return array Associative array of $handle => $data pairs.
	 * @since 1.0
	 */
	public function get_styles(): array {
		if ( is_array( $this->css_files ) ) {
			/**
			 * WPHOOK: Filter -> CSS files.
			 *
			 * @param array $css_files An array of CSS files, as $handle => $data.
			 * @var array
			 * @since 1.0
			 */
			return (array) apply_filters( 'tws_codegarage_css_files', $this->css_files );
		}

		$css_files = array(
			// Default CSS to be called on every page.
			Bootstrap::STYLE_HANDLE => array(
				'file'    => 'style.min.css',
				'global'  => true,
				'front'   => true,
				'admin'   => true,
				'block'   => true,
				'preload' => true,
			),
		);

		$files = apply_filters( 'tws_codegarage_css_files', $css_files );

		$this->css_files = array();
		$defaults        = array(
			'global'  => false,
			'front'   => true,
			'admin'   => false,
			'block'   => false,
			'media'   => 'all',
			'preload' => false,
		);

		foreach ( $files as $handle => $data ) {
			if ( is_string( $data ) ) {
				$data = array( 'file' => $data );
			}

			// Ignore CSS that has no file.
			if ( empty( $data['file'] ) ) {
				continue;
			}

			$this->css_files[ $handle ] = array_merge( $defaults, $data );
		}

		return $this->css_files;
	}

	/**
	 * Registers a script.
	 *
	 * @param string           $handle    Name of the script. Should be unique.
	 * @param array            $args      The script args with index as:
	 * * `string`        `file`    - The file relative to `Assets/JS` directory.
	 *                               Pass the `*.min.js` filename. Full URL if external file.
	 * * `bool`          `global`  - Whether to enqueue on all pages. Default `false`.
	 *                               If set to `true`, `preload` has no effect.
	 * * `bool`          `front`   - Add on site frontend. Default `true`.
	 * * `bool`          `admin`   - Add on site admin. Default `false`.
	 * * `bool`          `block`   - Add on gutenberg block editor. Default `false`.
	 * * `bool|callable` `preload` - Conditionally enqueue the script handle. Callable
	 *                               function must return bool value. Default `true`.
	 * @param string[]         $deps      An array of registered script handles this script
	 *                                    depends on. Default empty array.
	 * @param string|bool|null $ver       String specifying script version number, if it has
	 *                                    one, which is added to the URL
	 *                                    as a query string for cache busting purposes.
	 *                                    If version is set to `false`, a version
	 *                                    number is auto-generated from project version.
	 *                                    If set to `null`, no version is added.
	 * @param bool             $in_footer Whether to enqueue the script before `</body>`
	 *                                  instead of in the `<head>`. Default 'false'.
	 * @param bool             $enqueue   Whether to enqueue immediately after registering.
	 * @param string           $attr      The `<script>` tag attribute. No effect
	 *                                    if {@param `$in_footer` is set to `true`}.
	 *                                    To learn more, click on given links.
	 * @link https://javascript.info/script-async-defer
	 * @link https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html#script
	 * @since 1.0
	 */
	public function register_script( string $handle, array $args, array $deps = array(), $ver = false, bool $in_footer = false, bool $enqueue = false, string $attr = 'async' ) {
		// Bail early if in AMP project.
		if ( $this->is_amp() ) {
			return;
		}

		// Bail if file not given.
		if ( ! isset( $args['file'] ) ) {
			_doing_it_wrong( __METHOD__, esc_html__( "The 'file' param with filename relative to Assets/JS directory must be passed to register the script.", 'tws-codegarage' ), '1.0' );

			return;
		}

		/**
		 * WP Scripts loads on 'init' hook.
		 *
		 * As a safety precaution, let's invoke this method
		 * only after "wp_loaded" hook.
		 *
		 * @see WP_Scripts::__construct().
		 * @filesource wp-includes\class.wp-scripts.php.
		 */
		if ( ! did_action( 'wp_loaded' ) ) {
			/* translators: %s: The script handle */
			_doing_it_wrong( __METHOD__, esc_html( sprintf( __( 'Scripts must be registered only after `wp_loaded` action hook. Script handle: `%s`', 'tws-codegarage' ), $handle ) ), '1.0' );

			return;
		}

		$defaults = array(
			'global'  => false,
			'front'   => true,
			'admin'   => false,
			'block'   => false,
			'preload' => true,
		);

		// Start generating script data.
		$args = array_merge( $defaults, $args );

		// Bail if not for the current context.
		if ( ! $this->is_preload( $args['preload'] ) ) {
			return;
		}

		$source = (string) $args['file'];

		// Clear filename from args.
		unset( $args['file'] );

		// Start creating script args.
		$script = array( 'handle' => $handle );

		// Defaults to whatever given.
		$version = $ver;

		// Given files are not external links, generate URL and version number.
		if ( file_exists( $_src = Bootstrap::load()->path( "Assets/JS/{$source}" ) ) ) {
			$source = Bootstrap::load()->url( "Assets/JS/{$source}" );

			// Auto generate version number.
			if ( false === $version ) {
				$version = Bootstrap::load()->version( $_src );
			}
		}

		$script['src']  = $source;
		$script['ver']  = $version;
		$script['deps'] = $deps;
		$script['attr'] = $attr;
		$precache       = false;

		wp_register_script( $handle, $source, $deps, $version, $in_footer );

		// Only allow "async" to run when there is no deps as it may load before $deps.
		$attribute = empty( $deps ) && 'async' === $attr ? 'async' : 'defer';

		// Modern way of handling script files.
		if ( ! $in_footer ) {
			wp_script_add_data( $handle, $attribute, true );

			// Cache if loaded in async mode.
			if ( 'async' === $attribute ) {
				$precache = true;
			}
		}

		/**
		 * Precache info.
		 *
		 * @link https://gist.github.com/westonruter/caa6e08b8d1f70cd3ddab1064d7d1bc2
		 */
		wp_script_add_data( $handle, 'precache', $precache );
		wp_script_add_data( $handle, 'modern_attribute', $attribute );

		$script['attr']     = $attribute;
		$script['data']     = $args;
		$script['precache'] = $precache;
		$script['enqueue']  = $enqueue;

		$this->registered_scripts[ $handle ] = $script;
	}

	/**
	 * Enqueues the script for the given handle.
	 *
	 * @param string $handle The script handle.
	 * @since 1.0
	 */
	public function enqueue_script( string $handle ) {
		$this->registered_scripts[ $handle ]['enqueue'] = true;
	}

	/**
	 * Sets localized script data for the given script handle.
	 *
	 * Use this after {@method `Asset::register_script`} so localized data
	 * is properly added after the script handle is registered.
	 *
	 * @param string $handle      Script handle the data will be attached to.
	 * @param string $object_name Name for the JavaScript object.
	 *                            Passed directly, so it should be qualified JS variable.
	 *                            Example: '/[a-zA-Z0-9_]+/'.
	 * @param array  $l10n        The data itself. The data can be either
	 *                            a single or multi-dimensional array.
	 * @since 1.0
	 */
	public function localize_script( string $handle, string $object_name, array $l10n ) {
		$this->localized[ $handle ] = array(
			'name' => $object_name,
			'l10n' => $l10n,
		);
	}

	/**
	 * Enqueues script.
	 *
	 * @since 1.0
	 */
	public function enqueue_scripts() {
		$scripts = $this->registered_scripts();

		// Bail early if nothing is registered to enqueue.
		if ( empty( $scripts ) ) {
			return;
		}

		foreach ( $scripts as $handle => $args ) {
			// Ignore registered scripts that are not in queue yet.
			if ( ! $args['enqueue'] ) {
				continue;
			}

			// Ignore registered scripts not for the current context.
			if ( ! $this->validate( (array) $args['data'] ) ) {
				continue;
			}

			wp_enqueue_script( $handle );

			// Add localized script, if any.
			if ( isset( $this->localized[ $handle ] ) && ! empty( $script = $this->localized_scripts( $handle ) ) ) {
				wp_localize_script( $handle, $script['name'], $script['l10n'] );
			}
		}
	}

	/**
	 * Gets registered scripts.
	 *
	 * @param string $handle The registered script handle.
	 * @return ((bool|callable)[]|string|bool|null)[] If handle is given, localized script
	 *                                                for that handle. Else all scripts.
	 * @since 1.0
	 */
	public function registered_scripts( string $handle = null ): array {
		/**
		 * WPHOOK: Filter -> Registered scripts.
		 *
		 * @param ((bool|callable)[]|string|bool|null)[] $scripts The registered scripts.
		 * @var ((bool|callable)[]|string|bool|null)[]
		 * @since 1.0
		 */
		$scripts = (array) apply_filters( 'tws_codegarage_registered_scripts', $this->registered_scripts );

		return $this->get_script( $scripts, $handle, __METHOD__ );
	}

	/**
	 * Gets localized scripts.
	 *
	 * @param string $handle The localized script handle.
	 * @return array         If handle is given, localized script for that handle.
	 *                       Else all localized scripts.
	 * @since 1.0
	 */
	public function localized_scripts( string $handle = null ): array {
		/**
		 * WPHOOK: Filter -> Localized scripts.
		 *
		 * @param ((bool|callable)[]|string|bool|null)[] $scripts The localized scripts.
		 * @var ((bool|callable)[]|string|bool|null)[]
		 * @since 1.0
		 */
		$scripts = (array) apply_filters( 'tws_codegarage_localized_scripts', $this->localized );

		return $this->get_script( $scripts, $handle, __METHOD__ );
	}

	/**
	 * Logs wrong script handle.
	 *
	 * @param array       $scripts The registered scripts.
	 * @param string|null $handle  The handle name.
	 * @param string      $method  The method where wrong call made.
	 * @return array
	 * @since 1.0
	 */
	private function get_script( array $scripts, $handle, string $method ): array {
		// Get all scripts if no handle given.
		if ( null === $handle ) {
			return $scripts;
		}

		if ( ! isset( $scripts[ $handle ] ) ) {
			_doing_it_wrong(
				esc_html( $method ),
				/* translators: %s: The script handle name */
				esc_html( sprintf( __( 'The registered script not found for the handle: "%s"', 'tws-codegarage' ), $handle ) ),
				'1.0'
			);

			return array();
		}

		return $scripts[ $handle ];
	}

	/**
	 * Sets google font display attribute.
	 *
	 * @param string $display The supported display value.
	 * @link https://developers.google.com/web/updates/2016/02/font-display#swap
	 * @since 1.0
	 */
	public function set_google_font_display( string $display = 'swap' ) {
		$this->google_fonts_display = $display;
	}

	/**
	 * Adds google font to be enqueued.
	 *
	 * @param string $name   The font name. Eg. "Source Sans Pro".
	 * @param array  $weights The supported weights. Eg: `array('400','600')`.
	 *                        Default are `400|600|700`. If this value is passed,
	 *                        value passed here will be used replacing the defaults.
	 * @since 1.0
	 */
	public function add_google_font( string $name, array $weights = array() ) {
		$default = array( '400', '600', '700' );

		$this->google_fonts[ $name ] = ! empty( $weights ) ? $weights : $default;
	}

	/**
	 * Gets Google Fonts that are included.
	 *
	 * It is an associative array with:
	 * * Font name as index/key.
	 * * Font variants in an array as value.
	 *
	 * @return (string[])[]
	 * @since 1.0
	 */
	public function get_google_fonts(): array {
		if ( is_array( $this->google_fonts ) ) {
			/**
			 * WPHOOK: Filter -> Google Fonts.
			 *
			 * @param array $google_fonts $font_name => $font_variants array.
			 */
			return (array) apply_filters( 'tws_codegarage_google_fonts', $this->google_fonts );
		}

		// Default fonts.
		$google_fonts = array(
			'Source Sans Pro'  => array( '300', '300i', '400', '400i', '700', '700i' ),
			'Source Serif Pro' => array( '400', '600', '700' ),
		);

		$this->google_fonts = (array) apply_filters( 'tws_codegarage_google_fonts', $google_fonts );

		return $this->google_fonts;
	}

	/**
	 * Gets the Google Fonts URL to use for enqueuing Google Fonts CSS.
	 *
	 * Uses `latin` subset by default. To use other subsets, add a `subset` key to $query_args and the desired value.
	 *
	 * @return string Google Fonts URL, empty string if not used.
	 * @since 1.0
	 */
	public function google_fonts(): string {
		$fonts = $this->get_google_fonts();

		// Bail early if google fonts not used.
		if ( empty( $fonts ) ) {
			return '';
		}

		$font_families = array();

		foreach ( $fonts as $name => $types ) {
			if ( ! empty( $types ) ) {
				if ( ! is_array( $types ) ) {
					_doing_it_wrong( __METHOD__, esc_html__( 'The google font variants must be given as an array value instead of comma separated value.', 'tws-codegarage' ), '1.0' );

					$types = explode( ',', str_replace( ' ', '', $types ) );
				}

				$font_families[] = $name . ':' . implode( ',', $types );
				continue;
			}

			$font_families[] = $name;
		}

		$protocol   = is_ssl() ? 'https://' : 'http://';
		$query_args = array(
			'family'  => implode( '|', $font_families ),
			'display' => $this->google_fonts_display,
		);

		return add_query_arg( $query_args, "{$protocol}fonts.googleapis.com/css" );
	}

	/**
	 * Determines whether this is an AMP response.
	 *
	 * Note that this must only be called after the parse_query action.
	 *
	 * @return bool Whether the AMP plugin is active and the current request is for an AMP endpoint.
	 * @since 1.0
	 */
	public function is_amp() : bool {
		return function_exists( 'is_amp_endpoint' ) && \is_amp_endpoint();
	}
}
