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

    const prompt = stringToHTML(`<ul class="validation-window" data-validator-id="${target.dataset.validatorId}"><button class="open-path">Ignore</button></ul>`);

    // Ignore button functionality
    prompt.querySelector(".open-path").addEventListener("click", () => {
        prompt.remove();
    });

    // Add the messages
    messages.forEach(message => {
        prompt.appendChild(stringToHTML(`<li>${message}</li>`));
    });

    // Introduce it to the DOM
    document.body.appendChild(prompt);

    // Position the window
    const deltaWidth = prompt.offsetWidth - target.offsetWidth;
    prompt.style.left = `${target.offsetLeft - deltaWidth / 2}px`;
    prompt.style.top = `${target.offsetTop + target.offsetHeight + 3}px`;

    // Move on window resize
    window.addEventListener("resize", () => {
        prompt.style.left = `${target.offsetLeft - deltaWidth / 2}px`;
        prompt.style.top = `${target.offsetTop + target.offsetHeight + 3}px`;
    });
};