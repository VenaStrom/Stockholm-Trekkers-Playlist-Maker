# Changing File Paths

## User Data Folder
This is the root folder of where all user data is stored. This path can be changed by changing `userDataFolder` in [main.js](../main.js) towards the top of the file. 

## Project Saves Folder
This is the folder where all project saves are stored. This path can be changed by changing `saveFilesFolder` in [main.js](../main.js) towards the top of the file.

## Where Downloaded Files Are Stored
`videoFolder` towards the top of [downloadAssets.js](../scripts/download/downloadAssets.js) is the path where downloaded files are stored. [adding-a-file-download.md](./adding-a-file-download.md) also references this path so please update the doc as well.

## File Download Lookup File
`downloadReferenceFile` towards the top of [downloadAssets.js](../scripts/download/downloadAssets.js) is the path where the file download lookup file is stored. This file specifies the IDs of the files that are to be downloaded and their names. More information can be found in [adding-a-file-download.md](./adding-a-file-download.md).