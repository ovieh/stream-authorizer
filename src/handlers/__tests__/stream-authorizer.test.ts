import { Context } from 'aws-lambda';
import { handler } from '../stream-authorizer';
import { startDb, stopDb, createTables, deleteTables } from 'jest-dynalite';

beforeAll(startDb);

beforeEach(createTables);
afterEach(deleteTables);

afterAll(stopDb);

const context = {} as Context;

describe('Stream Authorizer handler', () => {
    it('returns a statusCode of 401 when the user has more than 3 than concurrent streams', async () => {
        const response = await handler(
            { body: { userId: 'toomanystreams' } },
            context
        );

        expect(response.statusCode).toBe(401);
    });

    it('returns a statusCode of 201 when the user has less than 3 concurrent streams', async () => {
        const response = await handler(
            { body: { userId: 'madeuphash' } },
            context
        );

        expect(response.statusCode).toBe(201);
    });

});
