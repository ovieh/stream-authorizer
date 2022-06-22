import DynamoDB, {
    DocumentClient,
    PutItemInputAttributeMap,
} from 'aws-sdk/clients/dynamodb';
import dynamoDbTestConfig from '../../test/jest-dynalite-config';

interface IDynamoDB {
    put(
        item: DynamoDB.DocumentClient.PutItemInput
    ): Promise<PutItemInputAttributeMap>;
    get(
        item: DynamoDB.DocumentClient.GetItemInput
    ): Promise<PutItemInputAttributeMap>;
}

export class DynamoDBClient implements IDynamoDB {
    private client: DocumentClient;

    constructor() {

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
            await this.client.put(item).promise();
            return item.Item;
        } catch (error) {
            console.error(error);
        }
    }

    async get(item: DynamoDB.DocumentClient.GetItemInput) {
        try {
            const result = await this.client.get(item).promise();

            if (result.Item) {
                return result.Item;
            } else {
                return null;
            }
        } catch (error) {
            console.error(error);
        }
    }
}
