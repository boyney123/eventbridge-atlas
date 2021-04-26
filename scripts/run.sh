#!/bin/sh

echo "setting up AWS creds"
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY

echo "Clean up directory"
npm run clean

echo "Importing data from AWS"
npm run import-from-aws-and-generate-markdown

echo "Generating documentation..."
./lib/docuowl --input generated-docs --output docs-html

echo "Staring App"
npm run add-event-atlas-ui-changes && npm start