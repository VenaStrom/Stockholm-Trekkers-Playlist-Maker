"use strict";

const makeEpisodeDOM = (episodeData = null) => {
    episodeData = episodeData || {
        filePath: "",
        startTime: "--:--",
        endTime: "",
        duration: "",
    }

    const episodeBody = stringToHTML(`
    <li class="episode">
        <p class="time" title="When this episode will start playing">${episodeData.startTime}</p>
        <input type="file" title="Click to select a file to add to the playlist">
    </li>`);

    const fileInput = episodeBody.querySelector("input[type='file']");

    if (episodeData.filePath) {
        // Visually set the file input 
        const fileName = episodeData.filePath.split(/[/\\]/).at(-1);
        const dataTransfer = new DataTransfer();
        const file = new File([new Blob()], fileName);
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        fileInput.dataset.filePath = episodeData.filePath;
    }
    if (episodeData.duration) {
        fileInput.dataset.duration = episodeData.duration;
    }

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length !== 0) {
            // Get and save the full path of the file
            fileInput.dataset.filePath = webUtils.getPathForFile(fileInput.files[0]);
        } else {
            fileInput.dataset.filePath = "";
        }

        // Update the episode durations and start times
        updateEpisodeTimes(episodeBody.closest(".block")); // From episodeTimes.js
    });

    return episodeBody;
};

const makeBlockDOM = (blockData = null) => {
    // 
    // Argument handling
    // 
    blockData = blockData || {
        startTime: "",
        options: [...blockOptions],
        episodes: [],
    }

    blockData.options = migrateOptions(blockData.options);


    const blockBody = stringToHTML(`<div class="block"></div>`);

    // 
    // Header
    // 
    const blockHeader = stringToHTML(`
    <div class="header">
        <div class="start-time" title="When this block will start playing. Options will offset from this time so the first episode will always start at the defined block start time">
            <p>Block Start</p>
            <input type="text" placeholder="hhmm" value="${blockData.startTime}">
        </div>

        <div class="options">
            <div>
                ${blockData.options.map(option => `<div class="option-dot${option.checked ? " active" : ""}"></div>`).join("")}
            </div>

            <button>Options<span>▼</span></button>
        </div>

        <button class="delete" title="Delete this block forever">
            <img src="../../assets/images/delete_35dp_000000_FILL0_wght700_GRAD0_opsz40.png" alt="Delete block">
        </button>
    </div>`);

    // Delete button
    blockHeader.querySelector(".delete").addEventListener("click", deleteBlock);
    // Options dropdown button
    blockHeader.querySelector(".options").addEventListener("click", toggleOptionsDropdown);

    // Event listeners for formatting and updating the episode times
    const blockTimeInput = blockHeader.querySelector(".start-time input");
    blockTimeInput.addEventListener("blur", (event) => {
        event.target.value = interpretTime(event.target.value);

        // Update the episode times
        updateEpisodeTimes(blockBody); // From episodeTimes.js
    });


    //
    // Options dropdown
    //
    const makeOptionCategories = (options) => {
        const uniqueCategories = new Set(options.map(option => option.category || "default"));

        return [...uniqueCategories].map(category => {
            // Get only the options in this category
            const optionsInCategory = options.filter(option => option.category === category);

            const makeOptionCheckbox = (option) => {
                return `
                <div title="${option.description}">
                    <p>${option.name}</p><input data-id="${option.id}" type="checkbox"${option.checked ? " checked" : ""}>
                </div>`;
            };

            // Create the category body
            const categoryBody = `
            <div class="options-category">
                <p>${blockOptionsCategoryLookup[category]}</p>

                <div>
                    ${optionsInCategory.map(makeOptionCheckbox).join("")}
                </div>
            </div>`;

            return categoryBody;
        });
    };

    const optionsDropdown = stringToHTML(`
    <div class="options-dropdown hidden">
        <hr>

        ${makeOptionCategories(blockData.options).join("")}
    </div > `);

    // Clicking an option label toggles its checkbox
    optionsDropdown.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        // Clicking anywhere on the container toggles the checkbox
        checkbox.parentElement.addEventListener("click", () => checkbox.click());
        checkbox.addEventListener("click", (event) => event.stopPropagation());
    });
    // Update the option dots when the checkboxes are changed
    optionsDropdown.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener("click", () => updateOptionDots(blockBody));
    });


    // 
    // Episodes
    // 
    const episodeList = stringToHTML(`<ul class="main"></ul>`);

    // Load all episodes
    blockData.episodes.forEach(episodeData => {
        episodeList.appendChild(makeEpisodeDOM(episodeData));
    });

    // Make sure there are at least 1 episode
    while (episodeList.querySelectorAll(".episode").length < 1) {
        episodeList.appendChild(makeEpisodeDOM());
    }

    // Make sure there's always an empty episode at the end
    episodeList.addEventListener("change", () => {
        const episodes = episodeList.querySelectorAll(".episode");
        const lastEpisode = episodes[episodes.length - 1];

        if (lastEpisode.querySelector("input[type='file']").files.length !== 0) {
            episodeList.appendChild(makeEpisodeDOM());
        }
    });
    episodeList.dispatchEvent(new Event("change"));
    
    // Close options dropdown when you start editing the block
    episodeList.addEventListener("change", closeOptionsDropdown);


    //
    // Add all elements to the block
    //
    blockBody.appendChild(blockHeader);
    blockBody.appendChild(optionsDropdown);
    blockBody.appendChild(episodeList);

    // Make the time format and update the episode times
    blockTimeInput.dispatchEvent(new Event("blur"));

    return blockBody;
};


//
// Event listener callbacks
// 
const deleteBlock = (event) => {
    if (confirm("Are you sure you want to delete this block forever?")) {
        const block = event.target.closest(".block");
        block.remove();
    }
};
const toggleOptionsDropdown = (event) => {
    const dropdown = event.target.closest(".header").parentElement.querySelector(".options-dropdown");

    if (dropdown.classList.contains("hidden")) {
        openOptionsDropdown(event);
    } else {
        closeOptionsDropdown(event);
    }
};

const openOptionsDropdown = (event) => {
    // Show the dropdown
    const block = event.target.closest(".block");
    const dropdown = block.querySelector(".options-dropdown");
    dropdown.classList.remove("hidden");

    // Change the arrow
    const header = block.querySelector(".header");
    const arrow = header.querySelector(".options button span");
    arrow.textContent = "▲";
};

const closeOptionsDropdown = (event) => {
    // Hide the dropdown
    const block = event.target.closest(".block");
    const dropdown = block.querySelector(".options-dropdown");
    dropdown.classList.add("hidden");

    // Change the arrow
    const header = block.querySelector(".header");
    const arrow = header.querySelector(".options button span");
    arrow.textContent = "▼";
};

const updateOptionDots = (block) => {
    const optionDots = block.querySelectorAll(".header .options .option-dot");
    const options = block.querySelectorAll(".options-dropdown input[type='checkbox']");

    options.forEach((option, index) => {
        if (option.checked) {
            optionDots[index].classList.add("active");
        }
        else {
            optionDots[index].classList.remove("active");
        }
    });
};


// New block button
const createBlock = (blockData = null) => {
    const newBlockButton = document.querySelector(".make-new-block");
    newBlockButton.insertAdjacentElement("beforebegin", makeBlockDOM(blockData));

    document.dispatchEvent(new Event("input")); // For emptyInputStyling.js
};
document.querySelector(".make-new-block").addEventListener("click", () => createBlock());