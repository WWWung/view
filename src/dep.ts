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