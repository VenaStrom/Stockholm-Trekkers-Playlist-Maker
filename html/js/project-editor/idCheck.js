
const pageURL = window.location.href;
const arguments = {};
pageURL.split("?")[1].split("&").forEach((arg) => {
    const [key, value] = arg.split("=");

    arguments[key] = value;
});

