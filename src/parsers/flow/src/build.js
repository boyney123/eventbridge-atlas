export default async ({ exec }) => {
  await exec(
    `cd src/parsers/flow/src/lib && npx webpack`,
    true
  )
}
