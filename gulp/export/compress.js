'use strict';

/**
 * External dependencies
 */
import
{
	src,
	dest,
} from 'gulp';

import path from 'path';
import GulpZip from 'gulp-zip';

/**
 * Internal dependencies
 */
import { prodMainPath } from '../constants';
import { getMainConfig } from '../utils';

/** The user configuration. */
const config = getMainConfig( true );

/**
 * Creates the zip file.
 *
 * @param {function} done function to call when async processes finish.
 * @return {Stream} Single stream after pipeline gets destroyed.
 */
export default function compress( done ) {
	return ! config.export.compress ?
		done() :
		src( `${ prodMainPath }/**/*` )
			.pipe( GulpZip( `${ config.core.slug }.zip` ) )
			.pipe( dest( path.normalize( `${ prodMainPath }/../` ) ) );
}

