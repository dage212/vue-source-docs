# vite热更新原理
vite的热更新是通过websocket实现的，但是没有专门建立websocket服务，而是通过http服务的upgrade事件进行协议升级，建立websocket连接，vite服务启动后经过浏览器发来的请求，返给浏览器建立websocket连接的代码文件，这样就实现和浏览器建立websocket通信。结合nodejs监听watcher事件，当文件发生变化时，发送websocket消息，浏览器收到消息后执行组件更新方法，从而实现热更新。





## watcher监听 
watcher对应的是server.watch配置。server.watch配置不为null就会被启用。watcher主要是做文件监听，当文件发生变化时（即文件内容修改，新增文件，删除文件），会触发热更新。watcher的实现是基于[chokidar](https://www.npmjs.com/package/chokidar)实现的。源码中调用chokidar.watch(paths,options)来监听文件变化。chokidar.watch有两个参数，第一个paths监听的文件路径数组，第二个options配置项。这里监听文件目录有root根目录，public目录，和一些配置文件。源码是这样的:

```js
chokidar.watch(
        [
          //项目根目录
          root,
          // vite.cinfig.js配置文件中依赖的文件路径数组
          ...config.configFileDependencies,
          // 是.env文件，.env环境变量配置文件。envDir是.env文件所在目录是可配置，
          // 不一定在根目录
          ...getEnvFilesForMode(config.mode, config.envDir),
          // public目录，一般情况public在根目录里，也有可能不在根目录，
          // 因为publicDir是可配置的
          ...(publicDir && publicFiles ? [publicDir] : []),
        ],
        //看下面代码块
        resolvedWatchOptions,
      )
```

```js
  // 这里主要是watcher监听需要忽略的文件和目录，这里主要是忽略node_modules
  // 目录和OutDirs输出目录以及

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
## 触发watcher事件

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

## 发送websocket消息给浏览器

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
## 前端浏览器代码更新
前端浏览器建立socket连接过程：当vite启动服务后，浏览器打开页面时候vite会给每个组件文件进行编译转换，讲xxx.vue文件里面的template/script转换成正常js代码,其中有一步骤就是在每个文件注入```import {createHotContext as __vite__createHotContext} from "/@vite/client";import.meta.hot = __vite__createHotContext("/xxx.vue");```这段代码,这段代码因为import引用文件的原因，会执行get请求，去vite服务端请求packages\vite\src\client\client.ts文件，client.ts文件里面执行了浏览器websocket建立连接。当接收到vite发来的
消息，浏览器端会执行vue源码里面的reload或者rerender方法去重新渲染组件，实现热更新。
这是vite-plugin-vue插件执行的时候注入到xxx.vue文件里面代码，用于接收到socket消息后更新组件：
```js
import.meta.hot.accept(mod => {
  if (!mod) return
  const { default: updated, _rerender_only } = mod
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)
  }
})
```















