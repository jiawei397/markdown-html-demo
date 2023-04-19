# markdown-html-demo

背景是公司要开源一个技术文档（[thingjs](https://www.thingjs.com/guide/)），觉得别人家的有个功能不错，页面上能直接展示代码与效果预览。
这是一个页面：[https://oasisengine.cn/#/docs/latest/cn/model](https://oasisengine.cn/#/docs/latest/cn/model)。文档是用Markdown写的，嵌入了一个iframe：
![image.png](https://cdn.nlark.com/yuque/0/2023/png/8420122/1681549110319-f29f6f18-cc6f-4195-bfca-6a78761b8517.png#averageHue=%2351965f&clientId=u6ce15829-779e-4&from=paste&height=568&id=j6jjA&name=image.png&originHeight=1136&originWidth=2030&originalType=binary&ratio=2&rotation=0&showTitle=false&size=195229&status=done&style=none&taskId=u4f948a54-c8ba-4b67-9ef8-8c4597a0a3b&title=&width=1015)
## React渲染Playground
### 源码
到人家的[Github](https://github.com/galacean/oasis-engine.github.io/)上扒了下，是个React项目。
先是用AST转换playground这个标签：
```tsx
import { visit } from "unist-util-visit";

export default function() {
  return (markdownAST: any) => {
    visit(markdownAST, 'html', (node, i, parent) => {
      if (node.value.includes('<playground')) {
        const src = /src="(.+)"/.exec(node.value);

        if (src && src[1]) {
          const data = parent.data || (parent.data = {})
          const props = data.hProperties || (data.hProperties = {})
          // 参考 Markdown AST（https://github.com/syntax-tree/mdast）
          // 选择 blockquote 类型，作为 markdown-react 的自定义组件(components props)的处理类型
          parent.type = 'blockquote'
          props.className = "playground-in-doc";
          props.src = src[1];
          parent.children = [];
        }
      }
    });
  }
}
```

DocDetail.tsx用react-markdown把Markdown渲染成页面。
```tsx
import ReactMarkdown from 'react-markdown';
import Prism from 'prismjs';


<ReactMarkdown
  remarkPlugins={[playgroundPlugin, linkPlugin, remarkGfm, remarkFrontmatter]}
  // temporarily remove <a /> in toc
  // rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, toc]}
  rehypePlugins={[toc, customeToc, rehypeRaw]}
  skipHtml={false}
  components={{
    ...
    // 处理就是这段
    blockquote({ className, src }: any) {
      if (className === 'playground-in-doc') {
        return <Playground id={getIdByTitle(src) || ''} title={docTitle} embed={true} />;
      }
      return null;
    }
  }}
>
  {docData.content}
</ReactMarkdown>
```
上面的Playground组件，就是这篇：
```tsx
export default function Playground(props: IPlayground) {
  const [code, setCode] = useState('');
  const [src, setSrc] = useState('');
  const { lang, version } = useContext(AppContext);
  const [packages, setPackage] = useState<any>(null);

  const url = `/#/example/${props.id}`;
  const iframe = createRef<HTMLIFrameElement>();

  const fetchCode = async (id: string) => {
    const res = await fetchDocDataById(id);

    const code = Prism.highlight(res?.content || '', Prism.languages.javascript, 'javascript');
    setCode(code);
    setSrc(res?.content || '');
  };

  useEffect(() => {
    if (!props.id) return;
    fetchCode(props.id);

    // fix: iframe not reload when url hash changes
    iframe.current?.contentWindow?.location.reload();
  }, [props.id]);

  const fetchDependencies = async () => {
    const configRes = await fetchEngineDataConfig();
    const packages = JSON.parse(configRes.find((config) => config.version === version)?.packages || '');

    setPackage(packages);
  };

  useEffect(() => {
    fetchDependencies();
  }, [version]);

  if (!packages || !props.id) return null;

  return (
    <Media query='(max-width: 768px)'>
      {(isMobile) => (
        <StyledCodeBox wrap="false" embed={props.embed}>
          <StyledDemo>
            <iframe src={url} width='100%' height='100%' frameBorder='0' ref={iframe} />
          </StyledDemo>
          {!isMobile && <StyledSource>
            <pre>
              <code
                dangerouslySetInnerHTML={{
                  __html: code,
                }}
              />
            </pre>
          </StyledSource>
          }
          {!isMobile && src && (
            <CodeActions
              sourceCode={src}
              engineName={siteConfig.name}
              name={props.title || ''}
              url={url}
              version={packages['oasis-engine']}
              packages={packages}
            />
          )}
          {!isMobile && url && <DemoActions url={url} />}
        </StyledCodeBox>
      )}
    </Media>
  );
}
```

使用时非常简单，在Markdown里嵌入一句，把src路径写到src里就可以了。
```markdown
<playground src="buffer-mesh-instance.ts"></playground>
```

### 分析

> 技术本身没有什么神秘的，就是嵌入了一个iframe，url是这里配置的src经过AST转换处理。

对我们而言，我们的[thingjs的网站](https://www.thingjs.com/guide/?m=sample)分享出来一个url：[https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js](https://www.thingjs.com/guide/sampleindex.html?m=examples/js/sample_021_Hello.js)，本身就是一个可以渲染为页面的url。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/8420122/1681637533793-e7c61387-cc65-4e47-ba7d-f103aa8ab42a.png#averageHue=%23a69e8c&clientId=u0cd879f1-07f7-4&from=paste&height=667&id=uc6619697&name=image.png&originHeight=1334&originWidth=1628&originalType=binary&ratio=2&rotation=0&showTitle=false&size=1768927&status=done&style=none&taskId=ufe1d57e3-2199-4708-9ac8-def71b3bfa7&title=&width=814)

目前无论是前端还是Node.js哪种方式，都是基于[markdown-it](https://markdown-it.github.io/markdown-it)来处理，修改它最终输出为Html的产物。那么就自定义一个合适的语法规则，将它组装成我们自己的url即可。

为了简单起见，没有必要与这个项目的规则保持一致，可以设置成这样：

```markdown
@[playground](sample_021_Hello)

@[playground](sample_021_Hello?width=400&height=200)
```

要求使用**上方必须有空行，前方不能有空格**。

## 我们的实现

### 方案一

使用[markdown-it-custom-block](https://github.com/posva/markdown-it-custom-block)来实现。它的例子是这样的：

```javascript
const customBlock = require('markdown-it-custom-block')

markdownit()
  .use(customBlock, {
    example (arg) {
      return `<example-${arg}/>`
    },
    video (url) {
      return `<video controls>
        <source src="${url}" type="video/mp4">
      </video>`
    }
  })
```

将以下Markdown内容

```markdown
@[example](hello)

@[video](video.mp4)
```

转换为以下部分：

```html
<example-hello/>
<video controls>
  <source src="video.mp4" type="video/mp4">
</video>
```

基本是符合我们要求的。以下是具体实现。

#### 页面使用

```html
<!DOCTYPE html>
<html>

<head>
  <title>Markdown to HTML</title>
</head>
<body>
  <div id="markdown-content">
  </div>
  <script type="module">
    import MarkdownIt from "https://esm.sh/v115/markdown-it@13.0.1/es2022/markdown-it.mjs";
    import customBlock from "https://esm.sh/v115/markdown-it-custom-block@0.1.2/es2022/markdown-it-custom-block.mjs";
    // 创建一个Markdown解析器
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

    const markdownContent = `# Demo演示
    下面是个样例：

@[playground](sample_021_Hello)


    这是示例2：

@[playground](sample_021_Hello?width=400&height=200)
        `;
    console.log(markdownContent)

    const result = md.render(markdownContent);
    // 将替换后的HTML渲染到页面中
    document.getElementById('markdown-content').innerHTML = result;

  </script>
</body>

</html>
```
页面效果
![image.png](https://cdn.nlark.com/yuque/0/2023/png/8420122/1681637936493-1dbb711b-5421-4776-9e67-11eb24b8c0d8.png#averageHue=%23696866&clientId=u0cd879f1-07f7-4&from=paste&height=757&id=u5dc48751&name=image.png&originHeight=1514&originWidth=1638&originalType=binary&ratio=2&rotation=0&showTitle=false&size=840731&status=done&style=none&taskId=u21f2ad68-6509-489d-a9fa-c92ed2abaa3&title=&width=819)
#### Node.js版本
```javascript
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
});

app.use(async ctx => {
  const str = fs.readFileSync("demo.md", {
    encoding: "utf-8"
  });
  const result = md.render(str);
  ctx.body = result;
});

app.listen(3000);
```

这是用到的demo.md

```markdown
# Demo演示

下面是个样例：

@[playground](sample_021_Hello)


这是示例2：

@[playground](sample_021_Hello?width=400&height=200)
```

### 方案二

参考[markdown-it-video](https://github.com/CenterForOpenScience/markdown-it-video)，封装一个插件（其实参考markdown-it-custom-block也一样，也可以基于上面的情况封装一层）：

```javascript
// 定义正则表达式匹配playground标签
const playgroundRegexp = /^@\[playground\]\((.+)\)/;
const service = "playground"

function transPlay(playgroundId, options) {
  let width = options.width;
  let height = options.height;
  if (playgroundId.includes("?")) {
    let arr = playgroundId.split("?");
    playgroundId = arr[0];
    const search = new URLSearchParams(arr[1]);
    width = search.get("width") || width;
    height = search.get("height") || height;
  }
  const src = (options.formatIframeUrl || formatIframeUrl)(playgroundId);
  return `<iframe width="${width}" height="${height}" src="${src}"></iframe>`;
}

function formatIframeUrl(playgroundId) {
  if (playgroundId.startsWith("http")) {
    return playgroundId;
  }
  return `https://www.thingjs.com/guide/sampleindex.html?m=examples/js/${playgroundId}.js`
}

function tokenizePlayground(md, options) {
  return (tokens, idx) => {
    return transPlay(tokens[idx].playgroundId, options);
  }
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

  state.pos += state.src.indexOf(')', state.pos) + 1;
  return true;
}

export default function playgroundPlugin(md, options = {
  width: 800,
  height: 500,
}) {
  md.renderer.rules.playground = tokenizePlayground(md, options);
  md.inline.ruler.before('emphasis', service, playgroundEmbed);
}
```

#### 页面使用

```html
<!DOCTYPE html>
<html>

<head>
  <title>Markdown to HTML</title>
</head>

<body>
  <div id="markdown-content">
  </div>

  <script type="module">
    import MarkdownIt from "https://esm.sh/v115/markdown-it@13.0.1/es2022/markdown-it.mjs";
    import playgroundPlugin from "./playgroundPlugin.js";
    // 创建一个Markdown解析器
    const md = new MarkdownIt();
    md.use(playgroundPlugin);

    const markdownContent = `# Demo演示
    下面是个样例：

@[playground](sample_021_Hello)


    这是示例2：

@[playground](sample_021_Hello?width=400&height=200)
        `;

    const result = md.render(markdownContent);
    // 将替换后的HTML渲染到页面中
    document.getElementById('markdown-content').innerHTML = result;

  </script>
</body>

</html>
```

#### Node.js版本

```javascript
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
  const result = md.render(str);
  ctx.body = result;
});

app.listen(3000);
```
