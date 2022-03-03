'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';

/**
 * Internal dependencies
 */
import {
	bundlerNotActive,
	logStreamFail,
} from '../helper/log.js';

import {
	lintScripts,
	startScriptStringReplace,
} from '../scripts.js';

import webpackConfig from '../../webpack.config.js';
import { paths } from '../constants.js';

/**
 * Bundles script using webpack bundler.
 *
 * Configure webpack using `webpack.config.js` in the root directory.
 *
 * @param {function} done Function to call when async processes finish.
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
export const bundleScripts = ( done ) => {
	const config = webpackConfig;

	if ( Object.keys( config.entry ).length < 1 ) {
		return bundlerNotActive( true, done() );
	}

	return src( paths.scripts.bundlerSrc )
		.pipe( logStreamFail() )
		.pipe( lintScripts() )
		.pipe( webpackStream( config, webpack ) )
		.pipe( startScriptStringReplace() )
		.pipe( dest( paths.scripts.bundlerDest ) );
};
