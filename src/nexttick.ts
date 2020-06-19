import { Watcher } from "./watcher"
//  异步触发更新
const watcherQueue:Array<Watcher> = []
let waiting = false

function nextTick() {
    //  异步更新，好处是可以等待同步的代码执行完毕再一次性，性能比较好
    const p = Promise.resolve()
    p.then(() => {
        waiting = false
        for (let i = 0; i < watcherQueue.length; i++) {
            const watcher = watcherQueue[i]
            watcher.run()
        }
        console.log("afterupdated")
    })
}

function clearWatcherQueue() {
    watcherQueue.splice(0, watcherQueue.length)
}

export function addWatcher(watcher: Watcher) {
    if (!watcherQueue.includes(watcher)) {
        watcherQueue.push(watcher)
    }
    //  如果当前已经在等待更新的状态，则不需要调用nextTick
    if (!waiting) {
        waiting = true
        nextTick()
    }
}