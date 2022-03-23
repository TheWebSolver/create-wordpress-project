'use strict';

/**
 * External dependencies
 */
import {
	src,
	dest,
} from 'gulp';

import newer from 'gulp-newer';
import phpcs from 'gulp-phpcs';
import postcss from 'gulp-postcss';
import gulpIf from 'gulp-if';
import tabify from 'gulp-tabify';
import rename from 'gulp-rename';
import postcssPresetEnv from 'postcss-preset-env';
import AtImport from 'postcss-import';
import cssnano from 'cssnano';
import stylelint from 'stylelint';
import reporter from 'postcss-reporter';
import calc from 'postcss-calc';
import { pipeline } from 'mississippi';

/**
 * Internal dependencies
 */
import {
	paths,
	isProd,
	PHPCSOptions,
} from './constants';

import {
	getMainConfig,
	logError,
} from './utils';

import {
	mapPath,
	sourcemaps,
	startStringReplace,
} from './helper/base';

import { server } from './browserSync';

/** The user configuration. */
const config = getMainConfig( isProd );

/**
 * Returns a single stream code sniffing using WPCS.
 *
 * Logs all rules that that code violates.
 *
 * @param {boolean} editor Whether sniff for editor style.
 * @return {Object} Pumpify pipeline object.
 * @link https://github.com/JustBlackBird/gulp-phpcs
 */
export const sniffStyle = ( editor = false ) => {
	return pipeline.obj( [
		logError( editor ? 'CSS' : 'Editor CSS' ),
		newer( {
			dest: paths.styles.dest,
			extra: [ paths.config.mainConfig ],
		} ),
		phpcs( {
			bin: PHPCSOptions.bin,
			standard: 'WordPress',
			warningSeverity: 0,
		} ),
		phpcs.reporter( 'log' ),
	] );
};

/** Post CSS Preset Environment Import. */
export const getDevStyleImport = config?.dev?.styles?.importFrom ?
	mapPath( config.dev.styles.importFrom, paths.styles.srcDir ) :
	[];

/**
 * Gets Post CSS Preset Environment Features.
 *
 * @param {boolean} custom Whether custom properties to be preserved.
 *                         This must be false for the editor.
 * @return {Object<Object|boolean>} The features as an object.
 */
export const getDevStyleFeatures = ( custom ) => {
	return {
		'custom-media-queries': { preserve: false },
		'custom-properties': { preserve: custom },
		'nesting-rules': true,
	};
};

/**
 * Gets Post CSS Preset Environment.
 *
 * @param {boolean} editor         Whether env for style editor.
 * @param {boolean} preserveCustom Set preserve custom properties.
 * @return {Object} The environment option.
 * @link https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
 */
export const getPresetEnv = ( editor = false, preserveCustom = true ) => {
	const preset = {
		/**
		 * By default, `_custom-media.css` is imported.
		 *
		 * @link https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#importfrom
		 */
		importFrom: getDevStyleImport,

		/**
		 * Features to implement.
		 *
		 * 0 => experimental, 4 => stable.
		 * For specific polyfills, see `features` property.
		 */
		stage: config?.dev?.styles?.stage ?? 3,

		/**
		 * By default, following features are enabled.
		 *
		 * - `custom-media-queries`
		 * - `custom-properties`
		 * - `nesting-rules`
		 *
		 * @link https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#features
		 * @link https://preset-env.cssdb.org/features/
		 */
		features: config?.dev?.styles?.features ?? getDevStyleFeatures( preserveCustom ),

		/**
		 * By default, disabled grid support for IE 10-11.
		 *
		 * Learn more from following links:
		 *
		 * @link https://github.com/postcss/autoprefixer#options
		 * @link https://github.com/postcss/autoprefixer#does-autoprefixer-polyfill-grid-layout-for-ie.
		 */
		autoprefixer: config?.dev?.styles?.autoprefixer ?? {},
	};

	if ( editor ) {
		/**
		 * For editor stylesheet, remove polyfilled CSS by other plugins.
		 *
		 * For eg: by default, remove for `editor-styles.css`.
		 *
		 * @link https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#preserve
		 */
		preset.preserve = false;
	}

	return preset;
};

/**
 * PostCSS At Import property.
 *
 * Makes sure custom import feature for CSS to work.
 */
export const getPostCSSAtImport = AtImport( {
	path: [ paths.styles.srcDir ],
	plugins: [ stylelint() ],
} );

/**
 * Processes styles.
 *
 * - Apply stylelint.
 * - PostCSS preset env (imports stylesheet files).
 * - Minify CSS.
 *
 * @return {Object} Pumpify pipeline object.
 */
export const processStyle = () => {
	const postcssPlugins = [
		stylelint(),
		postcssPresetEnv( getPresetEnv() ),
		calc( { preserve: false } ),
		cssnano(),
	];

	// Skip minifying files during development and debug is enabled.
	if ( config.dev.debug.styles && ! isProd ) {
		postcssPlugins.pop(); // Unset cssnano().
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
 * Lints CSS via PostCSS and CSSNext.
 *
 * Includes Autoprefixer by default.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS stream.
 */
const styles = () => {
	return src( paths.styles.src, { sourcemaps } )
		.pipe( sniffStyle() )
		.pipe( processStyle() )
		.pipe( gulpIf( isProd, startStringReplace() ) )
		.pipe( dest( paths.styles.dest, { sourcemaps } ) );
};

export default styles;
