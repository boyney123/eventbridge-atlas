export default async ({ exec }) => {
  await exec(
    `cd generated-docs/asyncapi && npx @asyncapi/generator events.yml @asyncapi/html-template -o ../../docs-html/asyncapi`,
    true
  )
}
