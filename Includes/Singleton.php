<?php
/**
 * The Singleton Trait.
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
 * @package TheWebSolver\Codegarage\Trait
 * @author Shesh Ghimire <shesh@thewebsolver.com>
 */

namespace TheWebSolver\Codegarage;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

/**
 * Singleton trait.
 */
trait Singleton {
	/**
	 * Singleton instance.
	 *
	 * @var ($this)[]
	 * @since 1.0
	 */
	protected static $instance = array();

	/**
	 * Loads called class instance.
	 *
	 * @return $this The called class instance.
	 * @since 1.0
	 */
	final public static function load() {
		$class = get_called_class();

		if ( ! isset( static::$instance[ $class ] ) ) {
			static::$instance[ $class ] = new $class();
		}

		return static::$instance[ $class ];
	}

	// phpcs:disable -- Prevent these events.
	protected function __construct() {}
	final protected function __clone() {}
	final protected function __sleep() {}
	final protected function __wakeup() {}
	// phpcs:enable
}
