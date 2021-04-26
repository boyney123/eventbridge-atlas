FROM node:15.4.0-alpine

RUN mkdir -p /usr/src/eventbridge-docs
WORKDIR /usr/src/eventbridge-docs

CMD ["./lib/docuowl", "--input", "generated-docs", "--output", "docs-html"]
