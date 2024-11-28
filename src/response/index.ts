export const sendResponse = (code: number, response: any) => {
    return {
        statusCode: code, 
        body: JSON.stringify(response), 
        headers: {
            "Content-Type": "application/json", 
        },
    };
};
