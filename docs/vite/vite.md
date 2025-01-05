# vite原理

This page demonstrates some of the built-in markdown extensions provided by VitePress.

## vite目录结构说明

```
vite/
├─ bin
│  ├─ openChrome.applescript 
│  └─ vite.js
├─ node_modules/
├─ src
│  ├─ client/
│  │  ├─ client.ts
│  │  ├─ env.ts
│  │  ├─ overlay.ts
│  │  └─ tsconfig.json 
│  ├─ node/
│  │   ├─ __tests__/
│  │   ├─ optimizer 
│  │   ├─ plugins/
│  │   ├─ server/
│  │   ├─ ssr/
│  │   ├─ build.ts
│  │   ├─ cli.ts
│  │   ├─ config.ts
│  │   ├─constants.ts
│  │   ├─env.ts
│  │   ├─fsUtils.ts
│  │   ├─http.ts
│  │   ├─index.ts
│  │   ├─logger.ts
│  │   ├─packages.ts
│  │   ├─plugin.ts
│  │   ├─preview.ts
│  │   ├─publicDir.ts
│  │   ├─publicUtils.ts
│  │   ├─shortcuts.ts
│  │   ├─tsconfig.json
│  │   ├─utils.ts
|  │   └─ watch.ts
│  ├─  runtime/ 
│  │   ├─ client.ts
│  │   ├─ index.ts
│  ├─ shared/
│  │    ├─ index.ts
│  └─ types/
├─ types/
├─ CHANGELOG.md
├─ client.d.ts
├─ index.cjs
├─ index.d.cts
├─ LICENSE.md
├─ package.json
├─ README.md
├─ rollup.config.ts
├─ rollup.dts.config.ts
├─ rollupLicensePlugin.ts
├─ tsconfig.base.json
├─ tsconfig.check.json
└─ tsconfig.json
```

## package.json解析

```json
  {
  "name": "vite",
  "version": "6.0.3",
  "type": "module",
  "license": "MIT",
  "author": "Evan You",
  "description": "Native-ESM powered web dev build tool",
  // bin配置 vite作为第三方安装包，执行vite相关命令时，其实就是执行bin/vite.js
  "bin": {
    "vite": "bin/vite.js"
  },
  "keywords": [
    "frontend",
    "framework",
    "hmr",
    "dev-server",
    "build-tool",
    "vite"
  ],
  // 定义打包后入口文件
  "main": "./dist/node/index.js",
  // 定义打包后类型文件入口
  "types": "./dist/node/index.d.ts",
  "exports": {
    ".": {
      "module-sync": "./dist/node/index.js",
      "import": "./dist/node/index.js",
      "require": "./index.cjs"
    },
    "./client": {
      "types": "./client.d.ts"
    },
    "./module-runner": "./dist/node/module-runner.js",
    "./dist/client/*": "./dist/client/*",
    "./types/*": {
      "types": "./types/*"
    },
    "./types/internal/*": null,
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "module-runner": [
        "dist/node/module-runner.d.ts"
      ]
    }
  },
  "imports": {
    "#module-sync-enabled": {
      "module-sync": "./misc/true.js",
      "default": "./misc/false.js"
    }
  },
  "files": [
    "bin",
    "dist",
    "misc/**/*.js",
    "client.d.ts",
    "index.cjs",
    "index.d.cts",
    "types"
  ],
  "engines": {
    "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vitejs/vite.git",
    "directory": "packages/vite"
  },
  "bugs": {
    "url": "https://github.com/vitejs/vite/issues"
  },
  "homepage": "https://vite.dev",
  "funding": "https://github.com/vitejs/vite?sponsor=1",
  "scripts": {
    // 开发时候执行的命令
    "dev": "tsx scripts/dev.ts",
    // 打包
    "build": "premove dist && pnpm build-bundle && pnpm build-types",
    "build-bundle": "rollup --config rollup.config.ts --configPlugin esbuild",
    "build-types": "pnpm build-types-temp && pnpm build-types-roll && pnpm build-types-check",
    "build-types-temp": "tsc --emitDeclarationOnly --outDir temp -p src/node/tsconfig.build.json",
    "build-types-roll": "rollup --config rollup.dts.config.ts --configPlugin esbuild && premove temp",
    "build-types-check": "tsc --project tsconfig.check.json",
    "typecheck": "tsc --noEmit && tsc --noEmit -p src/node",
    "lint": "eslint --cache --ext .ts src/**",
    "format": "prettier --write --cache --parser typescript \"src/**/*.ts\"",
    "prepublishOnly": "npm run build"
  },
  "//": "READ CONTRIBUTING.md to understand what to put under deps vs. devDeps!",
  "dependencies": {
    "esbuild": "^0.24.0",
    "postcss": "^8.4.49",
    "rollup": "^4.23.0"
  },
  "optionalDependencies": {
    "fsevents": "~2.3.3"
  },
  // 开发依赖 build时不会打包进去
  "devDependencies": {
    "@ampproject/remapping": "^2.3.0",
    "@babel/parser": "^7.26.3",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@polka/compression": "^1.0.0-next.25",
    "@rollup/plugin-alias": "^5.1.1",
    "@rollup/plugin-commonjs": "^28.0.1",
    "@rollup/plugin-dynamic-import-vars": "2.1.4",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "15.3.0",
    "@rollup/pluginutils": "^5.1.3",
    "@types/escape-html": "^1.0.4",
    "@types/pnpapi": "^0.0.5",
    "artichokie": "^0.2.1",
    "cac": "^6.7.14",
    "chokidar": "^3.6.0",
    "connect": "^3.7.0",
    "convert-source-map": "^2.0.0",
    "cors": "^2.8.5",
    "cross-spawn": "^7.0.6",
    "debug": "^4.4.0",
    "dep-types": "link:./src/types",
    "dotenv": "^16.4.7",
    "dotenv-expand": "^12.0.1",
    "es-module-lexer": "^1.5.4",
    "escape-html": "^1.0.3",
    "estree-walker": "^3.0.3",
    "etag": "^1.8.1",
    "http-proxy": "^1.18.1",
    "launch-editor-middleware": "^2.9.1",
    "lightningcss": "^1.28.2",
    "magic-string": "^0.30.14",
    "mlly": "^1.7.3",
    "mrmime": "^2.0.0",
    "nanoid": "^5.0.9",
    "open": "^10.1.0",
    "parse5": "^7.2.1",
    "pathe": "^1.1.2",
    "periscopic": "^4.0.2",
    "picocolors": "^1.1.1",
    "picomatch": "^4.0.2",
    "postcss-import": "^16.1.0",
    "postcss-load-config": "^6.0.1",
    "postcss-modules": "^6.0.1",
    "resolve.exports": "^2.0.3",
    "rollup-plugin-dts": "^6.1.1",
    "rollup-plugin-esbuild": "^6.1.1",
    "rollup-plugin-license": "^3.5.3",
    "sass": "^1.82.0",
    "sass-embedded": "^1.82.0",
    "sirv": "^3.0.0",
    "source-map-support": "^0.5.21",
    "strip-literal": "^2.1.1",
    "tinyglobby": "^0.2.10",
    "tsconfck": "^3.1.4",
    "tslib": "^2.8.1",
    "types": "link:./types",
    "ufo": "^1.5.4",
    "ws": "^8.18.0"
  },
  "peerDependencies": {
    "@types/node": "^18.0.0 || ^20.0.0 || >=22.0.0",
    "jiti": ">=1.21.0",
    "less": "*",
    "lightningcss": "^1.21.0",
    "sass": "*",
    "sass-embedded": "*",
    "stylus": "*",
    "sugarss": "*",
    "terser": "^5.16.0",
    "tsx": "^4.8.1",
    "yaml": "^2.4.2"
  },
  "peerDependenciesMeta": {
    "@types/node": {
      "optional": true
    },
    "jiti": {
      "optional": true
    },
    "sass": {
      "optional": true
    },
    "sass-embedded": {
      "optional": true
    },
    "stylus": {
      "optional": true
    },
    "less": {
      "optional": true
    },
    "sugarss": {
      "optional": true
    },
    "lightningcss": {
      "optional": true
    },
    "terser": {
      "optional": true
    },
    "tsx": {
      "optional": true
    },
    "yaml": {
      "optional": true
    }
  }
}


```
## dev命令解析

执行tsx scripts/dev.ts 命令,进入packages\vite\scripts\dev.ts

**dev.ts**
```js
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { type BuildOptions, context } from 'esbuild'
import packageJSON from '../package.json'
//每次dev执行都递归删除dist目录
rmSync('dist', { force: true, recursive: true })
//递归重新创建dist/node目录
mkdirSync('dist/node', { recursive: true })
//在dist/node/index.d.ts文件中写入内容
writeFileSync('dist/node/index.d.ts', "export * from '../../src/node/index.ts'")
//写入内容
writeFileSync(
  'dist/node/module-runner.d.ts',
  "export * from '../../src/module-runner/index.ts'",
)

const serverOptions: BuildOptions = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  external: [
    ...Object.keys(packageJSON.dependencies),
    ...Object.keys(packageJSON.peerDependencies),
    ...Object.keys(packageJSON.optionalDependencies),
    ...Object.keys(packageJSON.devDependencies),
  ],
}
const clientOptions: BuildOptions = {
  bundle: true,
  platform: 'browser',
  target: 'es2020',
  format: 'esm',
  sourcemap: true,
}
//核心还是执行watch，这里用的是esbuild的watch方法,根webpack监听类似,实时刷新
const watch = async (options: BuildOptions) => {
  const ctx = await context(options)
  await ctx.watch()
}
// 为什么会多个watch呢？因为这些入口文件彼此独立的，相当于多个入口，所有创建多个watch，修改代码的同时会生成dist对应文件
// 这里监听src/client/env.ts
void watch({
  entryPoints: ['src/client/env.ts'],
  outfile: 'dist/client/env.mjs',
  ...clientOptions,
})
// 这里监听src/client/client.ts
void watch({
  entryPoints: ['src/client/client.ts'],
  outfile: 'dist/client/client.mjs',
  //上面env.ts是单独打包的，所以需要client.ts对env.ts引用的排除
  external: ['@vite/env'],
  ...clientOptions,
})
// 这里监听src/node/cli.ts，src/node/constants.ts，src/node/index.ts。这里是多入口文件打包
// 因为这里主要在node环境执行，上面两个是用在浏览器环境执行的，所以分开监听编译,这里面是vite打包核心所在，
// 上面两个文件会在项目打包时候通过请求返回给浏览器，注入到前端代码中，可在浏览器中看到这段代码
void watch({
  ...serverOptions,
  entryPoints: {
    cli: 'src/node/cli.ts',
    constants: 'src/node/constants.ts',
    index: 'src/node/index.ts',
  },
  outdir: 'dist/node',
  format: 'esm',
  splitting: true,
  chunkNames: '_[name]-[hash]',
  
  define: { require: '___require' },
  plugins: [
    {
      //自定义插件，打包结束时候将___require替换为require,原因是esbuild打包时候require()是顶层变量，在worker中找不到，所以需要替换为__require,打包完后再替换回去
      name: 'log',
      setup(build) {
        let first = true
        build.onEnd(() => {
          for (const file of readdirSync('dist/node')) {
            const path = `dist/node/${file}`
            const content = readFileSync(path, 'utf-8')
            if (content.includes('___require')) {
              writeFileSync(path, content.replaceAll('___require', 'require'))
            }
          }
          if (first) {
            first = false
            console.log('Watching...')
          } else {
            console.log('Rebuilt')
          }
        })
      },
    },
  ],
})
// 同上一样
void watch({
  ...serverOptions,
  entryPoints: ['./src/module-runner/index.ts'],
  outfile: 'dist/node/module-runner.js',
  format: 'esm',
})
// 公共方法库单独编译
void watch({
  ...serverOptions,
  entryPoints: ['./src/node/publicUtils.ts'],
  outfile: 'dist/node-cjs/publicUtils.cjs',
  format: 'cjs',
  //打包后插入这段代码
  banner: {
    js: `
const { pathToFileURL } = require("node:url")
const __url = pathToFileURL(__filename)`.trimStart(),
  },
  //定义全局变量 跟webpack和vite类似，这里的__url变量会被替换为import.meta.url，引用的是上面注入代码的url
  define: {
    'import.meta.url': '__url',
  },
})


```
## vite是怎么运行的
当我们把vite经过npm install -g vite安装到本地后，node安装目录里有vite经过build打包后的代码，```node安装根目录\node\node_modules\npm\node_modules\vite```,当我们执行vite init vue my-vue-app等命令后，vite会执行刚才目录的vite/bin/vite.js文件，该文件内容如下：

在vite/bin/vite.js中第一行代码是```#!/usr/bin/env node```，这是告知系统这个文件用node执行，这段代码很重要，没有不行。/usr/bin/env在这里作用是查找环境变量，并用node执行。

vite/bin/vite.js主要执行start这个方法，该方法会先判断是否是profile模式，如果是，则开启profile，启用开发调试。会将Session挂在全局变量上global.__vite_profile_session，在后面使用。否则该方法中主要执行import('../dist/node/cli.js')，这个文件主要还是开发诊断，否则生产环境执行cli.js逻辑。

```js
function start() {
  try {
    module.enableCompileCache?.()
  } catch {}
  // 注意这里文件路径，在上面的watch方法中，dist/node/cli.js文件是打包后的文件，这个文件是在dev开发时候实时生成的
  return import('../dist/node/cli.js')
}

if (profileIndex > 0) {
  process.argv.splice(profileIndex, 1)
  const next = process.argv[profileIndex]
  if (next && !next.startsWith('-')) {
    process.argv.splice(profileIndex, 1)
  }
  const inspector = await import('node:inspector').then((r) => r.default)
  const session = (global.__vite_profile_session = new inspector.Session())
  session.connect()
  session.post('Profiler.enable', () => {
    session.post('Profiler.start', start)
  })
} else {
  start()
}
```

## cli.js文件解析

接下来分析cli.ts文件，执行逻辑从cli命令开始

这里是开始获取npm的cli命令参数，后面会区分dev和build命令，dev是开发模式，build是打包模式。option是npm命令参数，cli.option是获取npm命令参数的配置。这里用的是cac第三方库。这里是执行不同命令的通用参数配置。具体插件[cac](https://www.npmjs.com/package/cac)库使用方法。

```js
const cli = cac('vite')
cli
  .option('-c, --config <file>', `[string] use specified config file`)
  .option('--base <path>', `[string] public base path (default: /)`, {
    type: [convertBase],
  })
  .option('-l, --logLevel <level>', `[string] info | warn | error | silent`)
  .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
  .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
  .option('-f, --filter <filter>', `[string] filter debug logs`)
  .option('-m, --mode <mode>', `[string] set env mode`)

```

这里是执行vite/vite dev/vite server命令
```js
cli
  .command('[root]', 'start dev server') // default command
  .alias('serve') // the command is called 'serve' in Vite's API
  .alias('dev') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`, { type: [convertHost] })
  .option('--port <port>', `[number] specify port`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('--cors', `[boolean] enable CORS`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option(
    '--force',
    `[boolean] force the optimizer to ignore the cache and re-bundle`,
  )
  .action(async (root: string, options: ServerOptions & GlobalCLIOptions) => {
    filterDuplicateOptions(options)
    // 这里开始是开发模式核心，createServer粗暴理解为启动node服务
    const { createServer } = await import('./server')
    try {
      const server = await createServer({
        root,
        base: options.base,
        mode: options.mode,
        configFile: options.config,
        logLevel: options.logLevel,
        clearScreen: options.clearScreen,
        optimizeDeps: { force: options.force },
        server: cleanGlobalCLIOptions(options),
      })

      if (!server.httpServer) {
        throw new Error('HTTP server not available')
      }

      await server.listen()

      const info = server.config.logger.info

      const viteStartTime = global.__vite_start_time ?? false
      //这里用现在事件-启动时间，求的启动所用时间，picocolors可以控制终端日志输出不同颜色
      const startupDurationString = viteStartTime
        ? colors.dim(
            `ready in ${colors.reset(
              colors.bold(Math.ceil(performance.now() - viteStartTime)),
            )} ms`,
          )
        : ''
      const hasExistingLogs =
        process.stdout.bytesWritten > 0 || process.stderr.bytesWritten > 0

      info(
        `\n  ${colors.green(
          `${colors.bold('VITE')} v${VERSION}`,
        )}  ${startupDurationString}\n`,
        {
          clear: !hasExistingLogs,
        },
      )
      // 打印启动服务地址 localhost:5173/
      server.printUrls()
      const customShortcuts: CLIShortcut<typeof server>[] = []
      if (profileSession) {
        // 这里是node服务跑起来后可用的快捷键操作，如果vite启动命令中加了--profile参数，
        // 这个p + enter快捷键就会生效，启动profile模式，stop后stopProfiler会在本地生成一个类似vite-profile-0.cpuprofile的文件
        //里面会记录函数执消耗行时间
        customShortcuts.push({
          key: 'p',
          description: 'start/stop the profiler',
          async action(server) {
            if (profileSession) {
              await stopProfiler(server.config.logger.info)
            } else {
              const inspector = await import('node:inspector').then(
                (r) => r.default,
              )
              await new Promise<void>((res) => {
                profileSession = new inspector.Session()
                profileSession.connect()
                profileSession.post('Profiler.enable', () => {
                  profileSession!.post('Profiler.start', () => {
                    server.config.logger.info('Profiler started')
                    res()
                  })
                })
              })
            }
          },
        })
      }
      // 将p快捷键操参数注册到server中
      server.bindCLIShortcuts({ print: true, customShortcuts })
    } catch (e) {
      // 异常日式打印方法
      const logger = createLogger(options.logLevel)
      logger.error(colors.red(`error when starting dev server:\n${e.stack}`), {
        error: e,
      })
      stopProfiler(logger.info)
      process.exit(1)
    }
  })
```

createServer具体逻辑

```js 
export async function _createServer(
  inlineConfig: InlineConfig = {},
  options: {
    listen: boolean
    previousEnvironments?: Record<string, DevEnvironment>
  },
): Promise<ViteDevServer> {
  // 这里主要是将配置信息进行各种组合，从工程中读取vite.config.xx(后缀名可以是js/ts/mjs/cjs等)配置信息，执行配置插件的config和configResolved方法，并将处理结果合并到config返回结果
  const config = await resolveConfig(inlineConfig, 'serve')

  // 这里是递归去返回了public里面的静态文件名称，返回文件名称放在new Set()中，返回值是Set类型,
  // 并把set又放在全局map中进行存储，便于后续调用，核心还是返回public里面的文件名称
  const initPublicFilesPromise = initPublicFiles(config)

  const { root, server: serverConfig } = config

  // 这里是返回https配置信息
  const httpsOptions = await resolveHttpsConfig(config.server.https)
  const { middlewareMode } = serverConfig

  // 输出build的outDir目录，有rollupOptions用rollupOptions，没有就用config.root和
  // config.build.outDir的拼接
  const resolvedOutDirs = getResolvedOutDirs(
    config.root,
    config.build.outDir,
    config.build.rollupOptions.output,
  )
  // 验证outdir是否在工程根目录下，不在会有warnning提示，并且会用watch监听outdir文件变化，
  // 反之不监听outdir
  const emptyOutDir = resolveEmptyOutDir(
    config.build.emptyOutDir,
    config.root,
    resolvedOutDirs,
  )
  // 设定watch不需要监听变化的文件夹，默认是node_modules/.git等文件夹,
  // emptyOutDir为true时，outdir变动也不会被监听
  const resolvedWatchOptions = resolveChokidarOptions(
    {
      disableGlobbing: true,
      ...serverConfig.watch,
    },
    resolvedOutDirs,
    emptyOutDir,
    config.cacheDir,
  )
  // 这里是创建中间件,更express中间件一个道理
  const middlewares = connect() as Connect.Server
  // 这里是创建http服务, 如果用户自定义了server.middlewareMode为true，则不会创建http服务
  // server会在后面以注册中间件的方式启动http服务，否则在这里直接启动server
  const httpServer = middlewareMode
    ? null
    : await resolveHttpServer(serverConfig, middlewares, httpsOptions)

  // 这里是创建websocket服务，浏览器端会通过websocket与vite建立联系，vite监听到文件变化后，会通过websocket发
  // 送消息给浏览器端websocket，热更新对应组件
  // 有一点注意的是，vite创建websocket没有单独创建websocket服务，而是通过http服务创建websocket服务，利用
  // http的upgrade事件，将http服务升级为websocket服务，而浏览器端是直接创建了websocket服务，这样只用http服务
  // 就可实现代理proxy和socket通信，一个服务做两件事。
  const ws = createWebSocketServer(httpServer, config, httpsOptions)

  //这里是public下所有文件名称，采用递归查找，返回一个set集合，async函数返回的是一个promise对象
  const publicFiles = await initPublicFilesPromise
  const { publicDir } = config

  // 如果创建http这里则设置http服务异常处理，logger可自定义，无自定义则用默认的logger方法
  if (httpServer) {
    setClientErrorHandler(httpServer, config.logger)
  }

  // eslint-disable-next-line eqeqeq
  // 这行代码绕过了eslint的eq规则
  const watchEnabled = serverConfig.watch !== null
  // 这里判断是否启用watcher监听文件变化，chokidar是第三方库watcher工具库
  // watch方法两个参数，第一个是配置需要监听的文件目录，第二个是配置
  const watcher = watchEnabled
    ? (chokidar.watch(
        // 监听config file和public是因为config file 和 public 可能在根目录之外
        [
          root,
          ...config.configFileDependencies,
          ...getEnvFilesForMode(config.mode, config.envDir),
          ...(publicDir && publicFiles ? [publicDir] : []),
        ],

        resolvedWatchOptions,
      ) as FSWatcher)
    : createNoopWatcher(resolvedWatchOptions)

  const environments: Record<string, DevEnvironment> = {}

  for (const [name, environmentOptions] of Object.entries(
    config.environments,
  )) {
    environments[name] = await environmentOptions.dev.createEnvironment(
      name,
      config,
      {
        ws,
      },
    )
  }

  for (const environment of Object.values(environments)) {
    const previousInstance = options.previousEnvironments?.[environment.name]
    await environment.init({ watcher, previousInstance })
  }

  // Backward compatibility

  let moduleGraph = new ModuleGraph({
    client: () => environments.client.moduleGraph,
    ssr: () => environments.ssr.moduleGraph,
  })

  //这个顾名思义就是封装插件的方法，返回分装对象，在后面调用
  const pluginContainer = createPluginContainer(environments)

  // http服务停止时候的回调方法，跟setClientErrorHandler其实可以放一起
  const closeHttpServer = createServerCloseFn(httpServer)

  // 这个是对index.html文件进行修改，比如head和body的插入，以及script标签需要插入部分逻辑代码，
  // 因为默认的index.html只有<div id="app">,vue工程运行后会插入用户写js逻辑和css样式，还有vue自身
  // 修改的代码
  const devHtmlTransformFn = createDevHtmlTransformFn(config)

  // 这个server是vite最后返回给我们的对象，我们在使用vite时候调用的方法就是sever这个对象返回的，
  // 这个server就是上面内容的总结，向外提供给我们封装好的对象，便于我们配置相关参数和调用
  let server: ViteDevServer = {
    //配置信息
    config,
    // 中间件
    middlewares,
    httpServer,
    // 文件变化监听，比如文件修改新增删除都会触发
    watcher,
    //这个是websocket
    ws,
    // 这个是对旧版本热更新的兼容，新的用environment.hot替换
    hot: createDeprecatedHotBroadcaster(ws),

    environments,
    // 插件容器，其实就是将插件的相关方法封装在一起
    pluginContainer,
    get moduleGraph() {
      warnFutureDeprecation(config, 'removeServerModuleGraph')
      return moduleGraph
    },
    set moduleGraph(graph) {
      moduleGraph = graph
    },

    resolvedUrls: null, // will be set on listen
    ssrTransform(
      code: string,
      inMap: SourceMap | { mappings: '' } | null,
      url: string,
      originalCode = code,
    ) {
      return ssrTransform(code, inMap, url, originalCode, {
        json: {
          stringify:
            config.json.stringify === true && config.json.namedExports !== true,
        },
      })
    },
    // environment.transformRequest and .warmupRequest don't take an options param for now,
    // so the logic and error handling needs to be duplicated here.
    // The only param in options that could be important is `html`, but we may remove it as
    // that is part of the internal control flow for the vite dev server to be able to bail
    // out and do the html fallback
    transformRequest(url, options) {
      warnFutureDeprecation(
        config,
        'removeServerTransformRequest',
        'server.transformRequest() is deprecated. Use environment.transformRequest() instead.',
      )
      const environment = server.environments[options?.ssr ? 'ssr' : 'client']
      return transformRequest(environment, url, options)
    },
    async warmupRequest(url, options) {
      try {
        const environment = server.environments[options?.ssr ? 'ssr' : 'client']
        await transformRequest(environment, url, options)
      } catch (e) {
        if (
          e?.code === ERR_OUTDATED_OPTIMIZED_DEP ||
          e?.code === ERR_CLOSED_SERVER
        ) {
          // these are expected errors
          return
        }
        // Unexpected error, log the issue but avoid an unhandled exception
        server.config.logger.error(
          buildErrorMessage(e, [`Pre-transform error: ${e.message}`], false),
          {
            error: e,
            timestamp: true,
          },
        )
      }
    },
    transformIndexHtml(url, html, originalUrl) {
      return devHtmlTransformFn(server, url, html, originalUrl)
    },
    async ssrLoadModule(url, opts?: { fixStacktrace?: boolean }) {
      warnFutureDeprecation(config, 'removeSsrLoadModule')
      return ssrLoadModule(url, server, opts?.fixStacktrace)
    },
    ssrFixStacktrace(e) {
      ssrFixStacktrace(e, server.environments.ssr.moduleGraph)
    },
    ssrRewriteStacktrace(stack: string) {
      return ssrRewriteStacktrace(stack, server.environments.ssr.moduleGraph)
    },
    async reloadModule(module) {
      if (serverConfig.hmr !== false && module.file) {
        // TODO: Should we also update the node moduleGraph for backward compatibility?
        const environmentModule = (module._clientModule ?? module._ssrModule)!
        updateModules(
          environments[environmentModule.environment]!,
          module.file,
          [environmentModule],
          Date.now(),
        )
      }
    },
    async listen(port?: number, isRestart?: boolean) {
      await startServer(server, port)
      if (httpServer) {
        server.resolvedUrls = await resolveServerUrls(
          httpServer,
          config.server,
          config,
        )
        if (!isRestart && config.server.open) server.openBrowser()
      }
      return server
    },
    openBrowser() {
      const options = server.config.server
      const url =
        server.resolvedUrls?.local[0] ?? server.resolvedUrls?.network[0]
      if (url) {
        const path =
          typeof options.open === 'string'
            ? new URL(options.open, url).href
            : url

        // We know the url that the browser would be opened to, so we can
        // start the request while we are awaiting the browser. This will
        // start the crawling of static imports ~500ms before.
        // preTransformRequests needs to be enabled for this optimization.
        if (server.config.server.preTransformRequests) {
          setTimeout(() => {
            const getMethod = path.startsWith('https:') ? httpsGet : httpGet

            getMethod(
              path,
              {
                headers: {
                  // Allow the history middleware to redirect to /index.html
                  Accept: 'text/html',
                },
              },
              (res) => {
                res.on('end', () => {
                  // Ignore response, scripts discovered while processing the entry
                  // will be preprocessed (server.config.server.preTransformRequests)
                })
              },
            )
              .on('error', () => {
                // Ignore errors
              })
              .end()
          }, 0)
        }

        _openBrowser(path, true, server.config.logger)
      } else {
        server.config.logger.warn('No URL available to open in browser')
      }
    },
    async close() {
      if (!middlewareMode) {
        teardownSIGTERMListener(closeServerAndExit)
      }

      await Promise.allSettled([
        watcher.close(),
        ws.close(),
        Promise.allSettled(
          Object.values(server.environments).map((environment) =>
            environment.close(),
          ),
        ),
        closeHttpServer(),
        server._ssrCompatModuleRunner?.close(),
      ])
      server.resolvedUrls = null
      server._ssrCompatModuleRunner = undefined
    },
    printUrls() {
      if (server.resolvedUrls) {
        printServerUrls(
          server.resolvedUrls,
          serverConfig.host,
          config.logger.info,
        )
      } else if (middlewareMode) {
        throw new Error('cannot print server URLs in middleware mode.')
      } else {
        throw new Error(
          'cannot print server URLs before server.listen is called.',
        )
      }
    },
    bindCLIShortcuts(options) {
      bindCLIShortcuts(server, options)
    },
    async restart(forceOptimize?: boolean) {
      if (!server._restartPromise) {
        server._forceOptimizeOnRestart = !!forceOptimize
        server._restartPromise = restartServer(server).finally(() => {
          server._restartPromise = null
          server._forceOptimizeOnRestart = false
        })
      }
      return server._restartPromise
    },

    waitForRequestsIdle(ignoredId?: string): Promise<void> {
      return environments.client.waitForRequestsIdle(ignoredId)
    },

    _setInternalServer(_server: ViteDevServer) {
      // Rebind internal the server variable so functions reference the user
      // server instance after a restart
      server = _server
    },
    _importGlobMap: new Map(),
    _restartPromise: null,
    _forceOptimizeOnRestart: false,
    _shortcutsOptions: undefined,
  }

  // maintain consistency with the server instance after restarting.
  const reflexServer = new Proxy(server, {
    get: (_, property: keyof ViteDevServer) => {
      return server[property]
    },
    set: (_, property: keyof ViteDevServer, value: never) => {
      server[property] = value
      return true
    },
  })

  const closeServerAndExit = async (_: unknown, exitCode?: number) => {
    try {
      await server.close()
    } finally {
      process.exitCode ??= exitCode ? 128 + exitCode : undefined
      process.exit()
    }
  }

  if (!middlewareMode) {
    setupSIGTERMListener(closeServerAndExit)
  }

  const onHMRUpdate = async (
    type: 'create' | 'delete' | 'update',
    file: string,
  ) => {
    if (serverConfig.hmr !== false) {
      await handleHMRUpdate(type, file, server)
    }
  }

  const onFileAddUnlink = async (file: string, isUnlink: boolean) => {
    file = normalizePath(file)
    reloadOnTsconfigChange(server, file)

    await pluginContainer.watchChange(file, {
      event: isUnlink ? 'delete' : 'create',
    })

    if (publicDir && publicFiles) {
      if (file.startsWith(publicDir)) {
        const path = file.slice(publicDir.length)
        publicFiles[isUnlink ? 'delete' : 'add'](path)
        if (!isUnlink) {
          const clientModuleGraph = server.environments.client.moduleGraph
          const moduleWithSamePath =
            await clientModuleGraph.getModuleByUrl(path)
          const etag = moduleWithSamePath?.transformResult?.etag
          if (etag) {
            // The public file should win on the next request over a module with the
            // same path. Prevent the transform etag fast path from serving the module
            clientModuleGraph.etagToModuleMap.delete(etag)
          }
        }
      }
    }
    if (isUnlink) {
      // invalidate module graph cache on file change
      for (const environment of Object.values(server.environments)) {
        environment.moduleGraph.onFileDelete(file)
      }
    }
    await onHMRUpdate(isUnlink ? 'delete' : 'create', file)
  }

  watcher.on('change', async (file) => {
    file = normalizePath(file)
    reloadOnTsconfigChange(server, file)

    await pluginContainer.watchChange(file, { event: 'update' })
    // invalidate module graph cache on file change
    for (const environment of Object.values(server.environments)) {
      environment.moduleGraph.onFileChange(file)
    }
    await onHMRUpdate('update', file)
  })

  watcher.on('add', (file) => {
    onFileAddUnlink(file, false)
  })
  watcher.on('unlink', (file) => {
    onFileAddUnlink(file, true)
  })

  if (!middlewareMode && httpServer) {
    httpServer.once('listening', () => {
      // update actual port since this may be different from initial value
      serverConfig.port = (httpServer.address() as net.AddressInfo).port
    })
  }

  // apply server configuration hooks from plugins
  const postHooks: ((() => void) | void)[] = []
  for (const hook of config.getSortedPluginHooks('configureServer')) {
    postHooks.push(await hook(reflexServer))
  }

  // Internal middlewares ------------------------------------------------------

  // request timer
  if (process.env.DEBUG) {
    middlewares.use(timeMiddleware(root))
  }

  // cors (enabled by default)
  const { cors } = serverConfig
  if (cors !== false) {
    middlewares.use(corsMiddleware(typeof cors === 'boolean' ? {} : cors))
  }

  middlewares.use(cachedTransformMiddleware(server))

  // proxy
  const { proxy } = serverConfig
  if (proxy) {
    const middlewareServer =
      (isObject(middlewareMode) ? middlewareMode.server : null) || httpServer
    middlewares.use(proxyMiddleware(middlewareServer, proxy, config))
  }

  // base
  if (config.base !== '/') {
    middlewares.use(baseMiddleware(config.rawBase, !!middlewareMode))
  }

  // open in editor support
  middlewares.use('/__open-in-editor', launchEditorMiddleware())

  // ping request handler
  // Keep the named function. The name is visible in debug logs via `DEBUG=connect:dispatcher ...`
  middlewares.use(function viteHMRPingMiddleware(req, res, next) {
    if (req.headers['accept'] === 'text/x-vite-ping') {
      res.writeHead(204).end()
    } else {
      next()
    }
  })

  // serve static files under /public
  // this applies before the transform middleware so that these files are served
  // as-is without transforms.
  if (publicDir) {
    middlewares.use(servePublicMiddleware(server, publicFiles))
  }

  // main transform middleware
  middlewares.use(transformMiddleware(server))

  // serve static files
  middlewares.use(serveRawFsMiddleware(server))
  middlewares.use(serveStaticMiddleware(server))

  // html fallback
  if (config.appType === 'spa' || config.appType === 'mpa') {
    middlewares.use(htmlFallbackMiddleware(root, config.appType === 'spa'))
  }

  // run post config hooks
  // This is applied before the html middleware so that user middleware can
  // serve custom content instead of index.html.
  postHooks.forEach((fn) => fn && fn())

  if (config.appType === 'spa' || config.appType === 'mpa') {
    // transform index.html
    middlewares.use(indexHtmlMiddleware(root, server))

    // handle 404s
    middlewares.use(notFoundMiddleware())
  }

  // error handler
  middlewares.use(errorMiddleware(server, !!middlewareMode))

  // httpServer.listen can be called multiple times
  // when port when using next port number
  // this code is to avoid calling buildStart multiple times
  let initingServer: Promise<void> | undefined
  let serverInited = false
  const initServer = async (onListen: boolean) => {
    if (serverInited) return
    if (initingServer) return initingServer

    initingServer = (async function () {
      // For backward compatibility, we call buildStart for the client
      // environment when initing the server. For other environments
      // buildStart will be called when the first request is transformed
      await environments.client.pluginContainer.buildStart()

      // ensure ws server started
      if (onListen || options.listen) {
        await Promise.all(
          Object.values(environments).map((e) => e.listen(server)),
        )
      }

      initingServer = undefined
      serverInited = true
    })()
    return initingServer
  }

  if (!middlewareMode && httpServer) {
    // overwrite listen to init optimizer before server start
    const listen = httpServer.listen.bind(httpServer)
    httpServer.listen = (async (port: number, ...args: any[]) => {
      try {
        await initServer(true)
      } catch (e) {
        httpServer.emit('error', e)
        return
      }
      return listen(port, ...args)
    }) as any
  } else {
    await initServer(false)
  }

  return server
}
```

## vite热更新实现原理
vite的热更新是通过websocket实现的。

##### 第一步：watcher监听 
watcher对应的是server.watch配置。server.watch配置不为null就会被启用。watcher主要是做文件监听，当文件发生变化时（即文件内容修改，新增文件，删除文件），会触发热更新。watcher的实现是基于[chokidar](https://www.npmjs.com/package/chokidar)实现的。源码中调用chokidar.watch(paths,options)来监听文件变化。chokidar.watch有两个参数，第一个paths监听的文件路径数组，第二个options配置项。这里监听文件目录有root根目录，public目录，和一些配置文件。源码是这样的:

```js
chokidar.watch(
        [
          //项目根目录
          root,
          // vite.cinfig.js配置文件中依赖的文件路径数组
          ...config.configFileDependencies,
          // 是.env文件，.env环境变量配置文件。envDir是.env文件所在目录是可配置，不一定在根目录
          ...getEnvFilesForMode(config.mode, config.envDir),
          // public目录，一般情况public在根目录里，也有可能不在根目录，因为publicDir是可配置的
          ...(publicDir && publicFiles ? [publicDir] : []),
        ],
        //看下面代码块
        resolvedWatchOptions,
      )
```

```js
  // 这里主要是watcher监听需要忽略的文件和目录，这里主要是忽略node_modules目录和OutDirs输出目录以及
  // cacheDir缓存目录，默认是node_modules/.vite，用来存放编译后的文件。
 const resolvedWatchOptions = resolveChokidarOptions(
    {
      disableGlobbing: true,
      ...serverConfig.watch,
    },
    resolvedOutDirs,
    // boolean值,为true时，outP忽略outDirs,在启动服务器时会清空OutDirs目录下的文件。为false会提示
    emptyOutDir,
    config.cacheDir,
  )
```
##### 第二步：触发watcher事件

上面是watcher对象的创建，下面注册的change/add/unlink事件，触发了热更新。

```js
  // 注册change事件，通过上面watch方法监听，工程文件内容变化的时候会触发
  watcher.on('change', async (file) => {
    //转换文件路径，//aa//bb//cc.js => /aa/bb/cc.js
    file = normalizePath(file)
    // 如果修改的是这个方法主要是针对tsconfig.json配置文件，清除给tsconfgig.json文件
    // 做的缓存，清除file所关联moduleGraph关系图（简单理解为file中引用的其它文件模块），
    // 清除引用关系给浏览器发送full-reload事件通知，是通过websocket通信的，告诉浏览器
    // 重新加载页面。
    reloadOnTsconfigChange(server, file)
    // 这里执行插件的watchChange方法，用vite写自定义插件时候，可以注册方法，调用时机
    // 就是在这里调用的跟插件其它方法buildStart/transform等一样，这个方法没有在vite
    // 官方文档没有写。
    await pluginContainer.watchChange(file, { event: 'update' })
    // 下面是更新模块图，模块图存储是文件路径和模块依赖关系的映射表。
    // 每个文件在不同环境会有对应模块图对象，vite源码叫EnvironmentModuleNode,因为跟
    // 环境对应的，不同的环境同一个文件EnvironmentModuleNode是不同的，所以都带
    // 有Environment。EnvironmentModuleNode对象存储着这个文件的编译后代码（vite源码
    // 叫transformResult）和被依赖的模块（vite源码叫importedModules,谁依赖了它）
    // 等其它相关信息。
    // EnvironmentModuleGraph对象主要负责调配管理各个EnvironmentModuleNode。这里
    // onFileChange本质是取消各种关系载的依赖，因为文件变化重新编译，所以需要取消之前
    // 的依赖关系。那取消依赖关系后依赖关系怎么建立呢？onHMRUpdate更新会执行restart方法，
    // 该方法会重新建立依赖关系。
    for (const environment of Object.values(server.environments)) {
      //这里遍历不同环境，更新file关系图，因为file文件内容变化，清空了file之前被引用关
      // 联关系
      environment.moduleGraph.onFileChange(file)
    }
    await onHMRUpdate('update', file)
  })
  // 注册add事件，通过上面watch方法监听，工程新增文件的时候会触发。onFileAddUnlink
  //做的事情其实跟上面本质差不多，更新配置文件，调用注册的watchChange方法，更新模块
  // 关系图。

  watcher.on('add', (file) => {
    onFileAddUnlink(file, false)
  })
  // 注册unlink事件，通过上面watch方法监听，工程删除文件的时候会触发
  watcher.on('unlink', (file) => {
    onFileAddUnlink(file, true)
  })

  const onFileAddUnlink = async (file: string, isUnlink: boolean) => {
    file = normalizePath(file)
    // 如果是tsconfig.json配置文件或者xxx.json文件，会清除之前的缓存，
    // 同时清除之前所有文件的依赖关系。因为配置文件发生变化，整个工程都受
    // 影响，所有发出full-reload事件。重新reload加载页面。
    reloadOnTsconfigChange(server, file)
    //触发插件的watchChange(server, file)
    //触发插件的watchChange方法，跟上面一样。这里就不展开了。
    await pluginContainer.watchChange(file, {
      event: isUnlink ? 'delete' : 'create',
    })

    if (publicDir && publicFiles) {
      if (file.startsWith(publicDir)) {
        const path = file.slice(publicDir.length)
        publicFiles[isUnlink ? 'delete' : 'add'](path)
        if (!isUnlink) {
          const clientModuleGraph = server.environments.client.moduleGraph
          const moduleWithSamePath =
            await clientModuleGraph.getModuleByUrl(path)
          const etag = moduleWithSamePath?.transformResult?.etag
          if (etag) {
            // 删除之前的etag
            clientModuleGraph.etagToModuleMap.delete(etag)
          }
        }
      }
    }
    if (isUnlink) {
      // 删除文件时候会从依赖本模块的模块中（importedModules中删除引用）移除本模块的引用
      for (const environment of Object.values(server.environments)) {
        environment.moduleGraph.onFileDelete(file)
      }
    }
    await onHMRUpdate(isUnlink ? 'delete' : 'create', file)
  }
```

##### 第三步：发送websocket消息给浏览器

上面watcher监听文件变化后，触发了onHMRUpdate方法，该方法会给浏览器发更新通知，触发热更新。

1. 重启新的服务，_createServer启动http服务和建立websocket连接, server.close停掉原先的服务，server.close里面停止之前http服务和关闭websocket连接。

```js
  try {
      newServer = await _createServer(inlineConfig, {
        listen: false,
        previousEnvironments: server.environments,
      })
    } catch (err: any) {
      server.config.logger.error(err.message, {
        timestamp: true,
      })
      server.config.logger.error('server restart failed', { timestamp: true })
      return
    }

    await server.close()
```

2. 执行插件的hotUpdate或者handleHotUpdate回调方法
```js
 try {
    for (const plugin of getSortedHotUpdatePlugins(
      server.environments.client,
    )) {
      // add/delete 触发热更新时，执行插件的hotUpdate方法

      if (plugin.hotUpdate) {
        const filteredModules = await getHookHandler(plugin.hotUpdate).call(
          clientContext,
          clientHotUpdateOptions,
        )
        // 此处省略总其它代码
        }
      } else if (type === 'update') {
        // update 触发热更新时，执行插件的handleHotUpdate方法
        const filteredModules = await getHookHandler(plugin.handleHotUpdate!)(
          mixedHmrContext,
        )
    }
  } catch (error) {
    hotMap.get(server.environments.client)!.error = error
  }
```

3. 发websocket消息给浏览器
```js
 async function hmr(environment: DevEnvironment) {
    try {
      const { options, error } = hotMap.get(environment)!
      if (error) {
        throw error
      }
      //如果变动的文件是html类型的文件，执行通知浏览器重新加载页面
      // full-reload 浏览器暴力执行location.reload()，相当于刷新页面
      if (!options.modules.length) {
        if (file.endsWith('.html')) {
          environment.hot.send({
            type: 'full-reload',
            path: config.server.middlewareMode
              ? '*'
              : '/' + normalizePath(path.relative(config.root, file)),
          })
        } else {
          debugHmr?.(
            `(${environment.name}) [no modules matched] ${colors.dim(shortFile)}`,
          )
        }
        return
      }

      updateModules(environment, shortFile, options.modules, timestamp)
    } catch (err) {
      // 报错发捕获异常
      environment.hot.send({
        type: 'error',
        err: prepareError(err),
      })
    }
  }
```

4. updateModules方法，给浏览器发websocket消息通知更新模块。
```js
export function updateModules(
  environment: DevEnvironment,
  file: string,
  modules: EnvironmentModuleNode[],
  timestamp: number,
  afterInvalidation?: boolean,
): void {
  const traversedModules = new Set<EnvironmentModuleNode>()
  for (const mod of modules) {
    const boundaries: PropagationBoundary[] = []
    // 
    const hasDeadEnd = propagateUpdate(mod, traversedModules, boundaries)
    // 发消息之前消除file模块的依赖关系图，更新后会重新创建关系图
    // 关系图记录的是本文件被哪些文件引用，还有本文件的代码
    environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true,
    )
    // 省略其它代码
    
    //updates.push(...) 给浏览器发websocket消息，通知更新模块
    updates.push(
      ...boundaries.map(
        ({ boundary, acceptedVia, isWithinCircularImport }) => ({
          type: `${boundary.type}-update` as const,
          timestamp,
          path: normalizeHmrUrl(boundary.url),
          acceptedPath: normalizeHmrUrl(acceptedVia.url),
          explicitImportRequired:
            boundary.type === 'js'
              ? isExplicitImportRequired(acceptedVia.url)
              : false,
          isWithinCircularImport,
        }),
      ),
    )
  }
  // 给浏览器发websocket消息，通知更新模块
  hot.send({
    type: 'update',
    updates,
  })
}
```
##### 第四步：前端浏览器代码更新












**更新代码**

```md

```




**Input**

````md
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
````

**Output**

```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```

## Custom Containers

**Input**

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::
```

**Output**

::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::

::: details
This is a details block.
:::

## More

Check out the documentation for the [full list of markdown extensions](https://vitepress.dev/guide/markdown).
