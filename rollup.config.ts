import { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { dts } from 'rollup-plugin-dts';
import { createRequire } from 'module';

const pkg = createRequire(import.meta.url)('./package.json');
const isProduction = process.env.BUILD === 'production';
const sourceFile = 'src/imgur.ts';

const jsConfig: RollupOptions = {
    input: sourceFile,
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
        tsConfigPaths(),
        replace({
            preventAssignment: true,
            __version__: pkg.version
        })
    ]
};

const dtsConfig: RollupOptions = {
    input: sourceFile,
    output: {
        file: pkg.types,
        format: 'es'
    },
    plugins: [
        tsConfigPaths(),
        dts()
    ]
};

export default [jsConfig, dtsConfig];
