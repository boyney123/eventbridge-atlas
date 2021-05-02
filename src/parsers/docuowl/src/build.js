const exec = require('../../../utils/exec')

export default async () => {
  await exec(
    `docker build -t eventbridge-atlas -f ./src/parsers/docuowl/utils/Dockerfile.local . && docker run -v $(pwd)/:/usr/src/eventbridge-atlas eventbridge-atlas`,
    true
  )
}
