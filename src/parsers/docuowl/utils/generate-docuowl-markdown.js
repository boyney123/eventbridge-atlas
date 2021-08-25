export const generateContentForDetailType = ({
  detailType,
  description = '',
  rulesForDetailType,
  schemaName,
  schemaVersion,
  descriptionsForProperties,
}) => {
  return `---
Title: ${detailType}
---

${description}

${
  descriptionsForProperties
    ? `

## Detail Definitions

${Object.keys(descriptionsForProperties).map(
  (rootKey) => `
#### ${rootKey}
${Object.keys(descriptionsForProperties[rootKey]).map(
  (property) => `
- \`${property}\` - ${descriptionsForProperties[rootKey][property]?.type} - ${descriptionsForProperties[rootKey][property].description}`
)}
`
)}`
    : ''
}

<br />

${
  rulesForDetailType.length > 0
    ? `
## Event Rules
${rulesForDetailType.map((rule) => `- \`${rule}\``)}
`
    : ''
}

<br />

# **Schema details**
#### Schema name: \`${schemaName}\`
#### Version: \`${schemaVersion}\`
    `
}

export const generateSideNotesForDetailType = ({ schema, example }) => {
  return `

${
  example
    ? `
#! Event Example
\`\`\`json
${JSON.stringify(example, null, 4)}
\`\`\`
`
    : ''
}


#! Event Schema
\`\`\`json
${JSON.stringify(schema, null, 4)}
\`\`\``
}

export const generateSourceMetadata = ({ source, sourceDescription, maintainers }) => {
  return `---
Title: ${source}
---

${sourceDescription}

${
  maintainers.length > 0
    ? `
  **Maintainers**: 
  ${maintainers.join(', ')}
  `
    : ''
}

`
}
