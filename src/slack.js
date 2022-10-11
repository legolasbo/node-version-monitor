import https from "https";

export default function slack(webhook, msg) {
    const requestOptions = {
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        }}

    const req = https.request(webhook, requestOptions)
    req.write(JSON.stringify({text:msg}))
    req.end()
}
