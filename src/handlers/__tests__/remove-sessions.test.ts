import { Context } from 'aws-lambda';
import { handler } from '../remove-session';
import { startDb, stopDb, createTables, deleteTables } from 'jest-dynalite';

beforeAll(startDb);

beforeEach(createTables);
afterEach(deleteTables);

afterAll(stopDb);

const context = {} as Context;

describe('Remove session handler', () => {
    it('returns 404 status code when user session is not found', async () => {
        const response = await handler(
            { body: { userId: 'not_a_user' } },
            context
        );

        expect(response.statusCode).toBe(404);
    });

    it("updates the user's number of concurrent sessions", async () => {
        const response = await handler(
            { body: { userId: 'toomanystreams' } },
            context
        );

        const body = JSON.parse(response.body);

        expect(body.message.concurrentSessions).toBe(2);
    });

    it('returns 201 status code when the user has more than 0 streams', async () => {
        const response = await handler(
            { body: { userId: 'toomanystreams' } },
            context
        );

        expect(response.statusCode).toBe(201);
    });

    it('returns 200 status code when the user has 0 streams', async () => {
        const response = await handler(
            { body: { userId: 'nostreams' } },
            context
        );

        expect(response.statusCode).toBe(200);
    });

    // it('returns a statusCode of 401 when the user has more than 3 than concurrent streams', async () => {
    //     const response = await handler(
    //         { body: { userId: 'toomanystreams' } },
    //         context
    //     );

    //     expect(response.statusCode).toBe(401);
    // });

    // it('returns a statusCode of 201 when the user has less than 3 concurrent streams', async () => {
    //     const response = await handler(
    //         { body: { userId: 'madeuphash' } },
    //         context
    //     );

    //     expect(response.statusCode).toBe(201);
    // });
});
