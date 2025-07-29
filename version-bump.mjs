import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const packageData = JSON.parse(readFileSync("package.json", "utf8"));
const targetVersion = process.env.npm_package_version || packageData.version;

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("manifest.json", JSON.stringify(manifest, null, "\t"));

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("versions.json", JSON.stringify(versions, null, "\t"));

const opts = { shell: true, stdio: "inherit" };
spawnSync("git add .", opts);
spawnSync(`git commit -m "chore(release): ${targetVersion}"`, opts);
spawnSync(`git tag -a ${targetVersion} -m "${targetVersion}"`, opts);
