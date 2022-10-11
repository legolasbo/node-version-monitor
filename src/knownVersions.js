import fs from "fs";
import semver from 'semver';

const knownVersionsPath = './knownVersions.json';

export const current = readKnownVersions()

export function writeKnownVersions() {
    const vs = current

    for (let pn in vs) {
        for (let diff in vs[pn]) {
            for (let pkgKey in vs[pn][diff]) {
                vs[pn][diff][pkgKey].current = vs[pn][diff][pkgKey].current.version
                vs[pn][diff][pkgKey].latest = vs[pn][diff][pkgKey].latest.version
            }
        }
    }
    // fs.writeFileSync('./knownVersions.json', JSON.stringify(knownVersions))

}

function readKnownVersions() {
    if (!fs.existsSync(knownVersionsPath)) {
        fs.writeFileSync(knownVersionsPath, JSON.stringify({}))
    }

    const vs = JSON.parse(fs.readFileSync(knownVersionsPath))

    for (let pn in vs) {
        for (let diff in vs[pn]) {
            for (let pkgKey in vs[pn][diff]) {
                vs[pn][diff][pkgKey].current = semver.parse(vs[pn][diff][pkgKey].current)
                vs[pn][diff][pkgKey].latest = semver.parse(vs[pn][diff][pkgKey].latest)
            }
        }
    }

    return vs
}

const module = {
    write: writeKnownVersions,
    current: current,
}
export default module