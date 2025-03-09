/*
  @license
	Rollup.js v4.35.0
	Sat, 08 Mar 2025 06:24:12 GMT - commit 70ef1cce7c740030cc2935b563d13950cc1511f5

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
