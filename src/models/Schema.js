import fs from 'fs-extra'
import path from 'path'

export default class Schema {
  constructor(awsSchema, rules) {
    const { Content = {}, SchemaName, SchemaVersion } = awsSchema
    const source = Content['x-amazon-events-source']
    const detailType = Content['x-amazon-events-detail-type']
    let eventMetaData = {}
    let sourceMetaData = {}

    try {
      eventMetaData = fs.readJsonSync(
        path.join(__dirname, `../../data/${source}/${detailType}.json`)
      )
    } catch (error) {
      eventMetaData = {}
    }

    try {
      sourceMetaData = fs.readJsonSync(
        path.join(__dirname, `../../data/${source}/source-metadata.json`)
      )
    } catch (error) {
      sourceMetaData = {}
    }

    this.eventMetaData = eventMetaData
    this.sourceMetaData = sourceMetaData

    this.source = source
    this.detailType = detailType
    this.schemaName = SchemaName
    this.schema = Content
    this.rules = rules
    this.version = SchemaVersion

    //source info
    this.sourceDescription = eventMetaData?.[source]?.metadata?.title || ''

    // event
    this.description = eventMetaData?.description || ''
    this.properties = eventMetaData?.properties || {} // depreated
    this.example = eventMetaData?.example
    this.detailProperties = eventMetaData?.detail || {}

    this.author = eventMetaData?.[source]?.events?.[detailType]?.author || ''
  }
}
