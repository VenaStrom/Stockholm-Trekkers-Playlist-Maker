# Adding a Leading or Trailing Clip

To add a leading or trailing clip so that you can toggle it in the project editor, follow these steps:
1. Make sure the clip you want gets downloaded to your computer. See [adding-a-file-download.md](./adding-a-file-download.md) for instructions.

2. You will need to add it to the [playlist-editor.html](../html/pages/playlist-editor.html) file within the `<head>` tag. There you will find this html structure:
```html
<div class="options">
    <div class="leading">
        <p>Add a leading:</p>

        <div>
            <div class="clickable" tabindex="0" title="This adds a 1 min countdown before the block. This should pretty much always be on.">
                <input type="checkbox" checked id="leading-countdown" data-file-name="pause_1_min_countdown.mp4" data-length-seconds="60" tabindex="-1">
                <p>countdown</p>
            </div>

            <div class="clickable" tabindex="0" title="This adds a 1 min clip of the emergency procedures before the block.">
                <input type="checkbox" checked id="leading-emergency-routine" data-file-name="pause_1_min_emergency.mp4" data-length-seconds="59" tabindex="-1">
                <p>emergency routine</p>
            </div>

            <div class="clickable" tabindex="0" title="This adds a 1 min clip that reminds viewers to show respect to each other in regards to the 2020s pandemic.">
                <input type="checkbox" id="leading-covid-disclaimer" data-file-name="pause_1_min_covid.mp4" data-length-seconds="60" tabindex="-1">
                <p>covid disclaimer</p>
            </div>
        </div>
    </div>

    <div class="trailing">
        <p>Add a trailing:</p>

        <div>
            <div class="clickable" tabindex="0" title="This adds a 20 second clip at the end of the block that reminds visitors to sign in">
                <input type="checkbox" id="trailing-sign-in-reminder" data-file-name="sign_in_reminder.mp4" data-length-seconds="19" tabindex="-1">
                <p>sign-in reminder</p>
            </div>
        </div>
    </div>
</div>
```

3. Add a new `<div>` element to the `leading` or `trailing` section depending on where the clip would end up. Use the following template:
```html
<div class="clickable" tabindex="0" title="[a longer descriptive text]">
    <input type="checkbox" tabindex="-1"
        id="[trailing || leading][a sensible id]" 
        data-file-name="[the filename you set in the fileURLs.json file]" 
        data-length-seconds="[the duration of the clip in seconds]">

    <p>the display name the user will see</p>
</div>
```
It's important that the id of the input contains either `trailing` or `leading` and that the id is unique.

4. You will also need to add another `preview dot` right above the previous html snippet. Just make sure there are as many dots as there are options in total. The console will throw a warning if that isn't the case.
```html	
<div class="open-options clickable" onclick="expandOptions(this)" tabindex="0">
    <div class="option-preview-dot"></div>
    <div class="option-preview-dot"></div>
    <div class="option-preview-dot"></div>
    <div class="option-preview-dot"></div>
    <p>Options ▼</p>
</div>
```

5. Note that all previous projects that were made before the new clip existed is gonna have to be re-saved in the editor in order to get the new options. This shouldn't be a problem though.