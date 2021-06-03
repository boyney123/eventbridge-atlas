import React, { memo, useState } from 'react'

import { Handle } from 'react-flow-renderer'
import Editor from '@monaco-editor/react'

export default memo(
  ({ data: { event: { detailType, version, schema, author }, example } = {} }) => {
    const [showSchema, setShowSchema] = useState(false)
    const [showExample, setShowExample] = useState(false)
    const [codeToRender, setCodeToRender] = useState(schema)

    return (
      <div className="border-4 border-pink-700  bg-gray-100 rounded-xl" id={detailType}>
        <Handle
          type="target"
          position="left"
          style={{ background: 'orange' }}
          onConnect={(params) => console.log('handle onConnect', params)}
        ></Handle>
        <div className="mx-auto text-center text-sm space-y-4">
          <div className="w-full bg-pink-500 py-2 text-white">
            <div className="mb-1">Event: {detailType}</div>
          </div>
          <div className="p-4 pt-0">
            <div className="divide-y divide-gray-200 text-left pr-6">
              <div class="sm:flex  py-1 ">
                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-20">
                  Version
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 ">{version}</dd>
              </div>
              {author && (
                <div class="sm:flex  py-4">
                  <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-20">
                    Author
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 ">{author}</dd>
                </div>
              )}
              <div class="sm:flex  py-4">
                <dt class="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-20">
                  Actions
                </dt>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSchema(!showSchema)
                      setShowExample(false)
                      setCodeToRender(schema)
                    }}
                    className="w-full text-center  px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {!showSchema ? <span>View Schema</span> : <span>Hide Schema </span>}
                  </button>
                  {example && (
                    <button
                      type="button"
                      className="invisible"
                      onClick={() => {
                        setShowExample(!showExample)
                        setShowSchema(false)
                        setCodeToRender(example)
                      }}
                      className="w-full text-center  px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {!showExample ? <span>View Example</span> : <span>Hide Example </span>}
                    </button>
                  )}
                  {!example && <div className="py-2 px-24" />}
                </div>
              </div>
            </div>

            {(showSchema || showExample) && (
              <div className="mt-4">
                <Editor
                  height="500px"
                  width="700px"
                  defaultLanguage="json"
                  defaultValue={JSON.stringify(codeToRender, null, 4)}
                  theme="vs-dark"
                  options={{ minimap: { enabled: false }, readOnly: true }}
                />
              </div>
            )}
            <Handle type="source" position="right" id="a" style={{ background: '#e91e63' }} />
          </div>
        </div>
      </div>
    )
  }
)
