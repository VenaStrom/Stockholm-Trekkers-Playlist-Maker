"use strict";

const pageBornAt = new Date().getTime();

const getID = () => {
    const pageURL = window.location.href;

    // Get an object with all the arguments in the url
    const args = {};
    pageURL.split("?").at(1).split("&").forEach((arg) => {
        const [key, value] = arg.split("=");

        args[key] = value;
    });

    // If the id already exists, return it
    if (args.id !== "new") {
        return args.id;
    };

    // Else, create a new id
    const time = new Date().getTime();

    const id = time.toString() + pageBornAt.toString();

    // This solution is not scalable in case you need more arguments in the url which probably won't be needed
    window.location.href = window.location.href.replace("?id=new", "") + `?id=${id}`;

    return id;
};

// Runs at page load to set an ID for this project
getID();