
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
    popup.style.left = `${source.getBoundingClientRect().center}px`;
    popup.style.top = `${source.getBoundingClientRect().bottom}px`;

    // Populate popup with warnings
    warnings.forEach(warning => {
        const p = document.createElement("p");
        p.textContent = "- " + warning;
        popup.appendChild(p);
    });

    document.body.appendChild(popup);
};