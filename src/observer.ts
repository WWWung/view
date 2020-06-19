import { reactive } from "./reactive";
/**
 * 创建观察者
 * @param data 
 */
export function observe(data:object|Array<any>):any {
    //  如果value是数组或者对象需要递归观察
    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value) || {}.toString.call(value) === "[object Object]") {
            data[key] = observe(value)
        }
    })
    //  返回代理后的对象
    return reactive(data)
}