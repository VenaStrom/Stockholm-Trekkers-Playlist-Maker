"use strict";

const { styleText } = require("node:util");
const readline = require("node:readline");
const path = require("node:path");
const { BrowserWindow, ipcMain } = require("electron");


// Call Trace //
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
    const fileNameAndLine = styleText(["reset", "gray"], `[Main] ${fileName}:${callee.getLineNumber()}:`);

    return fileNameAndLine;
};


// Block //
// Surrounds content with ---------------- lines
console.block = (content, title = "", options = { lineWidth: 40 }) => {
    const fileNameAndLine = getTrace();

    console.log({ _noTrace: true }, fileNameAndLine); // Trace on a separate line
    console.log({ _noTrace: true }, title.padEnd(options.lineWidth, "-"));
    console.log({ _noTrace: true }, content);
    console.log({ _noTrace: true }, "".padEnd(options.lineWidth, "-"));
};


// Read Line //
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


// Extend Console Functions //
// Relay all console logs to the renderer
// Adds a trace of the source file and line number to the console logs
// Adds colors to the console logging functions
const colors = {
    log: "cyan",
    debug: "blue",
    warn: ["reset", "bgYellow", "black", "bold"],
    error: ["reset", "bgRed", "white", "bold"],
    info: "green",
};
Object.entries(colors).forEach(([methodName, color]) => {
    const originalFunction = console[methodName];

    // Reassign the original functions
    console[methodName] = (firstArg, ...args) => {
        const format = {
            passFirstArg: true,
            trace: true,
            verboseTrace: false,
        };

        // Read Options
        if (typeof firstArg === "object") {
            // If the option object is present, don't pass the first argument
            if (firstArg._verboseTrace !== undefined) {
                format.passFirstArg = false;
                format.verboseTrace = firstArg._verboseTrace;
            }
            if (firstArg._noTrace !== undefined) {
                format.passFirstArg = false;
                format.trace = !firstArg._noTrace;
            }
        }

        // Relay to Renderer
        BrowserWindow.getAllWindows().forEach((window) => {
            const prefix = styleText("bold", `[Main Process]` + (format.trace ? ` ${getTrace({ depth: 4, verbose: format.verboseTrace })}` : ""));
            const compiledArgs = format.passFirstArg ? [firstArg, ...args] : args;

            // Don't pass renderer relays
            // If any arg contains the string "[Renderer]", don't pass it to the renderer, again...
            for (let index = 0; index < compiledArgs.length; index++) {
                const arg = compiledArgs[index];
                if (typeof arg === "string" && arg.includes("[Renderer]")) {
                    return;
                }
            }

            // Handle empty strings
            if (compiledArgs.length === 1 && compiledArgs.at(0) === "") {
                window.webContents.executeJavaScript( // _console is a copy of the original console functions in the renderer
                    `_console.${methodName}("${prefix}", "Empty");`
                );
            } else {
                window.webContents.executeJavaScript( // _console is a copy of the original console functions in the renderer
                    `_console.${methodName}("${prefix}", ...${JSON.stringify(compiledArgs)});`
                );
            }
        });

        // Colorize
        const colorize = (preColorArgs) => {
            for (let index = 0; index < preColorArgs.length; index++) {
                const arg = preColorArgs[index];
                if (typeof arg === "string" && !arg.includes("[Renderer]")) {
                    preColorArgs[index] = styleText(color, arg);
                }
            }
        }

        // Compile the arguments with regard to the options
        const finalArgs = [...args];
        if (format.passFirstArg) {
            finalArgs.unshift(firstArg);
        }
        colorize(finalArgs);
        if (format.trace) {
            finalArgs.unshift(getTrace({ depth: 2, verbose: format.verboseTrace }));
        }
        // Call the original function
        originalFunction(...finalArgs);
    }
});

const ipcHandlers = () => {
    ipcMain.handle("send-console", (event, type, args) => {
        const trace = args.shift();
        const prefix = styleText("gray", `[Renderer] ${trace}`);
        console[type]({ _noTrace: true }, prefix, ...args);
    });
};

module.exports = { ipcHandlers };