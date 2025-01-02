"use strict";

const { BrowserWindow, ipcMain } = require("electron");
const { styleText } = require("node:util");
const path = require("node:path");

const _console = {
    log: console.log,
    // debug: console.debug, // Unmodified
    warn: console.warn,
    error: console.error,
    info: console.info,
};

const _colors = {
    log: ["green"],
    debug: ["cyan"],
    warn: ["bgBlack", "yellow"],
    error: ["bgBlack", "red"],
    info: ["gray"],
    trace: ["gray"],
};

// A hacky way of getting the stack trace for determining the source of the console log
const getTrace = (options = { depth: 2, verbose: false }) => {
    // Temporarily override Error.prepareStackTrace to get the stack trace
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    // Create a new Error to capture the stack trace
    const callee = new Error().stack.at(options.depth); // Get the caller's stack frame. Default depth 2 because 0 is this function, 1 is the caller of this function, and 2 is the caller of the caller i.e. what we are after
    Error.prepareStackTrace = originalPrepareStackTrace; // Restore the original Error.prepareStackTrace

    const filePath = callee.getFileName();
    const fileName = path.basename(filePath || "");
    const lineNumber = callee.getLineNumber();
    const columnNumber = callee.getColumnNumber();

    if (options.verbose) {
        return `${filePath}:${lineNumber}:${columnNumber}`;
    }

    return `${fileName}:${lineNumber}:${columnNumber}`;
};

// Hijack Console Functions
Object.entries(_console).forEach(([type, originalFunction]) => {
    // If the first argument is an object, and contains any of these, don't pass it
    const availableOptions = ["_noTrace", "_verboseTrace", "_revert", "_noRenderer"];

    console[type] = (options, ...args) => {
        // In case you don't wanna modify the console.log in a specific instance
        if (options._revert) {
            return originalFunction(...args);
        }

        // Default options
        const config = {
            passFirstArg: true,
            trace: true,
            verboseTrace: false,
            sendToRenderer: true,
        };

        // Read Options
        if (options && availableOptions.some((option) => options[option])) {
            config.passFirstArg = false;
            if (options._noTrace) config.trace = false;
            if (options._verboseTrace) config.verboseTrace = true;
            if (options._noRenderer) config.sendToRenderer = false;
        }

        // Colorize the trace and the arguments if applicable 
        const prefix = styleText(_colors.trace, `[Main] ${getTrace()}:\n`);
        const verbosePrefix = styleText(_colors.trace, `[Main] ${getTrace({ verbose: true })}:\n`);
        const coloredArgs = [options, ...args]
            .map((arg) => typeof arg === "string" ? styleText(_colors[type], arg) : arg);


        // Compile the arguments 
        const functionArgs = [];

        if (config.trace) {
            functionArgs.push(prefix);

            if (config.verboseTrace) {
                functionArgs.shift();
                functionArgs.push(verbosePrefix);
            };
        }
        if (!config.passFirstArg) {
            coloredArgs.shift();
        }
        functionArgs.push(...coloredArgs);

        originalFunction(...functionArgs);

        if (!config.sendToRenderer) {
            return;
        }

        // Send the call to the renderer
        BrowserWindow.getAllWindows().forEach((window) => {
            const prefix = `%c[Main] ${getTrace({ depth: 4 })}:\\n`; // Escape the newline character since it will be evaluated in the renderer
            const verbosePrefix = `%c[Main] ${getTrace({ depth: 4, verbose: true })}:\\n`; // Escape the newline character since it will be evaluated in the renderer
            const prefixColor = "color: gray;";

            // Compile the arguments
            const relayedArgs = [options, ...args];
            if (!config.passFirstArg) {
                relayedArgs.shift();
            }

            window.webContents.executeJavaScript(
                `_console.${type}("${config.verboseTrace ? verbosePrefix : prefix}", "${prefixColor}", ...${JSON.stringify(relayedArgs)});`
            );
        });
    };
});


// Log from the renderer
const ipcHandlers = () => {
    ipcMain.handle("send-console", (_, type, args) => {
        const trace = args.shift();
        const prefix = styleText("gray", `[Renderer] ${trace}\n`);
        const coloredArgs = args
            .filter((arg) => typeof arg === "string")
            .map((arg) => styleText(_colors[type], arg));

        _console[type](prefix, ...coloredArgs);
    });
};

module.exports = { ipcHandlers };