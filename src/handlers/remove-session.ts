import { formatJSONResponse } from '../libs/api-gateway';
import { middyfy } from '../libs/lambda';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Handler,
} from 'aws-lambda';
import { DynamoDBClient } from '../libs/dynamodb';
import { StreamAuthorizerEvent, UserSession } from '../types';

type RemoveSessionHandler = Handler<
    APIGatewayProxyEventV2 & StreamAuthorizerEvent,
    APIGatewayProxyResultV2
>;

const dynamodb = new DynamoDBClient();

// TODO: Replace with environment variable
const tableName = 'stream-authorizer-dev';

const removeSession: RemoveSessionHandler = async (event) => {
    const { userId } = event.body;

    const params = {
        Key: { userId: userId },
        TableName: tableName,
    };

    const result = (await dynamodb.get(params)) as UserSession;

    if (!result) {
        return formatJSONResponse({ message: 'User session not found' }, 404);
    }

    if (result.concurrentSessions > 0) {
        const updatedSessionCount = (result.concurrentSessions -= 1);

        const item = { ...result, concurrentSessions: updatedSessionCount };

        const updatedItem = await dynamodb.put({
            Item: item,
            TableName: tableName,
        });

        return formatJSONResponse({ message: updatedItem }, 201);
    } else {
        return formatJSONResponse({ message: result }, 200);
    }
};

export const handler = middyfy(removeSession);
