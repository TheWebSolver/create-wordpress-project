<?php
/**
 * TheWebSolver Codegarage
 *
 * @package           TheWebSolver\Codegarage
 * @author            Shesh Ghimire
 * @license           GPL-3.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       TheWebSolver Codegarage
 * Plugin URI:        https://github.com/TheWebSolver/create-wordpress-project
 * Description:       An awesome plugin with modern build process.
 * Version:           1.0
 * Requires at least: 5.3
 * Tested up to:      5.9
 * Requires PHP:      7.0
 * Author:            Shesh Ghimire
 * Author URI:        https://github.com/hsehszroc
 * Text Domain:       tws-codegarage
 * Domain Path:       /languages
 * License:           GNU General Public License v3.0 (or later)
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 */

namespace TheWebSolver\Codegarage;

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

require __DIR__ . '/Includes/Bootstrap.php';

// Load main file.
Bootstrap::load()->platform( __DIR__, 'plugin' );

/**
 * Load project related files and start.
 *
 * @see Bootstrap::class()
 * @see Bootstrap::start()
 */
