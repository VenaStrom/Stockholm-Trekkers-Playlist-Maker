const blockOptionsCategoryLookup = {
    "leading": "Leading Clips",
    "trailing": "Trailing Clips",
    "default": "Options" // Fallback to this
};

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