<?php
/**
 * Theme functions.
 *
 * @package TheWebSolver\Codegarage\Function
 *
 * something meaningful.
 */

namespace TheWebSolver\Codegarage;

defined( 'ABSPATH' ) || exit; // Exit if accessed directly.

/**
 * Gets pagination text and arrows.
 *
 * @return string
 * @since 1.0.0
 */
function number_pagination() {
	global $wp_query;

	// Bail early if only one page.
	if ( $wp_query->max_num_pages < 2 ) {
		return '';
	}

	// Show pagination for pages with same category.
	$args = array(
		'prev_text'    => '<span class="tws-whitelabel-left-arrow">&larr;</span> ' . __( 'Previous Page', 'tws-codegarage' ),
		'next_text'    => __( 'Next Page', 'tws-codegarage' ) . ' <span class="tws-whitelabel-right-arrow">&rarr;</span>',
		'taxonomy'     => 'category',
		'in_same_term' => true,
	);

	ob_start();
	?>

	<div class="tws-whitelabel-pagination">
		<?php the_posts_navigation( $args ); ?>
	</div>

	<?php
	/**
	 * WPHOOK: Filter -> Pagination HTML markup.
	 *
	 * @param string|false $content The content.
	 * @var   string|false
	 */
	$content = apply_filters( 'tws_codegarage_pagination_markup', ob_get_clean() );

	echo $content ? $content : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
