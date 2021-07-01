export default async ({ exec }) => {
  await exec(
    `mkdir $(pwd)/docs-html &&  cp $(pwd)/generated-docs/slate/index.html.md $(pwd)/src/parsers/slate/lib/ && docker run --rm --name slate -v $(pwd)/docs-html/slate:/srv/slate/build -v $(pwd)/src/parsers/slate/lib:/srv/slate/source slatedocs/slate`,
    true
  )
}
