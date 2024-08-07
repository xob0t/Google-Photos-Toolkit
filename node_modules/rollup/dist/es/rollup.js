/*
  @license
	Rollup.js v4.20.0
	Sat, 03 Aug 2024 04:48:21 GMT - commit df12edfea6e9c1a71bda1a01bed1ab787b7514d5

	https://github.com/rollup/rollup

	Released under the MIT License.
*/
export { version as VERSION, defineConfig, rollup, watch } from './shared/node-entry.js';
import './shared/parseAst.js';
import '../native.js';
import 'node:path';
import 'path';
import 'node:process';
import 'node:perf_hooks';
import 'node:fs/promises';
import 'tty';
