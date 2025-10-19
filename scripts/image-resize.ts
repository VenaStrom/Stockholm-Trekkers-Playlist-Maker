import sharp from "sharp";

sharp("./src-tauri/icons/icon.png")
  .resize(128, 128)
  .toFile("./src-tauri/icons/128x128.png");

sharp("./src-tauri/icons/icon.png")
  .resize(64, 64)
  .toFile("./src-tauri/icons/64x64.png");

sharp("./src-tauri/icons/icon.png")
  .resize(32, 32)
  .toFile("./src-tauri/icons/32x32.png");

sharp("./src-tauri/icons/icon.png")
  .resize(16, 16)
  .toFile("./src-tauri/icons/16x16.png");