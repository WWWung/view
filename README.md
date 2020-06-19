# 调试说明
## npm install下载依赖npm run dev打包并监听文件变化，需要手动用服务打开dist/index.html文件

# 文件结构说明
```bash
view/
├── README.md           # 项目说明
├── dist                # 打包后的文件
├── src                 # 源码
│   ├── compile.ts      # 根据模板字符串创建渲染函数
│   ├── dep.ts          # 用来收集依赖和触发依赖
│   ├── index.ts        # 
│   ├── nexttick.ts     # 异步更新
│   ├── observer.ts     # 观察者
│   ├── reactive.ts     # 响应式
│   └── watcher.ts      # 监听变化
└── node_modules        # 模块文件
```