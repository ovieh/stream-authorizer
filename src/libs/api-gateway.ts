export const formatJSONResponse = (
    response: Record<string, unknown>,
    statusCode = 200
) => {
    return {
        statusCode,
        body: JSON.stringify(response),
    };
};
