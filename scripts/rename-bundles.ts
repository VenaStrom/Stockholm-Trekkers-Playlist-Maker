import fs from "node:fs";
import tauriConfig from "../src-tauri/tauri.conf.json" with {type: "json"};
import path from "node:path";

const bundles = fs.globSync(`src-tauri/target/release/bundle/*/${tauriConfig.productName}*`)
  .filter((path) => fs.statSync(path).isFile());

for (const bundle of bundles) {
  const newFileName = path.basename(bundle).replace(/\s+/g, "-");
  const newFilePath = path.join(path.dirname(bundle), newFileName);
  fs.cpSync(bundle, newFilePath);
  fs.rmSync(bundle);

  console.log(`Renamed bundle: ${bundle} -> ${newFilePath}`);
}