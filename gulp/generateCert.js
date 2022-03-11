'use strict';

/**
 * External dependencies
 */
import createCert from 'create-cert';
import fs from 'fs';

/**
 * Internal dependencies
 */
import { paths } from './constants';
import { sslGenerated } from './helper/log';

const generateCert = ( done ) => {
	// Use pem to create a new key/cert.
	/*
    const createCertOptions = {
        days: 1825,
        commonName: 'localhost'
    };
    */

	const createCertOptions = {
		days: 1825,
		selfSigned: true,
		country: 'NP',
		state: 'BG',
		locality: 'Bhaktapur',
		altNames: [ 'localhost' ],
		organization: 'TheWebSolver',
		commonName: 'localhost',
	};

	createCert( createCertOptions ).then( ( keys ) => {
		// Create the BrowserSync directory if needed.
		if ( ! fs.existsSync( paths.browserSync.dir ) ) {
			fs.mkdirSync( paths.browserSync.dir );
		}

		// Save the key.
		fs.writeFileSync( paths.browserSync.key, keys.key, ( err ) => {
			if ( err ) {
				throw err;
			}
		} );

		// Save the cert.
		fs.writeFileSync( paths.browserSync.cert, keys.cert, ( err ) => {
			if ( err ) {
				throw err;
			}
		} );

		// Save the CA cert.
		fs.writeFileSync( paths.browserSync.caCert, keys.caCert, ( err ) => {
			if ( err ) {
				throw err;
			}
		} );

		sslGenerated();

		done();
	} );
};

export default generateCert;
