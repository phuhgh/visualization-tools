const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const config = {
    mode: "development",
    devtool: "source-map",
    output: {
        path: path.join(__dirname, "bin", "pack"),
        filename: "[name].js",
    },
    entry: "./src/main.tsx",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            "docs-module": path.join(__dirname, "./build", "docs-module.js"),
        },
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        dead_code: true,
                        global_defs: {
                            DEBUG_MODE: false,
                        }
                    }
                }
            })
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "assets/index.html",
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "node_modules/@visualization-tools/core/assets/chart.css",
                    to: "",
                },
                {
                    from: "assets/docs.css",
                    to: "",
                },
                {
                    from: "build/docs-module.wasm",
                    to: ""
                },
            ],
        }),
    ],
    devServer: {
        static: path.join(__dirname, "assets"),
        port: 3000,
    },
};

module.exports = config;
