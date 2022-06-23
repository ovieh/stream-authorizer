type UserSession = {
    userId: string;
    concurrentSessions: number;
};

type StreamAuthorizerEvent = {
    body: {
        userId: string;
    };
};

export { UserSession, StreamAuthorizerEvent };
