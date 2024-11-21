
export const sendResponse = (code: number, response: any) => {

    return {
        statusCode: code,
        body: JSON.stringify(response),
    };
};