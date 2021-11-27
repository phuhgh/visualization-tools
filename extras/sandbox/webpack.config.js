const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: "development",
    devtool: "cheap-source-map",
    entry: {
        "main": "./src/main.ts",
    },
    output: {
        path: path.join(__dirname, "bin", "pack"),
        filename: "[name].js",
    },
    watchOptions: {
        ignored: /node_modules/
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true,
                test: /\.js(\?.*)?$/i,
                uglifyOptions: {
                    compress: {
                        dead_code: true,
                        global_defs: {
                            DEBUG_MODE: false,
                        }
                    }
                },
            })
        ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader"
                    },
                ],
            },
            {
                test: /\.(html|css|glsl)$/,
                exclude: /index\.html$/,
                use: {
                    loader: "raw-loader",
                    options: {
                        esModule: false,
                    },
                }
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        fallback: {
            "sandbox-module": path.join(__dirname, "./build", "sandbox-module.js"),
        },
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: "node_modules/@visualization-tools/core/assets/chart.css",
                    to: "",
                },
                {
                    from: "src/test-page/sandbox.css",
                    to: "",
                },
                {
                    from: "src/test-page/index.html",
                    to: "",
                },
                {
                    from: "build/sandbox-module.wasm",
                    to: ""
                },
                {
                    from: "src/test-page/test-data/SKUA_DATA.bin",
                    to: "test-data/SKUA_DATA.bin"
                },
            ],
        }),
    ],
    devServer: {
        static: [path.join(__dirname, "bin", "pack"), __dirname],
        port: 3000,
    }
};