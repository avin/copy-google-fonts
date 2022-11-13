import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import resolve from '@rollup/plugin-node-resolve';
import { RollupOptions } from 'rollup';

const bundle = (lib: string, config: RollupOptions): RollupOptions => ({
  ...config,
  input: `src/${lib}.ts`,
  external: [/node_modules/],
  onwarn(warning, warn) {
    // allow eval
    if (warning.message.includes('Use of eval is strongly discouraged')) {
      return;
    }
    warn(warning);
  },
});

const result: RollupOptions[] = [];
for (const lib of ['index', 'cli']) {
  result.push(
    bundle(lib, {
      plugins: [resolve(), esbuild()],
      output: [
        {
          file: `dist/${lib}.cjs`,
          format: 'cjs',
          sourcemap: true,
        },
        {
          file: `dist/${lib}.mjs`,
          format: 'es',
          sourcemap: true,
        },
      ],
    }),
  );
  result.push(
    bundle(lib, {
      plugins: [dts()],
      output: {
        file: `dist/${lib}.d.ts`,
        format: 'es',
      },
    }),
  );
}

export default result;
