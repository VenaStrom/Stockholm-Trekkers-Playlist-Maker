"use strict";

const attachPrompt = (target, messages) => {
    const window = stringToHTML(`<ul class="validation-window"><button class="open-path">Ignore</button></ul>`);

    // Only one prompt per target
    document.querySelectorAll(`.validation-window[data-target="${target}"]`).forEach(window => window.remove());
    window.dataset.target = target;
    
    // Ignore button
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