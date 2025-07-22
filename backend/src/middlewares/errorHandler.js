import { config } from "../config/config.js";

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || null;

    const stack = config.app.env === "development" ? err.stack : undefined;

    console.error(`[${new Date().toISOString()}] ${message}`);
    if (stack) console.error(stack);

    const response = {
        status: "error",
        statusCode,
        message,
    };

    if (config.app.env === "development") {
        response.errors = errors;
        response.stack = stack;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;
