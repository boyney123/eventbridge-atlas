import path from 'path'
import fs from 'fs-extra'
import json2md from 'json2md'

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const frontmatter = ({ title }) => {
  return `---
title: ${title}

language_tabs: # must be one of https://git.io/vQNgJ
  - javascript

toc_footers:
  - <a href='#'>Sponsor the project</a>
  - <a href='https://eventbridge-atlas.netlify.app/'>How to use EventBridge Atlas</a>

search: true

code_clipboard: true
--- `
}

export default async ({ eventBus, buildDir, registry }) => {
  const eventsBySource = registry.getEventsByEventSource()

  const markdown = [{ h1: `AWS EventBridge: Event bus ${eventBus}` }, { p: registry.description }]

  Object.keys(eventsBySource).map((eventSource) => {
    const { description: sourceDescription, maintainers = [] } =
      registry.getSourceMetadata(eventSource)

    markdown.push({ h1: eventSource })

    if (sourceDescription)
      markdown.push({ p: `<strong>Description:</strong> ${sourceDescription}` })
    if (maintainers.length > 0) {
      markdown.push({ p: `<strong>Maintained by:</strong> ${maintainers.join(', ')}` })
    }

    eventsBySource[eventSource].map((event) => {
      markdown.push({ h2: event.detailType })
      markdown.push({ p: event.description })

      if (event.rules.length > 0) {
        markdown.push({ h3: 'Rules' })
        markdown.push({ ol: event.rules })
      }

      if (event.example) {
        // pretty sure this needs to be stringify twice to escape everything
        const detailToString = JSON.stringify(event.example.Detail)
        const example = { ...event.example, Detail: detailToString }

        markdown.push({ blockquote: 'Send example event using AWS CLI' })
        markdown.push({
          code: {
            language: 'shell',
            content: `aws events put-events --entries ${JSON.stringify(JSON.stringify([example]))}`,
          },
        })
      }

      if (event.example) {
        markdown.push({ blockquote: 'Example of Event' })
        markdown.push({
          code: { language: 'json', content: JSON.stringify(event.example, null, 4) },
        })
      }

      markdown.push({ blockquote: 'Schema' })
      markdown.push({ code: { language: 'json', content: JSON.stringify(event.schema, null, 4) } })

      const hasDetailProperties = Object.keys(event.detailProperties).lengh > 0

      if (hasDetailProperties) {
        markdown.push({ h3: 'Detail Definitions' })

        Object.keys(event.detailProperties).map((rootKey) => {
          const detailRootObject = event.detailProperties[rootKey]

          markdown.push({ h4: `${rootKey}` })

          markdown.push({
            table: {
              headers: ['property', 'type', 'description'],
              rows: Object.keys(detailRootObject).map((property) => {
                return {
                  property,
                  type: detailRootObject[property]?.type,
                  description: detailRootObject[property]?.description,
                }
              }),
            },
          })
        })
      }
    })
  })

  const file = `${frontmatter({ title: eventBus })}
${json2md(markdown)}
  }`

  await fs.writeFile(path.join(buildDir, './index.html.md'), file)
}
