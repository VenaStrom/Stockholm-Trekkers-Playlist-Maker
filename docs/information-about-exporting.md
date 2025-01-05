# Information About Exporting

## In Short
- Avoid exporting to a USB drive.
- A playlist can be 20 GB or more.
- The exported folder is not zipped.

## Why Shouldn't I Export to a USB Drive?
When exporting, the main bottleneck is disk write speed and USB drives are generally very slow. If the copying speed is too slow, your OS may think the program is unresponsive, which could mess up the export. 

Given that the main bottleneck is disk write speed, it is best to export to a faster internal drive. The export itself will be quicker, and then you will have to zip the folder to upload it, so you might as well copy the zipped folder to the USB drive. The zipped folder is smaller and a blob[^1] so that transfer will be significantly faster than copying the folder.

[^1] A blob is a big binary file, as opposed to a folder which contains many files. When copying multiple files, there's some overhead for each file. When copying a single file (a blob), the only overhead is for that one file which significantly increases speeds. 

### TLDR
Exporting to a USB drive is slow and unreliable. Export to an internal drive and then copy the folder to the USB drive which is actually faster and more reliable. 

## How big is a playlist?
A playlist can vary a lot in size. For one Trekdag the playlist was 8 or 9 GB. For another, it was 25 GB. The size of the playlist depends on the number of episodes, their bitrates, resolutions, and lengths. The only important thing to do is to make sure you have enough space on the drive you are exporting to.

## Why is the Exported Folder Not Zipped?
It could become a feature in the future but the complication of making sure the appropriate software is available in users OS and related issues make it a low priority. It's also about user choice, some users may want to keep the folder unzipped for whatever reason. I, Viggo, have been keeping unzipped versions of every playlist on the organizations hard drive ever since I took over.

Another motivation is that, zipping during the export process would slow it down. Making some cross-platform solution for zipping is also not gonna be as optimized as a native multi-threaded solution for instance.