'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import fs from 'fs';

/**
 * Internal dependencies
 */
import {
	checkExistence,
	paths,
	prodMainPath,
} from '../constants';

import { getRelativePath } from '../helper/base';

import {
	isRequiredConfig,
	maybeExportFail,
	maybeSamePathFail,
	productionStarted,
} from '../helper/log';

/**
 * Creates production directory.
 *
 * If starts clean. Meaning:
 * - Removes if directory already exists.
 * - Starts rebuilding all files and directories.
 */
const createDirectory = () => {
	if ( fs.existsSync( prodMainPath ) ) {
		rimraf.sync( prodMainPath );
	}

	mkdirp( prodMainPath );
};

/**
 * Creates the production directory.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const start = () => {
	// Error if not in a production environment.
	maybeExportFail();

	// Error if the dev and the production directory have the same name.
	maybeSamePathFail();

	const Required = [
		'slug',
		'name',
	];

	// Stop process if config that must be set is still the default value.
	for ( const Field of Required ) {
		isRequiredConfig( Field, true );
	}

	// Create the production directory.
	createDirectory();

	// Log production started.
	if ( checkExistence( prodMainPath ) ) {
		productionStarted();
	}

	// Copying misc files to the production directory.
	return src( paths.export.src, { allowEmpty: true } )
		.pipe( dest( getRelativePath ) );
};

export default start;
