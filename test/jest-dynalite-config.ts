export default {
    tables: [
        {
            TableName: 'stream-authorizer-dev',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            AttributeDefinitions: [
                { AttributeName: 'userId', AttributeType: 'S' },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            data: [
                {
                    userId: 'madeuphash',
                    concurrentSessions: 1,
                },
                {
                    userId: 'toomanystreams',
                    concurrentSessions: 3,
                },
                {
                    userId: 'nostreams',
                    concurrentSessions: 0,
                }
            ],
        },
    ],
    basePort: 3000,
};
