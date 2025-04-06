const setup = (browserWindow) => {
    browserWindow.webContents.on("will-navigate", (event) => {
        if (event.url.includes("https://") || event.url.includes("http://")) {
            event.preventDefault();
            require("electron").shell.openExternal(event.url);
        }
    });
};

module.exports = { setup };