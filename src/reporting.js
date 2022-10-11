import {changeTypes} from "./differences.js";

export function reportDifferences(differences, callback) {
    let output = ""
    for (const changeType of changeTypes) {
        if (differences[changeType] === undefined) {
            continue
        }
        if (Object.keys(differences[changeType]).length === 0) {
            continue
        }

        const capitalizedType = changeType.charAt(0).toUpperCase() + changeType.slice(1);
        output += capitalizedType + " update for package(s):\n"

        for (const k of Object.keys(differences[changeType])) {
            const info = differences[changeType][k]
            output += ` - ${info.name}: ${info.current.version} -> ${info.latest.version}\n`
        }
    }

    if (output === "") {
        return
    }

    callback(output)
}

const module = {
    differences: reportDifferences
}
export default module
