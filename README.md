# Stream Authorizer Service

## Installation/deployment instructions


> **Requirements**: NodeJS `lts/fermium (v.14.15.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

-   Run `npm i` to install the project dependencies
-   Run `npx sls deploy` to deploy this stack to AWS

## Test your service

The two endpoints take identical inputs:

```json
{ "userId": "<some userId here>" }
```

>The `userId` is some identifier for the user provided by consumer. The `userId` and number of concurrent sessions is persisted to DynamoDB using http Lambda events.

## Testing

### To test locally

In order to test the add-session function locally, run the following command:

-   `npx sls invoke local -f add-session --path src/mocks/stream-authorizer-mock.json`

In order to test the remove-session function locally, run the following command:

-   `npx sls invoke local -f remove-session --path src/mocks/stream-authorizer-mock.json`

Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

### To test remotely

`Add user session info`

```json
curl --location --request POST 'https://<ask-me-for-url>/dev/stream-authorizer/add' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userId": "84700271-f75b-4d5d-9d76-cae84693eb65"
}'
```

`Update user session info when user exits stream`

```json
curl --location --request POST 'https://<ask-me-for-url>/dev/stream-authorizer/remove' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userId": "84700271-f75b-4d5d-9d76-cae84693eb65"
}'
```

## Running Unit / Integration Tests

`npm run test`

## Scalability Strategy

As it stands, the service uses AWS Lambda functions which can be handle "tens of thousands" of concurrent requests (or 1,000 by default). DynamoDB can also provide multi-region replication ensuring consistent experiences for consumers. AWS CloudWatch is automatically configured when using Lambda, if more observability is required CloudWatch logs can be imported into a service such as SumoLogic that may provide a more robust experience.

