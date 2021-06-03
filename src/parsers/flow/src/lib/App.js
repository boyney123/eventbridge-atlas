import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import Diagram from './components/Diagram'
import { ReactFlowProvider } from 'react-flow-renderer'

import registry from './data/registry.json'

const App = () => {
  return (
    <ReactFlowProvider>
      <Diagram
        registry={registry}
        onEventSelect={() => {
          setTest('s')
        }}
      />
    </ReactFlowProvider>
  )
}

const rootComponent = App()

ReactDOM.render(rootComponent, document.body.appendChild(document.createElement('DIV')))
