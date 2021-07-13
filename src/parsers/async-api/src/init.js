import path from 'path'
import fs from 'fs-extra'
import YAML from 'yaml'

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

function replaceDeinitionsWithComponents(obj) {
  const stringifyObject = JSON.stringify(obj)
  const replacedWords = stringifyObject.replace(/\#\/definitions\//gi, '#/components/schemas/')
  return JSON.parse(replacedWords)
}

const generateJSONForAsyncAPI = ({ eventBus, registry }) => {
  const generatedMessages = registry.getEvents().reduce((messages, schema) => {
    const detailType = schema.detailType

    messages[detailType] = {
      name: detailType,
      title: '', // has to be set at the moment?
      summary: schema.description,
      payload: {
        $ref: `#/components/schemas/${detailType}Payload`,
      },
    }

    return messages
  }, {})

  const generatedSchemas = registry.getEvents().reduce((schemas, schema) => {
    const detailType = schema.detailType

    const { properties, definitions = [] } = schema.schema

    schemas[`${detailType}Payload`] = {
      type: 'object',
      properties: properties,
    }

    Object.keys(definitions).forEach((definition) => {
      schemas[definition] = definitions[definition]
    })

    return schemas
  }, {})

  const generatedChannels = registry.getEvents().reduce((channels, schema) => {
    const rules = schema.rules || []
    const detailType = schema.detailType

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

export default async ({ eventBus, buildDir, registry }) => {
  const asyncAPIYml = new YAML.Document()
  asyncAPIYml.contents = generateJSONForAsyncAPI({ eventBus, registry })
  await fs.writeFile(path.join(buildDir, './events.yml'), asyncAPIYml.toString())
}
