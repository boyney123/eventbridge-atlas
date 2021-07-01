export default async ({ exec }) => {
  await exec(
    `cd generated-docs/asyncapi && npx @asyncapi/generator@1.7.3 events.yml @asyncapi/html-template -o ../../docs-html/asyncapi`,
    true
  )
}
