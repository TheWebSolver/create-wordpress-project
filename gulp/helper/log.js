'use strict';

/**
 * External dependencies
 */
import log from 'fancy-log';
import path from 'path';
import notify from 'gulp-notify';
import gulpPlumber from 'gulp-plumber';

/**
 * Internal dependencies
 */
import {
	bold,
	success,
	highlight,
	underline,
	error,
	italic,
	notice,
} from './text';

import {
	isProd,
	prodMainPath,
	rootPath,
	nameFieldDefaults,
	checkExistence,
} from '../constants';

import {
	capitalize,
	getRelativePath,
	isPlugin,
	projectType,
} from './base';

import { getMainConfig } from '../utils';

/**
 * The configuration JSON data.
 */
const config = getMainConfig( isProd );

/** The fancy logger. */
export const logger = log;

/** Success tag. */
export const successTag = bold( 'Success:' );

/** Failed tag. */
export const failTag = bold( 'Failed:' );

/** Error tag. */
export const errorTag = bold( 'Error:' );

/**
 * Sends message.
 *
 * @param {string}   message The message to log or return.
 * @param {boolean}  doLog   Whether to log immediately or not.
 * @param {function} done    Function to call when async processes finish.
 * @return {string} The message. Async handler if it is given.
 */
const sendMsg = ( message, doLog, done ) => {
	if ( doLog && config.export.log ) {
		log( message );
	}

	// Flag that async function is finished, if given. Else send msg.
	return done ? done() : message;
};

/**
 * Logs on stream.
 *
 * @param {Object} options The notification options.
 * @return {string} The message.
 */
export const logStream = ( options ) => {
	const notification = {
		message: options?.message ?? 'Started the process.',
	};

	if ( options?.title ) {
		notification.title = options.title;
	}

	return notify( notification );
};

/**
 * Logs info when there are errors in the current pipeline.
 *
 * @param {Object} options The failed option.
 * @return {NodeJS.ReadWriteStream} The stream.
 */
export const logStreamFail = ( options ) => {
	const logOptions = {
		message: '<%= options.message %>',
	};

	if ( options?.title ) {
		logOptions.title = options.title;
	}

	return gulpPlumber( {
		errorHandler: logStream( logOptions ),
	} );
};

/**
 * Validates if required core names are successfully set.
 *
 * @param {string}   coreName The field name to be replaced.
 * @param {boolean}  doLog    Whether to log the message or not.
 * @param {function} done     Function to call when async processes finish.
 * @return {string} The message.
 */
export const isRequiredConfig = ( coreName, doLog, done ) => {
	const defaultName = nameFieldDefaults[ coreName ],
		requiredName = config.core[ coreName ];

	// Do not proceed any further if names are same.
	if ( defaultName === requiredName ) {
		throw new Error( error( `${ errorTag } The project's ${ highlight( coreName ) } must be different than the default value ${ highlight( nameFieldDefaults[ coreName ] ) }.` ) );
	}

	const msg = success( `${ successTag } "${ highlight( coreName ) }" has been set: "${ bold( highlight( requiredName ) ) }".` );

	return sendMsg( msg, doLog, done );
};

/**
 * Shows log message whether SSL is valid.
 *
 * @param {boolean} isSuccess Whether deletion is success or not.
 * @param {string}  sslWhat   Whether it is a `certificate` or a `key`.
 * @param {string}  filePath  The `sslWhat` file path.
 * @param {boolean} doLog     Whether to log the message or not.
 * @return {string} The message.
 */
export const sslFound = ( isSuccess, sslWhat, filePath, doLog = true ) => {
	const msg = isSuccess ?
		notice( `${ successTag } Using the SSL ${ sslWhat } "${ bold( filePath ) }` ) :
		notice( `${ failTag } No SSL ${ sslWhat } found, HTTPS will "${ highlight( bold( 'not' ) ) } be enabled.` );

	return sendMsg( msg, doLog );
};

/**
 * Shows log message whether HTTPS is enabled.
 *
 * @param {boolean} doLog Whether to log the message or not.
 * @return {string} The message.
 */
export const httpsEnabled = ( doLog = true ) => {
	const msg = success( `${ successTag } HTTPS is ${ bold( 'on' ) }.` );

	return sendMsg( msg, doLog );
};

/**
 * Shows log message after custom certificate is generated.
 *
 * @param {boolean} doLog Whether to log the message or not.
 * @return {string} The message.
 */
export const sslGenerated = ( doLog = true ) => {
	const msg = success( `${ successTag } Custom SSL key and certificate generated successfully!` );

	return sendMsg( msg, doLog );
};

/**
 * Sets info that production has been started.
 *
 * @param {boolean}  doLog Whether to log the message or not.
 * @param {function} done  Function to call when async processes finish.
 * @return {string} The message.
 */
export const productionStarted = ( doLog = true, done ) => {
	const msg = success( `${ successTag } Started exporting "${ highlight( projectType.toUpperCase() ) }" project files to the production directory: "${ highlight( underline( prodMainPath ) ) }".` );

	return sendMsg( msg, doLog, done );
};

/**
 * Shows fail message if exporting is not called on node production env.
 */
export const maybeExportFail = () => {
	// Bail if is in production run.
	if ( isProd ) {
		return;
	}

	sendMsg(
		error( `${ errorTag } The bundle task may only be called from the production environment. Set ${ bold( underline( 'NODE_ENV' ) ) } to production and try again.` ),
		true
	);

	process.exit( 1 );
};

/**
 * Shows fail message if exporting path is same as the dev path.
 */
export const maybeSamePathFail = () => {
	// Bail if user's own path is defined.
	if ( path.basename( prodMainPath ) !== path.basename( rootPath ) ) {
		return;
	}

	sendMsg(
		error( `${ errorTag } The slug cannot be same as the development directory: ${ bold( highlight( path.basename( prodMainPath ) ) ) }.` ),
		true
	);

	process.exit( 1 );
};

/**
 * Shows log message that current project is not configured properly.
 *
 * @param {string}  fileBaseName The current filename in the pipeline.
 * @param {boolean} doLog        Whether to log the message or not.
 * @return {string} The message.
 */
export const wrongProjectType = ( fileBaseName, doLog = true ) => {
	const type = isPlugin ? 'theme' : 'plugin',
		configFile = `${ rootPath }/config/config.user.json`,
		toConfig = `{ export: { isTheme: ${ isPlugin ? 'true' : 'false' } } }`,
		msg = error( `${ errorTag } Current project is not set to "${ bold( type ) }".\n
			- Skipping extraction of file: "${ bold( fileBaseName ) }".\n
			- Update config to "${ bold( italic( toConfig ) ) }" in file: ${ highlight( underline( configFile ) ) }.
		` );

	return sendMsg( msg, doLog );
};

/**
 * Shows log message during project file extraction from bin to root directory.
 *
 * @param {string}  fileBaseName The current filename in the pipeline.
 * @param {boolean} isSuccess    Whether extraction is successful or not.
 * @param {boolean} override     Whether to override existing file or not.
 * @param {boolean} doLog        Whether to log the message or not.
 * @return {string} The message.
 */
export const projectBootstrapped = ( fileBaseName, isSuccess = true, override = false, doLog = true ) => {
	const filePath = `${ rootPath }/${ fileBaseName }`,
		currentType = capitalize( projectType );

	let msg = success( `${ successTag } ${ currentType } file "${ bold( fileBaseName ) }" bootstrapped: "${ filePath }"` );

	if ( ! isSuccess ) {
		const func = `.pipe( bootstrap${ currentType }( true ) )`,
			location = `${ rootPath }/gulp/bootstrap/${ projectType }.js`,
			overrideMsg = ! override ?
				`Did you mean to override the existing file? If so:\n
					- Set "override" param like so: ${ bold( italic( func ) ) }\n
					- Function is on file ${ underline( location ) }\n` :
				'File contents have been overriden if already modified.';

		msg = error( `${ bold( 'INGORE:' ) } ${ currentType } file "${ bold( fileBaseName ) }" already exists: ${ underline( highlight( filePath ) ) }\n
			${ overrideMsg }
		` );
	}

	return sendMsg( msg, doLog );
};

/**
 * Shows log message whether or not plugin main file is deleted in production.
 *
 * @param {string}  filePath   The main plugin file path.
 * @param {boolean} isDel      Whether deleting file or not.
 * @param {boolean} isSuccess  Whether deletion is success or not.
 * @param {boolean} isDev      Whether check is for dev or prod file.
 * @param {boolean} doLog      Whether to log the message or not.
 * @return {string} The message.
 */
export const pluginMainFileExists = ( filePath, isDel = false, isSuccess = true, isDev = true, doLog = true ) => {
	const Did = bold( isDel ? 'Deleted' : 'Created' ),
		Perform = isDel ? 'delete' : 'create',
		Which = highlight( isDev ? 'development' : 'production' ),
		FilePath = underline( highlight( filePath ) ),
		msg = isSuccess ?
			success( `${ successTag } ${ Did } plugin main ${ Which } file: "${ FilePath }".` ) :
			error( `${ failTag } Could not ${ Perform } plugin main ${ Which } file: ${ FilePath }.` );

	return sendMsg( msg, doLog );
};

/**
 * Shows log message whether or not theme files exist.
 *
 * @param {string}  fileName The main plugin file path.
 * @param {boolean} doLog    Whether to log the message or not.
 * @return {string} The message.
 */
export const themeFileExist = ( fileName, doLog = true ) => {
	const FilePath = `${ prodMainPath }/${ fileName }`,
		Which = highlight( fileName ),
		FilePathLog = underline( highlight( `${ prodMainPath }/${ fileName }` ) ),
		msg = checkExistence( FilePath ) ?
			success( `${ successTag } Created theme ${ Which } production file: "${ FilePathLog }"` ) :
			error( `${ errorTag } Could not create theme ${ Which } production file: "${ FilePathLog }"` );

	return sendMsg( msg, doLog );
};

/**
 * Shows log message after zip file has been generated.
 *
 * @param {boolean}  doLog Whether to log the message or not.
 * @param {function} done  Function to call when async processes finish.
 * @return {string} The message.
 */
export const afterCompress = ( doLog, done ) => {
	const zip = `${ config.core.slug }.zip`,
		msg = success( `${ successTag } Finished creating "${ highlight( zip ) }" file inside the directory: "${ highlight( underline( getRelativePath ) ) }"` );

	return sendMsg( msg, doLog, done );
};
