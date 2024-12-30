"use strict";

const attachPrompt = (target, messages) => {
    if (target.dataset.validatorId) {
        // Remove the old prompts
        [...document.querySelectorAll(`.validation-window[data-validator-id="${target.dataset.validatorId}"]`)]
            .map(window => window.remove());
    } else {
        // Assign a new ID
        // Get index of target in the parent
        target.parentElement.querySelectorAll("*")
            .forEach((element, index) => {
                if (element === target) {
                    target.dataset.validatorId = index;
                }
            });
        target.dataset.validatorId += new Date().getTime();
    }

    // Don't create a new prompt if there are no messages
    if (messages.length === 0) {
        return;
    }

    const window = stringToHTML(`<ul class="validation-window" data-validator-id="${target.dataset.validatorId}"><button class="open-path">Ignore</button></ul>`);

    // Ignore button functionality
    window.querySelector(".open-path").addEventListener("click", () => {
        window.remove();
    });

    // Add the messages
    messages.forEach(message => {
        window.appendChild(stringToHTML(`<li>${message}</li>`));
    });

    // Introduce it to the DOM
    document.body.appendChild(window);

    // Position the window
    const deltaWidth = window.offsetWidth - target.offsetWidth;
    window.style.left = `${target.offsetLeft - deltaWidth / 2}px`;
    window.style.top = `${target.offsetTop + target.offsetHeight + 3}px`;
};