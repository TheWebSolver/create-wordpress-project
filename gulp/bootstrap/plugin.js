'use strict';

/**
 * External dependencies
 */
import {
	dest,
	src,
} from 'gulp';

import tap from 'gulp-tap';
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';
import del from 'del';

/**
 * Internal dependencies
 */
import {
	checkExistence,
	isProd,
	nameFieldDefaults,
	paths,
	prodMainPath,
	rootPath,
} from '../constants';

import {
	wrongProjectType,
	projectBootstrapped,
} from '../helper/log';

import {
	isPlugin,
	getRelativePath,
} from '../helper/base';

import { getMainConfig } from '../utils';

/** The user configuration. */
const config = getMainConfig( isProd );

/** The plugin's old main file path in production. */
export const oldFilePath = `${ prodMainPath }/${ nameFieldDefaults.slug }.php`;

/** The plugin's new main file path in production. */
export const newFilePath = `${ prodMainPath }/${ config.core.slug }.php`;

/**
 * Verifies plugin main file and extract from bin to root directory.
 *
 * Internally, checks are in place to prevent possible overriding plugin main file
 * that already exists in the root directory before bootstrap.
 *
 * @param {boolean} override Whether to override existing file or not.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const bootstrapPlugin = ( override = false ) => {
	// Capture current file in the pipeline and verify before extraction.
	return tap( ( file, transform ) => {
		// Bail early if project is not a plugin.
		if ( ! isPlugin ) {
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
 * Renames plugin main filename post production.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const renameMainFile = () => {
	return gulpIf(
		checkExistence( oldFilePath ),
		rename( newFilePath )
	);
};

/**
 * Deletes old plugin main file.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const deleteMainFile = () => {
	const delOptions = {
		expandDirectories: false,
		onlyFiles: true,
		force: true,
	};

	return gulpIf(
		checkExistence( newFilePath ),
		del( oldFilePath, delOptions )
	);
};

/**
 * Updates plugin main file post production.
 *
 * @return {NodeJS.ReadWriteStream} Stream after rename.
 */
export const updateMainFile = () => {
	return src( oldFilePath )
		.pipe( renameMainFile() )
		.pipe( deleteMainFile() )
		.pipe( dest( getRelativePath ) );
};

/**
 * Gets plugin main file from bin and export to current project root.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const copyPluginMainFile = () => {
	return src( paths.plugin.php )
		.pipe( bootstrapPlugin( false ) );
};
