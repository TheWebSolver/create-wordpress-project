'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import newer from 'gulp-newer';
import imagemin from 'gulp-imagemin';

/**
 * Internal dependencies
 */
import { paths } from './constants';

/**
 * Optimizes images.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const images = () => {
	return src( paths.images.src )
		.pipe( newer( paths.images.dest ) )
		.pipe( imagemin() )
		.pipe( dest( paths.images.dest ) );
};

export default images;
