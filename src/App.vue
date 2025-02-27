<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/base16/tomorrow.css'

// 配置highlight.js以显示行号
hljs.configure({
  lineNumbers: true
})

interface Step {
  id: number
  title: string
  description: string
  code: string
}

const currentStep = ref(0)
const steps = ref<Step[]>([
  {
    id: 1,
    title: '初始化阶段',
    description: 'Vue实例创建时的初始化过程，包括响应式系统的设置',
    code: `const app = createApp({
  data() {
    return { count: 0 }
  }
})`
  },
  {
    id: 2,
    title: '编译阶段',
    description: '模板编译成渲染函数的过程',
    code: `// 模板编译示例
<template>
  <div>{{ count }}</div>
</template>

↓ 编译后 ↓

render() {
  return h('div', this.count)
}`
  },
  {
    id: 3,
    title: '响应式系统',
    description: '数据变化触发视图更新的过程',
    code: `// 响应式原理示例
let activeEffect
class Dep {
  subscribers = new Set()
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }
  notify() {
    this.subscribers.forEach(effect => effect())
  }
}`
  }
])

const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

onMounted(() => {
  hljs.highlightAll()
})

const updateHighlight = () => {
  nextTick(() => {
    hljs.highlightAll()
  })
}
</script>

<template>
  <div class="container">
    <h1>Vue源码运行流程解析</h1>
    
    <div class="content">
      <div class="flow-chart">
        <div class="steps">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            :class="['step', { active: index === currentStep }]"
            @click="currentStep = index; updateHighlight()"
          >
            <div class="step-number">{{ step.id }}</div>
            <div class="step-info">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="code-display">
        <pre><code class="language-javascript" v-html="steps[currentStep].code"></code></pre>
      </div>
    </div>

    <div class="controls">
      <button @click="prevStep" :disabled="currentStep === 0">上一步</button>
      <button @click="nextStep" :disabled="currentStep === steps.length - 1">下一步</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.flow-chart {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.step:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step.active {
  border-color: #42b883;
  background: #f0faf5;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #42b883;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-weight: bold;
}

.step-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.step-info p {
  margin: 0.5rem 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.code-display {
  background: #1e1e1e;
  padding: 1.5rem;
  border-radius: 8px;
  overflow: auto;
  width: 100%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.code-display pre {
  margin: 0;
  text-align: left;
}

.code-display code {
  color: #e6e6e6;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  display: block;
  padding-left: 0;
  background: transparent !important;
}

/* 添加行号样式 */
.hljs-ln-numbers {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  text-align: center;
  color: #666;
  border-right: 1px solid #666;
  vertical-align: top;
  padding-right: 8px !important;
  min-width: 30px;
}

.hljs-ln-code {
  padding-left: 8px !important;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1.5rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

button:hover {
  background: #3aa876;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style>
