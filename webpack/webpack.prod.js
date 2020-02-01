const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackMd5Hash = require("webpack-md5-hash");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const { prod_Path, src_Path } = require("./path");

module.exports = {
  entry: {
    main: "./" + src_Path + "/index.ts"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  node: {
    global: true
  },
  output: {
    path: path.resolve(__dirname, prod_Path),
    filename: "[name].[chunkhash].js"
  },
  //devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(path.resolve(__dirname, prod_Path), {
      root: process.cwd()
    }),
    new HtmlWebpackPlugin({
      inject: false,
      hash: true,
      template: "./" + src_Path + "/index.html",
      filename: "index.html"
    }),
    new WebpackMd5Hash()
  ]
};
