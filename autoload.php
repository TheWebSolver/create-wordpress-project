<?php
/**
 * The autoloader API.
 *
 * The autoloading class with namespace mapping.
 * An alternative to the composer autloader.
 *
 * -----------------------------------
 * DEVELOPED-MAINTAINED-SUPPPORTED BY
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
 * @package TheWebSolver\Core
 * @author  Shesh Ghimire <shesh@thewebsolver.com>
 * @version 1.0
 */

namespace TheWebSolver;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Prevent other autoloaders autoload TheWebSolver Autoloader class.
if ( ! class_exists( '\\TheWebSolver\\Autoloader', false ) ) {
	/**
	 * Autoloader class.
	 *
	 * @link https://getcomposer.org/doc/04-schema.md#psr-4
	 * @example usage
	 * ### If class files are present in the same directory:
	 * - `root/Includes/Helper/Helper_Class.php`
	 * - `root/Includes/Helper/General/Another_Class.php`
	 * - `root/Includes/API/General_API.php`
	 *
	 * ```
	 * // From project root, init autoloader.
	 * use TheWebSolver\Autoloader;
	 *
	 * $loader = new Autoloader();
	 * $map    = array('TheWebSolver\\Core\\' => 'Includes');
	 * $loaders->root(__DIR__)->path($map)->register();
	 * ```
	 *
	 * ### If class files are present in different directories:
	 * - `root/Includes/Helper/Helper_Class.php`
	 * - `root/Includes/Template/General/Another_Class.php`
	 * - `root/Source/API/General_API.php`
	 *
	 * Below is the structure how namesapce and classname should be for different directories.
	 * ```
	 * // File: Helper_Class.php
	 * namespace TheWebSolver\Core\Helper;
	 * class Helper_Class {}
	 *
	 * // File: Another_Class.php
	 * namespace TheWebSolver\Core\Template\General;
	 * class Another_Class {}
	 *
	 * // File: General_API.php
	 * namespace TheWebSolver\Feature\Source\API;
	 * class General_API {}
	 *
	 * // Lets autoload above structure files.
	 * // Subdirectory names after which namespace maps.
	 * use TheWebSolver\Autoloader;
	 *
	 * $loader = new Autoloader();
	 * $map    = array(
	 *  'TheWebSolver\\Core\\'    => 'Includes',
	 *  'TheWebSolver\\Feature\\' => 'Source',
	 * );
	 *
	 * // From project root, init autoloader.
	 * $loader->root(__DIR__)->path($map)->register();
	 * ```
	 */
	class Autoloader {
		/**
		 * The project root.
		 *
		 * @var string
		 * @since 1.0
		 */
		public $root;

		/**
		 * The current project directory name.
		 *
		 * @var string
		 * @since 1.0
		 */
		public $dir;

		/**
		 * The mapped namespace with it's directory name.
		 *
		 * @var (string|string[])[]
		 * @since 1.0
		 */
		public $paths;

		/**
		 * Classes set for inclusion.
		 *
		 * @var string[]
		 * @since 1.0
		 */
		private $classes = array();

		/**
		 * The class to include file for.
		 *
		 * @var string
		 * @since 1.0
		 */
		private $class = '';

		/**
		 * The autoload status.
		 *
		 * @var bool[]
		 * @since 1.0
		 */
		private $autoload = array();

		/**
		 * On debug, files are not included.
		 *
		 * @var bool
		 * @since 1.0
		 */
		private $debug = false;

		/**
		 * Creates full path for the given directory.
		 *
		 * @param string $path The path to be appended to root.
		 * @return string
		 * @since 1.0
		 */
		private function set( string $path ): string {
			return trailingslashit( $this->root ) . untrailingslashit( $path );
		}

		/**
		 * Sets project root.
		 *
		 * @param string $dir The project root directory path. Usually `__DIR__`.
		 * @return Autoloader
		 * @since 1.0
		 */
		public function root( string $dir ): Autoloader {
			$this->root = $dir;
			$this->dir  = basename( $this->root );

			return $this;
		}

		/**
		 * Sets namespace mapping directory name(s).
		 *
		 * @param (string|string[])[] $name Mapping namespace prefix as key and directory
		 *                                  (as string) or directories (as array).
		 * @return Autoloader
		 * @link https://getcomposer.org/doc/04-schema.md#psr-4
		 * @since 1.0
		 */
		public function path( array $name ): Autoloader {
			$this->paths = $name;

			return $this;
		}

		/**
		 * Sets debug mode.
		 *
		 * @param bool $enable Found file is not included if debug is true.
		 * @return Autoloader
		 * @since 1.0
		 */
		public function debug( bool $enable ): Autoloader {
			$this->debug = $enable;

			return $this;
		}

		/**
		 * Gets file from mapped path created using class parts.
		 *
		 * @param string[] $parts The classname parts.
		 * @param string   $path  The path to append parts to.
		 * @return string  $path  The file with full path that matches namespace.
		 * @since 1.0
		 */
		private function file( array $parts, string $path ): string {
			foreach ( $parts as $part ) {
				$path .= "/$part";
			}

			$path .= '.php';

			return $path;
		}

		/**
		 * Creates directory paths part from the class.
		 *
		 * @param string $namespace The namespace.
		 * @return string[]
		 * @since 1.0
		 */
		private function parts( string $namespace ): array {
			$parts = explode( '\\', substr( $this->class, strlen( $namespace ) ) );

			return $parts ? $parts : array();
		}

		/**
		 * Prevent loading if autoload is set to false.
		 *
		 * @throws \LogicException Can't load current class using autoloader.
		 * @since 1.0
		 */
		protected function block() {
			if ( class_exists( $this->class, false ) ) {
				throw new \LogicException(
					'Unable to load class:"' . $this->class . '" because autoload is set to "false".'
				);
			}
		}

		/**
		 * Includes mapped directories.
		 *
		 * @param string $file The file to include.
		 * @return bool
		 * @since 1.0
		 */
		private function include( string $file ): bool {
			$this->autoload[ $file ] = false;

			// Bail if file is not readable.
			if ( ! is_readable( $file ) ) {
				return false;
			}

			if ( ! $this->debug ) {
				include $file;
			}

			$this->autoload[ $file ]       = true;
			$this->classes[ $this->class ] = $file;

			return true;
		}

		/**
		 * Includes mapped directories for autoloading.
		 *
		 * @return bool True if file found and included, false otherwise.
		 * @link https://getcomposer.org/doc/04-schema.md#psr-4
		 * @since 1.0
		 */
		private function map(): bool {
			if ( ! is_array( $this->paths ) || empty( $this->paths ) ) {
				return false;
			}

			$files = array();

			/**
			 * The prefix for classmap prefix.
			 *
			 * @var string $namespace
			 */
			foreach ( $this->paths as $namespace => $dir ) {
				// Remove preceeding and succeeding slashes and add succeeding one.
				$ns = trim( $namespace, '\\' ) . '\\';

				// Ignore classes not in the given namespace.
				if ( strpos( $this->class, $ns ) !== 0 ) {
					continue;
				}

				$parts = $this->parts( $ns );

				// Ignore non-classmapped.
				if ( empty( $parts ) ) {
					continue;
				}

				if ( is_string( $dir ) ) {
					$file    = $this->file( $parts, $this->set( $dir ) );
					$include = $this->include( $file );

					if ( $include ) {
						$files[] = $file;
					}
				} elseif ( is_array( $dir ) ) {
					foreach ( $dir as $path ) {
						$file    = $this->file( $parts, $this->set( $path ) );
						$include = $this->include( $file );

						if ( $include ) {
							$files[] = $file;
						}
					}
				}
			}

			return ! empty( $files );
		}

		/**
		 * Includes file if mapping successful.
		 *
		 * @param string $class The full class to instantiate.
		 * @return bool True if autoloaded, false otherwise.
		 * @since 1.0
		 */
		public function autoload( string $class ): bool {
			$this->class = $class;

			return $this->map();
		}

		/**
		 * Registers classes for autoloading.
		 *
		 * @param bool $throw   Specifies whether spl_autoload_register() should throw
		 *                      exceptions when the autoload_function cannot be
		 *                      registered. Ignored since 8.0.
		 * @param bool $prepend If true, spl_autoload_register() will prepend
		 *                      the autoloader on the autoload stack instead of
		 *                      appending it.
		 * @return bool
		 * @since 1.0
		 */
		public function register( bool $throw = true, bool $prepend = false ): bool {
			return spl_autoload_register( array( $this, 'autoload' ), $throw, $prepend );
		}

		/**
		 * Validates if path is autoloaded.
		 *
		 * @param bool $path Whether path is autoloaded or not.
		 * @return bool
		 * @since 1.0
		 */
		public function valid( bool $path ): bool {
			return true === $path;
		}

		/**
		 * Gets mapped paths.
		 *
		 * @return bool[] Filepath as index, true as value.
		 * @since 1.0
		 */
		public function get(): array {
			return array_filter( $this->get_all(), array( $this, 'valid' ) );
		}

		/**
		 * Gets all mapped paths.
		 *
		 * It includes those files that do not get mapped.
		 *
		 * @return bool[] Filepath as index, autoloaded (true) or not (false) as value.
		 * @since 1.0
		 */
		public function get_all(): array {
			return $this->autoload;
		}

		/**
		 * Gets mapped classes.
		 *
		 * @return string[] Class as index, filepath as value.
		 * @since 1.0
		 */
		public function classes(): array {
			return $this->classes;
		}

		/**
		 * Gets the template path.
		 *
		 * @return string
		 * @since 1.0
		 */
		public function default_path(): string {
			return apply_filters( 'tws_default_tempate_path_' . $this->dir, 'templates/thewebsolver/' );
		}

		/**
		 * Locates a template file and return the path for inclusion.
		 *
		 * This is the load order:
		 * - yourtheme/$template_path/$template_name
		 * - yourtheme/$template_name
		 * - $default_path/$template_name
		 *
		 * @param mixed  $template_name The template file name.
		 * @param string $template_path The template path.
		 * @param string $default_path  The default path.
		 * @return string
		 * @since 1.0
		 */
		public function locate( $template_name, $template_path = '', $default_path = '' ) {
			// Set the template path.
			if ( ! $template_path ) {
				$template_path = $this->default_path();
			}

			if ( ! $default_path ) {
				$default_path = trailingslashit( $this->root ) . 'templates/';
			}

			// Theme priority when looking for the template file.
			$template = locate_template( array( trailingslashit( $template_path ) . $template_name ) );

			// Default to plugins directory if not found in theme.
			if ( ! $template ) {
				$template = $default_path . $template_name;
			}

			/**
			 * WPHOOK: Filter -> Send back the located template file.
			 *
			 * @since 1.0
			 */
			return apply_filters( 'tws_locate_template_file_' . $this->dir, $template, $template_name, $template_path );
		}

		/**
		 * Gets the template part.
		 *
		 * @param string $slug The first part of the template file name.
		 * @param string $name The second part of the template file name after ***-***.
		 * @param array  $args The args passed to the template file.
		 * @since 1.0
		 */
		public function template_part( string $slug, string $name = '', array $args = array() ) {
			if ( ! empty( $args ) ) {
				extract( $args ); // phpcs:ignore WordPress.PHP.DontExtract.extract_extract
			}

			// Prepare template part.
			$template = '';

			/**
			 * Look in yourtheme/{dirname}/slug-name.php and yourtheme/{dirname}/slug.php.
			 * Here the {dirname} defaults to "thewebsolver" unless used filter to change it.
			 */
			$template = locate_template(
				array(
					$this->default_path() . "{$slug}-{$name}.php",
					$this->default_path() . "{$slug}.php",
				)
			);

			/**
			 * WPHOOK: Filter -> change the template directory path.
			 *
			 * @var string
			 * @since 1.0
			 */
			$template_path = apply_filters( 'tws_locate_template_path_' . $this->dir, $this->root . '/template-parts', $template, $args );

			// Get default slug-name.php.
			if ( ! $template && $name && file_exists( $template_path . "/{$slug}-{$name}.php" ) ) {
					$template = $template_path . "/{$slug}-{$name}.php";
			}

			if ( ! $template && ! $name && file_exists( $template_path . "/{$slug}.php" ) ) {
					$template = $template_path . "/{$slug}.php";
			}

			/**
			 * WPHOOK: Filter -> change template part files from 3rd-party plugins.
			 *
			 * @var string
			 * @since 1.0
			 */
			$template = apply_filters( 'tws_locate_template_part_' . $this->dir, $template, $slug, $name );

			if ( $template ) {
				include $template;
			}
		}

		/**
		 * Gets template file that can be overridden from themes.
		 *
		 * @param string $template_name The template file name.
		 * @param array  $args          The agruments to be passed to template file.
		 * @param string $template_path The template path.
		 * @param string $default_path  The default path.
		 * @return void
		 * @since 1.0
		 */
		public function template( string $template_name, array $args = array(), string $template_path = '', string $default_path = '' ) {
			if ( ! empty( $args ) ) {
				extract( $args ); // phpcs:ignore WordPress.PHP.DontExtract.extract_extract
			}

			$located = $this->locate( $template_name, $template_path, $default_path );

			/**
			 * WPHOOK: Action -> Fires before getting template file.
			 *
			 * @param string $template_name
			 * @param string $template_path
			 * @param string $located
			 * @param array  $args
			 * @since 1.0
			 */
			do_action( 'tws_before_get_template_' . $this->dir, $template_name, $template_path, $located, $args );

			// Bail with wrong path info.
			if ( ! file_exists( $located ) ) {
				_doing_it_wrong( __METHOD__, sprintf( '"%s" does not exist.', esc_html( $located ) ), '1.0' );

					return;
			}

			// Include the located template file.
			include $located;

			/**
			 * WPHOOK: Action -> Fires after getting template file.
			 *
			 * @param string $template_name
			 * @param string $template_path
			 * @param string $located
			 * @param array  $args
			 * @since 1.0
			 */
			do_action( 'tws_after_get_template_' . $this->dir, $template_name, $template_path, $located, $args );
		}
	}
}
