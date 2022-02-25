'use strict';

/**
 * External dependencies
 */
import { src, dest } from 'gulp';
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';
import stylelint from 'stylelint';
import reporter from 'postcss-reporter';
import calc from 'postcss-calc';
import { pipeline } from 'mississippi';
import postcss from 'gulp-postcss';
import gulpIf from 'gulp-if';
import tabify from 'gulp-tabify';
import rename from 'gulp-rename';

/**
 * Internal dependencies
 */
import {
	paths,
	isProd,
} from './constants';

import { getMainConfig } from './utils';

import {
	getPostCSSAtImport,
	getPresetEnv,
	sniffStyle,
} from './styles';

import {
	sourcemaps,
	startStringReplace,
} from './helper/base';

import { server } from './browserSync';

/** The user configuration. */
const config = getMainConfig( isProd );

/**
 * Lints editor styles.
 *
 * @return {Object} Pumpify pipeline object.
 */
export const lintEditorStyle = () => {
	const postcssPlugins = [
		stylelint(),
		postcssPresetEnv( getPresetEnv( true, false ) ),
		calc( { preserve: false } ),
		cssnano(),
	];

	// Skip minifying files during development and debug is enabled.
	if ( config.dev.debug.styles && ! isProd ) {
		postcssPlugins.pop();
	}

	// Report messages from other postcss plugins.
	postcssPlugins.push(
		reporter( { clearReportedMessages: true } )
	);

	// Single stream with postCSS events.
	return pipeline.obj( [
		postcss( [ getPostCSSAtImport ] ),
		postcss( postcssPlugins ),
		gulpIf( config.dev.debug.styles, tabify( 2, true ) ),
		rename( { suffix: '.min' } ),
		server.stream( { match: '**/*.css' } ),
	] );
};

/**
 * Linsts CSS via PostCSS and CSSNext.
 *
 * Includes Autoprefixer by default.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const editorStyles = () => {
	return src( paths.styles.editorSrc, { sourcemaps } )
		.pipe( sniffStyle( true ) )
		.pipe( gulpIf( isProd, startStringReplace() ) )
		.pipe( lintEditorStyle() )
		.pipe( dest( paths.styles.editorDest, { sourcemaps } ) );
};

export default editorStyles;
