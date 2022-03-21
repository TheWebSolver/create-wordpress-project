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
	private $project_type = 'plugin';

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
		// Bail early if already bootstrapped.
		if ( null !== self::$instance ) {
			return self::$instance;
		}

		// Bootstrap.
		$project = new self();

		// Set project.
		$project->project = $project->project( false );

		// Verify if project is valid before continuing any further.
		if ( $project->is_valid() ) {
			$project->setup();
		}

		return $project;
	}

	/**
	 * Starts project setup.
	 *
	 * This Bootstrap file must exist inside `Includes` directory for setup to succeed.
	 *
	 * @since 1.0
	 */
	private function setup() {
		self::$instance = $this;

		// Setup project URI.
		$this->url = $this->is_plugin()
			? plugin_dir_url( dirname( __FILE__ ) )
			: get_theme_file_uri();

		// Setup autoloader.
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
		 * - `Asset.php` file is inside `Asset` directory.
		 * - namespace must be `TheWebSolver\Codegarage`.
		 * - classname must be `Assets` (same as filename).
		 * - Autoload path will then be `$rootpath/Assets/Assets.php`.
		 *
		 * Another example with nested directory and different filename.
		 * - `Asset_Handler.php` file is inside `Assets/PHP` directory.
		 * - namespace must be `TheWebSolver\Codegarage\PHP`.
		 * - classname must be `Asset_Handler` (same as filename).
		 * - Autoload path will then be `$rootpath/Assets/PHP/Asset_Handler.php`.
		 */
		$paths  = array( 'Assets', 'Includes' );
		$map    = array( __NAMESPACE__ => $paths );
		$loader = new Autoloader();

		// Start autoloading.
		$loader->root( $this->path() )->path( $map )->register();

		$this->loader = $loader;
		$this->asset  = Asset::load();

		// Init project.
		$this->init();

		/**
		 * WPHOOK: Action -> Fires after everything is loaded.
		 *
		 * @param Bootstrap $project The current bootstrap instance.
		 * @since 1.0
		 */
		do_action( 'tws_codegarage_loaded', $this );
	}

	/**
	 * Determines whether current project is a valid project.
	 *
	 * - `Bootstrap::project()` is an array, then project is a plugin.
	 * - `Bootstrap::project()` is an object (`WP_Theme` instance), then project is a theme.
	 *
	 * @return bool
	 * @since 1.0
	 */
	private function is_valid() {
		$valid = ( is_array( $this->project ) && ! empty( $this->project ) ) || is_object( $this->project );

		// Shutdown further execution if not in plugins or themes folder.
		if ( ! $valid ) {
			wp_die(
				esc_html__( 'The build process should either be in plugins or themes directory.', 'tws-codegarage' ),
				esc_html__( 'Project directory not valid', 'tws-codegarage' ),
				400
			);
		}

		// Set project type once verified that it is a valid project.
		if ( is_object( $this->project ) ) {
			$this->project_type = 'theme';
		}

		return $valid;
	}

	/**
	 * Gets project data.
	 *
	 * @param string|false $key The specific product data value. False to get all data.
	 * @return array|string|WP_Theme|int If nothing found, then `-1`.
	 * @since 1.0
	 */
	public function project( $key = 'Version' ) {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$this->root   = dirname( __DIR__ );
		$project_dir  = $this->dirname();
		$plugin_file  = 'tws-codegarage.php';
		$project_file = WP_PLUGIN_DIR . "/$project_dir/$plugin_file";

		if ( file_exists( $project_file ) ) {
			$plugin = get_plugin_data( $project_file, false );

			if ( ! empty( $plugin ) ) {
				// Get all data when called upon.
				if ( false === $key ) {
					return $plugin;
				}

				return isset( $plugin[ $key ] ) ? (string) $plugin[ $key ] : '';
			}
		}

		// TODO: Review getting theme data later.
		$theme = wp_get_theme( '', $this->path() );

		if ( $theme instanceof WP_Theme ) {
			// Get all data when called upon.
			if ( false === $key ) {
				return $theme;
			}

			if ( method_exists( $theme, 'get' ) ) {
				$val = $theme->get( $key );

				return false !== $val ? $val : '';
			}
		}

		// Flag that project is not valid.
		return -1;
	}

	/**
	 * Gets the project type.
	 *
	 * @return string
	 * @since 1.0
	 */
	public function project_type(): string {
		return $this->project_type;
	}

	/**
	 * Verifies if current project is a plugin.
	 *
	 * @return bool
	 * @since 1.0
	 */
	public function is_plugin(): bool {
		return 'plugin' === $this->project_type;
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
		$debug = defined( 'WP_DEBUG' ) && WP_DEBUG;

		if ( $debug ) {
			return file_exists( $this->path( $file ) )
				? (string) filemtime( $this->path( $file ) )
				: (string) filemtime( __FILE__ );
		}

		// Array means plugin, else theme.
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
	 * Inits project tasks.
	 *
	 * @since 1.0
	 */
	private function init() {

	}
}
