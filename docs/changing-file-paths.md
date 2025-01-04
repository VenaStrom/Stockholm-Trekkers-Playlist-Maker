# Changing File Paths

All file paths *should* be collected in [filePaths.js](../filePaths.js) and referenced from there. Two file paths are referenced in the [installer.nsh](../build/installer.nsh) script, namely the paths for `videoAssetsFolder` and the `userDataFolder`. They are used to delete them on uninstall.

### User Data Folder
This is the root folder of where all user data is stored.

### Project Saves Folder
This is the folder where all project save files are stored. Project save files are JSON files that store the structure and order of playlists.

### Where Downloaded Files Are Stored
`videoAssetsFolder` says where the downloaded video files are stored. 

### File Download Lookup File
`downloadReferenceFile` is the path where the file download reference is stored. This file specifies the IDs of the files that are to be downloaded and their names. More information can be found in [adding-a-file-download.md](./adding-a-file-download.md).