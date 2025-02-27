import { parse as babelParse } from '@babel/parser'
import traverseDefault from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'

// 由于 @babel/traverse 是 ESM 默认导出，需要这样处理
const traverse = traverseDefault.default || traverseDefault

// Vue 生命周期钩子
const VUE_LIFECYCLE_HOOKS = [
  'setup',
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeUnmount',
  'unmounted',
  'errorCaptured',
  'renderTracked',
  'renderTriggered',
  'activated',
  'deactivated'
]

// 处理参数，包括解构参数
function processParam(param) {
  if (t.isIdentifier(param)) {
    return t.identifier(param.name)
  }
  if (t.isObjectPattern(param)) {
    return t.objectExpression(
      param.properties.map(prop => {
        if (t.isObjectProperty(prop)) {
          return t.objectProperty(
            t.identifier(prop.key.name),
            t.identifier(prop.value.name || prop.key.name)
          )
        }
        return null
      }).filter(Boolean)
    )
  }
  if (t.isArrayPattern(param)) {
    return t.arrayExpression(
      param.elements.map(element => 
        element ? t.identifier(element.name) : t.nullLiteral()
      )
    )
  }
  return t.nullLiteral()
}

export function injectTraceCode(s, script) {
  console.log('[Inject] Starting injection for:', script.loc?.source || 'unknown file')
  
  const ast = babelParse(script.content, {
    sourceType: 'module',
    plugins: [
      'jsx',
      'typescript',
      'decorators-legacy',
      'classProperties',
      'topLevelAwait',
      'objectRestSpread'
    ]
  })
  
  let functionsProcessed = 0
  
  traverse(ast, {
    Function(path) {
      const { node, parent } = path
      
      // 获取函数名
      let fnName = getFunctionName(node, parent, path)
      console.log('[Inject] Processing function:', fnName, 'at line:', node.loc?.start?.line)
      
      // 获取函数位置信息
      const location = script.loc?.source ? `${script.loc.source}:${node.loc.start.line}:${node.loc.start.column}` : 'unknown'
      
      // 为箭头函数创建特殊的跟踪代码
      const createTraceNode = (args) => t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('__trace_node__'),
          t.logicalExpression(
            '&&',
            t.identifier('window.__VUE_TRACE__'),
            t.callExpression(
              t.memberExpression(
                t.identifier('window.__VUE_TRACE__'),
                t.identifier('enter')
              ),
              [t.objectExpression([
                t.objectProperty(
                  t.identifier('name'),
                  t.stringLiteral(fnName)
                ),
                t.objectProperty(
                  t.identifier('args'),
                  args
                ),
                t.objectProperty(
                  t.identifier('location'),
                  t.stringLiteral(location)
                ),
                t.objectProperty(
                  t.identifier('isVueHook'),
                  t.booleanLiteral(VUE_LIFECYCLE_HOOKS.includes(fnName))
                )
              ])]
            )
          )
        )
      ])

      // 包装函数体
      if (t.isArrowFunctionExpression(node)) {
        // 创建参数数组
        const argsArray = t.arrayExpression(
          node.params.map(param => processParam(param))
        )
        
        // 创建跟踪节点
        const traceNode = createTraceNode(argsArray)

        if (!t.isBlockStatement(node.body)) {
          // 处理箭头函数的简写形式
          const returnValue = node.body
          node.body = t.blockStatement([
            traceNode,
            t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier('__return_value__'),
                returnValue
              )
            ]),
            t.expressionStatement(
              t.logicalExpression(
                '&&',
                t.identifier('window.__VUE_TRACE__'),
                t.logicalExpression(
                  '&&',
                  t.identifier('__trace_node__'),
                  t.callExpression(
                    t.memberExpression(
                      t.identifier('window.__VUE_TRACE__'),
                      t.identifier('exit')
                    ),
                    [
                      t.identifier('__trace_node__'),
                      t.identifier('__return_value__')
                    ]
                  )
                )
              )
            ),
            t.returnStatement(t.identifier('__return_value__'))
          ])
        } else {
          const originalBody = node.body.body
          const hasReturnStatement = originalBody.some(stmt => t.isReturnStatement(stmt))
          
          const newBody = [traceNode]
          
          // 初始化返回值变量
          newBody.push(
            t.variableDeclaration('let', [
              t.variableDeclarator(
                t.identifier('__return_value__'),
                t.identifier('undefined')
              )
            ])
          )
          
          // 处理原始函数体
          originalBody.forEach(stmt => {
            if (t.isReturnStatement(stmt)) {
              if (stmt.argument) {
                newBody.push(
                  t.expressionStatement(
                    t.assignmentExpression(
                      '=',
                      t.identifier('__return_value__'),
                      stmt.argument
                    )
                  )
                )
              }
              newBody.push(
                t.expressionStatement(
                  t.logicalExpression(
                    '&&',
                    t.identifier('window.__VUE_TRACE__'),
                    t.logicalExpression(
                      '&&',
                      t.identifier('__trace_node__'),
                      t.callExpression(
                        t.memberExpression(
                          t.identifier('window.__VUE_TRACE__'),
                          t.identifier('exit')
                        ),
                        [
                          t.identifier('__trace_node__'),
                          t.identifier('__return_value__')
                        ]
                      )
                    )
                  )
                )
              )
              newBody.push(t.returnStatement(t.identifier('__return_value__')))
            } else {
              newBody.push(stmt)
            }
          })
          
          if (!hasReturnStatement) {
            newBody.push(
              t.expressionStatement(
                t.logicalExpression(
                  '&&',
                  t.identifier('window.__VUE_TRACE__'),
                  t.logicalExpression(
                    '&&',
                    t.identifier('__trace_node__'),
                    t.callExpression(
                      t.memberExpression(
                        t.identifier('window.__VUE_TRACE__'),
                        t.identifier('exit')
                      ),
                      [
                        t.identifier('__trace_node__'),
                        t.identifier('__return_value__')
                      ]
                    )
                  )
                )
              )
            )
          }
          
          node.body.body = newBody
        }
      } else {
        // 处理普通函数，使用原来的逻辑
        const traceNode = createTraceNode(
          t.callExpression(
            t.memberExpression(
              t.identifier('Array'),
              t.identifier('from')
            ),
            [t.identifier('arguments')]
          )
        )
        // ... 其他代码保持不变 ...
      }
      
      functionsProcessed++
    }
  })
  
  console.log(`[Inject] Processed ${functionsProcessed} functions in:`, script.loc?.source || 'unknown file')

  // 将修改后的 AST 转换回代码
  const output = generate.default(ast, {
    retainLines: true,
    compact: false
  }, script.content)
  
  s.overwrite(0, script.content.length, output.code)
}

// 获取函数名（增强版）
function getFunctionName(node, parent, path) {
  // 直接使用函数声明的名称
  if (node.id?.name) return node.id.name
  
  // 对象方法
  if (t.isObjectProperty(parent) && t.isIdentifier(parent.key)) return parent.key.name
  
  // 变量声明
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) return parent.id.name
  
  // Vue 组件方法
  if (isVueMethod(path)) {
    const methodName = getVueMethodName(path)
    if (methodName) return methodName
  }
  
  // 渲染函数
  if (path.node.key?.name === 'render') return 'render'
  
  // 生命周期钩子
  const hookName = findVueHookName(path)
  if (hookName) return hookName
  
  return 'anonymous'
}

// 查找 Vue 生命周期钩子名称
function findVueHookName(path) {
  let current = path
  while (current) {
    if (t.isObjectProperty(current.node) && 
        t.isIdentifier(current.node.key) && 
        VUE_LIFECYCLE_HOOKS.includes(current.node.key.name)) {
      return current.node.key.name
    }
    current = current.parentPath
  }
  return null
}

// 获取 Vue 方法名称
function getVueMethodName(path) {
  let current = path
  while (current) {
    if (t.isObjectProperty(current.node) && 
        current.parent && 
        t.isObjectExpression(current.parent) &&
        current.parentPath.parent &&
        t.isObjectProperty(current.parentPath.parent) &&
        t.isIdentifier(current.parentPath.parent.key) &&
        (current.parentPath.parent.key.name === 'methods' || 
         current.parentPath.parent.key.name === 'computed')) {
      return current.node.key.name
    }
    current = current.parentPath
  }
  return null
}

// 判断是否是 Vue 方法
function isVueMethod(path) {
  let parent = path.parentPath
  while (parent) {
    if (t.isObjectProperty(parent.node) && 
        parent.parent && 
        t.isObjectExpression(parent.parent.node) &&
        (path.scope.getProgramParent().hasBinding('defineComponent') ||
         isInVueOptions(parent))) {
      return true
    }
    parent = parent.parentPath
  }
  return false
}

// 检查是否在 Vue 选项中
function isInVueOptions(path) {
  let current = path
  while (current) {
    if (t.isObjectProperty(current.node) &&
        t.isIdentifier(current.node.key) &&
        ['methods', 'computed', 'watch', 'components'].includes(current.node.key.name)) {
      return true
    }
    current = current.parentPath
  }
  return false
}

