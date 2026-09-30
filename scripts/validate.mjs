import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const browsers = ["chrome", "firefox"];
const requiredPermissions = ["cookies", "activeTab", "tabs", "storage"];
const requiredCoreFiles = [
  "popup.html",
  "css/popup.css",
  "js/popup.js",
  "img/icon16.png",
  "img/icon48.png",
  "img/icon128.png",
];

const manifests = new Map();

for (const browser of browsers) {
  const manifestPath = resolve(
    repositoryRoot,
    "apps",
    browser,
    "manifest.json"
  );
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifests.set(browser, manifest);

  if (manifest.manifest_version !== 3) {
    throw new Error(`${browser} must use Manifest V3.`);
  }

  for (const permission of requiredPermissions) {
    if (!manifest.permissions?.includes(permission)) {
      throw new Error(`${browser} manifest is missing ${permission} permission.`);
    }
  }

  if (manifest.action?.default_popup !== "popup.html") {
    throw new Error(`${browser} manifest must use popup.html.`);
  }
}

const chromeManifest = manifests.get("chrome");
const firefoxManifest = manifests.get("firefox");

for (const field of ["name", "version", "description"]) {
  if (chromeManifest[field] !== firefoxManifest[field]) {
    throw new Error(`Manifest field "${field}" must match across browsers.`);
  }
}

if (!firefoxManifest.browser_specific_settings?.gecko?.id) {
  throw new Error("Firefox manifest must define a Gecko extension ID.");
}

if (
  !firefoxManifest.browser_specific_settings.gecko.data_collection_permissions
    ?.required
) {
  throw new Error(
    "Firefox manifest must declare its required data collection permissions."
  );
}

for (const file of requiredCoreFiles) {
  await access(resolve(repositoryRoot, "packages", "extension-core", file));
}

console.log("Validated Chrome and Firefox manifests and shared extension files.");
