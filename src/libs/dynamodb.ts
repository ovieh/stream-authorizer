import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { PromiseResult } from 'aws-sdk/lib/request';
import dynamoDbTestConfig from '../../test/jest-dynalite-config';

interface IDynamoDB {
    put(item: DynamoDB.DocumentClient.PutItemInput): unknown;
}

export class DynamoDBClient implements IDynamoDB {
    private client: DocumentClient;
    private tableName: string;
    // private config: DocumentClientConfig;

    constructor(tableName: string) {
        this.tableName = tableName;

        if (process.env.JEST_WORKER_ID) {
            this.client = new DynamoDB.DocumentClient({
                ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
                    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
                    sslEnabled: false,
                    region: 'local',
                    basePort: dynamoDbTestConfig.basePort,
                }),
            });
        } else {
            this.client = new DynamoDB.DocumentClient();
        }
    }
    async put(item: DynamoDB.DocumentClient.PutItemInput) {
        try {
            console.log(item);
            await this.client.put(item).promise();
            return item;
        } catch (error) {
            console.error(error);
        }
    }
}
