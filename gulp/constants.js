'use strict';

/**
 * External dependencies
 */
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import {
	bold,
	error,
	highlight,
	italic,
} from './helper/text';

import { getMainConfig } from './utils';

/**
 * Checks file existence.
 *
 * @param {string} filePath The path to check for.
 * @return {boolean} True if exists, false otherwise.
 */
export const checkExistence = ( filePath ) => {
	return fs.existsSync( filePath );
};

/**
 * Root path is where npm run commands happen.
 */
export const rootPath = process.cwd();

/**
 * Path to gulp files (this file is located inside it).
 */
export const gulpPath = `${ rootPath }/gulp`;

/**
 * Path to gulp test.
 */
export const gulpTestPath = `${ rootPath }/gulp/tests`;

/**
 * Determine whether current npm command is for development or production.
 */
export const isProd = ( process.env.NODE_ENV === 'production' );

/**
 * Get the final configuration of the project.
 */
const config = getMainConfig( isProd );

/**
 * Directory for the production project (used with config core slug).
 */
export const prodMainPath = path.normalize( `${ rootPath }/../${ config.core.slug }` );

/**
 * Directory for the project's production language path.
 */
export const langPath = `${ prodMainPath }/languages`;

/**
 * Directory for assets (CSS, JS, images).
 */
export const assetsDir = `${ rootPath }/assets`;

/**
 * Directory for assets (CSS, JS, images) in production.
 */
export const prodAssetsDir = `${ prodMainPath }/assets`;

/** Directory for pre-bundled scripts. */
export const bundlerSrc = `${ assetsDir }/js/src/bundler`;

/** Directory for post-bundled scripts. */
export const bundlerDest = `${ assetsDir }/js/dist`;

/**
 * Directory for phpcs form composer installed globally.
 */
export const phpcsGlobalPath = config?.dev?.phpcsPath ?? '';

/**
 * Directory for phpcs from composer installed locally.
 */
export const phpcsLocalPath = `${ rootPath }/vendor/bin/phpcs`;

/**
 * PHPCS Coding Standards.
 *
 * phpcs path must be defined either from global scope
 * or local scope inside composer vendor bin path.
 */
let phpcsBinPath = '';

if ( fs.existsSync( phpcsGlobalPath ) ) {
	phpcsBinPath = phpcsGlobalPath;
}

if ( fs.existsSync( phpcsLocalPath ) ) {
	phpcsBinPath = phpcsLocalPath;
}

// Must have a path to phpcs.
if ( ! phpcsBinPath ) {
	const Vendor = `Install Composer's vendor "${ bold( 'squizlabs/php_codesniffer' ) }"`,
		NoPHPCSPathMsg = error( `${ bold( 'FAILED:' ) } PHPCS path not found for code sniffing and implementing ${ bold( highlight( 'WordPress Coding Standard' ) ) }. Use any one of below options and try again.\n

		${ bold( 'OPTION 1:' ) } ${ Vendor } ${ bold( italic( 'GLOBALLY' ) ) } and set phpcs path like this: "${ highlight( '{"dev":{"phpcsPath":"path/to/vendor/bin/phpcs"}}' ) }" in file: ${ highlight( rootPath.concat( '/config/config.user.json' ) ) }".\n

		${ bold( 'OPTION 2:' ) } ${ Vendor } ${ bold( italic( 'LOCALLY' ) ) } and make sure phpcs path exists: "${ highlight( rootPath.concat( '/vendor/bin/phpcs' ) ) }".\n`

		);

	throw new Error( NoPHPCSPathMsg );
}

/**
 * Define PHPCS options for use during development.
 */
export const PHPCSOptions = {
	/**
	 * The path to phpcs file in global scope.
	 */
	bin: phpcsBinPath,

	/**
	 * Defined PHPCS standard.
	 *
	 * Use standard name such as "WordPress" or use xml file (already included).
	 * It is recommended to check the modifications to the default WordPress rules.
	 * in the below file located at the root directory.
	 */
	standard: `${ rootPath }/phpcs.xml.dist`,

	/**
	 * Warning severity.
	 */
	warningSeverity: 0,
};

/**
 * Project config name fields and their defaults.
 */
export const nameFieldDefaults = {
	author: 'Shesh Ghimire',
	PHPNamespace: 'TheWebSolver\\Codegarage',
	slug: 'tws-codegarage',
	name: 'TheWebSolver Codegarage',
	underscoreCase: 'tws_codegarage',
	constant: 'TWS_CODEGARAGE',
	camelCase: 'twsCodeGarage',
	camelCaseVar: 'twsCodeGarage',
};

// Only whitelabel if config has set any value.
if (
	config.core.whiteLabel &&
	typeof config.core.whiteLabel === 'string' &&
	config.core.whiteLabel !== ''
) {
	nameFieldDefaults.whiteLabel = 'tws-whitelabel';
}

/**
 * Project paths.
 */
const paths = {
	assetsDir,
	browserSync: {
		dir: `${ rootPath }/BrowserSync`,
		cert: `${ rootPath }/BrowserSync/wp-rig-browser-sync-cert.crt`,
		caCert: `${ rootPath }/BrowserSync/wp-rig-browser-sync-root-cert.crt`,
		key: `${ rootPath }/BrowserSync/wp-rig-browser-sync-key.key`,
	},
	config: {
		mainConfig: `${ rootPath }/config/config.js`,
	},
	php: {
		src: [
			// Include every PHP files.
			`${ rootPath }/**/*.php`,

			// Exclude files inside these directories.
			`!${ rootPath }/bin/**/*.*`,
			`!${ rootPath }/tests/**/*.*`,
			`!${ rootPath }/vendor/**/*.*`,
			`!${ rootPath }/node_modules/**/*.*`,
		],
		dest: `${ rootPath }/`,
	},
	theme: {
		files: [
			'functions.php',
			'index.php',
			'style.css',
		],
		php: `${ rootPath }/bin/theme/**/*.php`,
		style: `${ rootPath }/bin/theme/**/style.css`,
	},
	plugin: {
		php: `${ rootPath }/bin/plugin/tws-codegarage.php`,
	},
	styles: {
		editorSrc: [
			`${ assetsDir }/css/src/editor/**/*.css`,
			// Ignore partial files.
			`!${ assetsDir }/css/src/**/_*.css`,
		],
		editorSrcDir: `${ assetsDir }/css/src/editor`,
		editorDest: `${ assetsDir }/css/editor`,
		src: [
			`${ assetsDir }/css/src/**/*.css`,
			// Ignore partial files.
			`!${ assetsDir }/css/src/**/_*.css`,
			// Ignore editor source css.
			`!${ assetsDir }/css/src/editor/**/*.css`,
		],
		srcDir: `${ assetsDir }/css/src`,
		dest: `${ assetsDir }/css`,
	},
	scripts: {
		src: [
			`${ assetsDir }/js/src/**/*.js`,

			// Ignore partial files.
			`!${ assetsDir }/js/src/**/_*.js`,

			// Ignore bundled files.
			`!${ bundlerSrc }/**/*.js`,
		],
		srcDir: `${ assetsDir }/js/src`,
		dest: `${ assetsDir }/js`,

		bundlerSrc: `${ bundlerSrc }/**/*.js`,
		bundlerDest,
	},
	images: {
		src: `${ assetsDir }/images/src/**/*.{jpg,JPG,png,svg,gif,GIF}`,
		dest: `${ assetsDir }/images/`,
	},
	export: {
		src: [],
		stringReplaceSrc: [
			`${ rootPath }/languages/*.po`,
		],
	},
	languages: {
		src: [
			`${ rootPath }/**/*.php`,
			`!${ rootPath }/optional/**/*.*`,
			`!${ rootPath }/tests/**/*.*`,
			`!${ rootPath }/vendor/**/*.*`,
		],
		dest: `${ rootPath }/languages/${ nameFieldDefaults.slug }.pot`,
	},
};

// If current project is theme, add style.css file for string replacement.
if ( config.export.isTheme ) {
	paths.export.stringReplaceSrc.push( `${ rootPath }/style.css` );
}

if ( config.export.isTheme ) {
	// Exclude plugin main file, if exists.
	paths.php.src.push( `!${ rootPath }/**/${ nameFieldDefaults.slug }.php` );
} else {
	// Exclude all theme files, if exist.
	paths.theme.files.forEach( ( file ) => paths.php.src.push( `!${ rootPath }/${ file }` ) );
}

// Add rootPath to filesToCopy and extraFiles.
const extraFiles = config?.export?.extraFiles ?? [];
const filesToCopy = config?.export?.filesToCopy ?? [];

for ( const filePath of filesToCopy.concat( extraFiles ) ) {
	// Add the files to export src.
	paths.export.src.push( `${ rootPath }/${ filePath }` );
}

// Override paths for production.
if ( isProd ) {
	paths.php.dest = `${ prodMainPath }/`;
	paths.styles.dest = `${ prodAssetsDir }/css/`;
	paths.styles.editorDest = `${ prodAssetsDir }/css/editor/`;
	paths.scripts.dest = `${ prodAssetsDir }/js/`;
	paths.images.dest = `${ prodAssetsDir }/images/`;
	paths.languages = {
		src: `${ prodMainPath }/**/*.php`,
		dest: `${ prodMainPath }/languages/${ config.core.slug }.pot`,
	};

	paths.scripts.bundlerDest = `${ prodAssetsDir }/js/dist`;
}

export { paths };
