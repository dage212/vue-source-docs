# vite源码解析

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

## package.json

```
  "scripts": {
    "dev": "rimraf dist && pnpm run build-bundle -w",
    "build": "rimraf dist && run-s build-bundle build-types",
    "build-bundle": "rollup --config rollup.config.ts --configPlugin typescript",
    "build-types": "run-s build-types-temp build-types-roll build-types-check",
    "build-types-temp": "tsc --emitDeclarationOnly --outDir temp -p src/node",
    "build-types-roll": "rollup --config rollup.dts.config.ts --configPlugin typescript && rimraf temp",
    "build-types-check": "tsc --project tsconfig.check.json",
    "typecheck": "tsc --noEmit",
    "lint": "eslint --cache --ext .ts src/**",
    "format": "prettier --write --cache --parser typescript \"src/**/*.ts\"",
    "prepublishOnly": "npm run build"
  }

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
