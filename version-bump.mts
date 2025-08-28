import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const api = {
    readText(path: string) {
        return readFileSync(path, "utf-8");
    },

    readJSON(path: string) {
        return JSON.parse(readFileSync(path, "utf-8"));
    },

    writeText(path: string, content: string) {
        writeFileSync(path, content);
    },

    writeJSON(path: string, content: Record<string, unknown>) {
        writeFileSync(path, JSON.stringify(content, null, 2));
    },

    spawn(command: string) {
        spawnSync(command, { shell: true, stdio: "inherit" });
    },
};

function bump({ readJSON, readText, writeJSON, writeText, spawn }: typeof api) {
    const packageData = readJSON("package.json");
    const targetVersion =
        process.env.npm_package_version || packageData.version;

    // read minAppVersion from manifest.json and bump version to target version
    const manifest = readJSON("manifest.json");
    const previousVersion = manifest.version;
    const { minAppVersion } = manifest;
    manifest.version = targetVersion;
    writeJSON("manifest.json", manifest);

    // update versions.json with target version and minAppVersion from manifest.json
    const versions = readJSON("versions.json");
    versions[targetVersion] = minAppVersion;
    writeJSON("versions.json", versions);

    // update changelog
    const changelog = readText("CHANGELOG.md")
        .replace("## [Unreleased]", `## [Unreleased]\n\n## [${targetVersion}]`)
        .replace(
            `compare/${previousVersion}...main`,
            `compare/${targetVersion}...main`,
        );

    const from = changelog.indexOf(`[Unreleased]:`);
    const to = changelog.indexOf(`[${previousVersion}]:`);
    const newEntry = changelog
        .slice(from, to)
        .replace(targetVersion, previousVersion)
        .replace("main", targetVersion)
        .replace("Unreleased", targetVersion);

    writeText(
        "CHANGELOG.md",
        changelog.slice(0, to) +
            newEntry +
            changelog.slice(to, changelog.length),
    );

    // create commit
    spawn("git add .");
    spawn(`git commit -m "chore(release): ${targetVersion}"`);
    spawn(`git tag -a ${targetVersion} -m "${targetVersion}"`);
}

function diff(from: string, to: string) {
    spawnSync(`git --no-pager diff ${from} ${to}`, {
        shell: true,
        stdio: "inherit",
    });
}

async function prompt(message: string) {
    return new Promise<string>((resolve) => {
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        process.stdout.write(message);
        process.stdin.once("data", (data) => {
            resolve(data.toString().trim());
            process.stdin.pause();
        });
    });
}

async function main() {
    const dir = mkdtempSync(join(tmpdir(), "pochoir-"));
    bump({
        ...api,
        writeText(path, content) {
            api.writeText(join(dir, path), content);
            diff(path, join(dir, path));
        },
        writeJSON(path, content) {
            const str = JSON.stringify(content, null, "\t");
            api.writeText(join(dir, path), str);
            diff(path, join(dir, path));
        },
        spawn(command) {
            console.log("execute: ", command);
        },
    });

    while (true) {
        const result = await prompt("Do you want to continue? (y/n)\n");
        if (result === "y") {
            bump(api);
            break;
        } else if (result === "n") {
            break;
        }
    }
}

main();
