import eventMetaData from '../../data/event-metadata.json'
import Schema from './Schema'

export default class Registry {
  constructor(awsSchemas, allRulesForEvents) {
    this.description = eventMetaData?.eventbus?.description || ''
    this.events = awsSchemas.map((schema) => {
      const { Content } = schema
      const detailType = Content['x-amazon-events-detail-type']
      const { rules = [] } = allRulesForEvents[detailType] || {}
      return new Schema(schema, rules)
    })
  }

  getEventsByEventSource() {
    return this.events.reduce((eventsBySource, event) => {
      if (eventsBySource[event.source] === undefined) eventsBySource[event.source] = []
      eventsBySource[event.source].push(event)
      return eventsBySource
    }, {})
  }
}
