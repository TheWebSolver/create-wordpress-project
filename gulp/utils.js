'use strict';

/**
 * External dependencies
 */
import gulpPlumber from 'gulp-plumber';
import importFresh from 'import-fresh';
import notify from 'gulp-notify';

/**
 * Internal dependencies
 */
import { rootPath } from './constants';

/**
 * Gets default configuration.
 *
 * @return {JSON} The config as json.
 */
export const getDefaultConfig = () => require( `${ rootPath }/config/config.default.json` );

/**
 * Gets final configuration merged from default and custom.
 *
 * @param {boolean} uncached Whether to get an uncached version of the configuration.
 *                           Defaults to false.
 * @return {Object} Main configuration data.
 */
export const getMainConfig = ( uncached = false ) => {
	const configPath = `${ process.cwd() }/config/config.js`,
		customConfig = uncached ? importFresh( configPath ) : require( configPath );

	// Define slug value for the current project.
	if ( ! customConfig.core.slug ) {
		customConfig.core.slug = customConfig.core.name
			.toLowerCase()
			.replace( /[\s_]+/g, '-' ).replace( /[^a-z0-9-]+/g, '' );
	}

	// Define underscore value for the current project.
	if ( ! customConfig.core.underscoreCase ) {
		customConfig.core.underscoreCase = customConfig.core.slug
			.replace( /-/g, '_' );
	}

	// Define constant value for the current project.
	if ( ! customConfig.core.constant ) {
		customConfig.core.constant = customConfig.core.underscoreCase.toUpperCase();
	}

	// Define camel case value for the current project.
	if ( ! customConfig.core.camelCase ) {
		customConfig.core.camelCase = customConfig.core.slug
			.split( '-' )
			.map( ( part ) => part[ 0 ].toUpperCase() + part.substring( 1 ) )
			.join( '' );
	}

	if ( ! customConfig.core.camelCaseVar ) {
		customConfig.core.camelCaseVar = customConfig.core.camelCase[ 0 ].toLowerCase() + customConfig.core.camelCase.substring( 1 );
	}

	// Define whether current project is a theme (not a plugin).
	if ( ! customConfig.export.isTheme ) {
		customConfig.export.isTheme = false;
	}

	return customConfig;
};

export const logError = ( errorTitle = 'gulp' ) => {
	return gulpPlumber( {
		errorHandler: notify.onError( {
			title: errorTitle,
			message: '<%= error.message %>',
		} ),
	} );
};

/**
 * Makes backslashes to forward slashes.
 *
 * @param {string} path The path to be converted.
 * @return {string} The converted path.
 */
export const backslashToForwardSlash = ( path ) => {
	const replaceFn = ( ( p ) => p.replace( /\\/g, '/' ) );
	if ( Array.isArray( path ) ) {
		const paths = [];

		path.forEach( ( p ) => paths.push( replaceFn( p ) ) );

		return paths;
	}
	return replaceFn( path );
};

/**
 * Determines if a config value is defined.
 *
 * @param {string} configValueLocation a config value path to search for, e.g. 'config.core.slug'
 * @return {boolean} Whether the config value is defined
 */
export const configValueDefined = ( configValueLocation ) => {
	// We won't find anything if the location to search is empty.
	if ( 0 === configValueLocation.length ) {
		return false;
	}

	// Get a copy of the config
	let config = getMainConfig();

	// Turn the value location given into an array
	const configValueLocationArray = configValueLocation.split( '.' );

	// Remove config from the array if present
	if ( 'config' === configValueLocationArray[ 0 ] ) {
		configValueLocationArray.shift();
	}

	// Loop through the config value paths passed
	for ( const currentValueLocation of configValueLocationArray ) {
		// Check if there is a match in the current object level.
		if ( ! Object.prototype.hasOwnProperty.call( config, currentValueLocation ) ) {
			// Return false if no match
			return false;
		}

		// Move the config object to the next level
		config = config[ currentValueLocation ];
	}

	// If we've made it this far there is a match for the given config value path.
	return true;
};

/**
 * Appends a base file path to a list of files.
 *
 * @param {string|Array} filePaths the file or files to append the base path to
 * @param {string} basePath the base path to append
 * @return {string|Array} file paths with base path appended
 */
export function appendBaseToFilePathArray( filePaths, basePath ) {
	if ( ! Array.isArray( filePaths ) ) {
		return `${ basePath }/${ filePaths }`;
	}

	const output = [];

	// Loop through all file paths
	for ( const filePath of filePaths ) {
		// And push them into output with the base added
		output.push( `${ basePath }/${ filePath }` );
	}

	return output;
}
