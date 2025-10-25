use std::error::Error;
use std::fs;
use std::path::{Path, PathBuf};

const ASSET_MANIFEST_PATH: &str = "../scripts/asset-urls.json";
const VIDEO_ASSET_DIR: &str = "video-assets";

fn main() {
  // If files listed in scripts/asset-urls.json are not present in src-tauri/video-assets, cancel
  if let Err(err) = ensure_video_assets() {
    println!("cargo:warning=Failed to ensure video assets are present: {err}");
    std::process::exit(1);
  }

  tauri_build::build()
}

fn ensure_video_assets() -> Result<(), Box<dyn Error>> {
  let manifest_dir = PathBuf::from(std::env::var("CARGO_MANIFEST_DIR")?);
  let asset_manifest_relative = Path::new(ASSET_MANIFEST_PATH);
  println!(
    "cargo:rerun-if-changed={}",
    asset_manifest_relative.display()
  );

  let asset_manifest_path = manifest_dir.join(asset_manifest_relative);
  let asset_dir = manifest_dir.join(VIDEO_ASSET_DIR);

  let urls: Vec<String> = serde_json::from_str(&fs::read_to_string(&asset_manifest_path)?)?;

  let mut missing_assets = Vec::new();

  for url in urls {
    let Some(file_name) = url.rsplit('/').next().filter(|name| !name.is_empty()) else {
      return Err(format!("Asset URL is missing a filename component: {url}").into());
    };

    let asset_path = asset_dir.join(file_name);
    if !asset_path.exists() {
      missing_assets.push(file_name.to_owned());
    }
  }

  if missing_assets.is_empty() {
    return Ok(());
  } else {
    return Err(
      format!(
        "Missing video assets: {:?}. Please run `yarn download-assets` to download them.",
        missing_assets
      )
      .into(),
    );
  }
}
