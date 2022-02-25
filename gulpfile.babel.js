'use strict';

/**
 * External dependencies
 */
import {
	parallel,
	series,
} from 'gulp';

/**
 * Internal dependencies
 */
import {
	cleanCSS,
	cleanJS,
} from './gulp/clean';


import { copyPluginMainFile } from './gulp/bootstrap/plugin';
import { copyThemeMainFiles } from './gulp/bootstrap/theme';
import generateCert from './gulp/generateCert';
import images from './gulp/images';
import php from './gulp/php';
import { serve } from './gulp/browserSync';
import scripts from './gulp/scripts';
import styles from './gulp/styles';
import editorStyles from './gulp/editorStyles';
import translate from './gulp/translate';
import watch from './gulp/watch';
import start from './gulp/export/start';
import stringReplace from './gulp/export/stringReplace';
import compress from './gulp/export/compress';
import { verifyMainFile } from './gulp/helper/promise';
import copyProjectFiles, { updateProjectMainFiles } from './gulp/export/project';

/**
 * Export for bootstrapping project by its type before developing project.
 */
 export const bootstrapProject = copyProjectFiles;

/**
 * Map out the sequence of events on first load and make it the default task
 */
export const developProject = series(
	cleanCSS,
	cleanJS,
	parallel(
		php,
		images,
		series(
			styles,
			editorStyles
		),
		scripts
	),
	serve,
	watch
);

export default developProject;

/**
 * Build project for development without BrowserSync or watching.
 */
export const buildDev = parallel(
	php,
	images,
	series(
		styles,
		editorStyles
	),
	scripts,
	translate
);

/**
 * Export project for distribution.
 */
export const exportProject = series(
	start,
	parallel(
		php,
		scripts,
		series(
			styles,
			editorStyles
		),
		images
	),
	translate,
	stringReplace,
	updateProjectMainFiles,
	verifyMainFile,
	compress
);

/**
 * Export for bootstrapping theme before build process.
 */
export const bootstrapThemeProject = copyThemeMainFiles;

/**
 * Export for bootstrapping plugin before build process.
 */
export const bootstrapPluginProject = copyPluginMainFile;

/**
 * Export all imported functions as tasks.
 */
export {
	generateCert,
	images,
	php,
	scripts,
	styles,
	editorStyles,
	translate,
	watch,
	cleanCSS,
	cleanJS,
};
