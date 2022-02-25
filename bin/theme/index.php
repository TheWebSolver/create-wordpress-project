<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package TheWebSolver\Codegarage\Template
 * @since 1.0.0
 */

use function TheWebSolver\Codegarage\number_pagination;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo( 'charset' ); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="profile" href="https://gmpg.org/xfn/11">

		<?php wp_head(); ?>
	</head>
	<body itemtype="https://schema.org/WebPage" itemscope="itemscope" <?php body_class(); ?>>
		<?php wp_body_open(); ?>
		<a class="skip-link screen-reader-text" href="#content"><?php echo esc_html__( 'Skip to content', 'tws-codegarage' ); ?></a>

		<div id="content" class="site-content">
			<div class="tws-whitelabel-container">

			<div id="primary">

				<?php
				/**
				 * WPHOOK: Action -> fires before the main content.
				 */
				do_action( 'tws_codegarage_primary_content_top' );
				?>

				<main id="main" class="site-main">
					<?php
					if ( have_posts() ) :
						/**
						 * WPHOOK: Action -> fires before the content loop.
						 */
						do_action( 'tws_codegarage_template_parts_content_top' );

						while ( have_posts() ) :
							the_post();
						endwhile;
						/**
						 * WPHOOK: Action -> fires after the content loop.
						 */
						do_action( 'tws_codegarage_template_parts_content_bottom' );
					else :
						/**
						 * WPHOOK: Action -> fires if there is no content.
						 */
						do_action( 'tws_codegarage_template_parts_content_none' );
					endif;
					?>
				</main><!-- #main -->

				<?php number_pagination(); ?>

				<?php
				/**
				 * WPHOOK: Action -> fires after the main content.
				 */
				do_action( 'tws_codegarage_primary_content_bottom' );
				?>

			</div><!-- #primary -->

			</div> <!-- .tws-whitelabel-container -->
		</div><!-- #content -->
		<?php wp_footer(); ?>
	</body>
</html>
