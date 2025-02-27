import { parse, compileScript } from '@vue/compiler-sfc'
import MagicString from 'magic-string'
import { createUnplugin } from 'unplugin'
import { injectTraceCode } from './inject'
import fs from 'fs'
import path from 'path'

// 创建插件
const vueTracePlugin = createUnplugin((options = {}) => {
  let vueRuntimeModulePath = ''
  
  return {
    name: 'vite-plugin-vue-trace',
    enforce: 'post', // 在 Vue 插件之后运行

    configResolved(config) {
      console.log('Plugin configResolved called')
      // 找到 Vue runtime 模块的路径
      try {
        vueRuntimeModulePath = require.resolve('vue/dist/vue.runtime.esm-bundler.js')
      } catch (e) {
        console.warn('Could not find Vue runtime module')
      }

      // 修改 Vite 配置
      return {
        ...config,
        optimizeDeps: {
          ...(config.optimizeDeps || {}),
          include: [
            ...(config.optimizeDeps?.include || []),
            'vue',
            '@vue/runtime-core',
            '@vue/runtime-dom'
          ]
        },
        build: {
          ...(config.build || {}),
          commonjsOptions: {
            ...(config.build?.commonjsOptions || {}),
            include: [
              ...(config.build?.commonjsOptions?.include || []),
              /vue/,
              /@vue/
            ]
          }
        }
      }
    },

    // 注入初始化代码
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          injectTo: 'head',
          prependTo: 'head',
          order: -999,
          children: `
            window.__VUE_TRACE__ = {
              traces: [],
              currentNode: null,
              rootNode: null,
              enter: function(info) {
                const node = {
                  name: info.name,
                  args: info.args,
                  location: info.location,
                  isVueHook: info.isVueHook,
                  children: [],
                  parent: this.currentNode,
                  startTime: performance.now()
                };
                
                console.log('Entering function:', node.name);
                
                if (this.currentNode) {
                  this.currentNode.children.push(node);
                } else {
                  this.traces.push(node);
                  this.rootNode = node;
                }
                this.currentNode = node;
                return node;
              },
              exit: function(node, returnValue) {
                if (node) {
                  node.endTime = performance.now();
                  node.duration = node.endTime - node.startTime;
                  node.returnValue = returnValue;
                  console.log('Exiting function:', node.name);
                  this.currentNode = node.parent;
                }
              }
            };
          `
        },
        {
          tag: 'script',
          attrs: { type: 'module' },
          injectTo: 'head',
          order: 0,
          children: `
            import { initTraceUI } from '/plugins/vue-function-trace/runtime.jsx';
            window.addEventListener('load', () => {
              initTraceUI();
            });
          `
        }
      ]
    },

    // 处理所有 JavaScript 文件
    transform(code, id) {
      console.log('\n[Transform] Processing:', id)

      // 跳过非 JavaScript 文件
      if (!/\.(js|ts|vue|mjs)(\?.*)?$/.test(id)) {
        console.log('[Transform] Skipping non-JS file:', id)
        return
      }

      // 跳过 runtime.jsx 文件
      if (id.includes('runtime.jsx')) {
        console.log('[Transform] Skipping runtime.jsx:', id)
        return
      }

      // 跳过 Solid.js 相关文件
      if (id.includes('solid-js') || id.includes('solid')) {
        console.log('[Transform] Skipping Solid.js file:', id)
        return
      }

      // 跳过一些特定的文件
      if (id.includes('node_modules') && 
          !id.includes('vue_dist_vue__runtime__esm-bundler__js') && 
          !id.includes('chunk-') && 
          !id.includes('node_modules/vue') && 
          !id.includes('node_modules/@vue') &&
          !id.includes('node_modules/.vite/deps/vue') &&
          !id.includes('node_modules/.vite/deps/@vue')) {
        console.log('[Transform] Skipping non-Vue module:', id)
        return
      }

      try {
        const s = new MagicString(code)
        
        // 处理 .vue 文件
        if (id.endsWith('.vue')) {
          console.log('[Transform] Processing Vue component:', id)
          const { descriptor } = parse(code)
          if (descriptor.script || descriptor.scriptSetup) {
            const script = compileScript(descriptor, { 
              id,
              inlineTemplate: true,
              reactivityTransform: true
            })
            
            if (script) {
              console.log('[Transform] Injecting trace code into Vue component:', id)
              injectTraceCode(s, {
                content: script.content,
                loc: { source: id }
              })
            }
          }
          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
        
        // 处理 Vue runtime 和其他 JavaScript 文件
        if (id.includes('node_modules/.vite/deps/') || 
            id.includes('node_modules/vue') || 
            id.includes('node_modules/@vue') || 
            !id.includes('node_modules')) {
          console.log('[Transform] Injecting trace code into:', id)
          injectTraceCode(s, { 
            content: code, 
            loc: { source: id } 
          })

          return {
            code: s.toString(),
            map: s.generateMap()
          }
        }
      } catch (err) {
        console.error('[Transform] Error processing file:', id, '\n', err)
        return null
      }
    },

    // 修改预构建配置
    config(config) {
      return {
        optimizeDeps: {
          entries: [
            'vue/dist/vue.runtime.esm-bundler.js'
          ],
          include: [
            '@vue/runtime-core',
            '@vue/runtime-dom'
          ]
        },
        resolve: {
          alias: {
            'vue': 'vue/dist/vue.runtime.esm-bundler.js'
          }
        }
      }
    }
  }
})

export default vueTracePlugin.vite 