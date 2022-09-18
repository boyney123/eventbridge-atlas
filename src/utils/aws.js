const path = require('path')
const { EventBridge } = require('@aws-sdk/client-eventbridge')
const { Schemas } = require('@aws-sdk/client-schemas')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const schemas = new Schemas({
  region: process.env.REGION,
})
const eventbridge = new EventBridge({
  region: process.env.REGION,
})

export const getTargetsForEventsOnEventBridge = async (eventBusName) => {
  const targetsForEvents = await eventbridge.listRules({ EventBusName: eventBusName })

  return buildTargets(targetsForEvents.Rules)
}

export const getAllSchemas = async (registryName) => {
  return await schemas.listSchemas({ RegistryName: registryName })
}

export const getAllSchemasAsJSONSchema = async (registryName, schemaList) => {
  return schemaList.map(async (schema) => {
    return schemas.exportSchema({
      RegistryName: registryName,
      SchemaName: schema.SchemaName,
      Type: 'JSONSchemaDraft4',
    })
  })
}
export const hydrateSchemasWithAdditionalOpenAPIData = async (registryName, schemaList) => {
  return schemaList.map(async (rawSchema) => {
    const schema = buildSchema(rawSchema)

    // get the schema as open API too, as its has more metadata we might find useful.
    const openAPISchema = await schemas.describeSchema({
      RegistryName: registryName,
      SchemaName: schema.SchemaName,
    })
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
  return { ...rawSchema, Content: JSON.parse(rawSchema.Content) }
}

export const buildTargets = (busRules) => {
  return busRules.filter(busRule => busRule.EventPattern !== undefined).reduce((rules, rule) => {
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
