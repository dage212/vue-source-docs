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
