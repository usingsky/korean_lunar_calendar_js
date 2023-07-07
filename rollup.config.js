import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-minification";
//import copy from "rollup-plugin-copy";
//import { visualizer } from "rollup-plugin-visualizer";

const pkg = require('./package.json')

const config = [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true,
            },
            {
                file: pkg.module,
                format: 'esm',
                sourcemap: true,
            },
            {
                file: `dist/${pkg.name}.min.js`,
                format: 'iife',
                name: 'KoreanLunarCalendar',
                plugins: [terser()]
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({ useTsconfigDeclarationDir: true}),
            //visualizer(),
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: `dist/${pkg.name}.d.ts`,
            format: 'es'
        },
        plugins: [ dts.default() ]
    },
    /*
    {
        input: `dist/esm/${pkg.name}.js`,
        output: {
            file: `dist/esm/${pkg.name}.min.js`,
            format: 'esm',
            plugins: [terser()]
        },
    },
    */
];

export default config;
