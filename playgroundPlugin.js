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
