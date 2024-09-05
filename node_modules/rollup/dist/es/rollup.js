/*
  @license
	Rollup.js v4.21.2
	Fri, 30 Aug 2024 07:03:57 GMT - commit f83b3151e93253a45f5b8ccb9ccb2e04214bc490

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
