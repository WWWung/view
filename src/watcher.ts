import { Dep, setTarget } from "./dep";
import {
    addWatcher
} from "./nexttick"
import View from ".";
let uid = 0
/**
 * 监听
 */
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
        //  调用run的时候会对 数据 取值操作，就会触发get收集到依赖
        this.run()
        setTarget(null)
    }
    addDep(dep: Dep) {
        dep.addSub(this)
    }
    
    //  update的时候把watcher入栈，等待下次更新
    update() {
        addWatcher(this)
    }

    run() {
        const value = this.render(this.data)
        this.vm._update(value)
    }
}