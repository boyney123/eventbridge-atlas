import React, { memo } from 'react'

import { Handle } from 'react-flow-renderer'

export default memo(({ data: { source, description, maintainers = [] } = {}, ...rest }) => {
  return (
    <div className="border-4 border-red-500 bg-gray-200 rounded-xl">
      <div className="mx-auto text-center">
        <div className="w-full bg-red-500 py-2 text-white">
          <div className="mb-1">Event Source</div>
        </div>
        <div className="p-4">
          <div className="text-xs inline-block pl-2 pr-6 font-bold">{source}</div>
          {description && (
            <div className="mt-2 text-xs italic w-64 block pl-2 pr-6">{description}</div>
          )}
          {maintainers && maintainers.length > 0 && (
            <div className="mt-2 text-xs italic w-64 block pl-2 pr-6">
              <span className="font-bold">Maintainers</span>: {maintainers.join(', ')}
            </div>
          )}
          <Handle type="source" position="right" id="a" style={{ background: '#e91e63' }} />
        </div>
      </div>
    </div>
  )
})
