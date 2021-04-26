const path = require('path')
const fs = require('fs-extra')
const eventMetaData = require('../data/event-metadata.json')

import {
  getTargetsForEventsOnEventBridge,
  getAllSchemasAsJSONSchema,
  hydrateSchemasWithAdditionalOpenAPIData,
} from './utils/aws'
import {
  generateContentForDetailType,
  generateSideNotesForDetailType,
  generateSourceMetadata,
} from './utils/js-to-markdown'

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const exec = require('./utils/exec')

const generateFiles = async (allSchemasForEvents, eventRules) => {
  await fs.ensureDirSync(path.join(__dirname, '../generated-docs'))

  const makeDocs = allSchemasForEvents.map(async (schema) => {
    const { Content = {}, SchemaName, SchemaVersion } = schema

    const source = Content['x-amazon-events-source'].replace('DeadHappy', 'MyApp')
    const detailType = Content['x-amazon-events-detail-type']
    const sourceDescription = eventMetaData?.[source]?.metadata?.title || ''

    await fs.ensureDirSync(path.join(__dirname, `../generated-docs/${source}`))

    await fs.writeFileSync(
      path.join(__dirname, `../generated-docs/${source}/meta.md`),
      generateSourceMetadata({ source, sourceDescription })
    )

    // Generate the file for each detail type
    await fs.ensureDirSync(path.join(__dirname, `../generated-docs/${source}/${detailType}`))

    const { description, properties, example } = eventMetaData?.[source]?.events?.[detailType] || {}

    const rulesForDetailType = eventRules?.[detailType]?.rules || []

    const content = generateContentForDetailType({
      detailType,
      description,
      rulesForDetailType,
      schemaName: SchemaName,
      schemaVersion: SchemaVersion,
      descriptionsForProperties: properties,
    })
    await fs.writeFileSync(
      path.join(__dirname, `../generated-docs/${source}/${detailType}/content.md`),
      content
    )

    const sidenotes = generateSideNotesForDetailType({ schema: schema.Content, example })
    await fs.writeFileSync(
      path.join(__dirname, `../generated-docs/${source}/${detailType}/sidenotes.md`),
      sidenotes
    )
  })

  await Promise.all(makeDocs)
}

const init = async () => {
  // make request to get all schemas in the registry
  console.log(`Fetching schemas in the registry: ${process.env.DISCOVERED_SCHEMAS_ARN}...`)

  const data = await exec(
    `aws schemas list-schemas --registry-name ${process.env.DISCOVERED_SCHEMAS_ARN} --region ${process.env.REGION}`,
    true
  )
  const { Schemas: schemas } = JSON.parse(data.stdout)

  try {
    // get all schemas as JSON schemas
    console.log(`Found ${schemas.length} schemas on Event bus. Downloading schemas as JSON...`)
    const allEventSchemasAsJSONSchema = await Promise.all(await getAllSchemasAsJSONSchema(schemas))

    // JSON schema does not give us everything, lets hydrate the data with the open API stuff.
    console.log(`Now hydraing scheams with extra OPEN API data...`)
    const requestsToGetAllSchemas = await hydrateSchemasWithAdditionalOpenAPIData(
      allEventSchemasAsJSONSchema
    )

    const allSchemasForEvents = await Promise.all(requestsToGetAllSchemas)

    console.log(`Now getting target/rule information for events`)
    const targets = await getTargetsForEventsOnEventBridge()

    console.log(`AWS Import complete. Now generating your documentation....`)
    await generateFiles(allSchemasForEvents, targets)

    console.log(`Finished generating`)
  } catch (error) {
    console.log('e', error)
  }
}

init()
