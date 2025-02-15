---
outline: deep
---

# Oxc工程源码解读
Oxc是用rust编写的前端语法树解析库，类似于eslint和babel的功能。下面图片是Oxc的工程目录图：


![[Oxc](https://github.com/oxc-project/oxc)](image.png)

- .github:  github相关配置文件 oxc的部署是用github的actions，里面的workflow文件是部署不同库执行的脚本。
  
- app/oxlint:  是oxlint的源码，主要是对前端代码进行静态分析的工具，类似于eslint。这里面是用rust编写的，
  发布时候会执行`cross build --release --target=x86_64-pc-windows-msvc --bin oxlint --features allocator`命令，生成oxlint.exe文件，用于npm/oxlint/bin/oxlint会调用oxlint.exe文件。target根据不同环境配置不同target。

- crate:  oxc库ast语法解析的核心源码，用rust编写。单独做为rust包存在，为napi文件夹里面的包提供核心依赖。
  发布配置文件.github\workflows\release_crates.yml。

- napi:  是借用[napi-rs](https://github.com/napi-rs/napi-rs#readme)库编写的，用于nodejs调用rust的库。
  oxc把rust编译成node的addons，代替C++。
  配置文件.github\workflows\release_napi.yml。

  - napi/minify:  用napi-rs库编写的，编译后会生成`minify.${target}.node`文件，target根据不同环境配置不同target。在npm/oxc-minify目录下会调用minify.${target}.node文件。
  
  - napi/parser:  用napi-rs库编写的，编译后会生成`parser.${target}.node`文件，target根据不同环境配置不同target。在npm/oxc-parser目录下会调用parser.${target}.node文件。
  
  - napi/transform:  用napi-rs库编写的，编译后会生成`transform.${target}.node`文件，target根据不同环境
  配置不同target。在npm/oxc-transform目录下会根据target生成transform.${target}.node文件。
  
- npm:  是oxc向npm发布的包，里面有oxc-minify、oxc-parser、oxc-transform、oxc-types、 oxc-wasm、oxlint、parser-wasm、runtime等包。这些是oxc对外暴露的接口，其它库引用的oxc，都是在npm文件夹里。
  - oxc-minify:  oxc-minify是oxc对外暴露的接口，其它库引用的oxc，都是在npm文件夹里。
  
  - oxc-parser:  oxc-parser是oxc对外暴露的ast接口，功能等同`@babel/parser`，用于生成ast结构。
  
  - oxc-transform: oxc-transform是oxc对外暴露的transform接口，等同于babel库中的`babel.transform`。
  
  - oxc-types: oxc-types是oxc对外暴露的接口，它是oxc的类型定义文件。
  
  - oxc-wasm: oxc-wasm是oxc对外暴露的wasm接口，它是oxc的wasm/parser包编译生成的。
  
  - runtime: 是oxc对外暴露的runtime接口，代码是copy的`@babel/runtime`。
  
- target: 是rust编译结果存放目录。
  
- tasks: 用于测试

- wasm/parser: 是用rust编写的，借助wasm-bindgen包生成wasm文件，编译后会生成web和node端的wasm文件，提供给npm/oxc-wasm包使用。




         
