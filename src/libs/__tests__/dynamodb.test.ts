import { nanoid } from 'nanoid';
import { DynamoDBClient } from '../dynamodb';
import { startDb, stopDb, createTables, deleteTables } from 'jest-dynalite';
import { UserSession } from '../../types';

beforeAll(startDb);

beforeEach(createTables);
afterEach(deleteTables);

afterAll(stopDb);

const dynamodb = new DynamoDBClient('todo-serverless-dev');

const item: UserSession = {
    userId: nanoid(),
    concurrentSessions: 1,
};

const tableName = 'stream-authorizer-dev';

describe('DynamoDb Client', () => {
    test('DynamoDb client exists', () => {
        expect(dynamodb).toBeDefined();
    });

    test('put method creates an item', async () => {
        const result = await dynamodb.put({
            Item: item,
            TableName: tableName,
        });

        expect(result).toBe(item);
    });

    test('get method returns correct item', async () => {
        const params = {
            Key: { userId: 'madeuphash' },
            TableName: tableName,
        };

        const result = await dynamodb.get(params);

        expect(result).toHaveProperty('userId', params.Key.userId);
    });
});
