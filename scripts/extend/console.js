"use strict";

const readline = require("node:readline");
const path = require("node:path");
const { styleText } = require("node:util");

// Function to get the file name and line number of the caller
const getTrace = (options = { depth: 2, verbose: false }) => {
    // Temporarily override Error.prepareStackTrace to get the stack trace
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    // Create a new Error to capture the stack trace
    const callee = new Error().stack.at(options.depth); // Get the caller's stack frame. Default depth 2 because 0 is this function, 1 is the caller of this function, and 2 is the caller of the caller i.e. what we are after
    Error.prepareStackTrace = originalPrepareStackTrace; // Restore the original Error.prepareStackTrace

    // Get the file name and line number from the stack frame
    const fileName = options.verbose ? path.relative(process.cwd(), callee.getFileName()) : path.basename(callee.getFileName());
    // Make trace gray
    const fileNameAndLine = styleText(["reset", "gray"], `${fileName}:${callee.getLineNumber()}:`);

    return fileNameAndLine;
};


// Surrounds content with ---------------- lines
console.block = (content, title = "", options = { lineWidth: 40 }) => {
    const fileNameAndLine = getTrace();

    console.log({ _noTrace: true }, fileNameAndLine); // Trace on a separate line
    console.log({ _noTrace: true }, title.padEnd(options.lineWidth, "-"));
    console.log({ _noTrace: true }, content);
    console.log({ _noTrace: true }, "".padEnd(options.lineWidth, "-"));
};


// Get user input from the console
console.readLine = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        // Trace where this call came from
        console.log({ _noTrace: true }, getTrace({ depth: 4 })); // Depth 4 due to where this call is in the stack 

        rl.question(query, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};


// Add colors to the console log functions
const colors = {
    log: "cyan",
    debug: "blue",
    warn: ["reset", "bgYellow", "black", "bold"],
    error: ["reset", "bgRed", "white", "bold"],
    info: "green",
};

Object.entries(colors).forEach(([methodName, color]) => {
    const originalFunction = console[methodName];

    // Reassign the original functions to include color
    console[methodName] = (...args) => {
        const coloredArguments = args.map((argument) => {
            // If the argument is not a string, return it as is since it can't be styled without parsing to string
            if (typeof argument === "string") {
                return styleText(color, argument);
            }

            return argument;
        });
        originalFunction(...coloredArguments);
    };
});


// Add file name and line number to console logs
["debug", "log", "warn", "error", "info"].forEach((methodName) => {
    const originalFunction = console[methodName];

    // Reassign the original functions to include the file name and line number of the caller
    console[methodName] = (firstArgument, ...otherArguments) => {
        const fileNameAndLine = getTrace();

        if (typeof firstArgument === "object") { // Look for config object
            if (firstArgument._noTrace !== undefined) {
                const args = firstArgument._noTrace ? otherArguments : [fileNameAndLine, ...otherArguments]; // If false, don't include options object
                originalFunction(...args);
                return;
            }
            if (firstArgument._verboseTrace !== undefined) {
                const args = firstArgument._verboseTrace ? [getTrace({ depth: 2, verbose: true }), ...otherArguments] : otherArguments; // If false, don't include options object
                originalFunction(...args);
                return;
            }
        }
        originalFunction(fileNameAndLine, firstArgument, ...otherArguments);
    };
});