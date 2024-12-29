// Keys: the category id that is used for the options in the blockOptions array
// Values: the name of the category that is displayed in the UI
const blockOptionsCategoryLookup = {
    "leading": "Leading Clips",
    "trailing": "Trailing Clips",
    "default": "Options" // Fallback to this if the category is not found
};


// Template option:
// {
//     id: "a-unique-id",
//     category: "one-of-the-categories", // See blockOptionsCategoryLookup
//     name: "The Name You See In The UI",
//     checked: true, // Default state
//     duration: "60", // Duration of the clip in seconds
//     fileName: "the-same-name-as-the-name-in-assetDownloadInfo-json.mp4", 
//     description: "A longer descriptive text that explains what this option does",
// },
const blockOptions = [
    {
        id: "leading-countdown",
        category: "leading",
        name: "Countdown",
        checked: true, // Default value
        duration: "60", // Seconds
        fileName: "pause_1_min_countdown.mp4",
        description: "Adds a 1 minute countdown before playing the first episode of the block",
    },
    {
        id: "leading-emergency-routine",
        category: "leading",
        name: "Emergency Routine",
        checked: true, // Default value
        duration: "59", // Seconds
        fileName: "pause_1_min_emergency.mp4",
        description: "Adds a 1 minute clip, describing our emergency routines, before playing the first episode of the block",
    },
    {
        id: "leading-covid-disclaimer",
        category: "leading",
        name: "COVID-19 Disclaimer",
        checked: false, // Default value
        duration: "60", // Seconds
        fileName: "pause_1_min_covid.mp4",
        description: "Adds a 1 minute clip, reminding the audience of our COVID-19 guidelines, before playing the first episode of the block",
    },
    {
        id: "trailing-sign-in-reminder",
        category: "trailing",
        name: "Sign In Reminder",
        checked: false, // Default value
        duration: "19", // Seconds
        fileName: "sign_in_reminder.mp4",
        description: "Adds a 20 second clip, reminding the audience to sign the attendance sheet, after the last episode of the block",
    }
];


//
// Since option formats have been updated, handle old formats
//
const migrateOptions = (options) => {
    const optionsLookup = Object.fromEntries(blockOptions.map(option => [option.id, option]));

    // Missing name
    if (options.some(option => !option.name)) {
        // Try to use the existing options to find the name
        console.warn("Some options have no name, trying to find the name in the options list. Falls back to ID otherwise");

        options.forEach(option => {
            if (!option.name) {
                option.name = optionsLookup[option.id]?.name || option.id;
            }
        });
    }

    // Missing description
    if (options.some(option => !option.description)) {
        console.warn("Some options have no description, trying to find the description in the options list");

        options.forEach(option => {
            if (!option.description) {
                option.description = optionsLookup[option.id]?.description || "No description available";
            }
        });
    }

    // Missing category
    if (options.some(option => !option.category)) {
        console.warn("Some options have no category, trying to find the category via ID. Falls back to default category otherwise");

        options.forEach(option => {
            if (!option.category) {
                option.category = optionsLookup[option.id]?.category || "default";
            }
        });
    }

    return options;
};