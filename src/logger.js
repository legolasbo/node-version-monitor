function format(msg) {
    const ts = new Date().toISOString()
    return `${ts} - ${msg}`
}

export function log(msg) {
    console.log(format(msg))
}

export function warn(msg) {
    console.warn(format(msg))
}

export function error(msg) {
    console.error(format(msg))
}

const module = {
    log,
    warn,
    error,
}
export default module