'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import newer from 'gulp-newer';
import eslint from 'gulp-eslint';
import babel from 'gulp-babel';
import { pipeline } from 'mississippi';
import gulpIf from 'gulp-if';
import rename from 'gulp-rename';
import GulpUglify from 'gulp-uglify';

/**
 * Internal dependencies
 */
import {
	paths,
	isProd,
} from './constants';

import {
	getMainConfig,
	logError,
} from './utils';

import {
	startStringReplace,
	sourcemaps,
} from './helper/base';

/**
 * Returns a single stream linting with eslint.
 *
 * @return {Object} Pumpify pipeline object.
 */
export const lintScripts = () => {
	return pipeline.obj( [
		logError( 'JavaScript' ),
		newer( {
			dest: paths.scripts.dest,
			extra: [ paths.config.mainConfig ],
		} ),
		eslint(),
		eslint.format(),
	] );
};

/**
 * Starts string replacement process for scripts.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS Stream.
 */
export const startScriptStringReplace = () => {
	return gulpIf( isProd, startStringReplace() );
};

/**
 * Returns a single stream minimizing script with uglify.
 *
 * @return {Object} Pumpify pipeline object.
 */
export const uglifyScripts = () => {
	const config = getMainConfig( isProd ),
		presets = [ '@babel/preset-env' ];

	return pipeline.obj( [
		babel( { presets } ),
		gulpIf( ! config.dev.debug.scripts, GulpUglify() ),
		rename( { suffix: '.min' } ),
	] );
};

/**
 * Lints using Babel, ESlint, and Uglify.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const scripts = () => {
	return src( paths.scripts.src, { sourcemaps } )
		.pipe( lintScripts() )
		.pipe( startScriptStringReplace() )
		.pipe( uglifyScripts() )
		.pipe( dest( paths.scripts.dest, { sourcemaps } ) );
};

export default scripts;
