//  用来收集依赖
import { Watcher } from "./watcher"

let target:Watcher = null

export class Dep {
    watchers: Array<Watcher>
    constructor() {
        this.watchers = []
    }
    addSub(watcher: Watcher) {
        this.watchers.push(watcher)
    }
    removeSub() {

    }
    depend() {
        //  target存在的时候才收集，避免重复收集
        target && target.addDep(this)
    }
    //  通知更新
    notify() {
        for (let i = 0; i < this.watchers.length; i++) {
            this.watchers[i].update()
        }
    }
}

export function setTarget(watcher: Watcher|null) {
    target = watcher
}