var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + unicodeRegExp.source + "]*";
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var isUnaryTag = function (tag) { return 'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr'.split(",").includes(tag); };
//  匹配开始标签的开始部分
var startTagOpen = new RegExp("^<" + qnameCapture);
//  匹配开始标签的结束部分
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");
function parse(html) {
    var root, currentParent = null, nodeStack = [];
    var index = 0;
    var last;
    while (html) {
        last = html;
        {
            var textEnd = html.indexOf('<');
            if (textEnd === 0) {
                var startTagMatch = parseStartTag();
                if (startTagMatch) {
                    handleStartTag(startTagMatch);
                    continue;
                }
                var endTagMatch = html.match(endTag);
                if (endTagMatch) {
                    advance(endTagMatch[0].length);
                    onEnd();
                }
            }
            var text = void 0, rest = void 0, next = void 0;
            if (textEnd >= 0) {
                rest = html.slice(textEnd);
                while (!endTag.test(rest) &&
                    !startTagOpen.test(rest)) {
                    next = rest.indexOf('<', 1);
                    if (next < 0) {
                        break;
                    }
                    textEnd += next;
                    rest = html.slice(textEnd);
                }
                text = html.substring(0, textEnd);
            }
            if (textEnd < 0) {
                text = html;
            }
            if (text) {
                advance(text.length);
            }
        }
        if (html === last) {
            console.log("last is:" + last);
            break;
        }
    }
    function advance(n) {
        index += n;
        html = html.substring(n);
    }
    function parseStartTag() {
        var start = html.match(startTagOpen);
        if (!start) {
            return;
        }
        var match = {
            tagName: start[1],
            attrs: [],
            start: index,
            unarySlash: false,
            end: 0
        };
        advance(start[0].length);
        var end, attr;
        while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
            attr.start = index;
            advance(attr[0].length);
            attr.end = index;
            match.attrs.push(attr);
        }
        if (end) {
            match.unarySlash = !!end[1];
            advance(end[0].length);
            match.end = index;
            return match;
        }
    }
    function handleStartTag(match) {
        var tagName = match.tagName, unarySlash = match.unarySlash, attrs = match.attrs;
        var unary = isUnaryTag(tagName) || unarySlash;
        var len = attrs.length;
        for (var i = 0; i < len; i++) {
            var attr = attrs[i];
            var value = attr[3] || attr[4] || attr[5];
            attrs[i] = {
                name: attr[1],
                value: value
            };
        }
        onStart(tagName, attrs, unary);
    }
    function onStart(tag, attrs, unary) {
        var ele = {
            type: 1,
            tag: tag,
            parent: currentParent,
            attrs: attrs,
            children: []
        };
        if (!root) {
            root = ele;
        }
        else if (currentParent) {
            currentParent.children.push(ele);
        }
        if (!unary) {
            currentParent = ele;
            nodeStack.push(currentParent);
        }
    }
    function onEnd() {
        nodeStack.pop();
        currentParent = nodeStack[nodeStack.length - 1];
    }
    return root;
}

//  将模板字符串编译成渲染函数
function compileHtmlToFunction(template) {
    // const exp = 
    var queue = [];
    var matchedStr = "";
    var ast = parse(template);
    console.log(ast);
    for (var i = 0; i < template.length; i++) {
        var current = template.charAt(i);
        //  普通字符串直接返回，模板字符串作为函数处理
        if (current === "{") {
            queue.push((matchedStr));
            matchedStr = "";
        }
        else if (current === "}") {
            queue.push(createGetter(matchedStr));
            matchedStr = "";
        }
        else {
            matchedStr += current;
        }
    }
    matchedStr && queue.push(matchedStr);
    return function compiler(data) {
        var str = "";
        for (var i = 0; i < queue.length; i++) {
            str += (typeof queue[i] === "function" ?
                queue[i](data) :
                queue[i]);
        }
        return str;
    };
}
function createGetter(exp) {
    return function getValue(data) {
        var arr = exp.split(".");
        var value = data;
        for (var i = 0; i < arr.length; i++) {
            value = value[arr[i]];
        }
        return value;
    };
}

var target = null;
var Dep = /** @class */ (function () {
    function Dep() {
        this.watchers = [];
    }
    Dep.prototype.addSub = function (watcher) {
        this.watchers.push(watcher);
    };
    Dep.prototype.removeSub = function () {
    };
    Dep.prototype.depend = function () {
        //  target存在的时候才收集，避免重复收集
        target && target.addDep(this);
    };
    //  通知更新
    Dep.prototype.notify = function () {
        for (var i = 0; i < this.watchers.length; i++) {
            this.watchers[i].update();
        }
    };
    return Dep;
}());
function setTarget(watcher) {
    target = watcher;
}

//  通过proxy添加响应式
//  vue2.0是通过Object.defineProperty的方式拦截，这里采用es6的proxy
function reactive(data) {
    var dep = new Dep();
    var handler = {
        //  取值的时候收集依赖
        get: function (target, key) {
            dep.depend();
            return target[key];
        },
        //  修改值的时候触发更新
        set: function (target, key, value) {
            //  数组发生改变的时候会触发两次，length触发一次，内容改变触发一次
            var old = target[key];
            if (old === value) {
                return true;
            }
            target[key] = value;
            //  触发更新
            dep.notify();
            return true;
        }
    };
    return new Proxy(data, handler);
}

/**
 * 创建观察者
 * @param data
 */
function observe(data) {
    //  如果value是数组或者对象需要递归观察
    Object.entries(data).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value) || {}.toString.call(value) === "[object Object]") {
            data[key] = observe(value);
        }
    });
    //  返回代理后的对象
    return reactive(data);
}

//  异步触发更新
var watcherQueue = [];
var waiting = false;
function nextTick() {
    //  异步更新，好处是可以等待同步的代码执行完毕再一次性，性能比较好
    var p = Promise.resolve();
    p.then(function () {
        waiting = false;
        for (var i = 0; i < watcherQueue.length; i++) {
            var watcher = watcherQueue[i];
            watcher.run();
        }
        console.log("afterupdated");
    });
}
function addWatcher(watcher) {
    if (!watcherQueue.includes(watcher)) {
        watcherQueue.push(watcher);
    }
    //  如果当前已经在等待更新的状态，则不需要调用nextTick
    if (!waiting) {
        waiting = true;
        nextTick();
    }
}

var uid = 0;
/**
 * 监听
 */
var Watcher = /** @class */ (function () {
    function Watcher(render, data, vm) {
        this.render = render;
        this.data = data;
        this.id = uid++;
        this.vm = vm;
        this.init();
    }
    Watcher.prototype.init = function () {
        setTarget(this);
        //  调用run的时候会对 数据 取值操作，就会触发get收集到依赖
        this.run();
        setTarget(null);
    };
    Watcher.prototype.addDep = function (dep) {
        dep.addSub(this);
    };
    //  update的时候把watcher入栈，等待下次更新
    Watcher.prototype.update = function () {
        addWatcher(this);
    };
    Watcher.prototype.run = function () {
        var value = this.render(this.data);
        this.vm._update(value);
    };
    return Watcher;
}());

var View = /** @class */ (function () {
    function View(opts) {
        this.el = null;
        this.data = null;
        this.init(opts);
    }
    View.prototype.init = function (opts) {
        var el = opts.el, data = opts.data;
        //  添加观察者
        this.data = observe(data);
        //  绑定dom元素
        this.el = document.getElementById(el);
        //  根据元素获取 模板 字符串
        var template = this.getTemplate(this.el);
        //  根据模板字符串生成渲染函数
        var complier = compileHtmlToFunction(template);
        //  监听变化后更新
        new Watcher(complier, this.data, this);
    };
    View.prototype.getTemplate = function (el) {
        return el.innerHTML;
    };
    //  更新dom(vue里的实现这里会通过diff算法比较新旧vnode，我看不懂)
    View.prototype._update = function (value) {
        // this.el.innerHTML = value
    };
    return View;
}());

export default View;
//# sourceMappingURL=index.js.map
