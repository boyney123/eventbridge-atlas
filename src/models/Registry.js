import Schema from './Schema'
import fs from 'fs-extra'
import path from 'path'

export default class Registry {
  constructor(awsSchemas, allRulesForEvents, eventBusName) {
    this.description = ''
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

  getSourceMetadata(source) {
    try {
      return fs.readJsonSync(path.join(__dirname, `../../data/${source}/source-metadata.json`))
    } catch (error) {
      return {}
    }
  }

  getEvents() {
    return this.events
  }

  getEventsByEventSource() {
    return this.events.reduce((eventsBySource, event) => {
      if (eventsBySource[event.source] === undefined) eventsBySource[event.source] = []
      eventsBySource[event.source].push(event)
      return eventsBySource
    }, {})
  }
}
