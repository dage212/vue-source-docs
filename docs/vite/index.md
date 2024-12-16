---
outline: deep
---

# Vite工程项目结构说明

这部分主要讲述vite源码工程文件结构，以及各个文件所放的内容以及作用。

## vite文件结构
```md
vite/
├── .github/   # github相关文件 部署执行配置文件
├── .stackblitz/ # stackblitz相关文件
├── docs/ # vite文档相关文件 vite官网的页面就是用这里面的.md生成展示的
├── packages/ # vite源码核心文件
├── patches/    #
├── playground/ # 测试相关文件 里面包含测试用例的场景
├── scripts/ # 一些脚本文件 执行工程运行打包等命令
├── .editorconfig #
├── .git-blame-ignore-revs
├── .gitignore
├── .npmrc
├── .prettierignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── eslint.config.js
├── netlify.toml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── vitest.config.e2e.ts
└── vitest.config.ts # 项目vite配置文件
```






## vite核心文件
packages里面有三个文件夹，分别是create-vite、plugin-legacy、vite。
create-vite是创建项目时的模板，plugin-legacy是兼容IE的插件，vite是核心源码。


```md
vite/
├── packages/
    ├── create-vite/ # 创建项目时的模板
    ├── plugin-legacy/ # 兼容IE的插件
    └── vite/ # 核心源码

```

## package.json

项目根目录package.json文件命令介绍:

```json

  {
  "name": "@vitejs/vite-monorepo",
  "private": true,
  "type": "module",
  "engines": {
    "node": "^18.0.0 || ^20.0.0 || >=22.0.0"
  },
  "homepage": "https://vite.dev/",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vitejs/vite.git"
  },
  "keywords": [
    "frontend",
    "hmr",
    "dev-server",
    "build-tool",
    "vite"
  ],
  "scripts": {
    // preinstall是npm安装钩子函数 这里限制只能用pnpm
    "preinstall": "npx only-allow pnpm", 
    //初始化simple-git-hooks
    "postinstall": "simple-git-hooks",
    // 执行 prettier代码格式化 --write直接修改文件 --cache 缓存 .表示所有文件
    "format": "prettier --write --cache .",
    // 执行lint代码检查
    "lint": "eslint --cache .",
    // 执行ts类型检查 --noEmit不需要生成文件 
    // 并行执行子包typecheck命令 vite包和cretate-vite包都有typecheck命令
    "typecheck": "tsc -p scripts --noEmit && pnpm -r --parallel run typecheck",
    // 执行测试
    "test": "pnpm test-unit && pnpm test-serve && pnpm test-build",
    "test-serve": "vitest run -c vitest.config.e2e.ts",
    // 跟test-serve类似，VITE_TEST_BUILD=1有区别，这个参数是区分跑不同的测试用例，
    //用例里面有判断isServe
    "test-build": "VITE_TEST_BUILD=1 vitest run -c vitest.config.e2e.ts",
    // 会跑测试用例 不包含playground里面的用例
    "test-unit": "vitest run",
    "test-docs": "pnpm run docs-build",
    //这个命令同上面test命令，参数不同
    "debug-serve": "VITE_DEBUG_SERVE=1 vitest run -c vitest.config.e2e.ts",
    //这个命令同上面test命令，参数不同
    "debug-build": "VITE_TEST_BUILD=1 VITE_PRESERVE_BUILD_ARTIFACTS=1 vitest run -c vitest.config.e2e.ts",
    // 启动文档服务
    "docs": "pnpm --filter=docs run docs",
    // 打包文档
    "docs-build": "pnpm --filter=docs run docs-build",
    // 打包文档后本地预览
    "docs-serve": "pnpm --filter=docs run docs-serve",
    // 打包packages里面的子项目
    "build": "pnpm -r --filter='./packages/*' run build",
    //启动packages里面的子项目
    "dev": "pnpm -r --parallel --filter='./packages/*' run dev", 
    //发布
    "release": "tsx scripts/release.ts",
    "ci-publish": "tsx scripts/publishCI.ts",
    //打包工程和文档
    "ci-docs": "pnpm build && pnpm docs-build"
  },
  "devDependencies": {
    "@eslint/js": "^9.16.0",
    "@type-challenges/utils": "^0.1.1",
    "@types/babel__core": "^7.20.5",
    "@types/babel__preset-env": "^7.9.7",
    "@types/convert-source-map": "^2.0.3",
    "@types/cross-spawn": "^6.0.6",
    "@types/debug": "^4.1.12",
    "@types/estree": "^1.0.6",
    "@types/etag": "^1.8.3",
    "@types/less": "^3.0.7",
    "@types/node": "^22.10.1",
    "@types/picomatch": "^3.0.1",
    "@types/stylus": "^0.48.43",
    "@types/ws": "^8.5.13",
    "@vitejs/release-scripts": "^1.3.2",
    "conventional-changelog-cli": "^5.0.0",
    "eslint": "^9.16.0",
    "eslint-plugin-import-x": "^4.5.0",
    "eslint-plugin-n": "^17.14.0",
    "eslint-plugin-regexp": "^2.7.0",
    "execa": "^9.5.2",
    "globals": "^15.13.0",
    "gsap": "^3.12.5",
    "lint-staged": "^15.2.10",
    "picocolors": "^1.1.1",
    "playwright-chromium": "^1.49.0",
    "premove": "^4.0.0",
    "prettier": "3.4.2",
    "rollup": "^4.23.0",
    "rollup-plugin-esbuild": "^6.1.1",
    "simple-git-hooks": "^2.11.1",
    "tslib": "^2.8.1",
    "tsx": "^4.19.2",
    "typescript": "~5.6.2",
    "typescript-eslint": "^8.17.0",
    "vite": "workspace:*",
    "vitest": "^2.1.8"
  },
  //配置git提交时的钩子函数
  "simple-git-hooks": {
    // git提交前执行  执行本地文件代码格式校验
    "pre-commit": "pnpm exec lint-staged --concurrent false"
  },
  // lint-staged命令配置
  "lint-staged": {
    "*": [
      "prettier --write --cache --ignore-unknown"
    ],
    "packages/*/{src,types}/**/*.ts": [
      "eslint --cache --fix"
    ],
    "packages/**/*.d.ts": [
      "eslint --cache --fix"
    ],
    "playground/**/__tests__/**/*.ts": [
      "eslint --cache --fix"
    ]
  },
  "packageManager": "pnpm@9.15.0",
  "pnpm": {
    "overrides": {
      "vite": "workspace:*"
    },
    "patchedDependencies": {
      "http-proxy@1.18.1": "patches/http-proxy@1.18.1.patch",
      "sirv@3.0.0": "patches/sirv@3.0.0.patch",
      "chokidar@3.6.0": "patches/chokidar@3.6.0.patch"
    },
    "peerDependencyRules": {
      "allowedVersions": {
        "vite": "*"
      },
      "ignoreMissing": [
        "@algolia/client-search",
        "postcss",
        "search-insights"
      ]
    },
    "packageExtensions": {
      "sass-embedded": {
        "peerDependencies": {
          "source-map-js": "*"
        },
        "peerDependenciesMeta": {
          "source-map-js": {
            "optional": true
          }
        }
      }
    }
  },
  "stackblitz": {
    "startCommand": "pnpm --filter='./packages/vite' run dev"
  }
}


```

## release命令

执行tsx scripts/release.ts发布代码过程，logRecentCommits打印提交记录，generateChangelog
生成更新日志changelog,extendCommitHash短hash替换成git rev-parse ${shortHash}生成的长hash

##### scripts/release.ts

```js
release({
  repo: 'vite',
  packages: ['vite', 'create-vite', 'plugin-legacy'],
  toTag: (pkg, version) =>
    pkg === 'vite' ? `v${version}` : `${pkg}@${version}`,
    // 执行 git rev-list -n 1 v${version} 获取最近一次版本的提交记录并取到其hash值
    // 执行 git --no-pager log hash..HEAD --oneline -- packages/vite // 打印v${version}
    // 到最新的提交记录之间的记录
  logChangelog: (pkg) => logRecentCommits(pkg),
  generateChangelog: async (pkgName) => {
    if (pkgName === 'create-vite') await updateTemplateVersions()
    console.log(colors.cyan('\nGenerating changelog...'))
    const changelogArgs = [
      'conventional-changelog',
      '-p',
      'angular',
      '-i',
      'CHANGELOG.md',
      '-s',
      '--commit-path',
      '.',
    ]
    if (pkgName !== 'vite') changelogArgs.push('--lerna-package', pkgName)
    // 执行 npx conventional-changelog -p angular -i CHANGELOG.md -s --commit-path .
    // 生成更新日志
    await run('npx', changelogArgs, { cwd: `packages/${pkgName}` })
    // 把conventional-changelog生成的数字短hash替换成git rev-parse ${shortHash}生成的长hash
    extendCommitHash(`packages/${pkgName}/CHANGELOG.md`)
  },
})

```

release函数里面执行logChangelog和 generateChangelog回调函数后，执行了git相关操作 git add / git commit / git tag / git push等。同时更新了package.json的版本号。这样就完成了发布。release可以简单理解为git操作的封装。

## publish命令

发布执行tsx scripts/publishCI.ts命令

##### scripts/publishCI.ts

```js
const tag = process.argv.slice(2)[0] ?? ''
const provenance = !tag.includes('@')

publish({ defaultPackage: 'vite', provenance, packageManager: 'pnpm' })
```
publish里面执行 ``` pnpm publish --access public --tag ${tag} --provenance --no-git-checks ```发布npm包。--access public 包访问级别为public，npm所有用户可用。--no-git-checks跳过git检查。

