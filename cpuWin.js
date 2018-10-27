const { spawn } = require('child_process');

function cpuLoad() {
    return new Promise((resolve) => {
        const child = spawn('wmic', ['cpu', 'get', 'loadpercentage'], {stdio: 'pipe'});
        child.stdout.on('data', (data) => {
            resolve(parseInt(data.toString('utf8').substring(16).trim()));
        });
    })
}

module.exports = {
    measure: cpuLoad
}
