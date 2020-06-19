import { Dep } from "./dep"
//  通过proxy添加响应式
//  vue2.0是通过Object.defineProperty的方式拦截，这里采用es6的proxy
export function reactive(data:object|Array<any>):any {
    const dep = new Dep()
    const handler = {
        //  取值的时候收集依赖
        get(target, key) {
            dep.depend()
            return target[key]
        },
        //  修改值的时候触发更新
        set(target, key, value) {
            //  数组发生改变的时候会触发两次，length触发一次，内容改变触发一次
            const old = target[key]
            if (old === value) {
                return true
            }
            target[key] = value
            //  触发更新
            dep.notify()
            return true
        }
    }
    return new Proxy(data, handler)
}