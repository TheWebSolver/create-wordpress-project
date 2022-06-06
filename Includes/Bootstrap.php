<?php
/**
 * Bootstrap class.
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
 * @package TheWebSolver\Codegarage
 * @author Shesh Ghimire <sheshgh@thewebsolver.com>
 */

namespace TheWebSolver\Codegarage;

use TheWebSolver\Autoloader;
use TheWebSolver\Codegarage\Asset;
use WP_Theme;

/**
 * Bootstrap class.
 */
final class Bootstrap {
	/**
	 * Bootstrap instance.
	 *
	 * @var Bootstrap
	 * @since 1.0
	 */
	private static $instance;

	/**
	 * The project data.
	 *
	 * @var string|array|WP_Theme|bool
	 * @since 1.0
	 */
	private $project;

	/**
	 * The project type is either a plugin or a theme.
	 *
	 * @var string
	 * @since 1.0
	 */
	private $type = 'plugin';

	/**
	 * Root path.
	 *
	 * @var string
	 * @since 1.0
	 */
	private $root;

	/**
	 * Root URL.
	 *
	 * @var string
	 * @since 1.0
	 */
	private $url;

	/**
	 * The asset instance.
	 *
	 * @var Asset
	 * @since 1.0
	 */
	private $asset;

	/**
	 * Autoloader instance.
	 *
	 * @var Autoloader
	 * @since 1.0
	 */
	public $loader;

	/**
	 * Project callable classes.
	 *
	 * @var string[]
	 */
	private $call = array();

	/**
	 * Global script handle.
	 *
	 * @var string
	 * @since 1.0
	 */
	const SCRIPT_HANDLE = 'tws-codegarage-script';

	/**
	 * Global stylesheet handle.
	 *
	 * @var string
	 * @since 1.0
	 */
	const STYLE_HANDLE = 'tws-codegarage-style';

	/**
	 * Loads instance.
	 *
	 * @return Bootstrap
	 * @since 1.0
	 */
	public static function load() {
		return self::$instance ?: ( self::$instance = new self() );
	}

	/**
	 * Starts project.
	 *
	 * @param string $root The project root path.
	 * @param string $type The project type.
	 * @return Bootstrap
	 * @since 1.0
	 */
	public function platform( string $root, string $type ): Bootstrap {
		$file          = dirname( __FILE__ );
		$this->root    = $root;
		$this->type    = $type;
		$this->project = $this->project( false );
		$this->url     = $this->is_plugin() ? plugin_dir_url( $file ) : get_theme_file_uri();

		$this->setup();

		return $this;
	}

	/**
	 * Starts project setup.
	 *
	 * This Bootstrap file must exist inside `Includes` directory for setup to succeed.
	 *
	 * @since 1.0
	 */
	private function setup() {
		require_once $this->path( 'autoload.php' );

		/**
		 * Setup namespace mapping to directories.
		 *
		 * These are the default mapping paths.
		 *
		 * @var string[]
		 * @link https://getcomposer.org/doc/04-schema.md#psr-4
		 * @example Schema
		 * Below sequence is for the "Assets" (not "Includes") `$paths`.
		 * It is because Asset.php file exist in the project
		 * by default and it will be autoloaded once bootstrapped
		 * like so: `$this->asset = Asset::load()`.
		 *
		 * - `Asset.php` file is inside `Assets` directory.
		 * - namespace must be `TheWebSolver\Codegarage`.
		 * - classname must be `Asset` (same as filename without `.php` extension).
		 * - Autoload path will then be `{$this->root}/Assets/Asset.php`.
		 *
		 * Another example with nested directory and different filename.
		 * - `Asset_Handler.php` file is inside `Assets/PHP` directory.
		 * - namespace must be `TheWebSolver\Codegarage\PHP`.
		 * - classname must be `Asset_Handler` (same as filename without `.php` extension).
		 * - Autoload path will then be `{$this->root}/Assets/PHP/Asset_Handler.php`.
		 */
		$paths  = array( 'Assets', 'Includes' );
		$map    = array( __NAMESPACE__ => $paths );
		$loader = new Autoloader();

		// Start autoloading.
		$loader->root( $this->path() )->path( $map )->register();

		$this->loader = $loader;
		$this->asset  = Asset::load();

		/**
		 * WPHOOK: Action -> Fires after everything is loaded.
		 *
		 * @param Bootstrap $project The current bootstrap instance.
		 * @since 1.0
		 */
		do_action( 'tws_codegarage_loaded', $this );
	}

	/**
	 * Gets project data.
	 *
	 * WordPress dies if project is not in `plugins` or `themes` directory structure.
	 *
	 * @param string|false $key The specific project data. `false` to get all data.
	 * @return array|string|WP_Theme
	 * @since 1.0
	 */
	public function project( $key = 'Version' ) {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$domain = 'tws-codegarage';

		if ( file_exists( $file = WP_PLUGIN_DIR . "/{$this->dirname()}/{$domain}.php" ) ) {
			if ( ! empty( $plugin = get_plugin_data( $file, false ) ) ) {
				return false === $key ? $plugin : ( $plugin[ $key ] ?? '' );
			}
		}

		if ( ( $theme = wp_get_theme( $domain ) ) && $theme->exists() ) {
			return false === $key ? $theme : ( $theme->get( $key ) ?: '' );
		}

		/**
		 * WPHOOK: Filter -> Enable to create project outside plugin/theme directory.
		 *
		 * @param bool $enable Whether to allow project creation.
		 */
		if ( true === apply_filters( 'tws_codegarage_enable_project_anywhere', false ) ) {
			return '';
		}

		// Flag that project is not valid.
		// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped
		wp_die(
			__( 'The build process should either be inside "plugins" or "themes" directory.', 'tws-codegarage' ),
			__( 'Project directory not valid', 'tws-codegarage' ),
			400
		);
		// phpcs:enable
	}

	/**
	 * Gets the project type.
	 *
	 * @return string
	 * @since 1.0
	 */
	public function project_type(): string {
		return $this->type;
	}

	/**
	 * Verifies if current project is a plugin.
	 *
	 * @return bool
	 * @since 1.0
	 */
	public function is_plugin(): bool {
		return 'plugin' === $this->project_type();
	}

	/**
	 * Gets the file path if given relative to project root.
	 *
	 * If file is not passed, then project root path with trailing slash.
	 *
	 * @param string $file The filename of the project without preceding slash.
	 * @return string Normalized path with `wp_normalize_path()` function.
	 * @since 1.0
	 */
	public function path( string $file = '' ): string {
		$path = trailingslashit( $this->root );

		if ( $file ) {
			$path .= untrailingslashit( $file );
		}

		return wp_normalize_path( $path );
	}

	/**
	 * Gets the file URL if given relative to project URL.
	 *
	 * If file is not given, then project URL with trailing slash.
	 *
	 * @param string $file The filename of the project without preceding slash.
	 * @return string Escaped URL using `esc_url()` function.
	 * @since 1.0
	 */
	public function url( string $file = '' ): string {
		$url = trailingslashit( $this->url );

		if ( $file ) {
			$url .= untrailingslashit( $file );
		}

		return esc_url( $url );
	}

	/**
	 * Gets project directory name.
	 *
	 * @return string
	 * @since 1.0
	 */
	public function dirname(): string {
		return basename( $this->path() );
	}

	/**
	 * Gets current version of the project.
	 *
	 * @param string $file The filename of the project without preceding slash.
	 * @return string The version number by project type.
	 * @since 1.0
	 */
	public function version( string $file ): string {
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			return file_exists( $f = $this->path( $file ) ) ? filemtime( $f ) : filemtime( __FILE__ );
		}

		return $this->is_plugin() ? $this->project['Version'] : $this->project->get( 'Version' );
	}

	/**
	 * Gets asset instance.
	 *
	 * @return Asset
	 * @since 1.0
	 */
	public function asset(): Asset {
		return $this->asset;
	}

	/**
	 * Sets additional class components to be instantiated.
	 *
	 * Use this method to instantiate classes early in the request lifecycle.
	 * Mainly used in the main file of a plugin or in the functions.php file of a theme.
	 *
	 * Only pass the full namespaced classname. Class will then be instantiated either:
	 * - being a non-singleton pattern, or
	 * - being singleton pattern using project's `Singleton` trait.
	 *
	 * @param string ...$name The classnames with full namespace.
	 * @return Bootstrap
	 * @since 1.0
	 */
	public function class( string ...$name ): Bootstrap {
		$this->call = $name;

		return $this;
	}

	/**
	 * Starts project class instantiation.
	 *
	 * Only run this method after all classes are set using {@method Bootstrap::class()}.
	 *
	 * @since 1.0
	 */
	public function start() {
		if ( empty( $this->call ) ) {
			return;
		}

		foreach ( $this->call as $class ) {
			// Ignore string not that is not a class.
			if ( ! class_exists( $class, true ) ) {
				continue;
			}

			if ( is_callable( array( $class, 'load' ), false, $name ) ) {
				call_user_func( $name );
			} else {
				new $class();
			}
		}
	}
}
