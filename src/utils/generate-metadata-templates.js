require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })
import path from 'path'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import jsf from 'json-schema-faker'

import { getAllSchemas, getAllSchemasAsJSONSchema } from './aws'

const REGSITRY_NAME = process.env.SCHEMA_REGISTRY_NAME

const parseSchemaIntoTemplate = (test) => {
  const { definitions = {} } = test.JSONSchema

  return Object.keys(definitions).reduce((templates, definition) => {
    const { properties = {} } = definitions[definition]

    const definitionLowerCase = definition.toLocaleLowerCase()

    templates[definitionLowerCase] = templates[definitionLowerCase] || {}

    templates[definitionLowerCase] = Object.keys(properties).reduce((newProperties, property) => {
      const { type, $ref } = properties[property]

      if ($ref) {
        return newProperties
      }

      newProperties[property] = {
        type,
        description: '',
        example: '',
      }

      return newProperties
    }, {})

    // remove any data we are not interested in
    if (Object.keys(templates[definitionLowerCase]).length === 0) {
      delete templates[definitionLowerCase]
    }

    return templates
  }, {})
}

const generateMetadataFromSchemas = async () => {
  const data = await getAllSchemas(REGSITRY_NAME)
  const { Schemas: schemas } = data

  const allEventSchemasAsJSONSchema = await Promise.all(
    await getAllSchemasAsJSONSchema(REGSITRY_NAME, schemas)
  )

  const schemasGroupedBySource = allEventSchemasAsJSONSchema.reduce((groupedSchemas, schema) => {
    const { SchemaName, Content, SchemaVersion } = schema

    // example: myapp.applications@MyEvent
    const schemaParts = SchemaName.split('@')

    const source = schemaParts[0]
    const eventName = schemaParts[1]

    groupedSchemas[source] = groupedSchemas[source] || {}
    groupedSchemas[source][eventName] = { JSONSchema: JSON.parse(Content), SchemaVersion }

    return groupedSchemas
  }, {})

  Object.keys(schemasGroupedBySource).map((source) => {
    const folderDir = path.join(__dirname, `../../data/${source}`)

    fs.mkdirSync(folderDir, { recursive: true })

    const events = schemasGroupedBySource[source]

    fs.writeFileSync(
      `${folderDir}/source-metadata.json`,
      JSON.stringify(
        {
          description: '',
          maintainers: [],
        },
        null,
        4
      )
    )

    Object.keys(events).forEach((event) => {
      const { detail } = jsf.generate(events[event].JSONSchema)

      const extendedSchema = parseSchemaIntoTemplate(events[event])

      const file = {
        description: `${event} event raised on the ${source} event source`,
        detail: {
          ...extendedSchema,
        },
        example: {
          'detail-type': event,
          resources: [],
          detail: detail,
          id: uuid(),
          source: source,
          time: new Date(),
          region: process.env.REGION,
          version: events[event].SchemaVersion,
          account: 'YOUR_ACCOUNT',
        },
      }

      fs.writeFileSync(`${folderDir}/${event}.json`, JSON.stringify(file, null, 4))
    })
  })
}

generateMetadataFromSchemas()
