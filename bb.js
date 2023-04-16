const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true
});
// const { Token } = require('markdown-it/lib/token');

// function playgroundPlugin(md) {
//   md.core.ruler.after('inline', 'playground', state => {
//     const { tokens } = state;

//     for (let i = 0; i < tokens.length; i++) {
//       const token = tokens[i];
//       if (token.type === 'inline') {
//         for (let j = 0; j < token.children.length; j++) {
//           const child = token.children[j];
//           if (child.content.match(/^<playground /)) {
//             child.content = `<iframe src='https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${child.content}.js'></iframe>`;
//           }
//         }
//       }
//     }
//   });
// }

// md.use(playgroundPlugin);

// md.renderer.rules.playground = (tokens, idx, options, env, self) => {
//   console.log("----111")
//   const srcItem = tokens[idx].attrs.find(item => {
//     return item[0] === 'src'
//   })
//   const src = srcItem[1]
//   const alt = tokens[idx].content
//   return `<p>
//         <div class="light-link" data-fancybox="gallery" no-pjax="" data-type="image" data-caption="${alt}">
//             <img src="${src}" alt="${alt}" />
//             <span class="post-img-desc">${alt}</span>
//         </div>
//     </p>`
// }

// md.renderer.rules.playground_open = (tokens, idx, options, env, self) => {
//   return '<div class="table-responsive box-shadow-wrap-lg"><table>'
// }
// md.renderer.rules.playground_close = (tokens, idx, options, env, self) => {
//   return '</table></div>'
// }
const playgroundRegexp = /<playground\s+src="(.*)"/;

// md.inline.ruler.after('text', 'playground_rule', function replace(state) {
//   //html_inline

//   const { tokens } = state;
//   console.log("----", tokens)

//   for (let i = 0; i < tokens.length; i++) {
//     const token = tokens[i];
//     // console.log(token)
//     if (token.type === 'html_inline') {
//       //   for (let j = 0; j < token.children.length; j++) {
//       //     const child = token.children[j];
//       if (token.content.match(/^<playground /)) {
//         const src = token.content.match(playgroundRegexp)[1];
//         token.content = `https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${src}.js`;
//         token.tag = "iframe";
//         token.block = true
//         // child.content = `<iframe src='https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${child.content}.js'></iframe>`;
//       }
//     }
//   }
// });

md.inline.ruler.after('quote', 'playground_rule', function replace(state) {
  //html_inline

  const { tokens } = state;
  console.log("----", tokens)

  // for (let i = 0; i < tokens.length; i++) {
  //   const token = tokens[i];
  //   // console.log(token)
  //   if (token.type === 'html_inline') {
  //     //   for (let j = 0; j < token.children.length; j++) {
  //     //     const child = token.children[j];
  //     if (token.content.match(/^<playground /)) {
  //       const src = token.content.match(playgroundRegexp)[1];
  //       token.content = `https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${src}.js`;
  //       token.tag = "iframe";
  //       token.block = true
  //       // child.content = `<iframe src='https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${child.content}.js'></iframe>`;
  //     }
  //   }
  // }
});


const markdownText = '这是一段包含playground标签的Markdown文本：<playground src="sample_021_Hello"></playground>';
const html = md.render(markdownText, {
  html: true,
});
console.log(html);
// html = '这是一段包含playground标签的Markdown文本：<iframe src="sample_021_Hello" />';

// console.log(md.parse(markdownText)[1].children);