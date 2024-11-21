export const sendResponse = (code, response) => {
    return {
        statusCode: code,
        body: JSON.stringify(response),
    };
};
