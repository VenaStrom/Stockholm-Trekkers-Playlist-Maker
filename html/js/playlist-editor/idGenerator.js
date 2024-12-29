"use strict";

const pageBornAt = new Date().getTime();

const getID = () => {
    const pageURL = window.location.href;

    // Get an object with all the arguments in the url
    const args = Object.fromEntries(new URLSearchParams(pageURL.split("?").at(-1)));

    // If the id already exists, return it
    if (args.id !== "new") {
        return args.id;
    };

    console.info("Creating a new ID");

    // If the id does not exist, create a new one
    const time = new Date().getTime();

    const id = time.toString() + pageBornAt.toString();

    // Add the new id to the url
    const updatedURL = new URL(pageURL);
    updatedURL.searchParams.set("id", id);
    window.location.href = updatedURL;

    return id;
};

// Runs at page load to set an ID for this project
getID();