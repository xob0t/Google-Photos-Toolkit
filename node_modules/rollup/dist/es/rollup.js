/*
  @license
	Rollup.js v4.37.0
	Sun, 23 Mar 2025 14:56:38 GMT - commit 8b1c634d945dda9294cf579de68c4b223c618e7f

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
