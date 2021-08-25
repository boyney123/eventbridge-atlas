const path = require('path')
const fs = require('fs-extra')

import {
  generateContentForDetailType,
  generateSideNotesForDetailType,
  generateSourceMetadata,
} from '../utils/generate-docuowl-markdown'

export default async ({ buildDir, registry }) => {
  const makeDocs = registry.getEvents().map(async (schema) => {
    const source = schema.source
    const detailType = schema.detailType
    const { description: sourceDescription, maintainers = [] } = registry.getSourceMetadata(source)

    await fs.ensureDirSync(path.join(buildDir, source))

    await fs.writeFileSync(
      path.join(buildDir, `${source}/meta.md`),
      generateSourceMetadata({ source, sourceDescription: sourceDescription, maintainers })
    )

    // Generate the file for each detail type
    await fs.ensureDirSync(path.join(buildDir, `${source}/${detailType}`))

    const content = generateContentForDetailType({
      detailType,
      description: schema.description,
      rulesForDetailType: schema.rules,
      schemaName: schema.schemaName,
      schemaVersion: schema.version,
      descriptionsForProperties: schema.detailProperties,
    })
    await fs.writeFileSync(path.join(buildDir, `/${source}/${detailType}/content.md`), content)

    const sidenotes = generateSideNotesForDetailType({
      schema: schema.schema,
      example: schema.example,
    })
    await fs.writeFileSync(path.join(buildDir, `${source}/${detailType}/sidenotes.md`), sidenotes)
  })

  await Promise.all(makeDocs)
}
