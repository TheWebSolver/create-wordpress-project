## Getting Started

The Webpack entry files are handled from the [***bundler***][b] directory that must exist inside [***src***][s] directory.

---

The main file that is passed to [***Webpack*** *entry*][e] point should exist inside [***bundler***][b] directory (the parent to this directory).

> This approach supports [***Webpack*** *Context API*][api] and is recommended to follow the same practice.

Each entry file components and it's related `.js` files must exist inside [*this*][lib] directory.

## Example:

### File Structure

```js
// The directory structure.

Assets
  |
  |-- JS
  |  |
  |  |-- dist // ← This (and it's files) may not exist until first bundle task is run.
  |  |  |
  |  |  | // ↓ Webpack output files after bundling.
  |  |  |- entryfile1.min.js
  |  |  |- entryfile2.min.js
  |  |  |
  |  |-- src
  |  |  |
  |  |  |-- bundler
  |  |  |  |
  |  |  |  | // ↓ Webpack entry files that uses Context API.
  |  |  |  |-- entryfile1.js
  |  |  |  |-- entryfile2.js
  |  |  |  |
  |  |  |  |-- lib
  |  |  |  |  |
  |  |  |  |  | // ↓ Related files to the Webpack entry file "entryfile1.js".
  |  |  |  |  |-- entryfile1-dir
  |  |  |  |  |  |
  |  |  |  |  |  | // ↓ Files (except index.js) can further be organized inside sub-directories.
  |  |  |  |  |  |-- inspector.js
  |  |  |  |  |  |-- edit.js
  |  |  |  |  |  |-- save.js
  |  |  |  |  |  |-- index.js // ← Main file that handles the execution.
  |  |  |  |  |
  |  |  |  |  | // ↓ Related files to the Webpack entry file "entryfile2.js".
  |  |  |  |  |-- entryfile2-dir
  |  |  |  |  |  |
  |  |  |  |  |  |-- inspector.js
  |  |  |  |  |  |-- edit.js
  |  |  |  |  |  |-- save.js
  |  |  |  |  |  |-- index.js // ← Main file that handles the execution.
```
### Webpack Entry

Lets define the entry files from the file structure above inside [*webpack.config.js*][w].

> The `entrypath` used below is a helper variable defined inside the Webpack config file itself to get entry files path.

```js
const entry = {
	entryfile1: `${ entryPath }/entryfile1.js`,
	entryfile2: `${ entryPath }/entryfile2.js`,
}
```

### Webpack Output

> The output is already been defined in the Webpack config file. It is here for completeness.

```js
/**
 * The output files.
 *
 * Since, bundler is watched (not by Webpack) by the gulp watch,
 *  we are directly saving final bundled file with a `${entry[key]}.min.js`
 * to comply with how other script files are served.
 */
const output = {
	filename: '[name].min.js', // Here, [name] is replaced by either "entryfile1" or "entryfile2" from entry key.
	path: destPath,
};
```

### Main Files

Inside the main bundler files ***entryfile1.js*** and ***entryfile2.js*** located inside [***bundler***][b] directory as [*structured above*](#file-structure), use the [***Webpack*** *Context API*][api] to import their respective `index.js` file located at [*this*][lib] directory.

```js
// Related files.
const mainFileDir = './lib/entryfile1-dir'; // entryfile2-dir if using inside "entryfile2.js".

// Do not look inside sub-directories as we only have one `index.js` in `mainFileDir` root.
const ignoreSubDir = false;

// RegExp for the main execution file to look.
const lookForIndex = /index\.js$/;

// Imports all requested files.
const importAll = ( request ) => {
	request.keys().forEach( request );
};

// Get "index.js" file present inside "lib" sub-directories and import them.
importAll( require.context( mainFileDir, ignoreSubDir, lookForIndex ) );
```

<!-- MARKDOWN LINKS -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[e]: https://webpack.js.org/concepts/entry-points/#root 'Docs link to Webpack entry point'
[b]: Assets/JS/src/bundler 'The Webpack entry files directory'
[s]: Assets/JS/src 'The javascript files source directory'
[api]: https://webpack.js.org/guides/dependency-management/#context-module-api 'Docs link to Webpack Context API'
[lib]: Assets/JS/src/bundler/lib 'Where Webpack entry file\'s related files exist'
[w]: webpack.config.js 'The Webpack configuration file'

