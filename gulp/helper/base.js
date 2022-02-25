'use strict';

/**
 * External dependencies
 */
import stringReplace from 'gulp-string-replace';
import { pipeline } from 'mississippi';
import fs from 'fs';

/**
 * Internal dependencies
 */
import {
	checkExistence,
	isProd,
	nameFieldDefaults,
	prodMainPath,
	rootPath,
} from '../constants';

import { getMainConfig } from '../utils';

/** The user configuration. */
const config = getMainConfig( isProd );

/** Style and Script source-map option. */
export const sourcemaps = ! isProd;

/** Whether project is a plugin or a theme. */
export const isPlugin = ! config.export.isTheme;

/** The project type. */
export const projectType = isPlugin ? 'plugin' : 'theme';

/**
 * Capitalizes first letter of the string.
 *
 * @param {string} s The string to capitalize.
 * @return {string} The capitalized string.
 */
export const capitalize = ( s ) => ( s && s[ 0 ].toUpperCase() + s.slice( 1 ) ) || '';

/**
 * Gets relative destination to the source file.
 *
 * Depends on the type of project:
 * - if project is a theme, relative path is `themes` directory path.
 * - if project is a plugin, relative path is `plugins` directory path.
 *
 * @param {string} file The file path.
 * @return {string} The relative path to the file.
 */
export const getRelativePath = ( file ) => file.base.replace( file.cwd, prodMainPath );

/**
 * Appends a base file path to a list of files.
 *
 * @param {string|Array<string>} paths The file or files are suffix.
 * @param {string}               root  The root path as prefix
 * @return {string|Array<string>} All paths with root appended.
 */
export const mapPath = ( paths, root ) => {
	// Bail early if filepath is a string.
	if ( ! Array.isArray( paths ) ) {
		return `${ root }/${ paths }`;
	}

	const Paths = [];

	// Loop through all file paths.
	for ( const filePath of paths ) {
		// And push them into output with the base added.
		Paths.push( `${ root }/${ filePath }` );
	}

	return Paths;
};

/** String replace options. */
const replaceOptions = {
	logs: { enabled: config?.export?.log ?? false },
	searchValue: 'regex',
};

/**
 * Replaces string that maps to the core defaults.
 *
 * @param {string} name The name key.
 * @return {internal.Transform} The replaced strings.
 */
const replaceString = ( name ) => {
	return stringReplace(
		// Backslashes must be double escaped for regex.
		nameFieldDefaults[ name ].replace( /\\/g, '\\\\' ),
		config.core[ name ],
		replaceOptions
	);
};

/**
 * Gets string replacement process to pass to pipeline.
 *
 * @return {Array} List of tasks.
 */
export const startStringReplace = () => {
	const Tasks = Object
		.keys( nameFieldDefaults )
		.map( replaceString );

	// Send ingle stream containing all the string replacement tasks.
	return pipeline.obj( Tasks );
};

/**
 * Gets list of project files present in the root.
 *
 * @return {string[]} The list of project files in root path.
 */
export const projectFilesInRoot = () => {
	return fs
		.readdirSync( rootPath )
		.filter( ( file ) => checkExistence( `${ rootPath }/${ file }` ) );
};

/**
 * Gets the filtered files in project root and in the given list.
 *
 * @param {string[]} list The list of source files.
 * @return {string[]} The filtered files.
 */
export const filterFilesList = ( list ) => {
	const filteredFiles = [];

	list.forEach( ( fileName ) => {
		const targetFile = `${ rootPath }/${ fileName }`;
		if ( projectFilesInRoot().includes( targetFile ) ) {
			filteredFiles.push( targetFile );
		}
	} );

	return filteredFiles;
};
