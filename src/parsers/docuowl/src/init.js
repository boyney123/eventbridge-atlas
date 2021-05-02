const path = require('path')
const fs = require('fs-extra')
const eventMetaData = require('../../../../data/event-metadata.json')

import {
  generateContentForDetailType,
  generateSideNotesForDetailType,
  generateSourceMetadata,
} from '../utils/generate-docuowl-markdown'

const generateDocuOwlReadMeFiles = async ({ eventSchemas, eventTargets, dir }) => {
  const makeDocs = eventSchemas.map(async (schema) => {
    const { Content = {}, SchemaName, SchemaVersion } = schema

    const source = Content['x-amazon-events-source']
    const detailType = Content['x-amazon-events-detail-type']
    const sourceDescription = eventMetaData?.[source]?.metadata?.title || ''

    await fs.ensureDirSync(path.join(dir, source))

    await fs.writeFileSync(
      path.join(dir, `${source}/meta.md`),
      generateSourceMetadata({ source, sourceDescription })
    )

    // Generate the file for each detail type
    await fs.ensureDirSync(path.join(dir, `${source}/${detailType}`))

    const { description, properties, example } = eventMetaData?.[source]?.events?.[detailType] || {}

    const rulesForDetailType = eventTargets?.[detailType]?.rules || []

    const content = generateContentForDetailType({
      detailType,
      description,
      rulesForDetailType,
      schemaName: SchemaName,
      schemaVersion: SchemaVersion,
      descriptionsForProperties: properties,
    })
    await fs.writeFileSync(path.join(dir, `/${source}/${detailType}/content.md`), content)

    const sidenotes = generateSideNotesForDetailType({ schema: schema.Content, example })
    await fs.writeFileSync(path.join(dir, `${source}/${detailType}/sidenotes.md`), sidenotes)
  })

  await Promise.all(makeDocs)
}

export default async ({ eventSchemas, eventTargets, buildDir }) => {
  await generateDocuOwlReadMeFiles({ eventSchemas, eventTargets, dir: buildDir })
}
