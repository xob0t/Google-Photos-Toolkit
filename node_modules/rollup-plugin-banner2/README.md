# rollup-plugin-banner2

## Introduction

Rollup plugin to prepend content before bundled js code.

## Why

`rollup` itself contains `output.banner` option.
The difference between this plugin and the `output.banner` parameter provided by the rollup is that the banner will not be cleaned up - for example by `rollup-plugin-uglify` plugin, the output file will not contain the `output.banner` parameter you set. `rollup-plugin-banner2` solves this problem.

There is another banner plugin: https://github.com/yingye/rollup-plugin-banner . Unfortunately, it looks **NOT MAINTAINED** for quite some time now. The main differences are described below.

## Usage

Install the plugin with NPM:

```
npm install --save-dev rollup-plugin-banner2
```

Add it to your rollup configuration:

```js
import banner2 from 'rollup-plugin-banner2'

export default {
  plugins: [
    banner2(
      () => `
    /**
     * rollup-plugin-banner2
     */
    `,
    ),
  ],
}
```

## Comparison with `rollup-plugin-banner`

- `banner2` supports sourcemaps
- `banner2` supports adding different banner to different chunks based on `ChunkInfo` (for more info see https://rollupjs.org/ )
- `banner2` does not support file path option that loads a file content and uses that as a banner. It should be easy enough to call `fs.readFileSync` yourself
- `banner2` does not support injecting values from `package.json` to banner via `<%= pkg.author %>` etc.
- `banner2` does not add JS comments as a wrapper to every banner automatically. You can explicitly use the option `{formatter: 'docBlock}`.

The missing features could be added if someone actually needs them.

## API

```ts
banner2(resolveBanner, options)
```

See the [typescript definition](index.d.ts) for more info.

### resolveBanner

The `resolveBanner` function returns a banner as

- `string`
- stringifiable object, i.e. having `toString` method, such as `Buffer`
- any falsy value for an empty banner
- a `Promise` resolving any of the values mentioned above

### options

- **sourcemap** - enable/disable sourcemap. `true` by default
- **formatter** - transform banner. No transform by default. Possible options:
  - `'docBlock'` - i.e. `/**` & `*/\n`
  - `'docBlockAndGap'` - i.e. `/**` & `*/\n\n`

## Contributing

- new PRs accepted :-)
- always cover your changes by tests
- always mention your changes in the [CHANGELOG.md](CHANGELOG.md)
- always update [typescript definition](index.d.ts) file when relevant to your changes, and possibly the docs.
