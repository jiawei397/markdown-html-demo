const customBlock = require('markdown-it-custom-block')
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  // html: true
});


md.use(customBlock, {
  playground(key) {
    return `<iframe src="https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${key}.js"></iframe>`;
  }
})

const str = `@[playground](sample_021_Hello)`;

console.log(md.render(str))