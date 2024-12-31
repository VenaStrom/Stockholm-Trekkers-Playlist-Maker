"use strict";

const _console = {
    log: console.log,
    // debug: console.debug, // Unmodified
    warn: console.warn,
    error: console.error,
    info: console.info,
};

// A hacky way of getting the stack trace for determining the source of the console log
const getTrace = (options = { depth: 2 }) => {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    const callee = new Error().stack.at(options.depth);
    Error.prepareStackTrace = originalPrepareStackTrace;

    const fileName = callee.toString().split("/").at(-1);
    return `${fileName.replace(")", "").replace("\n", "")}:`;
};

// Hijack console functions
Object.entries(_console).forEach(([type, originalFunction]) => {
    console[type] = (...args) => {
        // Relay to main
        main.sendConsole(type, [getTrace(), ...args]);

        const prefix = `%c[Renderer] ${getTrace()}\n`;
        const color = "color: gray;";

        originalFunction(prefix, color, ...args);
    };
});