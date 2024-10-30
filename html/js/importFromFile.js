
const importFromFile = () => {
    importer.import().then((data) => {
        console.log(data);
        window.location.reload();
    });
};