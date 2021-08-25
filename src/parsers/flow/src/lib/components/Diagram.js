import React, { useState, useEffect, memo } from 'react'
import ReactFlow, { useZoomPanHelper } from 'react-flow-renderer'

import LambdaNode from './LambdaNode'
import EventNode from './EventNode'
import SourceNode from './SourceNode'

const nodeTypes = {
  lambdaNode: LambdaNode,
  eventNode: EventNode,
  sourceNode: SourceNode,
}

export default memo(({ registry = {} }) => {
  const { events = [], description, eventBusName } = registry

  const eventsGroupedByEventSource = events.reduce((eventsGrouped, event) => {
    const { source } = event
    if (!eventsGrouped[source]) eventsGrouped[source] = []
    eventsGrouped[source].push(event)
    return eventsGrouped
  }, {})

  const [selectedSource, setSelectedSource] = useState(Object.keys(eventsGroupedByEventSource)[0])

  const sourceToRender = { [selectedSource]: eventsGroupedByEventSource[selectedSource] }

  const newMappedEvents = Object.keys(sourceToRender).reduce(
    (data, eventSource, eventSourceIndex) => {
      const {
        currentPosition: { y: currentYPosition },
      } = data

      const sourceNodeHeight = 80
      const eventNodeHeight = 400
      const eventNodeWidth = 450
      const paddingBetweenSourceAndEvents = 50
      const ruleHeight = 120
      let sourceMetadata = {}

      const eventSourceYPosition = eventSourceIndex * (10 + sourceNodeHeight) + currentYPosition

      const eventsForSource = eventsGroupedByEventSource[eventSource]

      const { description, maintainers = [] } =
        eventsForSource.find((event) => event?.sourceMetaData?.description !== undefined)
          ?.sourceMetaData || {}

      const sourceYPosition =
        currentYPosition +
        (eventsForSource.length * eventNodeHeight) / 2 -
        (description ? eventNodeHeight / 2 : 0)

      // The soruce node
      const sourceNode = {
        id: eventSource,
        type: 'sourceNode', // input node
        data: {
          source: eventSource,
          description,
          maintainers,
        },
        style: { width: 'auto' },
        position: {
          x: 0,
          y: sourceYPosition,
        },
        sourcePosition: 'right',
      }

      const eventNodes = eventsForSource.reduce((eventNodes, event, eventIndex) => {
        const { schemaName, rules = [], detailType, description, example, author } = event

        const eventNodeYPosition =
          eventSourceYPosition + eventIndex * eventNodeHeight + sourceNodeHeight / 2

        const eventNode = {
          id: schemaName,
          type: 'eventNode', // input node
          data: { event, description, example, author },
          position: {
            x: eventNodeWidth + paddingBetweenSourceAndEvents,
            y: eventNodeYPosition,
          },
          sourcePosition: 'right',
          targetPosition: 'left',
        }

        const eventNodeEventSourceConnection = {
          id: `es${eventSourceIndex}-${eventIndex}`,
          source: eventSource,
          target: schemaName,
          animated: false,
        }

        // render the rules and all connections
        const rulesAndConnectionMarkers = rules.reduce(
          (data, rule, ruleIndex) => {
            const { nodes, previousRuleYPosition } = data

            const marker = {
              id: `${detailType}-${rule}`,
              // you can also pass a React component as a label
              type: 'lambdaNode',
              data: { rule },
              position: {
                x: 1000,
                // y: eventNodeYPosition + ruleHeight / 2 - ruleIndex * 10 * ruleHeight,
                y: previousRuleYPosition,
              },
              sourcePosition: 'right',
              targetPosition: 'left',
            }

            const connection = {
              id: `${eventSource}-${schemaName}-${rule}`,
              source: `${schemaName}`,
              target: `${detailType}-${rule}`,
              animated: false,
            }

            nodes.push(marker)
            nodes.push(connection)

            return { nodes, previousRuleYPosition: previousRuleYPosition + ruleHeight + 50 }
          },
          { nodes: [], previousRuleYPosition: eventNodeYPosition }
        )

        return eventNodes
          .concat([eventNode, eventNodeEventSourceConnection])
          .concat(rulesAndConnectionMarkers.nodes)
      }, [])

      data.events = data.events.concat([sourceNode]).concat(eventNodes)

      return {
        events: data.events,
        currentPosition: {
          x: 0,
          y: eventsForSource.length * eventNodeHeight + 100 + currentYPosition,
        },
      }
    },
    { events: [], currentPosition: { x: 0, y: 25 } }
  )

  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const { fitView } = useZoomPanHelper()

  const onLoad = (rf) => {
    setReactFlowInstance(rf)
  }

  useEffect(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView()
    }
  }, [reactFlowInstance])

  return (
    <>
      <div className="py-2 px-28 bg-pink-600 text-white font-bold">
        EventBridge Atlas - EventBridge Map
      </div>
      <div className="p-4 px-28 bg-gray-800 text-gray-600 flex justify-between  items-center border-b-2 border-gray-600">
        <div className="w-1/2">
          <span className="block text-xl text-gray-200">{eventBusName}</span>
          <span className="block text-xs text-gray-500 mt-2">{description}</span>
        </div>
        <div className="w-1/2 flex justify-end items-center">
          <label htmlFor="filter" className="inline-block text-sm font-medium text-gray-400 pr-5">
            EventBus Sources:
          </label>
          <select
            name="filter"
            className=" mt-1 inline-block pl-3 bg-gray-200 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value)
              fitView()
            }}
          >
            {Object.keys(eventsGroupedByEventSource).map((source) => {
              return <option value={source}>{source}</option>
            })}
          </select>
        </div>
      </div>

      <div style={{ height: '100vh', width: '100vw' }} className="App">
        <ReactFlow
          elements={newMappedEvents.events}
          onLoad={onLoad}
          maxZoom={10}
          minZoom={0.1}
          defaultZoom={0.1}
          style={{ background: '#1A192B' }}
          nodeTypes={nodeTypes}
          defaultPosition={[100, 100]}
          nodesDraggable={true}
        />
      </div>
    </>
  )
})
