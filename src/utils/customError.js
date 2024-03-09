class CustomError extends Error {
    constructor(name, status, message) {
        super();
        this.name = name;
        this.status = status;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;

// export const createCustomError = (message, name) => {
//     const error =  new Error(message);
//     error.name = name;
//     return error;
// };