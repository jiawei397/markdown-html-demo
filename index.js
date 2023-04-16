// https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js

const MarkdownIt = require('markdown-it');
const fs = require("fs");
const Koa = require('koa');
const customBlock = require('markdown-it-custom-block')
const app = new Koa();

const md = new MarkdownIt();
md.use(customBlock, {
  playground(key) {
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
})


// 定义正则表达式匹配playground标签
const playgroundRegexp = /<playground\s+src="(.*)"><\/playground>/i;

// 注册markdown-it-regexp插件
// function playgroundPlugin(md) {
//   md.core.ruler.after('inline', 'playground', state => {
//     const { tokens } = state;

//     for (let i = 0; i < tokens.length; i++) {
//       const token = tokens[i];
//       if (token.type === 'inline') {
//         for (let j = 0; j < token.children.length; j++) {
//           const child = token.children[j];
//           if (child.content.match(playgroundRegexp)) {
//             const src = child.content.match(playgroundRegexp)[1];
//             child.content = `<iframe src="https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${src}.js"></iframe>`;
//           }
//         }
//       }
//     }
//   });
// }

// md.use(playgroundPlugin);

// var iterator = require('markdown-it-for-inline');
// const md = require('markdown-it')()
//   .use(iterator, 'playground', 'text', function (tokens, idx) {
//     const content = tokens[idx].content;
//     if (!playgroundRegexp.test(content)) {
//       return;
//     }
//     const src = content.match(playgroundRegexp)[1];
//     tokens[idx].content = `<iframe src="https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${src}.js"></iframe>`;
//   });


app.use(async ctx => {
  const str = fs.readFileSync("demo.md", {
    encoding: "utf-8"
  });
  console.log(str);
  const result = md.render(str, {
    // html: true
  });
  console.log(result)
  ctx.body = result
});

app.listen(3000);