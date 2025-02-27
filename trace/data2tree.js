
/**
 * 根据函数执行顺序数组生成可以具有父子关系的树🌲
 * @param data
 */
function setTree(data) {
    // @todo: 优化一下
    let fire = {};
    let point = null;
    let lastCaller = {};
    let fisrstCaller = {};
    data.forEach((item, index) => {
        var module = item.module;
        if (index === 0) {
            fire.name = item.name;
            fire.value = item.name;
            fire.functionInfo = item;
            fire.children = [];
            fire.index = index;
            fisrstCaller = fire;
            point = fire;
        }
        else if (item.callerName === data[index - 1].name) {
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.functionInfo = item;
            o.children = [];
            o.parent = point;
            o.index = index;
            point.children.push(o);
            lastCaller.caller = item.callerName;
            lastCaller.point = point;
            point = o;
        }
        else if (module && module.parents.indexOf(data[index - 1].name) > -1) {
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.functionInfo = item;
            o.children = [];
            o.parent = point;
            o.index = index;
            point.children.push(o);
            lastCaller.caller = item.callerName;
            lastCaller.point = point;
            point = o;
        }
        else if (module && module.parents.indexOf(lastCaller.name) > -1) {
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.index = index;
            o.functionInfo = item;
            o.children = [];
            lastCaller.point.children.push(o);
            o.parent = lastCaller.point;
            point = o;
        }
        else if (item.callerName === lastCaller.callerName) {
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.index = index;
            o.functionInfo = item;
            o.children = [];
            lastCaller.point.children.push(o);
            o.parent = lastCaller.point;
            point = o;
        }
        else if (item.callerName === null && item.name) {
            // 找不到父节点，就挂载到根节点
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.functionInfo = item;
            o.children = [];
            o.index = index;
            o.parent = fisrstCaller;
            fisrstCaller.children.push(o);
            point = o;
        }
        else {
            var o = {};
            o.name = item.name;
            o.value = item.name;
            o.index = index;
            o.functionInfo = item;
            o.children = [];
            let parent = findParent(point, item);
            // lastCaller.caller = item.caller;
            // lastCaller.point = point;
            o.parent = parent;
            point = o;
            if (parent) {
                if (parent && parent.children) {
                    parent.children.push(o);
                }
            }
            else {
                fisrstCaller.children.push(o);
                o.parent = fisrstCaller;
            }
        }
    });
    window.__TREE__.push(fire);
}

/**
 * 寻找当前节点的父节点
 * @param data 当前节点
 * @param name 调用函数的名字
 * @returns {null|*|null|*}
 */
function findParent(data, item) {
    if (data) {
        var module =  item.module;
        var parentModule = data.functionInfo.module;
        if (data.name === item.callerName || data.name === item.grandFatherName) {
            return data;
        }
        else if (module && parentModule && module.parents.indexOf(parentModule.i) > -1) {
            return data;
        }
        else {
            return findParent(data.parent, item);
        }
    }
    return null;
}

/**
 * 根据数组生成多颗树，并绑定到window对象上，这样可以方便查看树的原始数据
 */
function setFireToWindow() {
    window.__TREE__ = [];
    setTree(window.__DATA__);
    var __parent__ = {
        children: [],
        name: '开始',
        value: '开始',
        index: -99999
    };
    window.__TREE__.forEach(function(item) {
        __parent__.children.push(item);
        item.parent = __parent__;
    });
    window.__TREE__ = __parent__;
}

module.exports = setFireToWindow;