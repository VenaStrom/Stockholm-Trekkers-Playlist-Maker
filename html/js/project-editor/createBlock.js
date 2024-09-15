
// This file is very much a work in progress.

const createBlockButton = document.querySelector(".create-block");

const makeBlock = () => {

    const block = `
    <div class="round-box block">
        
        <div class="header">
            <div class="time">
                <p>Start time: </p>
                <input class="time-input" type="text" placeholder="hhmm">
            </div>

            <h3 class="option" tabindex="0">Options ▼</h3>

            <h3 class="block">Block 1</h3>

            <div class="options">
                <p>Add a leading:</p>

                <div>
                    <div tabindex="0">
                        <input type="checkbox" checked id="leading-countdown" tabindex="-1">
                        <p>countdown</p>
                    </div>

                    <div tabindex="0">
                        <input type="checkbox" checked id="leading-emergency-routine" tabindex="-1">
                        <p>emergency routine</p>
                    </div>

                    <div tabindex="0">
                        <input type="checkbox" id="leading-covid-disclaimer" tabindex="-1">
                        <p>covid disclaimer</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="episode">
            <div class="time">
                <p>Starts at: </p>
                <p>--:--</p>
            </div>

            <div class="file">
                <input type="file">
            </div>
        </div>

        <div class="episode">
            <div class="time">
                <p>Starts at: </p>
                <p>--:--</p>
            </div>

            <div class="file">
                <input type="file">
            </div>
        </div>

        <div class="episode">
            <div class="time">
                <p>Starts at: </p>
                <p>--:--</p>
            </div>

            <div class="file">
                <input type="file">
            </div>
        </div>
    </div>`

    createBlockButton.insertAdjacentHTML("beforebegin", block);
};

createBlockButton.addEventListener("click", makeBlock);  