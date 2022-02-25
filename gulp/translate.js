'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import sort from 'gulp-sort';
import wpPot from 'gulp-wp-pot';

/**
 * Internal dependencies
 */
import {
	paths,
	isProd,
	nameFieldDefaults,
} from './constants';

import { getMainConfig } from './utils';

/**
 * Generates translation files.
 *
 * @param {function} done Function to call when async processes finish.
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const translate = ( done ) => {
	const config = getMainConfig();

	// Bail if translation is disabled in production.
	if ( isProd && ! config?.export?.generatePotFile ) {
		return done();
	}

	const translateOptions = {
		domain: ( isProd ) ? config.core.slug : nameFieldDefaults.slug,
		package: ( isProd ) ? config.core.name : nameFieldDefaults.name,
		bugReport: ( isProd ) ? config.core.name : nameFieldDefaults.name,
		lastTranslator: ( isProd ) ? config.core.author : nameFieldDefaults.author,
	};

	return src( paths.languages.src )
		.pipe( sort() )
		.pipe( wpPot( translateOptions ) )
		.pipe( dest( paths.languages.dest ) );
};

export default translate;
