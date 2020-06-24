import { compileHtmlToFunction } from "./compile.js"
import { observe } from "./observer.js"
import { Watcher } from "./watcher.js"


export default class View {
    el: HTMLElement
    data:any
    constructor(opts) {
        this.el = null
        this.data = null
        this.init(opts)
    }

    init(opts) {
        const {
            el,
            data
        } = opts
        //  添加观察者
        this.data = observe(data)
        //  绑定dom元素
        this.el = document.getElementById(el)
        //  根据元素获取 模板 字符串
        const template = this.getTemplate(this.el)
        //  根据模板字符串生成渲染函数
        const complier = compileHtmlToFunction(template)
        //  监听变化后更新
        new Watcher(complier, this.data, this)
    }

    getTemplate(el:HTMLElement):string {
        return el.innerHTML
    }
    //  更新dom(vue里的实现这里会通过diff算法比较新旧vnode，我看不懂)
    _update(value:string) {
        // this.el.innerHTML = value
    }


}