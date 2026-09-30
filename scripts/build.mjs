import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreDirectory = resolve(repositoryRoot, "packages/extension-core");
const supportedBrowsers = ["chrome", "firefox"];
const requestedBrowser = process.argv[2];

if (requestedBrowser && !supportedBrowsers.includes(requestedBrowser)) {
  console.error(
    `Unsupported browser "${requestedBrowser}". Expected one of: ${supportedBrowsers.join(", ")}.`
  );
  process.exitCode = 1;
} else {
  const browsers = requestedBrowser ? [requestedBrowser] : supportedBrowsers;

  for (const browser of browsers) {
    const outputDirectory = resolve(repositoryRoot, "dist", browser);
    const manifestPath = resolve(
      repositoryRoot,
      "apps",
      browser,
      "manifest.json"
    );

    await rm(outputDirectory, { recursive: true, force: true });
    await mkdir(outputDirectory, { recursive: true });
    await cp(coreDirectory, outputDirectory, {
      recursive: true,
      filter: (source) => !source.endsWith("package.json"),
    });
    await cp(manifestPath, resolve(outputDirectory, "manifest.json"));

    console.log(`Built ${browser} extension in dist/${browser}`);
  }
}
