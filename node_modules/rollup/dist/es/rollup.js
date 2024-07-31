/*
  @license
	Rollup.js v4.19.1
	Sat, 27 Jul 2024 04:53:31 GMT - commit 8b967917c2923dc6a02ca1238261387aefa2cb2f

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
