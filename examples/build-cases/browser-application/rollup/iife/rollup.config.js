import html from '@web/rollup-plugin-html';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'index.html',
  output: {
    dir: 'build',
    format: 'iife',
    // manualChunks(id) {
    //   if (id.includes('node_modules')) {
    //     return 'vendor';
    //   }
    //   if (id.endsWith('assets/common.js')) {
    //     return 'common';
    //   }
    // }
  },
  plugins: [
    // add HTML plugin
    html({
      rootDir: path.join(process.cwd(), 'src'),
      flattenOutput: false,
    }),
    resolve(),
    commonjs()
  ],
};
