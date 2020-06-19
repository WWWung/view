import { Dep, setTarget } from "./dep";
import {
    addWatcher
} from "./nexttick"
import View from ".";
let uid = 0

export class Watcher {
    render:(data:any)=>string
    data: any
    id:number
    vm:View
    constructor(render:(data:any)=>string, data: any, vm:View) {
        this.render = render
        this.data = data
        this.id = uid++
        this.vm = vm
        this.init()
    }
    init() {
        setTarget(this)
        this.run()
        setTarget(null)
    }
    addDep(dep: Dep) {
        dep.addSub(this)
    }
    
    update() {
        addWatcher(this)
    }

    run() {
        const value = this.render(this.data)
        this.vm._update(value)
    }
}