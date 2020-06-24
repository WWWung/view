
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

const isUnaryTag = tag => 'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr'.split(",").includes(tag)

//  匹配开始标签的开始部分
const startTagOpen = new RegExp(`^<${qnameCapture}`)
//  匹配开始标签的结束部分
const startTagClose = /^\s*(\/?)>/

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

export function parse(html: string) {
    const stack = []
    let root: node, currentParent: node = null, nodeStack: Array<node> = []
    let index = 0
    let last, lastTag
    while (html) {
        last = html
        if (/**纯文本 */true) {
            let textEnd = html.indexOf('<')
            if (textEnd === 0) {
                if (/**注释的情况 */ false) {}
                if (/**条件注释的情况 */ false) {}
                if (/**<Doctype> */ false) {}
                const startTagMatch = parseStartTag()
                if (startTagMatch) {
                    handleStartTag(startTagMatch)
                    continue
                }
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    advance(endTagMatch[0].length)
                    onEnd()
                }
            }
            let text:string, rest: string, next:number
            if (textEnd >= 0) {
                rest = html.slice(textEnd)
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest)) {
                    next = rest.indexOf('<', 1)
                    if (next < 0) {
                        break
                    }
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                text = html.substring(0, textEnd)
            }
            if (textEnd < 0) {
                text = html
            }
            if (text) {
                advance(text.length)
            }
        }
        if (html === last) {
            console.log(`last is:${last}`)
            break
        }
    }

    function advance(n: number) {
        index += n
        html = html.substring(n)
    }

    function parseStartTag():startTagMatch {
        const start = html.match(startTagOpen)
        if (!start) {
            return
        }
        const match:startTagMatch = {
            tagName: start[1],
            attrs: [],
            start: index,
            unarySlash: false,
            end: 0
        }
        advance(start[0].length)
        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
            attr.start = index
            advance(attr[0].length)
            attr.end = index
            match.attrs.push(attr)
        }
        if (end) {
            match.unarySlash = !!end[1]
            advance(end[0].length)
            match.end = index
            return match
        }
    }

    function handleStartTag(match:startTagMatch) {
        const {
            tagName,
            unarySlash,
            attrs
        } = match
        const unary = isUnaryTag(tagName) || unarySlash
        const len = attrs.length
        for (let i = 0; i < len; i++) {
            const attr = attrs[i]
            const value = attr[3] || attr[4] || attr[5]
            attrs[i] = {
                name: attr[1],
                value
            }
        }
        if (!unary) {
            stack.push({ tag: tagName, attrs })
            lastTag = tagName
        }
        onStart(tagName, attrs, unary)
    }

    function onStart(tag:string, attrs:Array<attr>, unary:boolean) {
        const ele:node = {
            type: 1,
            tag,
            parent: currentParent,
            attrs,
            children: []
        }
        if (!root) {
            root = ele
        } else if (currentParent) {
            currentParent.children.push(ele)
        }
        if (!unary) {
            currentParent = ele
            nodeStack.push(currentParent)
        }
    }
    function onEnd() {
        nodeStack.pop()
        currentParent = nodeStack[nodeStack.length - 1]
    }
    return root
}



interface node {
    type:number,
    tag:string,
    parent: node,
    attrs: Array<attr>,
    children: Array<node>
}

interface attr {
    name: string,
    value: string
}

interface startTagMatch {
    tagName: string,
    attrs: Array<any>
    start: number,
    unarySlash: boolean,
    end: number
}