/*
  @license
	Rollup.js v4.45.0
	Sat, 12 Jul 2025 05:53:06 GMT - commit b7c7c1159f70ebe8ad6f94c942ebab2fa59c7982

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
