import Git from "nodegit";
import path from "path";
import os from "os";
import pkgJson from "package-json";
import fs from "fs";

async function getProjectHeadCommit(project) {
    const [user] = project.repo.split('@')
    const branch = project.branch
    const cloneOpts = {
        fetchOpts: {
            callbacks: {
                credentials: function () {
                    return Git.Cred.sshKeyNew(
                        user,
                        path.resolve(os.homedir() + "/.ssh/id_rsa.pub"),
                        path.resolve(os.homedir() + "/.ssh/id_rsa"),
                        "");
                },
                transferProgress: function (progress) {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write(`Objects received: ${progress.receivedObjects()}/${progress.totalObjects()}`);
                }
            }
        }
    };

    const repoPath = path.resolve(`./repositories/${project.name}`)

    const repo = await new Promise((resolve, reject) => fs.access(repoPath, fs.constants.R_OK, resolve))
        .then(accessError => {
            return !accessError ? Git.Repository.open(repoPath) : Git.Clone(project.repo, repoPath, cloneOpts);
        })
    await repo.fetchAll(cloneOpts.fetchOpts)
    return await repo.getBranch(branch).then(
        branch => branch.repo.getHeadCommit()
    )
}

export async function getLatestVersions(project) {
    const headCommit = await getProjectHeadCommit(project)

    const manifest = await headCommit.getEntry("package.json")
        .then(entry => entry.getBlob())
        .then(blob => JSON.parse(String(blob)))
    const promisedVersionInfo = Object.keys(manifest.dependencies)
        .map(d => pkgJson(d).catch(e => true /* Ignore the error */))

    return await Promise.all(promisedVersionInfo)
        .then(vi => vi.filter(p => typeof p === 'object'))
        .then(vi => vi.map(p => [p.name, p.version]))
        .then(v => new Map(v))
}

export async function getInstalledVersions(project) {
    const headCommit = await getProjectHeadCommit(project)
    const lock = await headCommit.getEntry("package-lock.json")
        .then(entry => entry.getBlob())
        .then(blob => JSON.parse(String(blob)))

    return Object.keys(lock.dependencies)
        .map(d => [d, lock.dependencies[d].version])
}

const module = {
    getLatestVersions: getLatestVersions,
    getInstalledVersions: getInstalledVersions,
}
export default module