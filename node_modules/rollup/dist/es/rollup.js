/*
  @license
	Rollup.js v4.40.1
	Mon, 28 Apr 2025 04:34:51 GMT - commit 1e6c40f49c428b7657fe3b9a2026f705acd39da1

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
