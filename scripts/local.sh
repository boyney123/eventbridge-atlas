#!/bin/sh

# Requires, AWS-CLI & Docker installed

npm run clean

npm run import-from-aws-and-generate-markdown

docker build -t eventbridge-atlas -f Dockerfile.local . && docker run -v $(pwd)/:/usr/src/eventbridge-atlas eventbridge-atlas

npm run add-event-atlas-ui-changes && npm start