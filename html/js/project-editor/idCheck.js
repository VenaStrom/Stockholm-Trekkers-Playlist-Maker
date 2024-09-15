
const pageBornAt = new Date().getTime();


const generateID = () => {
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
    
    console.log(id);
}