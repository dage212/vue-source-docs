---
outline: deep
---

# Vite工程项目结构说明

这部分主要讲述vite源码工程文件结构，以及各个文件所放的内容以及作用。

## vite文件结构
```md
vite/
├── .github/   # github相关文件 
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

```md

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
    "format": "prettier --write --cache .",
    "lint": "eslint --cache .",
    "typecheck": "tsc -p scripts --noEmit && pnpm -r --parallel run typecheck",
    "test": "pnpm test-unit && pnpm test-serve && pnpm test-build",
    "test-serve": "vitest run -c vitest.config.e2e.ts",
    "test-build": "VITE_TEST_BUILD=1 vitest run -c vitest.config.e2e.ts",
    "test-unit": "vitest run",
    "test-docs": "pnpm run docs-build",
    "debug-serve": "VITE_DEBUG_SERVE=1 vitest run -c vitest.config.e2e.ts",
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