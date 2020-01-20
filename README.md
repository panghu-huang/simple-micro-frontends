## 前言
微前端的概念来源于后端的微服务，这几年讨论的也比较多，这边就不多介绍

那么我们如果实现一个简单的微前端系统呢？

首先需要一个主应用，由主应用来分配和调度子路由切换

那么就需要解决几个问题，从哪里加载子应用
```javascript
const subApp = await import('./packages/subApp')
```
如果直接根据上面的方式加载子应用的话，就无法达到 **独立打包** 和 **独立发布**，那么意义不大

那么最简单的方式就是去加载子应用打包后的脚本，因为前端打包出来的不外乎 HTML、CSS、JavaScript 几种

那么一个简单的微前端大概需要完成几件事情：
* 一个项目之间路由的配置
* 路由匹配时根据配置加载子应用
* 路由退出时卸载子应用

## 配置
配置的话比较简单，需要几个基本的参数就好了
```javascript
export interface MFEConfig {
  path: string
  styles: string[]
  scripts: string[]
}

export const config: MFEConfig[] = []
```
* path: 匹配的路径，我们简单的认为 pathname.startsWith(path) 就匹配
* styles: 该应用对应的样式文件
* scripts: 该应用对应的脚本文件

## 加载子应用
### 主应用如何设计？
子应用什么时候加载和如何加载，都依托于主应用

简单的设计一个主应用，下面是一个简单的路由配置

```javascript
import { Route } from 'server-renderer'
import Home from './Home'
import Scheduler from './Scheduler'

const routes: Route[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/others',
    component: //...,
  },
  {
    path: '*',
    component: Scheduler,
  }
]

export default routes
```
我们可以看到，当主应用的路由都不匹配的时候会进入 `Scheduler` 这个组件，`Scheduler` 如果可以认为就是一个 404 组件，我们在 404 组件上面做文章

### Scheduler 组件
当进入 `Scheduler` 组件的时候，我们就要去获取整个应用的路由配置了，同样的，如果 `import` 进来的话，也就没有微前端的意义了

那么就把他放在一个静态的服务器上面，改为 `json` 格式，使用的时候把他请求下来

```javascript
const config = await fetch('path/to/config.json')
```

那么获取到路由配置的话，我们就知道了该去加载哪一个 JS 文件

但是我们希望能够手动控制子应用的挂载和卸载，而不是说脚本已加载就自己执行了

那么我们希望每一个子应用能够对外提供两个方法
```javascript
export function mount(): void {}
export function unmount(): void {}
```
加入子应用是一个 React 代码的话，那么如下所示
```javascript
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'

export const mount = () => {
  ReactDOM.render(
    <App/>,
    document.getElementById('content')
  )
}

export const unmount = () => {
  ReactDOM.unmountComponentAtNode(
    document.getElementById('content')
  )
}
```

当路由匹配时，去执行子应用的 `mount` 方法，跳出是则执行 `unmount` 方法

如果按照这样子设想的话，我们需要把子应用挂载在 `window` 上面，这是比较简单的方法，手动修改一个 `webpack` 配置，增加一个 library 的匹配

```javascript
const config: webpack.Configuration = {
  output: {
    library: 'subApp1'
  },
}
```

那么 `window['subApp1']` 就是我们导出来的子应用了

这时可以给 `MFEConfig` 加一个 `name` 配置
```javascript
export interface MFEConfig {
  path: string
  name: string
  styles: string[]
  scripts: string[]
}

// 根据 name 找到子应用
const subApp = window[config.name]
```

这样子的话，`Scheduler` 组件大概就能写出来了

```javascript
import * as React from 'react'
import { useLocation } from 'server-renderer'

const Scheduler: React.FC = () => {
  const { pathname } = useLocation()

  React.useEffect(
    () => {
      // ...
      const config = loadConfig()
      const subApp = config.find(
        //... 找到匹配的子应用
      )
      subApp.mount()
      
      return subApp.unmount
    },
    [pathname]
  )
  
  // 提供一个给子应用挂载的节点
  return (
    <div id='content'></div>
  )
}

export default Scheduler
```

## 更新子应用
当子应用更新的时候如果同步整个应用，也是比较重要的问题

按照上面的思路，整个应用的配置是一个 json 文件，那么，我子应用更新的时候，修改一下配置文件不就好了

那么剩下的就是更新的时候需要 `styles` 和 `scripts` 属性，从哪里来的问题了

这个我们可以简单的从 `webpack` 里面取到

```javascript
import * as webpack from 'webpack'

export class MicroFrontendPlugin {

  public apply(compilation: webpack.Compiler) {
    // 监听 webpack 提供的打包完成的钩子
    compilation.hooks.done.tap('mfe', stats => {
      const { assetsByChunkName } = stats.toJson()
      // ...
    })
  }
}

const config: webpack.Configuration = {
    plugins: [
        new MicroFrontendPlugin()
    ]
}
```
上面 `assetsByChunkName` 就是我们打包后生成的信息了

但是 assetsByChunkName 是 webpack 打包出来的产物，我们不确定是否用静态 `<link href=""/>` 等方式引入了其他文件，另外就是，我们**不能确定引入的顺序**

那么就可以换一种简单的方式了，去读取 webpack 打包后的 HTML 文件

```javascript
const builtHTMLPath = path.join('path/to/html')
const html = fs.readFileSync(builtHTMLPath, 'utf8')

const styles: string[] = []
const scripts: string[] = []
// cheerio: 一个解析 HTML 的第三方库
const $ = cheerio.load(html)

// ....
updateConfig()
// ...
```

如果说怕手动更新不安全等问题，也可以通过 `fs.watch` 监听文件，然后走程序修改

## 其他
* 主应用和子应用数据交互可以使用发布订阅模式等，例如 `window.dispatchEvent`

* 路由

```javascript
const history = createBrowserHistory()

// 子组件 mount 的时候把 history 传过去
app.mount(history)

// 子应用使用 history
import * as React from 'react'
import { Router } from 'react-router-dom'

const App: React.FC = () => {
  return (
    <Router history={history}>
      <div/>
    </Router>
  )
}

export default App
```