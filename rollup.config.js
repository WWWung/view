import ts from "rollup-plugin-typescript"
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

export default {
    output: {
        dir: "./dist",
        // format: "umd",
        format: "es",
        name: "view"
    },
    plugins: [
        ts(),
        commonjs(),
        resolve()
    ],
    watch: {
        include: "src/**"
    },
    input: "./src/index.ts"
}