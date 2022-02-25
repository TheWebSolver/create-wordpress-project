'use strict';

/**
 * Internal dependencies
 */
import {
	copyPluginMainFile,
	updateMainFile,
} from '../bootstrap/plugin';

import { isPlugin } from '../helper/base';
import { copyThemeMainFiles } from '../bootstrap/theme';
import { skipMainFiles } from '../helper/promise';

/**
 * Bootstraps project by its type.
 *
 * @return {NodeJS.ReadWriteStream} NodeJS Stream.
 */
const copyProjectFiles = () => {
	return isPlugin ? copyPluginMainFile() : copyThemeMainFiles();
};

export default copyProjectFiles;

/**
 * Updates project main files are necessary.
 *
 * @return {NodeJS.ReadWriteStream|Promise<resolve>} NodeJS stream for plugin, resolved promise for theme.
 */
export const updateProjectMainFiles = () => {
	return isPlugin ? updateMainFile() : skipMainFiles();
};
