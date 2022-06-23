import { formatJSONResponse } from '../libs/api-gateway';
import { middyfy } from '../libs/lambda';
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Handler,
} from 'aws-lambda';
import { DynamoDBClient } from '../libs/dynamodb';
import { StreamAuthorizerEvent, UserSession } from '../types';
import log from 'lambda-log';

type RemoveSessionHandler = Handler<
    APIGatewayProxyEvent & StreamAuthorizerEvent,
    APIGatewayProxyResult
>;
const dynamodb = new DynamoDBClient();

// TODO: Replace with environment variable
const tableName = 'stream-authorizer-dev';

const removeSession: RemoveSessionHandler = async (event, context) => {
    // add relevant event info to log (i.e. request id)
    log.options.meta = {
        functionName: context.functionName,
        requestId: context.awsRequestId,
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
        log.info(`userId: ${userId} could not be found`);
        return formatJSONResponse({ message: 'User session not found' }, 404);
    }

    if (result.concurrentSessions > 0) {
        const updatedSessionCount = (result.concurrentSessions -= 1);

        const item = { ...result, concurrentSessions: updatedSessionCount };

        try {
            const updatedItem = await dynamodb.put({
                Item: item,
                TableName: tableName,
            });

            return formatJSONResponse({ message: updatedItem }, 201);
        } catch (error) {
            log.error(error);
        }
    } else {
        return formatJSONResponse({ message: result }, 200);
    }
};

export const handler = middyfy(removeSession);
