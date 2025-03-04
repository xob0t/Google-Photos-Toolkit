/*
  @license
	Rollup.js v4.34.9
	Sat, 01 Mar 2025 07:32:06 GMT - commit 0ab9b9772e24dfe9ef08bfce3132e99a15b793f6

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
