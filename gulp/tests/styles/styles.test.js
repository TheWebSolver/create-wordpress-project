/* global test, expect */
/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import {
	pipe as pump,
	from,
	concat,
} from 'mississippi';
import Vinyl from 'vinyl';
import fs from 'fs';

/**
 * Internal dependencies
 */
import { gulpTestPath } from '../../constants';
import { getMainConfig, getDefaultConfig } from '../../utils';
import { processStyle } from '../../styles';

function makeMockFiles() {
	return [
		new Vinyl( {
			path: 'mock.css',
			contents: fs.readFileSync( `${ gulpTestPath }/styles/mock.css` ),
		} ),
	];
}

test( 'nesting', ( done ) => {
	const mockFiles = makeMockFiles();

	const config = getMainConfig();
	// Force minification of CSS.
	config.dev.debug.styles = false;

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).toContain( 'main .inner' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'Partials are imported.', ( done ) => {
	const mockFiles = makeMockFiles();

	const config = getMainConfig();
	// Force minification of CSS.
	config.dev.debug.styles = false;

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).toContain( ':root' );
		expect( fileContents ).toContain( '--global-main-bg-color:#f3fbfd' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'Custom properties processed.', ( done ) => {
	const mockFiles = makeMockFiles();

	const config = getMainConfig();
	// Force minification of CSS.
	config.dev.debug.styles = false;

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).toContain( 'background-color:#f3fbfd' );
		expect( fileContents ).toContain( 'font-weight:400' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'Custom media is processed.', ( done ) => {
	const mockFiles = makeMockFiles();

	const config = getMainConfig();
	// Force minification of CSS.
	config.dev.debug.styles = false;

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).toContain( '@media screen and (min-width:48em)' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'Minifies by default.', ( done ) => {
	const mockFiles = makeMockFiles();

	const config = getMainConfig();
	// Set styles debug to the default value.
	const defaultConfig = getDefaultConfig();
	config.dev.debug.styles = defaultConfig.dev.debug.styles;

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( file.basename ).toEqual( 'mock.min.css' );
		// Minified files will not have newlines.
		expect( fileContents ).not.toContain( '\n' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'Debug config disables minify.', ( done ) => {
	const config = getMainConfig();
	config.dev.debug.styles = true;

	const mockFiles = makeMockFiles();

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		// Un-minified files will have newlines.
		expect( fileContents ).toContain( '\n' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'IE grid prefix if configured.', ( done ) => {
	const config = getMainConfig();
	config.dev.styles.autoprefixer = { grid: true };

	const mockFiles = makeMockFiles();

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).toContain( '-ms-grid' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );

test( 'No IE grid prefix by default.', ( done ) => {
	const config = getMainConfig();
	// Set auto-prefix to the default value.
	const defaultConfig = getDefaultConfig();
	config.dev.styles.autoprefixer = defaultConfig.dev.styles.autoprefixer;

	const mockFiles = makeMockFiles();

	function assert( files ) {
		const file = files[ 0 ];
		const fileContents = file.contents.toString( 'utf-8' );
		expect( fileContents ).not.toContain( '-ms-grid' );
	}

	pump( [
		from.obj( mockFiles ),
		processStyle(),
		concat( assert ),
	], done );
} );
