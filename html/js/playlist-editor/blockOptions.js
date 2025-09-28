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
        id: "leading-sign-in-reminder",
        category: "leading",
        name: "Sign In Reminder",
        checked: false, // Default value
        duration: "19", // Seconds
        fileName: "sign_in_reminder.mp4",
        description: "Adds a 20 second clip, reminding the audience to sign the attendance sheet, after the last episode of the block",
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

const blockOptionsIdLookup = Object.fromEntries(blockOptions.map(option => [option.id, option]));

//
// Since option formats have been updated, handle old formats
//
const migrateOptions = (oldOptions) => {
    const cleanedOptions = [...blockOptions];

    // If the old options ID can be found in the current options, use the new options
    cleanedOptions.forEach(option => {
        const oldOption = oldOptions.find(oldOption => oldOption.id === option.id);
        if (oldOption) {
            option.checked = oldOption.checked;
        }
    });

    return cleanedOptions;
};