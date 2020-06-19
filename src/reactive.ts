import { Dep } from "./dep"

export function reactive(data:object|Array<any>):any {
    const dep = new Dep()
    const handler = {
        get(target, key) {
            dep.depend()
            return target[key]
        },
        set(target, key, value) {
            //  数组发生改变的时候会触发两次，length触发一次，内容改变触发一次
            const old = target[key]
            if (old === value) {
                return true
            }
            target[key] = value
            dep.notify()
            return true
        }
    }
    return new Proxy(data, handler)
}