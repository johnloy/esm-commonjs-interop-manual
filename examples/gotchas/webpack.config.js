const path = require("path");
const fs = require("fs");
const { merge } = require("webpack-merge");

const configBase = {
  mode: "development",
  output: {
    path: path.resolve(process.cwd(), "transpiled/webpack"),
  },
  target: "node",
};

module.exports = fs.readdirSync("./entry").map((entry) => {
  if (fs.statSync(`./entry/${entry}`).isDirectory()) return;
  return merge(configBase, {
    entry: {
      [entry.replace(/\.m?js$/, "")]: `./entry/${entry}`,
    },
    output: {
      filename: `[name]${path.extname(entry)}`,
    },
  });
}).filter(c => c);
