import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import camelCase from 'lodash.camelcase';
import sourceMaps from 'rollup-plugin-sourcemaps';
const pkg = require('./package.json');

const libraryName = 'moleculer-core';

export default {
  input: 'index.ts',
  output: [
    {
      // file: pkg.main,
      name: camelCase(libraryName),
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
    },
    // { file: pkg.module, format: 'es', sourcemap: true },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: '**',
    exclude: 'node_modules/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ outDir: 'dist' }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // nodeResolve(),

    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
