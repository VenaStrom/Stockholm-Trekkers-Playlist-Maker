
const pageBornAt = new Date().getTime();

const getID = () => {
    const pageURL = window.location.href;
    const arguments = {};
    pageURL.split("?")[1].split("&").forEach((arg) => {
        const [key, value] = arg.split("=");

        arguments[key] = value;
    });

    if (arguments.id !== "new") {
        return arguments.id;
    };

    const time = new Date().getTime();

    const id = time.toString() + pageBornAt.toString();

    // This solution is not scalable in case you need more arguments in the url which probably won't be needed
    window.location.href = window.location.href.replace("?id=new", "") + "?id=" + id;

    return id;
};

// Runs at page load to set an ID for this project
getID();