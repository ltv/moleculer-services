import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import camelCase from 'lodash.camelcase';

const libraryName = 'moleculer-core';

export default {
  input: 'index.ts',
  output: [
    {
      name: camelCase(libraryName),
      dir: 'dist',
      format: 'cjs',
      // sourcemap: true,
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: '**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ outDir: 'dist', lib: ['es6', 'es6', 'dom'], target: 'es6' }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
  ],
};
