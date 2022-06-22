export default {
    tables: [
        {
            TableName: 'stream-authorizer-dev',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'userId', AttributeType: 'S' },
            ],
            BillingMode: 'PAY_PER_REQUEST',
        },
    ],
    basePort: 3000,
};

