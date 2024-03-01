import fs from 'fs';
import banner from 'rollup-plugin-banner2';
import replace from '@rollup/plugin-replace';

import { string } from './build/strings-plugin.mjs';
import userScriptMetadataBlock from './build/metadata.mjs';
const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));
let packageJson = loadJSON('./package.json');

const entry = 'src/index.js';

const config = [
  // Modern Module (No babel preset)
  {
    input: entry,
    output: [
      {
        file: packageJson.main,
        format: 'iife',
        // exports: 'default',
      },
    ],
    plugins: [

      replace({
        preventAssignment: true,
        __VERSION__: JSON.stringify(packageJson.version),
        __HOMEPAGE__: JSON.stringify(packageJson.homepage)
      }),

      banner(userScriptMetadataBlock),
      // import html as string
      string({
        include: ['**/*.html'],
      }),

      // import css as string
      string({
        include: ['**/*.css'],
        transform(code) {
          return code
            .replace(/;\s*\n\s*/g, '; ') // remove line breaks after ;
            .replace(/\{\n */g, '{ ')    // remove line break after {
            .replace(/^\s*\n/gm, '')      // remove empty lines
            .replace(/;\s(\/\*.+\*\/)\n/g, '; $1 ')  // remove line break after comments on properties
            .trim();
        }
      }),
      
    ]
  },
];

export default config;