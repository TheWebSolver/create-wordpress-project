'use strict';

/**
 * External dependencies
 */
import {
	dest,
	src,
} from 'gulp';

import tap from 'gulp-tap';
import merge from 'merge-stream';

/**
 * Internal dependencies
 */
import {
	checkExistence,
	paths,
	rootPath,
} from '../constants';

import {
	wrongProjectType,
	projectBootstrapped,
} from '../helper/log';

import { isPlugin } from '../helper/base';

/**
 * Verifies theme file and extract from bin to root directory.
 *
 * Internally, checks are in place to prevent possible overriding theme file
 * that already exists in the root directory before bootstrap.
 *
 * @param {boolean} override Whether to override existing file or not.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const bootstrapTheme = ( override = false ) => {
	// Capture current file in the pipeline and verify before extraction.
	return tap( ( file, transform ) => {
		// Bail early if project is not a theme.
		if ( isPlugin ) {
			return wrongProjectType( file.basename );
		}

		const filePath = `${ rootPath }/${ file.basename }`;

		// Doesn't exist in root, extract.
		if ( ! checkExistence( filePath ) ) {
			transform.through( dest, [ paths.php.dest ] );

			// Log message to console.
			projectBootstrapped( file.basename, true );

			// Prevent overriding existing file.
			if ( ! override ) {
				return;
			}
		}

		// Already exits, log message to console about it.
		projectBootstrapped( file.basename, false, override );

		// Overriding is enabled, then do so.
		if ( override ) {
			return transform.through( dest, [ paths.php.dest ] );
		}
	} );
};

/**
 * Gets all theme related PHP files from bin and export to current project root.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const copyThemePHPFiles = () => {
	return src( paths.theme.php )
		.pipe( bootstrapTheme( false ) );
};

/**
 * Gets theme style.css file from bin and export to current project root.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const copyThemeStyleSheet = () => {
	return src( paths.theme.style )
		.pipe( bootstrapTheme( false ) );
};

/**
 * Gets theme all files from bin and export to current project root.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const copyThemeMainFiles = () => {
	return merge( src( paths.theme.style ), src( paths.theme.php ) )
		.pipe( bootstrapTheme( false ) );
};
