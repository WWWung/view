//  将模板字符串编译成渲染函数

import { parse } from "./parser/parser"

export function compileHtmlToFunction(template:string):(data:object|Array<any>) => string {
    // const exp = 
    const queue = []
    let matched = false
    let matchedStr = ""
    const ast = parse(template)
    console.log(ast)
    for (let i = 0; i < template.length; i++) {
        const current = template.charAt(i)
        //  普通字符串直接返回，模板字符串作为函数处理
        if (current === "{") {
            matched = true
            queue.push((matchedStr))
            matchedStr = ""
        } else if (current === "}") {
            matched = false
            queue.push(createGetter(matchedStr))
            matchedStr = ""
        } else {
            matchedStr += current
        }
    }
    matchedStr && queue.push(matchedStr)
    return function compiler(data:object|Array<any>):string {
        let str = ""
        for (let i = 0; i < queue.length; i++) {
            str += (typeof queue[i] === "function" ?
            queue[i](data) :
            queue[i])
        }
        return str
    }
}

function createGetter(exp) {
    return function getValue(data) {
        const arr = exp.split(".")
        let value = data
        for (let i = 0; i < arr.length; i++) {
            value = value[arr[i]]
        }
        return value
    }
}
