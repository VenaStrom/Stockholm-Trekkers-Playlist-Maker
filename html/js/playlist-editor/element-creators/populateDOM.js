
// The button with the big plus sign
const createBlockButton = document.querySelector(".create-block");

// Make new block when the "create new block" button is pressed
createBlockButton.addEventListener("click", createBlockDOM(this));


// Start off with one block
createBlockDOM(createBlockButton);
