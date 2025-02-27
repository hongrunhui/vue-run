import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import TraceTree from './components/TraceTree/index'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TraceTree nodes={window.parent?.window?.__VUE_TRACE__?.rootNode} />
  </React.StrictMode>,
)
