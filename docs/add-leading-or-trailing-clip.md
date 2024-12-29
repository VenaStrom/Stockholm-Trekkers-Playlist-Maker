# Adding a Leading or Trailing Clip

To add a leading or trailing clip so that you can toggle it in the project editor, follow these steps:
1. Make sure the clip you are going to use gets downloaded to your computer. See [adding-a-file-download.md](./adding-a-file-download.md) for instructions.

2. In the [blockOptions.js](../html/js/playlist-editor/blockOptions.js) file, create a new object in the `blockOptions` list. There is a template in the file. Here is an example:
```js
{
    id: "leading-countdown",
    category: "leading",
    name: "Countdown",
    checked: true, // Default value
    duration: "60", // Seconds
    fileName: "pause_1_min_countdown.mp4",
    description: "Adds a 1 minute countdown before playing the first episode of the block",
},
```
 - If there isn't an appropriate category, create a new one. In the `blockOptionsCategoryLookup`, add the `key-value` pair for the new category. The `key` is the category's ID, used in the `blockOptions` object, and the `value` what shows up in the UI.

> Note: Both the categories and the options are sorted by the order they are defined in the file.