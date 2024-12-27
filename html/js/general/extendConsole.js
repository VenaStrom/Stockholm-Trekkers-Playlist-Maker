"use strict";

const _console = {
    log: console.log,
    debug: console.debug,
    warn: console.warn,
    error: console.error,
    info: console.info,
};

Object.entries(_console).forEach(([type, originalFunction]) => {
    console[type] = (...args) => {
        main.sendConsole(type, args);
        originalFunction(...args);
    };
});