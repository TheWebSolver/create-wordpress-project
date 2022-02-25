'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

/**
 * Internal dependencies
 */
import {
	isProd,
	paths,
} from '../constants';

import {
	isPlugin,
	getRelativePath,
	startStringReplace,
} from '../helper/base';

/**
 * Replaces strings in files.
 *
 * @param {function} done Function to call when async processes finish.
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const stringReplace = ( done ) => {
	// Bail if not in production env.
	if ( ! isProd ) {
		return done();
	}

	/** Ignore stylesheet file if project is not a theme. */
	const maybeIgnoreStyleCSS = { allowEmpty: ! isPlugin };

	return src( paths.export.stringReplaceSrc, maybeIgnoreStyleCSS )
		.pipe( startStringReplace() )
		.pipe( dest( getRelativePath ) );
};

export default stringReplace;
