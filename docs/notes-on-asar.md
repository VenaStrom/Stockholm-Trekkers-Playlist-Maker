# Notes on ASAR

ASAR is a technology for compressing app data. ASAR is turned off for this project since the size difference is negligible and it makes the app easier to work with because unpacked data has a different file structure. That in of itself is not a problem, but when debugging i.e. running `yarn run start` or `yarn run debug` the app works on a different file structure than when it is packaged.

### If you turn it on
You would need to make sure every filepath in the project is correct after the app has been packaged, including those in the `package.json` file.