import exec from './exec'

export const getTargetsForEventsOnEventBridge = async () => {
  console.log('Getting targets for events....')
  const targets = await exec(`aws events list-rules --event-bus-name ${process.env.EVENT_BUS_NAME}`)
  const targetsForEvents = JSON.parse(targets.stdout)
  return buildTargets(targetsForEvents)
}

export const getAllSchemasAsJSONSchema = async (schemaList) => {
  return schemaList.map(async (schema) => {
    // return exec(`aws schemas describe-schema --registry-name arn:aws:schemas:eu-west-1:764738370862:registry/discovered-schemas --schema-name ${schema.SchemaName}`)
    return exec(
      `aws schemas export-schema --registry-name discovered-schemas --schema-name ${schema.SchemaName} --type JSONSchemaDraft4`
    )
  })
}

export const hydrateSchemasWithAdditionalOpenAPIData = async (schemas) => {
  return schemas.map(async (rawSchema) => {
    const schema = buildSchema(rawSchema)

    // get the schema as open API too, as its has more metadata we might find useful.
    const openAPISchema = await exec(
      `aws schemas describe-schema --registry-name discovered-schemas --schema-name ${schema.SchemaName}`
    )
    const schemaAsOpenAPI = buildSchema(openAPISchema)

    const { LastModified, SchemaArn, SchemaVersion, Tags, VersionCreatedDate } = schemaAsOpenAPI

    return {
      ...schema,
      LastModified,
      SchemaArn,
      SchemaVersion,
      Tags,
      VersionCreatedDate,
    }
  })
}

export const buildSchema = (rawSchema) => {
  const schemaDescription = JSON.parse(rawSchema.stdout)
  const { Content, ...schema } = schemaDescription
  return {
    Content: JSON.parse(Content),
    ...schema,
  }
}

export const buildTargets = ({ Rules = [] }) => {
  return Rules.reduce((rules, rule) => {
    const eventPattern = JSON.parse(rule.EventPattern)
    const detailType = eventPattern['detail-type'] || []
    detailType.forEach((detail) => {
      if (!rules[detail]) {
        rules[detail] = { rules: [] }
      }
      rules[detail].rules.push(rule.Name)
    })
    return rules
  }, {})
}
