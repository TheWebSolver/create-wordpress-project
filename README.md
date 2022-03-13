## Introduction:

Create WordPress Project is a modern WordPress development and production toolkit.

### Features
- Code-sniffs **PHP** with WordPress [PHP][p] Coding Standards,
- Lints **Style** with [WordPress Stylelint Config][c] & **Scripts** with  [WordPress ESLint Plugin][j],
- Minifies **[CSS][cn]/[JS][ju]/[Image][i]** files,
- Generates **[translate][pot]** (**.pot**) file,
- Autoloads **Classes**, **Traits** & **Interfaces** using [Autoloader][a],
- Prepares **[string][s]** such as namespace, action/filter tags, etc. for branding purposes.

## Documentation:

### Getting Started

1. #### Setup Config
	- Do not edit [config.default.json][defcnf] directly.
	- Any changes to be overridden must be done in [config.user.json][usrcnf] JSON file.
	- Necessary comments are in place for easier understanding.
	- The [user configuration][usrcnf] file contains following data:

	```json
	{
		// Strings to be replaced during project export.
		"core": {
			// Plugin/theme name. Replaces default "TheWebSolver Codegarage".
			"name": "Awesome WordPress Plugin",

			// Don't use hyphens if theme project. Replaces default "tws-codegarage".
			// Will be the plugin/theme directory name, plugin main filename and text-domain.
			"slug": "awesome-plugin",

			// Author name. Replaces default "Shesh Ghimire".
			"author": "Awesome Person",

			// Namespace and @package prefixes. Replaces default "TheWebSolver\\Codegarage".
			"PHPNamespace": "Awesome\\Plugin",

			// Underscore case prefix. Used widely as project prefix.
			// Used for action and filter tags. Replaces default "tws_codegarage".
			"underscoreCase": "awesome_plugin",

			// Camel case prefix. May be used on scripts. Replaces default "twsCodeGarage".
			"camelCase": "awesomePlugin",

			// Constants prefix. Replaces default "TWS_CODEGARAGE".
			"constant": "AWE_PLUG",

			// White label prefix. May be used on styles. Can be used elsewhere.
			// Replaces default "tws-whitelabel".
			"whiteLabel": "custom-prefix"
		},

		"dev": {
			"browserSync": {
				// Enable live reloading on each file save.
				"live": true,

				// The development URL where the project is being developed.
				"proxyURL": "http://test.tws/",

				// The port where browser sync will proxy the development URL.
				"bypassPort": "8181",

				// Enable/disable https.
				"https": false
			},

			"debug": {
				// If set to true, no minification happens.
				"styles": false,
				"scripts": false,

				// If set to false, PHPCS won't run.
				"phpcs": true
			},

			// Path to PHP Code-sniffer installed globally as Composer dev dependency.
			// Locally installed PHPCS is used (if exists).
			// Local PHPCS is defined in `./gulp/constants.js` as const "phpcsLocalPath".
			"phpcsPath": "Awesome\\Plugin\\Path\\To\\Composer\\vendor\\bin\\phpcs"
		},

		"export": {
			// Whether current project is a theme.
			"isTheme": false,

			// Whether to log messages on console during development/production.
			// Recommended to set it to true to see the progress.
			"log": true
		}
	}
	```

2. #### Check PHPCS Path
	Make sure that **PHPCS** path exists either globally or locally to start dev process.

3. #### Start Installation
	Install node modules and composer packages. You can install it separately or use the npm script to do that.

	From terminal, enter:
	```sh
	$ npm run toolkit-init
	```

4. #### Bootstrap Project
	To define the project and start development process, enter:
	```sh
	$ npm run create-wp-project
	```

	This will extract appropriate files for the current project from the [***bin***][bin] directory. i.e. If `isTheme` is set to `true` in [user config][usrcnf] file, [theme files][tf] will be extracted, else [plugin files][pf] will be extracted to the root directory of the project.

	Alternatively, following commands can be used for:
	- Theme project:
		```sh
		npm run create-wp-theme
		```

	- Plugin project:
		```sh
		npm run create-wp-plugin
		```

5. #### Start Development
	Once everything is set-up and main project files are extracted, then it's time to start the development process.

	From terminal, enter:
	```sh
	$ npm run dev
	```

	During development, following tasks are executed on file save:
	- Code sniffing (PHP files) and linting (style and script files)
	- Minification (style and script files)
	- Compression (images)
	- Translation `.pot` file

6. #### Export Project
	From terminal, enter:
	```sh
	$ npm run bundle
	```

	- Project can be exported multiple times.
	- On each subsequent export, directory gets deleted and everything gets exported again.

### Further Resources
- [GitHub Wiki][w]

## Toolkit Plugins:
| [Gulp]      | [Webpack] | [Autoloader][a] |
|-------------|-----------|------------|
| <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Gulp.js_Logo.svg" height="100px" /> | <img src="https://raw.githubusercontent.com/webpack/media/3e52c178e6ad2428585a2cbf5d22d6dbe0697f0f/logo/icon-square-small.svg" height="100px" /> | <img src="https://avatars.githubusercontent.com/u/71939933?s=200&v=4" height="100px" /> |
| [Task Runner][t]                 | [File Bundler][b]             | [Classes & Template files][a] |
| - Watch files during development | - Bundle javascript files     | - Loads Classes, Traits, etc. |
| - Export project files           | - Mainly for gutenberg blocks | - Exposes Template [API][api] |

<!-- MARKDOWN LINKS -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[w]: https://github.com/TheWebSolver/create-wordpress-project/wiki 'Link to Wiki page'
[p]: https://developer.wordpress.org/coding-standards/wordpress-coding-standards/php/ 'Docs link to WordPress PHP Coding Standards'
[c]: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-stylelint-config/ 'Docs link to WordPress Stylelint Config'
[j]: https://developer.wordpress.org/block-editor/reference-guides/packages/packages-eslint-plugin/ 'Docs link to WordPress ESLint Plugin'
[cn]: https://cssnano.co/docs/introduction/ 'Docs link to CSSNano'
[ju]: https://github.com/mishoo/UglifyJS 'GitHub link to UglifyJS'
[i]: https://github.com/imagemin/imagemin 'GitHub link to ImageMin'
[pot]: https://github.com/wp-pot/wp-pot 'GitHub link to WP-Pot'
[a]: /autoload.php 'The Autoloader class file'
[s]: https://github.com/tomaszczechowski/gulp-string-replace 'GitHub link to stringReplace'
[gulp]: https://gulpjs.com/ 'Link to gulp homepage'
[webpack]: https://webpack.js.org/ 'Link to webpack homepage'
[t]: /gulp 'The Gulp Directory'
[b]: /gulp/webpack 'The Gulp Webpack Directory'
[api]: https://github.com/TheWebSolver/create-wordpress-project/wiki/Template-API 'Link to Template API Wiki page'
[usrcnf]: /config/config.user.json 'The user configuration file'
[defcnf]: /config/config.default.json 'The default configuration file'
[bin]: /bin 'The Bin directory'
[tf]: /bin/theme 'The Theme files bin directory'
[pf]: /bin/plugin 'The Plugin files bin directory'
