/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import {
	isProd,
	bundlerSrc,
	bundlerDest,
} from './gulp/constants';

import {
	watch,
	jsRules,
	minimize,
	minimizer,
	externals,
} from './gulp/webpack/base';

/**
 * The entry path.
 *
 * The bundler entry path must resolve to `Assets/js/src/bundler`
 * so when exporting the project, all bundled files are exported as well.
 *
 * If different directory is to be set, change value for `bundlerSrc`
 * present inside `constants.js` instead. That way, all path mapped using
 * that constant gets propogated accordingly.
 */
const entryPath = path.resolve( bundlerSrc );

/**
 * The output path.
 *
 * The bundler destination path must resolve to `Assets/js/dist`
 * so when exporting the project, all bundled files are exported as well.
 *
 * If different directory is to be set, change value for `bundlerDest`
 * present inside `constants.js` instead. That way, all path mapped using
 * that constant gets propogated accordingly.
 */
 const destPath = path.resolve( bundlerDest );

/**
 * The entry files.
 *
 * If entry has no data, webpack won't run at all.
 * Use const `entryPath` when adding entry file path.
 *
 * @see bundleScripts()
 * @file `gulp/webpack/webpack.js`.
 * @link https://webpack.js.org/concepts/entry-points/
 */
const entry = {};

/**
 * The output files.
 *
 * Since, bundler is watched (not by webpack) by the gulp watch,
 *  we are directly saving final bundled file with a `*.min.js`
 * to comply with how other script files are served.
 *
 * @link https://webpack.js.org/concepts/output/
 */
const output = {
	filename: '[name].min.js',
	path: destPath,
};

/**
 * The modules to use.
 *
 * @link https://webpack.js.org/configuration/module/
 */
const module = {
	rules: [
		jsRules,

		// Add rules for other file types (hint: css, image).
	],
};

/**
 * Optimization options.
 *
 * @link https://webpack.js.org/configuration/optimization/#optimizationminimizer
 */
const optimization = {
	minimize,
	minimizer,

	// Any other optimization codes here.
};

/**
 * Devtool (sourcemap) option.
 *
 * Don't generate sourcemap on production, otherwise inline sourcemap.
 * This is to comply with how other script files are served.
 *
 * @link https://webpack.js.org/configuration/devtool/
 */
const devtool = isProd ? false : 'inline-source-map';

/**
 * The plugins to use.
 *
 * @link https://webpack.js.org/concepts/plugins/#configuration
 */
const plugins = [
	// Any plugins to use here.
];

/**
 * Current environment.
 *
 * https://webpack.js.org/configuration/mode/
 */
const mode = isProd ? 'production' : 'development';

/**
 * Webpack Configuration for gulp task.
 *
 * https://webpack.js.org/configuration/
 */
export default {
	watch,
	entry,
	output,
	module,
	plugins,
	externals,
	optimization,
	devtool,
	mode,
};
