"use strict";

// Template: 
// <div class="round-box project clickable" tabindex="0">
//      <div class="header">
//          <div class="project-date">
//              <p>Trekdag</p>
//              <h3>2024-13-12</h3>
//          </div>

//          <div class="meta-data">
//              <p>Last modified: </p>
//              <p>Wed, Dec 25, 2024</p>
//          </div>

//          <button class="delete">
//              <img src="../../assets/images/delete_35dp_000000_FILL0_wght700_GRAD0_opsz40.png" alt="Delete">
//          </button>
//      </div>

//      <ul class="main">
//          <!-- Start of Block -->
//          <li class="block-header">
//              <p>Block</p>
//              <div>
//                  <div class="option-dot active"></div>
//                  <div class="option-dot active"></div>
//                  <div class="option-dot"></div>
//                  <div class="option-dot"></div>
//              </div>
//          </li>
//          <!-- Episode -->
//          <li class="episode">
//              <p>12:00</p>
//              -
//              <p>a-reckoning-of-fates.mkv</p>
//          </li>
//          <!-- Pause -->
//          <li class="pause">
//              <p>--:--</p>
//              -
//              <p>pause</p>
//          </li>

//          <hr>

//          <!-- Start of Block -->
//          <li class="block-header">
//              <p>Block</p>
//              <div>
//                  <div class="option-dot active"></div>
//                  <div class="option-dot active"></div>
//                  <div class="option-dot"></div>
//                  <div class="option-dot"></div>
//              </div>
//          </li>
//          <!-- Episode -->
//          <li class="episode">
//              <p>12:00</p>
//              -
//              <p>a-reckoning-of-fates.mkv</p>
//          </li>
//          <!-- Pause -->
//          <li class="pause">
//              <p>--:--</p>
//              -
//              <p>pause</p>
//          </li>
//      </ul>
// </div>

const unixTimeToDate = (unixTime) => {
    if (!unixTime) { return undefined; };

    const date = new Date(unixTime);

    return date.toLocaleDateString("en", { year: "numeric", weekday: "short", month: "short", day: "numeric" })
};

const stringToHTML = (string) => {
    const htmlLaunderer = document.createElement("div");
    htmlLaunderer.innerHTML = string.trim();

    return htmlLaunderer.firstChild;
};

const makeBlockHeaderLi = (options) => {
    const makeDot = (isActive) => {
        return `<div class="option-dot${isActive ? " active" : ""}"></div>`;
    };

    return stringToHTML(`
        <li class="block-header">
            <p>Block</p>
            <div>
                ${options.map(option => makeDot(option.checked)).join("")}
            </div>
        </li>`);
};

const makeEpisodeLi = (time, episodeName) => {
    return stringToHTML(`
        <li class="episode">
            <p>${time}</p>
            -
            <p>${episodeName}</p>
        </li>`);
};

const makePauseLi = (time) => {
    return stringToHTML(`
        <li class="pause">
            <p>${time}</p>
            -
            <p>pause</p>
        </li>`);
};

const createProjectDOM = (projectData) => {
    const projectBody = stringToHTML(`<div class="round-box project clickable" tabindex="0"></div>`);

    const projectHeader = stringToHTML(
        `<div class="header">
            <div class="project-date">
                <p>Trekdag</p>
                <h3>${projectData.date}</h3>
            </div>
    
            <div class="meta-data">
                <p>Last modified: </p>
                <p>${unixTimeToDate(projectData.dateModified)}</p>
            </div>
    
            <button class="delete">
                <img src="../../assets/images/delete_35dp_000000_FILL0_wght700_GRAD0_opsz40.png" alt="Delete">
            </button>
        </div>`);

    const mainContent = stringToHTML(`<ul class="main"></ul>`);

    projectBody.appendChild(projectHeader);
    projectBody.appendChild(mainContent);

    let i = 0;
    for (const blockData of projectData.blocks) {
        // Block header
        mainContent.appendChild(makeBlockHeaderLi(blockData.options));
        // Episodes
        blockData.episodes.forEach(episodeData => mainContent.appendChild(makeEpisodeLi(episodeData.startTime || blockData.startTime, episodeData.fileName)));
        // Pause
        mainContent.appendChild(makePauseLi(blockData.episodes.at(-1)?.endTime || blockData.startTime || "--:--"));
        
        // Separator hairline
        if (i < projectData.blocks.length - 1) {
            mainContent.appendChild(stringToHTML(`<hr>`));
        }
        i++;
    }

    return projectBody;
};