# vite中间件原理
vite中间件在vite整个架构中充当了重要角色，当vite服务启动后，页面相关请求和编译都要经过中间件处理，其中编译过程中进行了缓存优化，极大提升了编译效率，并且vite对外暴露了middleware对象，允许我们自定义中间件。


## 中间件概述
::: tip 中间件概述

vite服务的本质是借助```import('node:http')、import('node:https')、import('node:http2')```启动了一个node服务，然后引用第三方库[connect](https://www.npmjs.com/package/connect)，注册中间件，处理具体代理转发请求，静态资源，代码编译等功能。

:::


``` js{3,7}
const app = connect()

app.use(middleware()) // 示例代码 注册各种中间件

const { createServer } = await import('node:http') //http协议

return createServer(app)
```
```js{3,7}
const app = connect()

app.use(middleware()) // 示例代码 注册各种中间件

const { createServer } = await import('node:https') //https协议

return createServer(httpsOptions, app)
```
```js{3,13}
const app = connect() 

app.use(middleware()) // 示例代码 注册各种中间件

const { createSecureServer } = await import('node:http2') //https2协议

    return createSecureServer(
      {
        maxSessionMemory: 1000,
        ...httpsOptions,
        allowHTTP1: true,
      },
      app,
    )
```
## baseMiddleware中间件
::: tip baseMiddleware中间件

baseMiddleware负责把我们的base路径转换成项目目录，即当我们访问`localhost:5173/`会自动跳转到`localost:5173/vue-source-docs/`路径下。源码里面执行res.writeHead方法设置响应头，借助Location属性进行重定向，跳转到项目配置的路径下。源码如下:

```js{11,12,13,14,15}
export function baseMiddleware(
  rawBase: string,
  middlewareMode: boolean,
): Connect.NextHandleFunction {
  return function viteBaseMiddleware(req, res, next) {
    const url = req.url!
    const pathname = cleanUrl(url)
    const base = rawBase
    // 这里的writeHead方法用于设置响应头，借助Location字段进行重定向，
    // 实现了localhost:5173/ 重定向到localhost:5173/vue-source-docs/
    if (pathname === '/' || pathname === '/index.html') {
      res.writeHead(302, {
        Location: base + url.slice(pathname.length),
      })
      res.end()
      return
    }
  }
}

```
::: 

## indexHtmlMiddleware中间件
::: tip indexHtmlMiddleware中间件
indexHtmlMiddleware主要是处理index.html文件，给head中meta标签添加`meta csp-nonce`属性，防止内联脚本被恶意篡改或注入。将html文件中模板变量`%xxx%`替换成对应`define中配置的变量`。给style/script标签添加`nonce`属性，同时在中间执行自定义插件的`transformIndexHtml`方法，最后将html通过`res.end(content)`返回给浏览器。源码如下：



```js{10,11,12}
export function injectCspNonceMetaTagHook(
  config: ResolvedConfig,
): IndexHtmlTransformHook {
  return () => {
    if (!config.html?.cspNonce) return
    // <meta property="csp-nonce" nonce="xxxx"> 注入到head中，
    // 防止内联脚本被恶意篡改或注入
    return [
      {
        tag: 'meta',
        injectTo: 'head',
        attrs: { property: 'csp-nonce', nonce: config.html.cspNonce },
      },
    ]
  }
}
```

:::

## transformMiddleware中间件
::: tip transformMiddleware中间件
transformMiddleware主要编译其它文件(.html文件不处理)，当打开`localhost:5173/`将index.html文件返回给浏览器后，浏览器会根据index.html文件中引用的其它文件(比如index.js/index.css等等)，会再次发起请求，这时候transformMiddleware中间件就会对这些文件进行编译转换，然后将转换的结果返回给浏览器。transform中会依次执行vite插件api函数，`resolveId/load/transform`方法。vite执行方法的顺序跟rollup是类似的，`先执行所有插件的resolveId方法，然后执行load方法，最后执行transform方法`,最终把编译好的代码经过`res.end(result)`返回给浏览器。源码如下：
:::


::: info resolveId方法代码块
```js{12,14}
async function doTransform(
  environment: DevEnvironment,
  url: string,
  options: TransformOptions,
  timestamp: number
) {
  url = removeTimestampQuery(url)
  // 省略其它代码
  let module = await environment.moduleGraph.getModuleByUrl(url)
  const resolved = module
    ? undefined
    : ((await pluginContainer.resolveId(url, undefined)) ?? undefined)
  // 省略其它代码
  const result = loadAndTransform(
    environment,
    id,
    url,
    options,
    timestamp,
    module,
    resolved,
  )
  return result
}
```
:::



::: info load和transform方法代码块
```js{12,15}
async function loadAndTransform(
  environment: DevEnvironment,
  id: string,
  url: string,
  options: TransformOptions,
  timestamp: number,
  mod?: EnvironmentModuleNode,
  resolved?: PartialResolvedId,
) {
  const { config, pluginContainer, logger } = environment
  // 省略中间代码
  const loadResult = await pluginContainer.load(id)
  // 省略中间代码
  // map是load方法返回map
  const transformResult = await pluginContainer.transform(code, id, {
    inMap: map,
  })
}

```
:::