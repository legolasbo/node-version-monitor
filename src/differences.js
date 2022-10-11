export const changeTypes = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease', 'build', 'undefined']
export const initialDifferences = function() {
    const initial = {}
    changeTypes.forEach(t => initial[t] = {})
    return initial
}()

export function newDifferences(projectName, differences, knownVersions) {
    if (!knownVersions[projectName]) {
        return differences
    }

    const newDiffs = {}
    for (const diff in differences) {
        if (!knownVersions[projectName][diff]) {
            newDiffs[diff] = differences[diff]
            continue
        }

        for (const name in differences[diff]) {
            if (!knownVersions[projectName][diff][name]) {
                if (!newDiffs[diff]) {
                    newDiffs[diff] = {}
                }
                newDiffs[diff][name] = differences[diff][name]
            }
        }
    }
    return newDiffs
}


const module = {
    changeTypes,
    initial: initialDifferences,
    new: newDifferences,
}
export default module