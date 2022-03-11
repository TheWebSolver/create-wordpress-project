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
- [GitHub Wiki][w].

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
