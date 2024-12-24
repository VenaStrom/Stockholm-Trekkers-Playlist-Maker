"use strict";


const warningPopup = (id, source, warnings) => {
    // Remove previous popup
    if (document.getElementById(id)) {
        document.getElementById(id).remove();
    }

    // Resolved all warnings
    if (warnings.length === 0) {
        return;
    }

    // Create new popup
    const popup = document.createElement("div");
    popup.classList.add("warning-popup");
    popup.id = id;

    // Create close button
    const closeButton = document.createElement("p");
    closeButton.textContent = "Dismiss";
    closeButton.addEventListener("click", () => popup.remove());
    popup.appendChild(closeButton);

    // Populate popup with warnings
    warnings.forEach(warning => {
        const p = document.createElement("p");
        p.textContent = "• " + warning;
        popup.appendChild(p);
    });

    document.body.appendChild(popup);

    // Set popup position
    const calculatePosition = () => {
        const sourceRect = source.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        popup.style.left = `${sourceRect.x + (sourceRect.width - popupRect.width) / 2}px`;
        popup.style.top = `${sourceRect.bottom + window.screenY + 3}px`;
    };
    window.addEventListener("scroll", calculatePosition);
    window.addEventListener("resize", calculatePosition);
    calculatePosition();
};