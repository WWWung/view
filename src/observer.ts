import { reactive } from "./reactive";

export function observe(data:object|Array<any>):any {
    // return reactive(data)
    // console.log(data)
    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value) || {}.toString.call(value) === "[object Object]") {
            data[key] = observe(value)
        }
    })
    return reactive(data)
}