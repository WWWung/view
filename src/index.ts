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
        this.data = observe(data)
        this.el = document.getElementById(el)
        const template = this.getTemplate(this.el)
        const complier = compileHtmlToFunction(template)
        new Watcher(complier, this.data, this)
    }

    getTemplate(el:HTMLElement):string {
        return el.innerHTML
    }

    _update(value:string) {
        this.el.innerHTML = value
    }


}