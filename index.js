// https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js
import MarkdownIt from 'markdown-it';
import { readFileSync } from "fs";
import Koa from 'koa';
import playgroundPlugin from "./playgroundPlugin.js";

const app = new Koa();
const md = new MarkdownIt();

md.use(playgroundPlugin, {
  width: 600,
  height: 400
});


app.use(async ctx => {
  const str = readFileSync("demo.md", {
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

console.log("started at http://localhost:3000");