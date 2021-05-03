import path from 'path'
import fs from 'fs-extra'
import YAML from 'yaml'
import eventMetaData from '../../../../data/event-metadata.json'

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

function replaceDeinitionsWithComponents(obj) {
  const stringifyObject = JSON.stringify(obj)
  const replacedWords = stringifyObject.replace(/\#\/definitions\//gi, '#/components/schemas/')
  return JSON.parse(replacedWords)
}

const generateJSONForAsyncAPI = ({ eventBus, eventSchemas, eventTargets }) => {
  const generatedMessages = eventSchemas.reduce((messages, schema) => {
    const { Content = {}, SchemaName, SchemaVersion } = schema
    const source = Content['x-amazon-events-source']
    const detailType = Content['x-amazon-events-detail-type']
    const sourceDescription = eventMetaData?.[source]?.metadata?.title || ''

    const { description = '', properties, example } =
      eventMetaData?.[source]?.events?.[detailType] || {}

    messages[detailType] = {
      name: detailType,
      title: '', // has to be set at the moment?
      summary: description,
      payload: {
        $ref: `#/components/schemas/${detailType}Payload`,
      },
    }

    return messages
  }, {})

  const generatedSchemas = eventSchemas.reduce((schemas, schema) => {
    const { Content = {}, SchemaName, SchemaVersion } = schema
    const source = Content['x-amazon-events-source']
    const detailType = Content['x-amazon-events-detail-type']
    const sourceDescription = eventMetaData?.[source]?.metadata?.title || ''

    const { properties, definitions = [] } = Content

    schemas[`${detailType}Payload`] = {
      type: 'object',
      properties,
    }

    Object.keys(definitions).forEach((definition) => {
      schemas[definition] = definitions[definition]
    })

    return schemas
  }, {})

  const generatedChannels = Object.keys(eventTargets).reduce((channels, detailType) => {
    const { rules = [] } = eventTargets[detailType]

    rules.forEach((rule) => {
      if (generatedMessages[detailType]) {
        channels[rule] = {
          description: '', //TODO: populate with customer descriptions of lambda?
          subscribe: {
            message: {
              $ref: `#/components/messages/${detailType}`,
            },
          },
        }
      }
    })

    return channels
  }, {})

  return {
    asyncapi: '2.0.0',
    info: {
      title: eventBus,
      version: '0.0.1',
    },
    channels: generatedChannels,
    components: {
      messages: generatedMessages,
      schemas: replaceDeinitionsWithComponents(generatedSchemas),
    },
  }
}

export default async ({ eventBus, eventSchemas, eventTargets, buildDir }) => {
  const asyncAPIYml = new YAML.Document()
  asyncAPIYml.contents = generateJSONForAsyncAPI({ eventBus, eventSchemas, eventTargets })
  await fs.writeFile(path.join(buildDir, './events.yml'), asyncAPIYml.toString())
}
