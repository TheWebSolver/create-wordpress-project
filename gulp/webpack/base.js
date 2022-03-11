'use strict';

/**
 * External dependencies
 */
import TerserPlugin from 'terser-webpack-plugin';

/**
 * Internal dependencies
 */
import { isProd } from '../constants';
import { getMainConfig } from '../utils';

/** Prevent webpack to start watching coz gulp is watching. That's it. */
export const watch = false;

/** Prevent minifying when in debug mode. */
export const minimize = ! getMainConfig( isProd ).dev.debug.scripts;

/** Files to test RegExp. */
const test = /\.js$/;

/** Exclude RegExp. */
const exclude = /node_modules/;

/** Javascript files rule. */
export const jsRules = {
	test,
	exclude,
	type: 'javascript/auto',
	use: {
		loader: 'babel-loader',
		options: {
			cacheDirectory: true,

			// Add other options here.
		},
	},
};

/**
 * Webpack minification plugin for javascript files.
 *
 * Especially targeted for gutenberg blocks development.
 */
const minifyBundlerScript = new TerserPlugin( {
	test,
	exclude,
	parallel: true,
	terserOptions: {
		format: {
			comments: false,
		},

		// Support ES6 module minification.
		module: true,

		// Rename (minify) class names (such as React).
		keep_classnames: false,

		// Rename (minify) function names.
		keep_fnames: false,

		// Rename (minify) toplevel class/function names. Remove unused ones.
		toplevel: false,

		// No support for IE8.
		ie8: false,

		/**
		 * Mangle (it means rename (minify)) all variable names for further compression.
		 *
		 * @link https://github.com/terser/terser#mangle-options
		 */
		mangle: {
			keep_classnames: false,
			keep_fnames: false,
			toplevel: true,
			reserved: [], // Pass variable names that shouldn't be renamed.
			properties: false, // Don't rename class properties (...for God's sake!).
		},
	},

	// Don't extract comments.
	extractComments: false,
} );

/**
 * The minimizers.
 *
 * Following minimizer are used by default.
 *
 * @link https://github.com/webpack-contrib/terser-webpack-plugin
 */
export const minimizer = [
	minifyBundlerScript,

	// Add minify plugins for other file types (hint: CSSMinimizerWebpackPlugin for stylesheet).
];

/**
 * List of WordPress blocks dependencies to be excluded while bundling.
 *
 * Use script handle as dependency when registering block editor asset.
 *
 * @link https://webpack.js.org/configuration/externals/
 * @link https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dependency-extraction-webpack-plugin/#webpack
 * */
export const externals = {
	'@wordpress/block-editor': 'wp.blockEditor',
	'@wordpress/blocks': 'wp.blocks',
	'@wordpress/components': 'wp.components',
	'@wordpress/compose': 'wp.compose',
	'@wordpress/element': 'wp.element',
	'@wordpress/hooks': 'wp.hooks',
	'@wordpress/i18n': 'wp.i18n',
	jquery: 'jQuery',
	lodash: 'lodash',
	react: 'React',
	'react-dom': 'ReactDOM',
};
