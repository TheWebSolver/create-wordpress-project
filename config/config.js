'use strict';

/**
 * External dependencies.
 */
const fs = require( 'fs' ); // ES Module import may not work.
const merge = require( 'deepmerge' );

// Default config file.
const defaultConfigPath = __dirname + '/config.default.json';

// Must have config.default.json file.
if ( ! fs.existsSync( defaultConfigPath ) ) {
	throw new Error(`No default configuration detected. Please create the file: "${defaultConfigPath}".` );
}

// Set config to the default config.
const defaultConfig = require( defaultConfigPath );
let config = defaultConfig;


// Load user configuration next.
const custom = __dirname + '/config.user.json';
const hasCustom = fs.existsSync( custom );

if ( hasCustom ) {
	config = merge( config, require( custom ) );
}

// Then append local config (testing purposes).
const local = __dirname + '/config.local.json';
const hasLocal = fs.existsSync( local );

if ( hasLocal ) {
	config = merge(config,require( local ));
}

// Export the config.
module.exports = config;
