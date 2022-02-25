'use strict';

/**
 * Internal dependencies
 */
import {
	themeFileExist,
	pluginMainFileExists,
} from './log';

import {
	newFilePath,
	oldFilePath,
} from '../bootstrap/plugin';

import {
	paths,
	checkExistence,
} from '../constants';

import { isPlugin } from '../helper/base';

/**
 * Verifies if production main file exists.
 *
 * if project is a plugin:
 * - Log message about new file renamed with config.core.slug.
 * - Log message about old dev file is deleted.
 *
 * If project is a theme:
 * - Log message about new required theme files exist.
 *
 * @return {Promise<resolve>} The resolved promise.
 */
export const verifyMainFile = () => {
	// Notify about theme files and exit.
	if ( ! isPlugin ) {
		paths.theme.files.forEach( ( file ) => themeFileExist( file ) );

		return Promise.resolve();
	}

	const isCreated = checkExistence( newFilePath ),
		isDeleted = ! checkExistence( oldFilePath );

	// Log message whether plugin main production file is created.
	pluginMainFileExists( newFilePath, false, isCreated, false );

	// Log message whether plugin main development file is deleted.
	pluginMainFileExists( oldFilePath, true, isDeleted, true );

	return Promise.resolve();
};

/**
 * Resolves any conflict when update is called.
 *
 * @return {Promise<resolve>} The resolved promise.
 */
export const skipMainFiles = () => {
	return Promise.resolve( `Theme does not need any updates.` );
};
