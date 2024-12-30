"use strict";

const getDuration = async (filePath) => {
    return new Promise((resolve, reject) => {
        ffprobe.get(filePath)
            .then((data) => {
                if (!data) {
                    console.error("No data returned from ffprobe");
                    reject();
                    return;
                }

                resolve(data.format.duration);
            })
            .catch((error) => {
                console.error(error);
                reject();
            });
    });
};