import { formatJSONResponse } from '../libs/api-gateway';
import { middyfy } from '../libs/lambda';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayAuthorizerEvent,
    Handler,
} from 'aws-lambda';
import log from 'lambda-log';
import { DynamoDBClient } from '../libs/dynamodb';
import { StreamAuthorizerEvent, UserSession } from '../types';

type StreamAuthorizerHandler = Handler<
    APIGatewayProxyEvent & StreamAuthorizerEvent,
    APIGatewayProxyResult
>;

const dynamodb = new DynamoDBClient();

// TODO: Replace with environment variable
const tableName = 'stream-authorizer-dev';

const streamAuthorizer: StreamAuthorizerHandler = async (event, context) => {
    // add relevant event info to log (i.e. request id)
    log.options.meta = {

        functionName: context.functionName,
    
        requestId: context.awsRequestId
    
      };

    const { userId } = event.body;

    const params = {
        Key: { userId: userId },
        TableName: tableName,
    };

    let result: UserSession;

    try {
        result = (await dynamodb.get(params)) as UserSession;
    } catch (error) {
        log.error(error);
    }

    if (!result) {
        const item: UserSession = { userId: userId, concurrentSessions: 1 };
        const params = { Item: item, TableName: tableName };

        try {
            const createdItem = await dynamodb.put(params);

            return formatJSONResponse({
                message: createdItem,
            });
        } catch (error) {
            log.error(error);
        }
    } else if (result.concurrentSessions < 3) {
        // TODO: replace hardcoded 3 with env var
        const updatedSessionCount = (result.concurrentSessions += 1);

        const item = { ...result, concurrentSessions: updatedSessionCount };
        const params = { Item: item, TableName: tableName };

        const updatedItem = await dynamodb.put(params);

        try {
            return formatJSONResponse(
                {
                    message: updatedItem,
                },
                201
            );
        } catch (error) {
            log.error(error);
        }
    } else {
        return formatJSONResponse(
            {
                message: 'Too many active streams',
            },
            401
        ); // TODO: replace text with something
    }
};

export const handler = middyfy(streamAuthorizer);
