'use strict';

/**
 * External dependencies
 */
import del from 'del';

/**
 * Internal dependencies
 */
import { paths } from './constants';

/**
 * Cleans CSS files.
 *
 * @return {Promise|string} with the deleted paths.
 */
export const cleanCSS = () => {
	const delPath = [
		`${ paths.styles.dest }/**/*.css`,
		`!${ paths.styles.srcDir }`,
		`!${ paths.styles.srcDir }/**`,
	];

	return del( delPath );
};

/**
 * Cleans JS files.
 *
 * @return {Promise|string} with the deleted paths.
 */
export const cleanJS = () => {
	const delPath = [
		`${ paths.scripts.dest }/**/*.js`,
		`!${ paths.scripts.srcDir }`,
		`!${ paths.scripts.srcDir }/**`,
	];

	return del( delPath );
};
