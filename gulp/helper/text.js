'use strict';

/**
 * External dependencies
 */
import chalk from 'chalk';

/**
 * Makes given text a bright magenta color.
 *
 * @param {string} text The text to be converted.
 * @return {string} The colored text.
 */
export const highlight = ( text ) => chalk.magenta( text );

/**
 * Makes given text a green color.
 *
 * @param {string} text The text to be converted.
 * @return {string} The colored text.
 */
export const success = ( text ) => chalk.green( text );

/**
 * Makes given text a red color.
 *
 * @param {string} text The text to be converted.
 * @return {string} The colored text.
 */
export const error = ( text ) => chalk.red( text );

/**
 * Italicizes given text.
 *
 * @param {string} text The text to be converted.
 * @return {string} The italic text.
 */
export const italic = ( text ) => chalk.italic( text );

/**
 * Underlines given text.
 *
 * @param {string} text The text to be converted.
 * @return {string} The underlined text.
 */
export const underline = ( text ) => chalk.underline( text );

/**
 * Makes given text bold.
 *
 * @param {string} text The text to be converted.
 * @return {string} The bold text.
 */
export const bold = ( text ) => chalk.bold( text );

/**
 * Makes given text a yellow color.
 *
 * @param {string} text The text to be converted.
 * @return {string} The colored text.
 */
export const notice = ( text ) => chalk.yellow( text );
