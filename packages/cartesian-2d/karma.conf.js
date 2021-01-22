const path = require("path");

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: "",
        // frameworks to use
        // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
        frameworks: ["jasmine", "webpack"],
        // list of files / patterns to load in the browser
        files: [
            "src/jasmine-env.ts",
            {pattern: "src/**/*.spec.ts", watched: false},
            {pattern: "build/**/*", watched: false, included: false},
            {pattern: "cpp/**/*", watched: false, included: false},
        ],
        // list of files / patterns to exclude
        exclude: [
        ],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
            "**/*.spec.ts": ["webpack"],
            "src/jasmine-env.ts": ["webpack"],
        },
        webpack: {
            devtool: "inline-source-map",
            resolve: {
                extensions: ['.ts', '.js'],
                fallback: {
                    "asan-test-module": path.join(__dirname, "./build", "asan-test-module.js"),
                    "safe-heap-module": path.join(__dirname, "./build", "safe-heap-module.js"),
                }
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?/,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'ts-loader', options: {},
                            }
                        ]
                    }
                ]
            },
        },

        // possible values: "dots", "progress"
        // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
        reporters: ["progress"],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
        browsers: [],
        concurrency: Infinity,
        proxy: {
            "/": path.join(__dirname, "build"),
        },
        plugins: [
            "karma-chrome-launcher",
            "karma-jasmine",
            "karma-webpack",
        ],
    });
};