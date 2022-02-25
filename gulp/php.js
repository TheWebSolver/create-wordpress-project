'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import { pipeline } from 'mississippi';
import gulpIf from 'gulp-if';
import phpcs from 'gulp-phpcs';

/**
 * Internal dependencies
 */
import {
	paths,
	PHPCSOptions,
	isProd,
} from './constants';

import { getMainConfig } from './utils';
import { startStringReplace } from './helper/base';

/**
 * Returns a single stream sniffing with WPCS.
 *
 * @return {Object} Pumpify pipeline object.
 */
export const sniffCodingStandard = () => {
	const config = getMainConfig( isProd );

	return pipeline.obj( [
		// Only code sniff PHP files if the debug setting is true.
		gulpIf( config.dev.debug.phpcs, phpcs( PHPCSOptions ) ),

		// Log all problems that were found.
		phpcs.reporter( 'log' ),
	] );
};

/**
 * Starts processing for dev environment.
 *
 * No string replacement and saving while in dev env.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const startPHPDev = () => {
	return src( paths.php.src )
		.pipe( sniffCodingStandard() )
		.pipe( dest( paths.php.dest ) );
};

/**
 * Starts processing for export.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const startPHPExport = () => {
	return src( paths.php.src )
		.pipe( sniffCodingStandard() )
		.pipe( startStringReplace() )
		.pipe( dest( paths.php.dest ) );
};

/**
 * Sniffs code using WPCS.
 *
 * During production, names are replaced with the user configuration.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const php = () => {
	return isProd ? startPHPExport() : startPHPDev();
};

export default php;
