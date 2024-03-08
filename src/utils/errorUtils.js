export const createCustomError = (message, name) => {
    const error =  new Error(message);
    error.name = name;
    return error;
};