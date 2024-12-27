"use strict";

const _console = {
    log: console.log,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
    info: console.info,
};

// Call Trace //
// Function to get the file name and line number of the caller
const getTrace = (options = { depth: 2 }) => {
    // Temporarily override Error.prepareStackTrace to get the stack trace
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    // Create a new Error to capture the stack trace
    const callee = new Error().stack.at(options.depth); // Get the caller's stack frame. Default depth 2 because 0 is this function, 1 is the caller of this function, and 2 is the caller of the caller i.e. what we are after
    Error.prepareStackTrace = originalPrepareStackTrace; // Restore the original Error.prepareStackTrace

    // Format and return the file name and line number
    return callee.toString().split("/").at(-1).replace(")", "").replace("\n", "");
};

Object.entries(_console).forEach(([type, originalFunction]) => {
    console[type] = (...args) => {
        const prefix = getTrace();
        main.sendConsole(type, [prefix, ...args]);
        originalFunction(prefix, ...args);
    };
});