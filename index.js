// https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js
const MarkdownIt = require('markdown-it');
const fs = require("fs");
const Koa = require('koa');
const app = new Koa();

const md = new MarkdownIt();
// 定义正则表达式匹配playground标签
const playgroundRegexp = /^@\[playground\]\((.*)\)/;
const service = "playground"

function transPlay(key) {
  let width = 1200;
  let height = 600;
  if (key.includes("?")) {
    let arr = key.split("?");
    key = arr[0];
    const search = new URLSearchParams(arr[1]);
    width = search.get("width") || width;
    height = search.get("height") || height;
  }
  return `<iframe width="${width}" height="${height}" src="https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${key}.js"></iframe>`;
}

function tokenizePlayground(tokens, idx) {
  return transPlay(tokens[idx].playgroundId)
}

function playgroundEmbed(state, silent) {
  const matchResult = state.src.match(playgroundRegexp);
  if (!matchResult) {
    return false;
  }

  const id = matchResult[1];

  if (!silent) {
    const newState = new state.md.inline.State(service, state.md, state.env, []);
    newState.md.inline.tokenize(newState);

    const token = state.push(service, '');
    token.playgroundId = id;
    token.service = service;
    token.level = state.level;
  }

  state.pos += state.src.indexOf(')', state.pos);
  return true;
}

function playgroundPlugin(md, options) {
  md.renderer.rules.playground = tokenizePlayground;
  md.inline.ruler.before('emphasis', service, playgroundEmbed);
}

md.use(playgroundPlugin);


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