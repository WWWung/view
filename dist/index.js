function compileHtmlToFunction(template) {
    // const exp = 
    var queue = [];
    var matchedStr = "";
    for (var i = 0; i < template.length; i++) {
        var current = template.charAt(i);
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

function reactive(data) {
    var dep = new Dep();
    var handler = {
        get: function (target, key) {
            dep.depend();
            return target[key];
        },
        set: function (target, key, value) {
            //  数组发生改变的时候会触发两次，length触发一次，内容改变触发一次
            var old = target[key];
            if (old === value) {
                return true;
            }
            target[key] = value;
            dep.notify();
            return true;
        }
    };
    return new Proxy(data, handler);
}

function observe(data) {
    // return reactive(data)
    // console.log(data)
    Object.entries(data).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (Array.isArray(value) || {}.toString.call(value) === "[object Object]") {
            data[key] = observe(value);
        }
    });
    return reactive(data);
}

var watcherQueue = [];
var waiting = false;
function nextTick() {
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
    if (!waiting) {
        waiting = true;
        nextTick();
    }
}

var uid = 0;
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
        this.run();
        setTarget(null);
    };
    Watcher.prototype.addDep = function (dep) {
        dep.addSub(this);
    };
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
        this.data = observe(data);
        this.el = document.getElementById(el);
        var template = this.getTemplate(this.el);
        var complier = compileHtmlToFunction(template);
        new Watcher(complier, this.data, this);
    };
    View.prototype.getTemplate = function (el) {
        return el.innerHTML;
    };
    View.prototype._update = function (value) {
        this.el.innerHTML = value;
    };
    return View;
}());

export default View;
//# sourceMappingURL=index.js.map
