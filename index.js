// https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js
const MarkdownIt = require('markdown-it');
const fs = require("fs");
const Koa = require('koa');
const playgroundPlugin = require("./playgroundPlugin");

const app = new Koa();
const md = new MarkdownIt();

md.use(playgroundPlugin, {
  width: 600,
  height: 400
});


app.use(async ctx => {
  const str = fs.readFileSync("demo.md", {
    encoding: "utf-8"
  });
  // console.log(str);
  const result = md.render(str, {
    // html: true
  });
  // console.log(result)
  ctx.body = result
});

app.listen(3000);