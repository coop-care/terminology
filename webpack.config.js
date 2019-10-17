const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

let config = {
    entry: "./src/app.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
    },

    devServer: {
        index: 'index.html',
        publicPath: '/dist/',
        contentBase: '.',
        watchContentBase: true
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".vue", ".json", ".scss", ".sass"],
        alias: {
          'vue$': 'vue/dist/vue.common.js'
        }
    },

    module: {
        rules: [
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre" },
            { test: /\.tsx?$/, loader: "ts-loader", options: { appendTsSuffixTo: [/\.vue$/] } },
            { test: /\.vue$/, loader: 'vue-loader' },
            {
                test: /\.s[ac]ss$/i,
                use: [
                  // Creates `style` nodes from JS strings
                  'vue-style-loader',
                  // Translates CSS into CommonJS
                  'css-loader',
                  // Compiles Sass to CSS
                  'sass-loader',
                ],
              },
            { test: /\.css$/, use: [ 'vue-style-loader', 'css-loader' ] }
        ]
    },

    plugins: [
      new VueLoaderPlugin()
    ]

};

module.exports = (env, argv) => {

    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }
  
    return config;
  };
