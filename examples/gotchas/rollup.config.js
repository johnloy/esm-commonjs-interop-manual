import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import globby from 'globby';
import path from 'path';

const entries = globby.sync('./entry/*.{mjs,js}') || [];

export default entries.map((entry) => ({
  input: entry,
  output: {
    dir: './transpiled/rollup',
    format: 'commonjs',
    interop: 'auto',
    exports: 'named',
    entryFileNames: (chunkInfo) => path.basename(chunkInfo.facadeModuleId),
  },
  plugins: [resolve({ preferBuiltins: true }), commonjs()],
}));
