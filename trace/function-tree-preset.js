/**
 * @author hongrunhui
 */
import StackTrace from 'stacktrace-js';
import deepClone from 'deep-clone';
import startRewrite from "./rewrite-function";
import {saveHtml} from './utils';
class RecorderPreset {
    constructor() {
        window.__RECORDERING__ = true;
        this.init();
    }

    init() {
        console.info('[RecorderPreset]: 开始注入');
        // 数据存的地方
        window.__DATA__ = [];
        window.__STEP__ = [];
        // 运行时关键变量
        window.__RUNTIME_VALUE_MAP__ = {};
        window.__SOURCE_MAP__ = {};
        startRewrite();
        window.__eatModule__ = function __eatModule__(arg, closure) {
            if (!window.__RECORDERING__) {
                return function (result, type) {
                    return result;
                };
            }
            if (arg) {
                const stacks = StackTrace.getSync();
                let callee = arg.callee;
                let caller = arg.callee.caller || arg.callee.__caller__;
                const data = {
                    callee,
                    caller,
                    arguments: arg,
                    closure,
                    stacks,
                    time: new Date().getTime()
                };
                if (callee && callee.name) {
                    window.__SOURCE_MAP__[callee.name] = data;
                }
                console.log('参数', data);
                saveHtml(data);
                window.__DATA__.push(data);
            }
            return function (result, type) {
                console.log('=====', type);
                if (!type) {
                }
                else if (type === 'if') {
                    const stacks = StackTrace.getSync();
                    if (!data.fnStep) {
                        data.fnStep = [];
                    }
                    const stepNode = {
                        stacks,
                        type: 'if',
                        value: result
                    };
                    data.fnStep.push(stepNode);
                }
                else if (type === 'value') {
                    // const stacks = StackTrace.getSync();
                    // if (!data.fnStep) {
                    //     data.fnStep = [];
                    // }
                    // const stepNode = {
                    //     stacks,
                    //     type: 'value',
                    //     value: clone(result)
                    // };
                    // console.log('哈哈哈哈', stepNode);
                    // data.fnStep.push(stepNode);
                    // if (window.__DATA__.length >= 256 && window.__DATA__.length < 426) {
                    //     const stacks = StackTrace.getSync();
                    //     const data = {
                    //         arg: result,
                    //         stacks
                    //     };
                    //     window.__STEP__.push(data);
                    // }
                }
                return result;
            };
        };
        window.__eat__ = function (arg, options, moduleInfo, closure) {
            if (!window.__RECORDERING__) {
                return function (result) {
                    return result;
                };
            }
            let {fnLoc} = options;
            if (!fnLoc) {
                fnLoc = {
                    start: {
                        line: 0,
                        column: 0
                    },
                    end: {
                        line: 0,
                        column: 0
                    }
                }
            }
            const {start} = fnLoc;
            const stacks = StackTrace.getSync();
            let callee = arg.callee;
            let caller = arg.callee.caller || arg.callee.__caller__;
            const data = {
                callee,
                caller,
                arguments: arg,
                fnLoc,
                line: start.line,
                col: start.column,
                moduleInfo,
                closure,
                stacks,
                steps: [],
                time: new Date().getTime()
            };
            if (window.__RECORDER_POINT__) {
                data.recorderPoint = window.__RECORDER_POINT__;
            }
            saveHtml(data);
            window.__DATA__.push(data);
            data.index = window.__DATA__.length;
            
            return data;
            // console.log(
            //     '\n\ncallee',
            //     arg.callee,
            //     '\ncaller',
            //     arg.callee.caller,
            //     '\n__caller__',
            //     arg.callee.__caller__);
            // if (!caller) {
            //     console.log('我找不到爸爸了', arg.callee, caller);
            // }
        };
    }

    setPoint(pointName) {
        if (!pointName) {
            return;
        }
        window.__RECORDER_POINT__ = pointName;
    }

    /**
     * 生成stack对象
     */
    recordStackObject(arg) {
        const stacks = StackTrace.getSync();
        let callee = arg.callee;
        let caller = arg.callee.caller || arg.callee.__caller__;
        const data = {
            callee,
            caller,
            arguments: arg,
            stacks,
            time: new Date().getTime()
        };
        return data;
    }

    recordValue(params) {
        if (!window.__RECORDERING__) {
            return;
        }
        const {
            index,
            name,
            action,
            args,
            value
        } = params;
        if (!window.__RUNTIME_VALUE_MAP__[name]) {
            window.__RUNTIME_VALUE_MAP__[name] = [];
        }
        const runtimeValue = window.__RUNTIME_VALUE_MAP__[name];
        const data = {
            index,
            action,
            args,
            value: deepClone(value)
        };
        runtimeValue.push(data)
    }
}

if (!window.__RECORDER_INSTANCE__) {
    window.__RECORDER_INSTANCE__ = new RecorderPreset();
}

export default window.__RECORDER_INSTANCE__ ;