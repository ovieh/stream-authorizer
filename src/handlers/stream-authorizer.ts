import { formatJSONResponse } from '../libs/api-gateway';
import { middyfy } from '../libs/lambda';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    Handler,
} from 'aws-lambda';
import { DynamoDBClient } from '../libs/dynamodb';
import { StreamAuthorizerEvent, UserSession } from '../types';


type StreamAuthorizerHandler = Handler<
    APIGatewayProxyEventV2 & StreamAuthorizerEvent,
    APIGatewayProxyResultV2
>;

const dynamodb = new DynamoDBClient();

// TODO: Replace with environment variable
const tableName = 'stream-authorizer-dev';

const streamAuthorizer: StreamAuthorizerHandler = async (event) => {
    const { userId } = event.body;

    const params = {
        Key: { userId: userId },
        TableName: tableName,
    };

    const result = (await dynamodb.get(params)) as UserSession;

    if (!result) {
        const item: UserSession = { userId: userId, concurrentSessions: 1 };
        const params = { Item: item, TableName: tableName };
        const createdItem = await dynamodb.put(params);

        return formatJSONResponse({
            message: createdItem,
        });
    } else if (result.concurrentSessions < 3) {
        // TODO: replace hardcoded 3 with env var
        const updatedSessionCount = (result.concurrentSessions += 1);

        const item = { ...result, concurrentSessions: updatedSessionCount };
        const params = { Item: item, TableName: tableName };

        const updatedItem = await dynamodb.put(params);

        return formatJSONResponse({
            message: updatedItem,
        }, 201);
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
