import semver from 'semver';
import fs from "fs";
import semverDiff from "semver-diff";
import git from './src/git.js';
import differences from './src/differences.js';
import knownUpdates from './src/knownVersions.js';
import report from "./src/reporting.js";
import logger from "./src/logger.js";
import slack from "./src/slack.js";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const config = JSON.parse(String(fs.readFileSync("./config.json")));

if (!config.projects) {
    console.error("No projects configured!");
    process.exit(1);
}

if (config.projects.length === 0) {
    console.error("No projects configured!");
    process.exit(1);
}

if (!config.webhook) {
    console.error("No webhook configured!");
    process.exit(1);
}

function getVersionsWithUpdates(installedVersions, latestVersions) {
    return installedVersions.map(v => v = {
        name: v[0],
        current: semver.parse(v[1]),
        latest: semver.parse(latestVersions.get(v[0]))
    })
        .filter(v => v.current !== null && v.latest !== null)
        .reduce((previousValue, currentValue) => {
            previousValue[semverDiff(currentValue.current, currentValue.latest)][currentValue.name] = currentValue
            return previousValue
        }, differences.initial);
}


async function checkProjects() {
    for (let projectName of Object.keys(config.projects)) {
        const project = config.projects[projectName]
        project.name = projectName

        const latestVersions = await git.getLatestVersions(project);
        const allInstalledVersions = await git.getInstalledVersions(project);
        const installedVersions = allInstalledVersions.filter(iv => latestVersions.has(iv[0]))
        const versionsWithUpdates = getVersionsWithUpdates(installedVersions, latestVersions)

        const callback = msg => {
            const m = `New NPM updates found for ${projectName}:\n${msg}`;
            slack(config.webhook, m)
            logger.log(m);
        }
        report.differences(differences.new(projectName, versionsWithUpdates, knownUpdates.current), callback);

        knownUpdates.current[projectName] = versionsWithUpdates
        knownUpdates.write()
        logger.log(`Checked ${projectName}`)
    }
}

checkProjects().then(r => logger.log(`Startup project check`));

function getCheckInterval() {
    const defaultCheckInterval = {days: 0, hours: 3, minutes: 0};
    if (!config.checkInterval) {
        config.checkInterval = defaultCheckInterval
    }

    config.checkInterval.days = config.checkInterval.days ?? 0
    config.checkInterval.hours = config.checkInterval.hours ?? 0
    config.checkInterval.minutes = config.checkInterval.minutes ?? 0

    function calculateInterval(i) {
        return i.days * DAY + i.hours * HOUR + i.minutes * MINUTE
    }

    const i = calculateInterval(config.checkInterval)
    return i > 0 ? i : calculateInterval(defaultCheckInterval)
}

setInterval(() => {
    checkProjects().then(r => logger.log(`Checked projects`));
}, getCheckInterval())
