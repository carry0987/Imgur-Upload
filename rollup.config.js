import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { dts } from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { createRequire } from 'module';
const pkg = createRequire(import.meta.url)('./package.json');

const isProduction = process.env.BUILD === 'production';

const jsConfig = {
    input: 'src/imgur.ts',
    output: [
        {
            file: pkg.main,
            format: 'umd',
            name: 'Imgur',
            plugins: isProduction ? [terser()] : []
        },
        {
            file: pkg.module,
            format: 'es'
        }
    ],
    plugins: [
        typescript(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

const dtsConfig = {
    input: 'dist/imgur.d.ts',
    output: {
        file: pkg.types,
        format: 'es'
    },
    plugins: [
        dts(),
        del({ hook: 'buildEnd', targets: ['!dist/index.js', 'dist/*.d.ts', 'dist/interface'] })
    ]
};

export default [jsConfig, dtsConfig];
