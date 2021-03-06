const fs = require("fs");
const Koa = require("koa");
const path = require("path");
const koaStatic = require("koa-static");
const app = new Koa();

const resolve = (file) => path.resolve(__dirname, file);
// 开放dist目录
app.use(koaStatic(resolve("../dist/client")));

// 第 2 步：获得一个createBundleRenderer
const { createBundleRenderer } = require("vue-server-renderer");
const serverBundle = require("../dist/server/vue-ssr-server-bundle.json");
const clientManifest = require("../dist/client/vue-ssr-client-manifest.json");

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: fs.readFileSync(
    path.resolve(__dirname, "../src/index.html"),
    "utf-8"
  ),
  clientManifest,
});

function renderToString(context) {
  return new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      err ? reject(err) : resolve(html);
    });
  });
}

// 第 3 步：添加一个中间件来处理所有请求
app.use(async (ctx, next) => {
  const context = {
    title: "Hello SSR",
    url: ctx.url,
  };
  // 将 context 数据渲染为 HTML
  const html = await renderToString(context);
  ctx.body = html;
});

/*服务启动*/
const port = 3000;
app.listen(port, function() {
  console.log(`server started at localhost:${port}`);
});
