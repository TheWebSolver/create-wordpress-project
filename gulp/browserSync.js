'use strict';
/**
 * Conditionally set up BrowserSync.
 *
 * Only run BrowserSync if config.browserSync.live = true.
 */

/**
 * External dependencies
 */
import browserSync from 'browser-sync';

/**
 * Internal dependencies
 */
import {
	paths,
	checkExistence,
} from './constants';

import {
	sslFound,
	httpsEnabled,
} from './helper/log';

import { getMainConfig } from './utils';

/** Creates a BrowserSync instance. */
export const server = browserSync.create();

/** The user configuration. */
const config = getMainConfig();

/**
 * Gets SSL certificate or key file path.
 *
 * @param {string} type The data to get.
 * @return {string} The file path.
 */
const getSSLFile = ( type ) => config?.dev?.browserSync[ type ] ?? paths.browserSync.cert;

/**
 * Initializes the BrowserSync server conditionally.
 *
 * @param {function} done Function to call when async processes finish.
 */
export const serve = ( done ) => {
	// Bail early if not serving via BrowserSync.
	if ( ! config.dev.browserSync.live ) {
		done();
	}

	const serverConfig = {
		proxy: config.dev.browserSync.proxyURL,
		port: config.dev.browserSync.bypassPort,
		liveReload: true,
		https: false,
	};

	// Only setup HTTPS certificates if HTTPS is enabled.
	if ( config.dev.browserSync.https ) {
		// Use a custom path key/cert if defined, otherwise use the default path.
		const cert = getSSLFile( 'certPath' );
		const key = getSSLFile( 'keyPath' );

		// Ensure the key/cert files exist.
		const certFound = checkExistence( cert );
		const keyFound = checkExistence( key );

		// Let the user know if we found a certificate.
		sslFound( certFound, 'certificate', cert );

		// Let the user know if we found a key.
		sslFound( keyFound, 'key', key );

		// Only enable HTTPS if there is a cert and a key.
		if ( certFound && keyFound ) {
			httpsEnabled();

			serverConfig.https = { key, cert };
		}
	}

	// Start the BrowserSync server.
	server.init( serverConfig );

	done();
};

/**
 * Reloads the live site.
 *
 * @param {function} done Function to call when async processes finish.
 */
export const reload = ( done ) => {
	if ( config?.dev?.browserSync?.live ) {
		if ( server.paused ) {
			server.resume();
		}
		server.reload();
	} else {
		server.pause();
	}

	done();
};
