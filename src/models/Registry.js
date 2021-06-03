import eventMetaData from '../../data/event-metadata.json'
import Schema from './Schema'

export default class Registry {
  constructor(awsSchemas, allRulesForEvents, eventBusName) {
    this.description = eventMetaData?.eventbus?.description || ''
    this.eventBusName = eventBusName
    this.events = awsSchemas.map((schema) => {
      const { Content } = schema
      const detailType = Content['x-amazon-events-detail-type']
      const { rules = [] } = allRulesForEvents[detailType] || {}
      return new Schema(schema, rules)
    })
  }

  toString() {
    return JSON.stringify(
      {
        description: this.description,
        eventBusName: this.eventBusName,
        events: this.events,
      },
      null,
      4
    )
  }

  getEventsByEventSource() {
    return this.events.reduce((eventsBySource, event) => {
      if (eventsBySource[event.source] === undefined) eventsBySource[event.source] = []
      eventsBySource[event.source].push(event)
      return eventsBySource
    }, {})
  }
}
