import { Watcher } from "./watcher"

const watcherQueue:Array<Watcher> = []
let waiting = false

function nextTick() {
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
    if (!waiting) {
        waiting = true
        nextTick()
    }
}