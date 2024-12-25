# Adding a asset to download

## How assets are downloaded
The [downloadAssets.js](./downloadAssets.js) file loops through the [assetDownloadInfo.json](../assetDownloadInfo.json) file and goes to `<urlTemplate>+<videos.id>` to download the file.

## Add a New Asset to Download
The program uses Google drive to store the assets. To add a new asset to be download, you need to upload the file to Google drive (make it public) and get the file id of the asset and add it to the [fileURLs.json](./fileURLs.json) file.

### Steps
1. You need to have the asset uploaded to google drive (needs to be public i.e. accessible via the link).

2. Get the file id of the asset.
   - The easiest way I've found is to go to the asset in Google drive and open it in a new tab. You should be brought to a page that looks like this:
![Screenshot](../screenshots/find-file-id.png)
In the url bar you will see a long string of characters that looks like this: `1POheLkrK_1O786JByNvmHBnxbEijn82E`, keep in mind that it can contain underscores, dashes, and other characters. Copy this string.

3. Open the [assetDownloadInfo.json](../assetDownloadInfo.json) file and add a new object to the `videos` array. The file should look something like this:
```json
{
    "urlTemplate": "https://drive.google.com/uc?export=download&id=",
    "videos": [
        // There might be other objects here
        {"name": "your-new-clip.mpeg", "id": "1c-YG8KTYNgAC-82bSxZ1CBMDvEG-Q5V_"}
    ]
}
```
Add the string you copied from the url to the `id` field and the name of the file to the `name` field. You can set the name to whatever you want as long as the file extension is the same. 

4. Now, the downloaded asset will end up in [assets/videos/](../assets/videos) with the name you specified in the `name` field.