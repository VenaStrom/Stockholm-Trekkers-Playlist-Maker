import fs from "node:fs";
import path from "node:path";

await new Promise((resolve) => setTimeout(resolve, 100));
console.log("");

const urls = [
  "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/releases/download/v4.0.0-Video-Assets/30_min_pause.mp4",
  "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/releases/download/v4.0.0-Video-Assets/20_sec_sign_in_reminder.mp4",
  "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/releases/download/v4.0.0-Video-Assets/1_min_emergency.mp4",
  "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/releases/download/v4.0.0-Video-Assets/1_min_covid.mp4",
  "https://github.com/VenaStrom/Stockholm-Trekkers-Playlist-Maker/releases/download/v4.0.0-Video-Assets/1_min_countdown.mp4",
]
const destPath = path.join("src-tauri", "video-assets");
const names = urls.map((url) => path.basename(url));

// If all exist, skip download
if (names.every((name) => fs.existsSync(path.join(destPath, name)))) {
  console.log("All video assets already exist. Skipping download.");
  process.exit(0);
}
else if (fs.existsSync(destPath)) {
  // Remove folder if it exists
  fs.rmSync(destPath, { recursive: true, force: true });
}

if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

await Promise.all(urls.map(async (url) => {
  const name = path.basename(url);
  const destFile = path.join(destPath, name);

  console.log(`Downloading ${name}...`);
  const response = await fetch(url, { method: "GET", redirect: "follow" });

  if (!response.ok) {
    console.error(`Failed to download ${name}: ${response.status} ${response.statusText}`);
    return;
  }

  fs.writeFileSync(destFile, Buffer.from(await response.arrayBuffer()));
  console.log(`Saved ${path.basename(url)} to ${destFile}`);
}));

console.log("");